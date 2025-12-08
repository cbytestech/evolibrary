from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from datetime import datetime
from backend.app.db.database import Base

class Indexer(Base):
    """
    Indexers discovered from Prowlarr/Jackett
    Auto-populated from connected apps
    """
    __tablename__ = "indexers"

    id = Column(Integer, primary_key=True, index=True)
    
    # Source tracking
    app_id = Column(Integer, ForeignKey("apps.id"), nullable=False)  # Which app provided this
    external_id = Column(String(100), nullable=False)  # ID in Prowlarr/Jackett
    
    # Indexer details
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    protocol = Column(String(20), nullable=False)  # torrent, usenet
    
    # Categories supported
    categories = Column(Text, nullable=True)  # JSON array of category IDs
    
    # Status
    enabled = Column(Boolean, default=True)
    configured = Column(Boolean, default=True)  # Is it configured in source app
    
    # Priority (lower number = higher priority)
    priority = Column(Integer, default=50)
    
    # Stats
    last_search_at = Column(DateTime, nullable=True)
    total_searches = Column(Integer, default=0)
    total_grabs = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_sync_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<Indexer {self.name} ({self.protocol})>"