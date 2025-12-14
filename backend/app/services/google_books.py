# File: backend/app/services/google_books.py
"""
📚 Google Books API Integration

Automatically enriches book metadata during library scanning.
"""

import httpx
import logging
from typing import Optional, Dict
import os

logger = logging.getLogger(__name__)


class GoogleBooksService:
    """Service for fetching metadata from Google Books API"""
    
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_BOOKS_API_KEY', '')
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
        self.timeout = 10.0
    
    async def search_by_title_author(self, title: str, author: str) -> Optional[Dict]:
        """
        Search Google Books by title and author
        
        Returns the best match or None
        """
        try:
            query = f"{title} {author}".strip()
            return await self._search(query)
        except Exception as e:
            logger.error(f"Failed to search by title/author: {e}")
            return None
    
    async def search_by_isbn(self, isbn: str) -> Optional[Dict]:
        """
        Search Google Books by ISBN (most accurate)
        
        Returns book data or None
        """
        try:
            query = f"isbn:{isbn}"
            return await self._search(query)
        except Exception as e:
            logger.error(f"Failed to search by ISBN: {e}")
            return None
    
    async def _search(self, query: str) -> Optional[Dict]:
        """
        Internal search method
        
        Returns the first (best) result or None
        """
        try:
            params = {
                'q': query,
                'maxResults': 1
            }
            
            if self.api_key:
                params['key'] = self.api_key
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                
                if response.status_code != 200:
                    logger.warning(f"Google Books API returned {response.status_code}")
                    return None
                
                data = response.json()
                
                if not data.get('items'):
                    logger.info(f"No results found for query: {query}")
                    return None
                
                # Return first result
                return self._extract_metadata(data['items'][0])
                
        except Exception as e:
            logger.error(f"Google Books API error: {e}")
            return None
    
    def _extract_metadata(self, item: Dict) -> Dict:
        """
        Extract and normalize metadata from Google Books response
        
        Returns a clean dictionary of book metadata
        """
        volume_info = item.get('volumeInfo', {})
        
        # Extract ISBN
        isbn = None
        for identifier in volume_info.get('industryIdentifiers', []):
            if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                isbn = identifier.get('identifier')
                break
        
        # Extract cover URL
        cover_url = None
        image_links = volume_info.get('imageLinks', {})
        if 'thumbnail' in image_links:
            cover_url = image_links['thumbnail'].replace('http:', 'https:')
        
        # Build metadata dictionary
        metadata = {
            'title': volume_info.get('title'),
            'author_name': volume_info.get('authors', ['Unknown'])[0],
            'description': volume_info.get('description'),
            'published_date': volume_info.get('publishedDate'),
            'page_count': volume_info.get('pageCount'),
            'isbn': isbn,
            'language': volume_info.get('language', 'en'),
            'publisher': volume_info.get('publisher'),
            'categories': volume_info.get('categories', []),
            'cover_url': cover_url
        }
        
        # Remove None values
        return {k: v for k, v in metadata.items() if v is not None}


# Singleton instance
google_books_service = GoogleBooksService()