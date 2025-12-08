from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger
from sqlalchemy.sql import func
from ..database import Base


class Library(Base):
    """Library model for managing book collections"""
    __tablename__ = "libraries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    path = Column(String(500), nullable=False)
    library_type = Column(String(50), nullable=False, default="books")
    enabled = Column(Boolean, nullable=False, default=True)
    
    # Scan settings
    auto_scan = Column(Boolean, nullable=False, default=True)
    scan_schedule = Column(String(50), nullable=False, default="hourly")
    last_scan = Column(DateTime, nullable=True)
    scan_on_startup = Column(Boolean, nullable=False, default=False)
    
    # Metadata settings
    fetch_metadata = Column(Boolean, nullable=False, default=True)
    download_covers = Column(Boolean, nullable=False, default=True)
    organize_files = Column(Boolean, nullable=False, default=False)
    
    # Stats
    total_items = Column(Integer, nullable=False, default=0)
    total_size = Column(BigInteger, nullable=False, default=0)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Library(id={self.id}, name='{self.name}', path='{self.path}')>"
    
    def to_dict(self):
        """Convert library to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
            "library_type": self.library_type,
            "enabled": self.enabled,
            "auto_scan": self.auto_scan,
            "scan_schedule": self.scan_schedule,
            "last_scan": self.last_scan.isoformat() if self.last_scan else None,
            "scan_on_startup": self.scan_on_startup,
            "fetch_metadata": self.fetch_metadata,
            "download_covers": self.download_covers,
            "organize_files": self.organize_files,
            "total_items": self.total_items,
            "total_size": self.total_size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }