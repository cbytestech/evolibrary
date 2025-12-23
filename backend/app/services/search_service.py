# File: backend/app/services/search_service.py
"""
Search Service - STRICT FILTERING VERSION
Only allows known book/audiobook/comic file formats
Blocks TV shows, movies, games, software, etc.
"""
import httpx
import logging
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models.app import App
from backend.app.db.models.indexer import Indexer

logger = logging.getLogger(__name__)


class SearchResult:
    """Standardized search result from any indexer"""
    
    def __init__(
        self,
        title: str,
        download_url: str,
        indexer_id: int,
        indexer_name: str,
        size_bytes: int,
        seeders: int = 0,
        protocol: str = "torrent",
        publish_date: Optional[datetime] = None,
        info_url: Optional[str] = None,
        categories: Optional[List[str]] = None,
        file_format: Optional[str] = None
    ):
        self.title = title
        self.download_url = download_url
        self.indexer_id = indexer_id
        self.indexer_name = indexer_name
        self.size_bytes = size_bytes
        self.size_mb = round(size_bytes / 1024 / 1024, 2)
        self.seeders = seeders
        self.protocol = protocol
        self.publish_date = publish_date
        self.info_url = info_url
        self.categories = categories or []
        self.file_format = file_format
    
    def get_media_type(self) -> str:
        """
        Detect media type from file format
        Returns: 'ebook', 'audiobook', 'comic', or 'magazine'
        """
        if not self.file_format:
            return "ebook"
        
        fmt = self.file_format.lower()
        
        # Audiobook formats
        if fmt in ['m4b', 'mp3', 'aac', 'flac', 'ogg', 'opus']:
            return "audiobook"
        
        # Comic formats
        if fmt in ['cbz', 'cbr', 'cb7', 'cbt']:
            return "comic"
        
        # Magazine detection (PDF only)
        if fmt == 'pdf':
            title_lower = self.title.lower()
            
            magazine_names = [
                'wired', 'vogue', 'time', 'forbes', 'economist', 'nature',
                'maxim', 'playboy', 'penthouse', 'gq', 'esquire'
            ]
            
            has_magazine_name = any(mag in title_lower for mag in magazine_names)
            has_date_pattern = bool(re.search(r'\d{4}[-/]\d{2}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b', title_lower))
            has_magazine_keyword = any(word in title_lower for word in ['magazine', 'monthly', 'weekly'])
            
            if has_magazine_name or (has_date_pattern and has_magazine_keyword):
                return "magazine"
        
        return "ebook"
    
    def is_valid_media_file(self) -> bool:
        """
        STRICT filtering - only allow known book/audiobook/comic formats
        Blocks TV shows, movies, anime, games, software, etc.
        """
        title_lower = self.title.lower()
        
        # BLOCK 1: TV Show patterns (S01E01, S02E03, Season 1, etc.)
        tv_patterns = [
            r's\d{2}e\d{2}',           # S01E01
            r'season\s+\d+',           # Season 1
            r's\d{2}\s',               # S01 
            r'\d{1,2}x\d{2}',          # 1x01
        ]
        if any(re.search(pattern, title_lower) for pattern in tv_patterns):
            return False
        
        # BLOCK 2: Movie/Video indicators
        movie_indicators = [
            'bluray', 'blu-ray', 'webrip', 'web-dl', 'hdtv', 'brrip',
            '1080p', '720p', '2160p', '4k', 'x264', 'x265', 'hevc',
            'dvdrip', 'xvid', 'web.dl', 'webdl', 'hdrip', 'cam', 
            'screener', 'ts', 'proper', 'repack', 'remux'
        ]
        if any(ind in title_lower for ind in movie_indicators):
            return False
        
        # BLOCK 3: Video file extensions
        if self.file_format:
            fmt = self.file_format.lower()
            video_formats = [
                'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 
                'm4v', 'mpg', 'mpeg', 'ts', 'vob', '3gp', 'ogv'
            ]
            if fmt in video_formats:
                return False
        
        # BLOCK 4: Game/Software indicators
        software_keywords = ['repack', 'cracked', 'trainer', 'multi2', 'multi5', 'flt']
        if any(kw in title_lower for kw in software_keywords):
            return False
        
        # ALLOW: Valid book/comic/audiobook formats
        valid_formats = [
            # Ebooks
            'epub', 'mobi', 'azw', 'azw3', 'pdf', 'txt', 'rtf', 'doc', 'docx',
            # Audiobooks
            'm4b', 'mp3', 'aac', 'flac', 'ogg', 'opus',
            # Comics
            'cbz', 'cbr', 'cb7', 'cbt',
            # Archives (might contain books/comics)
            'zip', 'rar', '7z'
        ]
        
        # Check file format
        if self.file_format and self.file_format.lower() in valid_formats:
            return True
        
        # Check title for format keywords
        for fmt in valid_formats:
            patterns = [f'.{fmt}', f'[{fmt}]', f'({fmt})', f' {fmt} ']
            if any(pattern in title_lower for pattern in patterns):
                return True
        
        # Check for explicit book keywords
        book_keywords = [
            'ebook', 'e-book', 'audiobook', 'comic', 'comics', 'manga',
            'novel', 'book', 'magazine', 'periodical', 'anthology'
        ]
        if any(kw in title_lower for kw in book_keywords):
            return True
        
        # Default: Block everything else
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response"""
        return {
            "title": self.title,
            "download_url": self.download_url,
            "indexer_id": self.indexer_id,
            "indexer_name": self.indexer_name,
            "size_bytes": self.size_bytes,
            "size_mb": self.size_mb,
            "seeders": self.seeders,
            "protocol": self.protocol,
            "publish_date": self.publish_date.isoformat() if self.publish_date else None,
            "info_url": self.info_url,
            "categories": self.categories,
            "file_format": self.file_format,
            "media_type": self.get_media_type()
        }


class SearchService:
    """Service for searching books across indexers"""
    
    def __init__(self):
        self.timeout = 60.0
    
    async def search(
        self,
        db: AsyncSession,
        query: str,
        indexer_ids: Optional[List[int]] = None,
        categories: Optional[List[str]] = None,
        limit: int = 100
    ) -> List[SearchResult]:
        """Search for books across all enabled indexers"""
        apps_query = select(App).where(App.enabled == True)
        result = await db.execute(apps_query)
        apps = result.scalars().all()
        
        if not apps:
            logger.warning("No enabled apps found")
            return []
        
        logger.info(f"🔍 Searching via {len(apps)} apps for: '{query}'")
        
        all_results = []
        
        for app in apps:
            try:
                if app.app_type == "prowlarr":
                    results = await self._search_prowlarr(db, app, query, categories, limit)
                    all_results.extend(results)
                    logger.info(f"[Prowlarr] Got {len(results)} results")
                    
                elif app.app_type == "jackett":
                    results = await self._search_jackett(db, app, query, categories, limit, indexer_ids)
                    all_results.extend(results)
                    logger.info(f"[Jackett] Got {len(results)} results")
                    
            except Exception as e:
                logger.error(f"Error searching {app.name}: {e}", exc_info=True)
                continue
        
        await db.commit()
        
        logger.info(f"📊 Raw results: {len(all_results)}")
        
        # STRICT filtering
        filtered_results = [r for r in all_results if r.is_valid_media_file()]
        filtered_count = len(all_results) - len(filtered_results)
        
        if filtered_count > 0:
            logger.info(f"🗑️ Filtered {filtered_count} invalid files")
        
        filtered_results.sort(key=lambda x: (-x.seeders, x.size_bytes))
        
        logger.info(f"✅ Returning {len(filtered_results)} valid results")
        return filtered_results
    
    async def _search_prowlarr(
        self,
        db: AsyncSession,
        app: App,
        query: str,
        categories: Optional[List[str]],
        limit: int
    ) -> List[SearchResult]:
        """Search via Prowlarr API"""
        try:
            client_kwargs = {"timeout": self.timeout}
            if app.base_url.startswith("https://"):
                client_kwargs["verify"] = False
            
            async with httpx.AsyncClient(**client_kwargs) as client:
                params = {
                    "query": query,
                    "limit": limit,
                    "type": "search"
                }
                
                if categories:
                    params["categories"] = ",".join(categories)
                
                response = await client.get(
                    f"{app.base_url}/api/v1/search",
                    params=params,
                    headers={"X-Api-Key": app.api_key}
                )
                
                if response.status_code != 200:
                    logger.error(f"[Prowlarr] Failed: HTTP {response.status_code}")
                    return []
                
                data = response.json()
                
                indexers_query = select(Indexer).where(Indexer.app_id == app.id)
                indexers_result = await db.execute(indexers_query)
                indexers = {idx.external_id: idx for idx in indexers_result.scalars().all()}
                
                results = []
                for item in data:
                    try:
                        prowlarr_indexer_id = str(item.get("indexerId", ""))
                        indexer = indexers.get(prowlarr_indexer_id)
                        
                        if not indexer:
                            indexer_id = 0
                            indexer_name = item.get("indexer", "Unknown")
                        else:
                            indexer_id = indexer.id
                            indexer_name = indexer.name
                        
                        result = SearchResult(
                            title=item.get("title", "Unknown"),
                            download_url=item.get("downloadUrl") or item.get("magnetUrl", ""),
                            indexer_id=indexer_id,
                            indexer_name=indexer_name,
                            size_bytes=item.get("size", 0),
                            seeders=item.get("seeders", 0),
                            protocol="torrent" if item.get("protocol") == "torrent" else "usenet",
                            publish_date=datetime.fromisoformat(item["publishDate"].replace("Z", "+00:00")) if item.get("publishDate") else None,
                            info_url=item.get("infoUrl"),
                            categories=[cat.get("name") for cat in item.get("categories", [])]
                        )
                        results.append(result)
                        
                    except Exception as e:
                        logger.error(f"Error parsing result: {e}")
                        continue
                
                return results
                
        except Exception as e:
            logger.error(f"Prowlarr error: {e}", exc_info=True)
            return []
    
    async def _search_jackett(
        self,
        db: AsyncSession,
        app: App,
        query: str,
        categories: Optional[List[str]],
        limit: int,
        indexer_ids: Optional[List[int]] = None
    ) -> List[SearchResult]:
        """Search via Jackett API"""
        try:
            client_kwargs = {"timeout": self.timeout, "follow_redirects": False}
            if app.base_url.startswith("https://"):
                client_kwargs["verify"] = False
            
            async with httpx.AsyncClient(**client_kwargs) as client:
                params = {
                    "apikey": app.api_key,
                    "Query": query,
                    "limit": limit
                }
                
                indexers_query = select(Indexer).where(
                    Indexer.app_id == app.id,
                    Indexer.enabled == True
                )
                if indexer_ids:
                    indexers_query = indexers_query.where(Indexer.id.in_(indexer_ids))
                
                indexers_result = await db.execute(indexers_query)
                indexers = indexers_result.scalars().all()
                
                if not indexers:
                    logger.warning("[Jackett] No enabled indexers")
                    return []
                
                for indexer in indexers:
                    params.setdefault("Tracker[]", []).append(indexer.external_id)
                
                if categories:
                    params["Category[]"] = categories
                
                cookies = None
                if app.password:
                    try:
                        login_response = await client.post(
                            f"{app.base_url}/UI/Dashboard",
                            data={"password": app.password},
                            headers={"Content-Type": "application/x-www-form-urlencoded"}
                        )
                        cookies = login_response.cookies
                    except Exception as e:
                        logger.warning(f"Jackett login failed: {e}")
                
                response = await client.get(
                    f"{app.base_url}/api/v2.0/indexers/all/results",
                    params=params,
                    cookies=cookies
                )
                
                if response.status_code != 200:
                    logger.error(f"Jackett failed: HTTP {response.status_code}")
                    return []
                
                data = response.json()
                indexer_lookup = {idx.external_id: idx for idx in indexers}
                
                results = []
                for item in data.get("Results", []):
                    try:
                        tracker_id = item.get("Tracker")
                        indexer = indexer_lookup.get(tracker_id)
                        
                        if not indexer:
                            indexer_id = 0
                            indexer_name = tracker_id or "Unknown"
                        else:
                            indexer_id = indexer.id
                            indexer_name = indexer.name
                        
                        result = SearchResult(
                            title=item.get("Title", "Unknown"),
                            download_url=item.get("MagnetUri") or item.get("Link", ""),
                            indexer_id=indexer_id,
                            indexer_name=indexer_name,
                            size_bytes=item.get("Size", 0),
                            seeders=item.get("Seeders", 0),
                            protocol="torrent",
                            publish_date=datetime.fromisoformat(item["PublishDate"]) if item.get("PublishDate") else None,
                            info_url=item.get("Details"),
                            categories=[str(cat) for cat in item.get("CategoryDesc", [])]
                        )
                        results.append(result)
                        
                    except Exception as e:
                        logger.error(f"Error parsing result: {e}")
                        continue
                
                return results
                
        except Exception as e:
            logger.error(f"Jackett error: {e}", exc_info=True)
            return []


search_service = SearchService()