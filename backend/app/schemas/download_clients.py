from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

class ClientType(str, Enum):
    """Supported download client types"""
    DELUGE = "deluge"
    QBITTORRENT = "qbittorrent"
    TRANSMISSION = "transmission"
    SABNZBD = "sabnzbd"
    NZBGET = "nzbget"

class TestStatus(str, Enum):
    """Test result status"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"

class MediaType(str, Enum):
    """Media types for label mapping"""
    EBOOK = "ebook"
    AUDIOBOOK = "audiobook"
    COMIC = "comic"
    MAGAZINE = "magazine"

class LabelMapping(BaseModel):
    """Label mapping for a specific media type"""
    label: str = Field(..., description="Label/category name in download client")
    download_path: str = Field(..., description="Download path for this media type")
    extensions: List[str] = Field(default_factory=list, description="File extensions (e.g., ['.epub', '.mobi'])")
    
    class Config:
        from_attributes = True

class DownloadClientBase(BaseModel):
    """Base schema for download client"""
    name: str = Field(..., min_length=1, max_length=200, description="User-friendly name")
    client_type: ClientType = Field(..., description="Type of download client")
    host: str = Field(..., min_length=1, max_length=500, description="Hostname or IP")
    port: int = Field(..., ge=1, le=65535, description="Port number")
    username: Optional[str] = Field(None, max_length=200, description="Username (if required)")
    password: Optional[str] = Field(None, max_length=200, description="Password")
    api_key: Optional[str] = Field(None, max_length=200, description="API key (if required)")
    use_ssl: bool = Field(default=False, description="Use HTTPS/SSL")
    label_mappings: Optional[Dict[str, LabelMapping]] = Field(None, description="Label mappings for media types")
    config: Optional[Dict[str, Any]] = Field(None, description="Additional configuration")
    enabled: bool = Field(default=True, description="Is client enabled")
    is_default: bool = Field(default=False, description="Is this the default client")

class DownloadClientCreate(DownloadClientBase):
    """Schema for creating a new download client"""
    pass

class DownloadClientUpdate(BaseModel):
    """Schema for updating an existing download client"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    client_type: Optional[ClientType] = None
    host: Optional[str] = Field(None, min_length=1, max_length=500)
    port: Optional[int] = Field(None, ge=1, le=65535)
    username: Optional[str] = Field(None, max_length=200)
    password: Optional[str] = Field(None, max_length=200)
    api_key: Optional[str] = Field(None, max_length=200)
    use_ssl: Optional[bool] = None
    label_mappings: Optional[Dict[str, LabelMapping]] = None
    config: Optional[Dict[str, Any]] = None
    enabled: Optional[bool] = None
    is_default: Optional[bool] = None

class DownloadClientResponse(DownloadClientBase):
    """Schema for download client response"""
    id: int
    last_test_at: Optional[datetime] = None
    last_test_status: Optional[TestStatus] = None
    last_test_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DownloadClientListResponse(BaseModel):
    """Schema for list of download clients"""
    clients: List[DownloadClientResponse]
    total: int

class DownloadClientTestRequest(BaseModel):
    """Schema for testing a download client connection"""
    client_type: ClientType
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None
    use_ssl: bool = False

class DownloadClientTestResponse(BaseModel):
    """Schema for test response"""
    status: TestStatus
    message: str
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True