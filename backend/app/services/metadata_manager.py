# File: backend/app/services/metadata_manager.py
"""
📝 Metadata Manager Service

Saves and loads metadata files alongside books for persistence.
Supports multiple formats:
- .json (simple JSON metadata)
- metadata.opf (Calibre-compatible OPF format)
- cover.jpg (downloaded cover image)
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime
import httpx

logger = logging.getLogger(__name__)


class MetadataManager:
    """Manages metadata files for books"""
    
    METADATA_FILENAME = "metadata.json"
    OPF_FILENAME = "metadata.opf"
    COVER_FILENAME = "cover.jpg"
    
    @staticmethod
    def get_book_folder(file_path: str) -> Path:
        """
        Get the folder where metadata should be stored.
        For single files: same directory as the file
        For audiobook folders: the folder itself
        """
        path = Path(file_path)
        
        # If it's a folder (audiobooks), use the folder
        if path.is_dir():
            return path
        
        # If it's a file, use parent directory
        return path.parent
    
    @staticmethod
    async def save_metadata(file_path: str, metadata: Dict) -> bool:
        """
        Save metadata as JSON file alongside the book
        
        Args:
            file_path: Path to the book file or folder
            metadata: Dictionary containing book metadata
        
        Returns:
            True if successful, False otherwise
        """
        try:
            folder = MetadataManager.get_book_folder(file_path)
            metadata_path = folder / MetadataManager.METADATA_FILENAME
            
            # Add timestamp
            metadata['_updated_at'] = datetime.utcnow().isoformat()
            
            # Write JSON file
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Saved metadata to {metadata_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save metadata for {file_path}: {e}")
            return False
    
    @staticmethod
    async def load_metadata(file_path: str) -> Optional[Dict]:
        """
        Load metadata from JSON file
        
        Args:
            file_path: Path to the book file or folder
        
        Returns:
            Dictionary containing metadata, or None if not found
        """
        try:
            folder = MetadataManager.get_book_folder(file_path)
            metadata_path = folder / MetadataManager.METADATA_FILENAME
            
            if not metadata_path.exists():
                return None
            
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            logger.info(f"📖 Loaded metadata from {metadata_path}")
            return metadata
            
        except Exception as e:
            logger.error(f"❌ Failed to load metadata for {file_path}: {e}")
            return None
    
    @staticmethod
    async def save_opf(file_path: str, metadata: Dict) -> bool:
        """
        Save metadata as Calibre-compatible OPF file
        
        This allows compatibility with Calibre and other tools
        """
        try:
            folder = MetadataManager.get_book_folder(file_path)
            opf_path = folder / MetadataManager.OPF_FILENAME
            
            # Build OPF XML
            opf_content = f"""<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{metadata.get('title', 'Unknown')}</dc:title>
    <dc:creator opf:role="aut">{metadata.get('author_name', 'Unknown')}</dc:creator>
    <dc:identifier opf:scheme="ISBN">{metadata.get('isbn', '')}</dc:identifier>
    <dc:publisher>{metadata.get('publisher', '')}</dc:publisher>
    <dc:date>{metadata.get('published_date', '')}</dc:date>
    <dc:language>{metadata.get('language', 'en')}</dc:language>
    <dc:description>{metadata.get('description', '')}</dc:description>
    <meta name="calibre:timestamp" content="{datetime.utcnow().isoformat()}" />
  </metadata>
</package>"""
            
            with open(opf_path, 'w', encoding='utf-8') as f:
                f.write(opf_content)
            
            logger.info(f"✅ Saved OPF metadata to {opf_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save OPF for {file_path}: {e}")
            return False
    
    @staticmethod
    async def download_cover(file_path: str, cover_url: str) -> Optional[str]:
        """
        Download cover image and save it alongside the book
        
        Args:
            file_path: Path to the book file or folder
            cover_url: URL of the cover image
        
        Returns:
            Path to saved cover, or None if failed
        """
        try:
            folder = MetadataManager.get_book_folder(file_path)
            cover_path = folder / MetadataManager.COVER_FILENAME
            
            # Download cover image
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(cover_url)
                
                if response.status_code != 200:
                    logger.error(f"Failed to download cover: HTTP {response.status_code}")
                    return None
                
                # Save cover
                with open(cover_path, 'wb') as f:
                    f.write(response.content)
            
            logger.info(f"✅ Downloaded cover to {cover_path}")
            return str(cover_path)
            
        except Exception as e:
            logger.error(f"❌ Failed to download cover for {file_path}: {e}")
            return None
    
    @staticmethod
    def get_cover_path(file_path: str) -> Optional[str]:
        """
        Get path to cover image if it exists
        
        Args:
            file_path: Path to the book file or folder
        
        Returns:
            Path to cover if exists, None otherwise
        """
        try:
            folder = MetadataManager.get_book_folder(file_path)
            cover_path = folder / MetadataManager.COVER_FILENAME
            
            if cover_path.exists():
                return str(cover_path)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get cover path for {file_path}: {e}")
            return None
    
    @staticmethod
    async def save_all(file_path: str, metadata: Dict, cover_url: Optional[str] = None) -> Dict[str, bool]:
        """
        Save all metadata formats at once
        
        Args:
            file_path: Path to the book file or folder
            metadata: Dictionary containing book metadata
            cover_url: Optional URL to download cover from
        
        Returns:
            Dictionary with success status for each format
        """
        results = {
            'json': False,
            'opf': False,
            'cover': False
        }
        
        # Save JSON metadata
        results['json'] = await MetadataManager.save_metadata(file_path, metadata)
        
        # Save OPF metadata
        results['opf'] = await MetadataManager.save_opf(file_path, metadata)
        
        # Download and save cover if URL provided
        if cover_url:
            cover_path = await MetadataManager.download_cover(file_path, cover_url)
            results['cover'] = cover_path is not None
        
        return results


# Singleton instance
metadata_manager = MetadataManager()