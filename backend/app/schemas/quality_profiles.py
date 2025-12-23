# File: backend/app/schemas/quality_profiles.py
"""
Quality Profile Schemas
Pydantic models for API validation and serialization
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MediaType(str, Enum):
    """Media types for quality profiles"""
    EBOOK = "ebook"
    AUDIOBOOK = "audiobook"
    COMIC = "comic"
    MAGAZINE = "magazine"


class FormatItem(BaseModel):
    """Individual format preference within a profile"""
    format: str = Field(..., description="File format (e.g., epub, mobi, pdf, m4b)")
    priority: int = Field(..., ge=1, description="Priority (1 = highest)")
    min_size_mb: float = Field(default=0, ge=0, description="Minimum file size in MB")
    max_size_mb: float = Field(default=0, ge=0, description="Maximum file size in MB (0 = no limit)")
    enabled: bool = Field(default=True, description="Is this format enabled")
    
    class Config:
        from_attributes = True


class QualityProfileBase(BaseModel):
    """Base schema for quality profile"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    format_items: List[FormatItem] = Field(..., min_items=1, description="Format preferences ordered by priority")
    cutoff_format: Optional[str] = Field(None, description="Stop searching when this format is found")
    allow_upgrades: bool = Field(default=True, description="Allow upgrading to better quality")
    upgrade_until_cutoff: bool = Field(default=True, description="Upgrade until cutoff format is reached")
    media_type: MediaType = Field(default=MediaType.EBOOK, description="Media type this profile applies to")
    enabled: bool = Field(default=True, description="Is profile enabled")
    is_default: bool = Field(default=False, description="Is this the default profile")


class QualityProfileCreate(QualityProfileBase):
    """Schema for creating a quality profile"""
    pass


class QualityProfileUpdate(BaseModel):
    """Schema for updating a quality profile"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    format_items: Optional[List[FormatItem]] = None
    cutoff_format: Optional[str] = None
    allow_upgrades: Optional[bool] = None
    upgrade_until_cutoff: Optional[bool] = None
    media_type: Optional[MediaType] = None
    enabled: Optional[bool] = None
    is_default: Optional[bool] = None


class QualityProfileResponse(QualityProfileBase):
    """Schema for quality profile response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QualityProfileListResponse(BaseModel):
    """Schema for list of quality profiles"""
    profiles: List[QualityProfileResponse]
    total: int


# Default quality profiles for seeding
DEFAULT_PROFILES = [
    {
        "name": "Standard eBook",
        "description": "Prefer EPUB, fallback to other formats",
        "media_type": "ebook",
        "cutoff_format": "epub",
        "format_items": [
            {"format": "epub", "priority": 1, "min_size_mb": 0, "max_size_mb": 50, "enabled": True},
            {"format": "mobi", "priority": 2, "min_size_mb": 0, "max_size_mb": 50, "enabled": True},
            {"format": "azw3", "priority": 3, "min_size_mb": 0, "max_size_mb": 50, "enabled": True},
            {"format": "pdf", "priority": 4, "min_size_mb": 0, "max_size_mb": 100, "enabled": True},
        ],
        "is_default": True,
        "enabled": True
    },
    {
        "name": "High Quality Audiobook",
        "description": "Prefer M4B, then high-quality MP3",
        "media_type": "audiobook",
        "cutoff_format": "m4b",
        "format_items": [
            {"format": "m4b", "priority": 1, "min_size_mb": 50, "max_size_mb": 0, "enabled": True},
            {"format": "mp3", "priority": 2, "min_size_mb": 50, "max_size_mb": 0, "enabled": True},
            {"format": "m4a", "priority": 3, "min_size_mb": 0, "max_size_mb": 0, "enabled": True},
        ],
        "is_default": False,
        "enabled": True
    },
    {
        "name": "Comic Archive",
        "description": "Prefer CBZ, fallback to CBR",
        "media_type": "comic",
        "cutoff_format": "cbz",
        "format_items": [
            {"format": "cbz", "priority": 1, "min_size_mb": 0, "max_size_mb": 500, "enabled": True},
            {"format": "cbr", "priority": 2, "min_size_mb": 0, "max_size_mb": 500, "enabled": True},
            {"format": "cb7", "priority": 3, "min_size_mb": 0, "max_size_mb": 500, "enabled": True},
        ],
        "is_default": False,
        "enabled": True
    }
]