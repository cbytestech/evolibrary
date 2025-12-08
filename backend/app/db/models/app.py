from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from backend.app.db.database import Base

class App(Base):
    """
    External application connections (Prowlarr, Jackett, FlareSolverr, Kavita, etc.)
    Stores configuration for integrating with external services
    """
    __tablename__ = "apps"

    id = Column(Integer, primary_key=True, index=True)
    
    # App identification
    name = Column(String(200), nullable=False)  # User-friendly name (e.g., "My Prowlarr")
    app_type = Column(String(50), nullable=False)  # prowlarr, jackett, flaresolverr, kavita
    
    # Connection details
    base_url = Column(String(500), nullable=False)  # http://10.0.0.50:9696
    api_key = Column(String(200), nullable=True)  # API key (encrypted in production)
    password = Column(String(200), nullable=True)  # Password for apps that need it (e.g., Jackett)
    
    # Configuration (JSON stored as text)
    config = Column(Text, nullable=True)  # Additional app-specific settings as JSON
    
    # Status
    enabled = Column(Boolean, default=True)
    last_test_at = Column(DateTime, nullable=True)
    last_test_status = Column(String(20), nullable=True)  # success, failed, pending
    last_test_message = Column(String(500), nullable=True)
    
    # Sync tracking
    last_sync_at = Column(DateTime, nullable=True)
    sync_status = Column(String(20), nullable=True)  # success, failed, in_progress
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<App {self.name} ({self.app_type})>"