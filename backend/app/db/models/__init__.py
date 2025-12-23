"""
Database models
"""
# File: backend/app/db/models/__init__.py

from .book import Book
from .library import Library
from .author import Author
from .app import App
from .indexer import Indexer
from .download_client import DownloadClient  # ADDED
from .quality_profile import QualityProfile  # ADDED - NEW

__all__ = [
    "Book", 
    "Library", 
    "Author", 
    "App", 
    "Indexer", 
    "DownloadClient",  # ADDED
    "QualityProfile"   # ADDED - NEW
]