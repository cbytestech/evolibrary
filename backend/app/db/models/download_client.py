from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from backend.app.db.database import Base

class DownloadClient(Base):
    """
    Download client connections (Deluge, qBittorrent, Transmission, etc.)
    Stores configuration for integrating with download clients
    """
    __tablename__ = "download_clients"

    id = Column(Integer, primary_key=True, index=True)
    
    # Client identification
    name = Column(String(200), nullable=False)  # User-friendly name (e.g., "My Deluge")
    client_type = Column(String(50), nullable=False)  # deluge, qbittorrent, transmission, sabnzbd, nzbget
    
    # Connection details
    host = Column(String(500), nullable=False)  # localhost, 10.0.0.50, deluge
    port = Column(Integer, nullable=False)  # 8112, 8080, etc.
    username = Column(String(200), nullable=True)  # Username (if required)
    password = Column(String(200), nullable=True)  # Password (encrypted in production)
    api_key = Column(String(200), nullable=True)  # API key (for clients that use it)
    use_ssl = Column(Boolean, default=False)  # Use HTTPS/SSL
    
    # Label/Category mappings (JSON stored as text)
    # Format: {
    #   "ebook": {"label": "ebooks", "download_path": "/downloads/ebooks", "extensions": [".epub", ".mobi", ".azw3"]},
    #   "audiobook": {"label": "audiobooks", "download_path": "/downloads/audiobooks", "extensions": [".m4b", ".mp3"]},
    #   ...
    # }
    label_mappings = Column(Text, nullable=True)
    
    # Configuration (JSON stored as text)
    config = Column(Text, nullable=True)  # Additional client-specific settings as JSON
    
    # Status
    enabled = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Is this the default client?
    
    last_test_at = Column(DateTime, nullable=True)
    last_test_status = Column(String(20), nullable=True)  # success, failed, pending
    last_test_message = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<DownloadClient {self.name} ({self.client_type})>"