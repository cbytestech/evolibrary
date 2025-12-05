"""
🦠 Evolibrary - Database Models
SQLAlchemy ORM models for the application
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Book(Base):
    """Book model - core entity"""
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    
    # Author relationship
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=True)
    author_name = Column(String(200), nullable=False, index=True)  # Denormalized for quick access
    
    # Book identifiers
    isbn = Column(String(13), unique=True, index=True)
    
    # Metadata
    description = Column(Text)
    publisher = Column(String(200))
    published_date = Column(String(50))  # Store as string for flexibility
    page_count = Column(Integer)
    language = Column(String(10), default="en")
    
    # Cover
    cover_url = Column(String(500))
    cover_path = Column(String(500))
    
    # Organization
    categories = Column(JSON, default=list)  # List of categories/genres
    
    # Tracking
    monitored = Column(Boolean, default=False)
    status = Column(String(50), default="wanted")  # wanted, downloading, downloaded, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    author = relationship("Author", back_populates="books")
    files = relationship("BookFile", back_populates="book", cascade="all, delete-orphan")
    downloads = relationship("Download", back_populates="book", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Book(id={self.id}, title='{self.title}', author='{self.author_name}')>"


class Author(Base):
    """Author model"""
    __tablename__ = "authors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    
    # Metadata
    bio = Column(Text)
    birth_date = Column(String(50))
    death_date = Column(String(50))
    website = Column(String(500))
    
    # Images
    photo_url = Column(String(500))
    photo_path = Column(String(500))
    
    # External IDs
    goodreads_id = Column(String(50))
    google_books_id = Column(String(50))
    
    # Tracking
    monitored = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    books = relationship("Book", back_populates="author")
    
    def __repr__(self):
        return f"<Author(id={self.id}, name='{self.name}')>"


class BookFile(Base):
    """Book file model - represents physical files"""
    __tablename__ = "book_files"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    
    # File info
    file_path = Column(String(1000), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_size = Column(Integer)  # bytes
    file_format = Column(String(10), nullable=False, index=True)  # epub, mobi, pdf, m4b, etc.
    
    # Quality
    quality = Column(String(50))  # low, medium, high, ultra
    source = Column(String(100))  # indexer name
    
    # Metadata
    duration = Column(Integer)  # for audiobooks, in seconds
    bitrate = Column(String(20))  # for audiobooks
    
    # Tracking
    is_primary = Column(Boolean, default=False)
    imported = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    book = relationship("Book", back_populates="files")
    
    def __repr__(self):
        return f"<BookFile(id={self.id}, format='{self.file_format}', path='{self.file_path}')>"


class Download(Base):
    """Download tracking model"""
    __tablename__ = "downloads"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    
    # Download info
    download_id = Column(String(100), unique=True, index=True)  # from download client
    indexer = Column(String(100))
    release_title = Column(String(500))
    
    # Client info
    client_type = Column(String(50))  # deluge, qbittorrent, etc.
    client_id = Column(String(100))
    
    # Status
    status = Column(String(50), default="queued", index=True)  # queued, downloading, completed, failed
    progress = Column(Integer, default=0)  # 0-100
    
    # Details
    size = Column(Integer)  # bytes
    download_rate = Column(Integer)  # bytes/sec
    upload_rate = Column(Integer)  # bytes/sec
    eta = Column(Integer)  # seconds
    
    # Error tracking
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Timestamps
    queued_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    book = relationship("Book", back_populates="downloads")
    
    def __repr__(self):
        return f"<Download(id={self.id}, status='{self.status}', progress={self.progress}%)>"


__all__ = ["Base", "Book", "BookFile", "Download", "Author"]