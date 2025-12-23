# File: backend/app/api/routes/search.py
"""
Search API Routes
Search for books across indexers and send to download clients
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
import logging

from backend.app.db.database import get_db
from backend.app.db.models.book import Book
from backend.app.db.models.quality_profile import QualityProfile
from backend.app.services.search_service import search_service
from backend.app.services.download_manager import download_manager

router = APIRouter(prefix="/search", tags=["search"])
logger = logging.getLogger(__name__)


class SearchRequest(BaseModel):
    """Request schema for book search"""
    query: str
    indexer_ids: Optional[List[int]] = None
    categories: Optional[List[str]] = None
    limit: int = 100


class SearchResponse(BaseModel):
    """Response schema for search results"""
    results: List[dict]
    total: int
    query: str


class DownloadRequest(BaseModel):
    """Request schema for downloading a book"""
    download_url: str
    title: str
    indexer_id: int
    size_bytes: Optional[int] = 0
    file_format: Optional[str] = None
    book_id: Optional[int] = None
    quality_profile_id: Optional[int] = None
    media_type: str = "ebook"


class DownloadResponse(BaseModel):
    """Response schema for download request"""
    success: bool
    message: str
    details: Optional[dict] = None


def filter_videos_and_movies(results: List) -> List:
    """
    Filter out video files and movies from search results
    
    This ensures only books, audiobooks, comics, and magazines come through
    """
    # Video file extensions to block
    video_formats = [
        'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 
        'm4v', 'mpg', 'mpeg', 'ts', 'vob', '3gp', 'ogv',
        'divx', 'xvid', 'rm', 'rmvb', 'asf', 'qt'
    ]
    
    # Movie/TV indicators in title
    movie_indicators = [
        'bluray', 'blu-ray', 'webrip', 'web-dl', 'hdtv', 'brrip',
        '1080p', '720p', '2160p', '4k', 'x264', 'x265', 'hevc',
        'dvdrip', 'cam', 'hdrip', 'proper', 'repack', 'remux',
        'web.dl', 'webdl', 'hdcam', 'screener', 'dvdscr',
        's01e', 's02e', 's03e', 's04e', 's05e',  # TV series patterns
        'season', 'complete.series'
    ]
    
    # Book/media indicators - if present, likely not a movie
    book_indicators = [
        'epub', 'mobi', 'azw', 'azw3', 'cbz', 'cbr', 'cb7', 'cbt',
        'm4b', 'audiobook', 'comic', 'manga', 'graphic.novel',
        'ebook', 'e-book', 'magazine', 'pdf'
    ]
    
    filtered_results = []
    filtered_count = 0
    
    for result in results:
        title_lower = result.title.lower()
        file_format = result.file_format.lower() if result.file_format else None
        
        # Check 1: Block video file formats
        if file_format and file_format in video_formats:
            logger.info(f"🎬 Filtering video (format={file_format}): {result.title[:60]}")
            filtered_count += 1
            continue
        
        # Check 2: Has book indicators? Allow it
        has_book_indicator = any(ind in title_lower for ind in book_indicators)
        if has_book_indicator:
            filtered_results.append(result)
            continue
        
        # Check 3: Has movie indicators? Block it (unless has book indicators above)
        has_movie_indicator = any(ind in title_lower for ind in movie_indicators)
        if has_movie_indicator:
            logger.info(f"🎬 Filtering movie (indicator): {result.title[:60]}")
            filtered_count += 1
            continue
        
        # Default: Allow
        filtered_results.append(result)
    
    if filtered_count > 0:
        logger.info(f"🗑 Filtered out {filtered_count} videos/movies from {len(results)} total results")
    
    return filtered_results


@router.post("/books", response_model=SearchResponse)
async def search_books(
    search_request: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Search for books across all enabled indexers
    
    This queries Prowlarr and Jackett to find available downloads
    """
    try:
        results = await search_service.search(
            db=db,
            query=search_request.query,
            indexer_ids=search_request.indexer_ids,
            categories=search_request.categories,
            limit=search_request.limit
        )
        
        # ⭐ FILTER OUT VIDEOS AND MOVIES
        filtered_results = filter_videos_and_movies(results)
        
        logger.info(f"📊 Search '{search_request.query}': {len(filtered_results)} results after filtering")
        
        return SearchResponse(
            results=[result.to_dict() for result in filtered_results],
            total=len(filtered_results),
            query=search_request.query
        )
    
    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.post("/download", response_model=DownloadResponse)
async def download_book(
    download_request: DownloadRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a book download to the configured download client
    
    This will:
    1. Validate against quality profile (if provided)
    2. Send to download client (Deluge) with proper label
    3. Update book status (if book_id provided)
    """
    
    logger.info(f"📥 Download request: {download_request.title}")
    logger.info(f"   Media type: {download_request.media_type}")
    logger.info(f"   Format: {download_request.file_format}")
    
    # Validate quality profile if provided
    if download_request.quality_profile_id:
        profile_result = await db.execute(
            select(QualityProfile).where(
                QualityProfile.id == download_request.quality_profile_id
            )
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quality profile not found"
            )
        
        logger.info(f"Using quality profile: {profile.name}")
    
    # Send to download client
    try:
        result = await download_manager.send_to_client(
            db=db,
            download_url=download_request.download_url,
            book_title=download_request.title,
            media_type=download_request.media_type,
            file_format=download_request.file_format
        )
        
        if not result.get("success"):
            return DownloadResponse(
                success=False,
                message=result.get("error", "Download failed"),
                details=result
            )
        
        # Update book status if book_id provided
        if download_request.book_id:
            await download_manager.update_book_status(
                db=db,
                book_id=download_request.book_id,
                status="downloading",
                monitored=True
            )
        
        # Update indexer stats
        from backend.app.db.models.indexer import Indexer
        indexer_result = await db.execute(
            select(Indexer).where(Indexer.id == download_request.indexer_id)
        )
        indexer = indexer_result.scalar_one_or_none()
        
        if indexer:
            indexer.total_grabs = (indexer.total_grabs or 0) + 1
            await db.commit()
        
        logger.info(f"✅ Successfully sent '{download_request.title}' to download client")
        
        return DownloadResponse(
            success=True,
            message=f"Successfully sent '{download_request.title}' to download client",
            details=result
        )
        
    except Exception as e:
        logger.error(f"Download failed: {e}", exc_info=True)
        return DownloadResponse(
            success=False,
            message=f"Download failed: {str(e)}",
            details={"error": str(e)}
        )


@router.get("/auto/{book_id}")
async def auto_search_book(
    book_id: int,
    db: AsyncSession = Depends(get_db),
    quality_profile_id: Optional[int] = None,
    auto_download: bool = False
):
    """
    Automatically search for a specific book and optionally download best match
    
    Args:
        book_id: Database ID of the book to search for
        quality_profile_id: Optional quality profile to use
        auto_download: If True, automatically download the best match
    """
    
    # Get book
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )
    
    # Build search query
    search_query = book.title
    if book.author_name:
        search_query = f"{book.author_name} {book.title}"
    
    # Search
    results = await search_service.search(
        db=db,
        query=search_query,
        limit=20
    )
    
    # ⭐ FILTER OUT VIDEOS AND MOVIES
    filtered_results = filter_videos_and_movies(results)
    
    if not filtered_results:
        return {
            "success": False,
            "message": f"No results found for '{search_query}'",
            "book_id": book_id,
            "results": []
        }
    
    # If auto_download, grab the best result
    if auto_download and filtered_results:
        best_result = filtered_results[0]  # Already sorted by seeders
        
        download_result = await download_manager.send_to_client(
            db=db,
            download_url=best_result.download_url,
            book_title=book.title,
            media_type="ebook",  # TODO: Detect from book's library type
            file_format=best_result.file_format
        )
        
        if download_result.get("success"):
            await download_manager.update_book_status(
                db=db,
                book_id=book_id,
                status="downloading",
                monitored=True
            )
            
            return {
                "success": True,
                "message": f"Automatically downloaded '{best_result.title}'",
                "book_id": book_id,
                "download": download_result,
                "selected_result": best_result.to_dict()
            }
        else:
            return {
                "success": False,
                "message": "Search succeeded but download failed",
                "book_id": book_id,
                "error": download_result.get("error"),
                "results": [r.to_dict() for r in filtered_results[:10]]
            }
    
    return {
        "success": True,
        "message": f"Found {len(filtered_results)} results for '{search_query}'",
        "book_id": book_id,
        "results": [r.to_dict() for r in filtered_results[:20]]
    }


@router.post("/monitor/{book_id}")
async def monitor_book(
    book_id: int,
    monitored: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Enable or disable monitoring for a book
    
    When monitored, the book will be automatically searched periodically
    """
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found"
        )
    
    book.monitored = monitored
    book.status = "monitoring" if monitored else "wanted"
    await db.commit()
    
    return {
        "success": True,
        "message": f"Book {'monitored' if monitored else 'unmonitored'}",
        "book_id": book_id,
        "monitored": monitored,
        "status": book.status
    }