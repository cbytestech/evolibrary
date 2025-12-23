# File: backend/app/services/download_manager.py
"""
Download Manager Service
Handles sending downloads to download clients with proper labeling
"""
import httpx
import logging
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models.download_client import DownloadClient
from backend.app.db.models.book import Book
from backend.app.services.deluge_service import deluge_service

logger = logging.getLogger(__name__)


class DownloadManager:
    """Manages sending downloads to configured download clients"""
    
    def __init__(self):
        self.timeout = 10.0
    
    async def send_to_client(
        self,
        db: AsyncSession,
        download_url: str,
        book_title: str,
        media_type: str = "ebook",
        file_format: Optional[str] = None,
        client_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send download to appropriate client
        
        Args:
            db: Database session
            download_url: Torrent URL or magnet link
            book_title: Title of the book
            media_type: Type of media (ebook, audiobook, comic, magazine)
            file_format: File format (epub, mobi, etc.)
            client_id: Optional specific client ID, otherwise uses default
        
        Returns:
            Dictionary with success status and details
        """
        
        # Get download client
        if client_id:
            result = await db.execute(
                select(DownloadClient).where(DownloadClient.id == client_id)
            )
            client = result.scalar_one_or_none()
        else:
            # Get default enabled client
            result = await db.execute(
                select(DownloadClient).where(
                    DownloadClient.enabled == True,
                    DownloadClient.is_default == True
                )
            )
            client = result.scalar_one_or_none()
            
            if not client:
                # Get any enabled client
                result = await db.execute(
                    select(DownloadClient).where(DownloadClient.enabled == True)
                )
                client = result.scalar_one_or_none()
        
        if not client:
            return {
                "success": False,
                "error": "No download client configured"
            }
        
        logger.info(f"Sending '{book_title}' to {client.name} ({client.client_type})")
        
        # Get label and download path from client's label mappings
        label_info = self._get_label_for_media_type(client, media_type)
        
        # Send to appropriate client
        try:
            if client.client_type == "deluge":
                return await self._send_to_deluge(
                    client=client,
                    download_url=download_url,
                    label=label_info.get("label"),
                    download_path=label_info.get("download_path")
                )
            elif client.client_type == "qbittorrent":
                return await self._send_to_qbittorrent(
                    client=client,
                    download_url=download_url,
                    category=label_info.get("label"),
                    save_path=label_info.get("download_path")
                )
            else:
                return {
                    "success": False,
                    "error": f"Client type {client.client_type} not yet supported"
                }
        
        except Exception as e:
            logger.error(f"Error sending to download client: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_label_for_media_type(
        self,
        client: DownloadClient,
        media_type: str
    ) -> Dict[str, Optional[str]]:
        """
        Get label and download path for media type from client configuration
        
        Returns:
            Dictionary with 'label' and 'download_path'
        """
        import json
        
        if not client.label_mappings:
            return {"label": None, "download_path": None}
        
        try:
            label_mappings = json.loads(client.label_mappings)
            mapping = label_mappings.get(media_type, {})
            
            return {
                "label": mapping.get("label"),
                "download_path": mapping.get("download_path")
            }
        except Exception as e:
            logger.error(f"Error parsing label mappings: {e}")
            return {"label": None, "download_path": None}
    
    async def _send_to_deluge(
        self,
        client: DownloadClient,
        download_url: str,
        label: Optional[str] = None,
        download_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send download to Deluge"""
        try:
            result = await deluge_service.add_torrent(
                host=client.host,
                port=client.port,
                password=client.password or "",
                torrent_url=download_url,
                label=label,
                download_path=download_path,
                use_ssl=client.use_ssl
            )
            
            if result.get("success"):
                logger.info(f"Successfully added to Deluge with label '{label}'")
                return {
                    "success": True,
                    "client": "deluge",
                    "torrent_id": result.get("torrent_id"),
                    "label": label,
                    "download_path": download_path
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to add torrent to Deluge"
                }
                
        except Exception as e:
            logger.error(f"Deluge add torrent error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _send_to_qbittorrent(
        self,
        client: DownloadClient,
        download_url: str,
        category: Optional[str] = None,
        save_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send download to qBittorrent - PLACEHOLDER"""
        # TODO: Implement qBittorrent support
        return {
            "success": False,
            "error": "qBittorrent support coming soon"
        }
    
    async def update_book_status(
        self,
        db: AsyncSession,
        book_id: int,
        status: str = "downloading",
        monitored: bool = True
    ):
        """Update book status after sending to download client"""
        result = await db.execute(
            select(Book).where(Book.id == book_id)
        )
        book = result.scalar_one_or_none()
        
        if book:
            book.status = status
            book.monitored = monitored
            await db.commit()
            logger.info(f"Updated book {book_id} status to '{status}'")


# Singleton instance
download_manager = DownloadManager()