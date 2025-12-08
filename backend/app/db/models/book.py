from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Book(Base):
    """Book model"""
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    
    # Library relationship
    library_id = Column(Integer, ForeignKey('libraries.id', ondelete='SET NULL'), nullable=True, index=True)
    
    # Basic info
    title = Column(String(500), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey('authors.id', ondelete='SET NULL'), nullable=True)
    author_name = Column(String(255), nullable=True, index=True)
    
    # Identifiers
    isbn = Column(String(13), nullable=True, index=True)
    
    # Details
    description = Column(Text, nullable=True)
    publisher = Column(String(255), nullable=True)
    published_date = Column(String(50), nullable=True)
    page_count = Column(Integer, nullable=True)
    language = Column(String(10), nullable=True)
    
    # Cover images
    cover_url = Column(String(500), nullable=True)
    cover_path = Column(String(500), nullable=True)
    
    # Categories (JSON stored as string)
    categories = Column(Text, nullable=True)
    
    # File info
    file_path = Column(String(1000), nullable=True, index=True)
    file_format = Column(String(10), nullable=True)
    file_size = Column(BigInteger, nullable=True)
    
    # Status
    monitored = Column(Boolean, nullable=False, default=True)
    status = Column(String(50), nullable=False, default="wanted")
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}', author='{self.author_name}')>"
    
    def to_dict(self):
        """Convert book to dictionary"""
        return {
            "id": self.id,
            "library_id": self.library_id,
            "title": self.title,
            "author_id": self.author_id,
            "author_name": self.author_name,
            "isbn": self.isbn,
            "description": self.description,
            "publisher": self.publisher,
            "published_date": self.published_date,
            "page_count": self.page_count,
            "language": self.language,
            "cover_url": self.cover_url,
            "cover_path": self.cover_path,
            "categories": self.categories,
            "file_path": self.file_path,
            "file_format": self.file_format,
            "file_size": self.file_size,
            "monitored": self.monitored,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }