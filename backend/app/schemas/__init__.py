"""
📋 Schemas Package
"""
# File: backend/app/schemas/__init__.py

from .books import (
    BookCreate,
    BookUpdate,
    BookResponse,
    BookListResponse,
    BookSearchParams,
    AuthorCreate,
    AuthorResponse
)

from .quality_profiles import (  # ADDED - NEW
    QualityProfileCreate,
    QualityProfileUpdate,
    QualityProfileResponse,
    QualityProfileListResponse,
    FormatItem,
    MediaType
)

__all__ = [
    # Books
    "BookCreate",
    "BookUpdate",
    "BookResponse",
    "BookListResponse",
    "BookSearchParams",
    "AuthorCreate",
    "AuthorResponse",
    # Quality Profiles - ADDED - NEW
    "QualityProfileCreate",
    "QualityProfileUpdate",
    "QualityProfileResponse",
    "QualityProfileListResponse",
    "FormatItem",
    "MediaType"
]