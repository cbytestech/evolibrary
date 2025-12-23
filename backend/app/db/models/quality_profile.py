# File: backend/app/db/models/quality_profile.py
"""
Quality Profile Model
Defines format preferences and download rules for books
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from datetime import datetime
from backend.app.db.database import Base


class QualityProfile(Base):
    """
    Quality profiles define format preferences and download decisions
    Similar to Radarr/Sonarr quality profiles
    """
    __tablename__ = "quality_profiles"

    id = Column(Integer, primary_key=True, index=True)
    
    # Profile identification
    name = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Format preferences (stored as JSON)
    # Example: [
    #   {"format": "epub", "priority": 1, "min_size_mb": 0, "max_size_mb": 50, "enabled": true},
    #   {"format": "mobi", "priority": 2, "min_size_mb": 0, "max_size_mb": 50, "enabled": true},
    #   {"format": "pdf", "priority": 3, "min_size_mb": 0, "max_size_mb": 100, "enabled": false}
    # ]
    format_items = Column(Text, nullable=False)  # JSON string
    
    # Cutoff - stop searching when this format is found
    cutoff_format = Column(String(20), nullable=True)
    
    # Upgrade settings
    allow_upgrades = Column(Boolean, default=True)
    upgrade_until_cutoff = Column(Boolean, default=True)
    
    # Media type this profile applies to
    media_type = Column(String(50), default="ebook")  # ebook, audiobook, comic, magazine
    
    # Status
    is_default = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<QualityProfile {self.name} ({self.media_type})>"