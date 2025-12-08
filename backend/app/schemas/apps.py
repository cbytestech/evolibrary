from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from enum import Enum

class AppType(str, Enum):
    """Supported external application types"""
    PROWLARR = "prowlarr"
    JACKETT = "jackett"
    FLARESOLVERR = "flaresolverr"
    KAVITA = "kavita"
    CALIBRE_WEB = "calibre_web"

class TestStatus(str, Enum):
    """Connection test status"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"

class AppBase(BaseModel):
    """Base schema for App"""
    name: str = Field(..., min_length=1, max_length=200, description="User-friendly name")
    app_type: AppType = Field(..., description="Type of application")
    base_url: str = Field(..., description="Base URL of the application")
    api_key: Optional[str] = Field(None, description="API key for authentication")
    password: Optional[str] = Field(None, description="Password for authentication (e.g., Jackett admin password)")
    config: Optional[dict] = Field(None, description="Additional configuration")
    enabled: bool = Field(True, description="Whether the app connection is enabled")

class AppCreate(AppBase):
    """Schema for creating a new app connection"""
    pass

class AppUpdate(BaseModel):
    """Schema for updating an app connection"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    app_type: Optional[AppType] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    password: Optional[str] = None
    config: Optional[dict] = None
    enabled: Optional[bool] = None

class AppResponse(AppBase):
    """Schema for app response"""
    id: int
    last_test_at: Optional[datetime] = None
    last_test_status: Optional[TestStatus] = None
    last_test_message: Optional[str] = None
    last_sync_at: Optional[datetime] = None
    sync_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AppTestRequest(BaseModel):
    """Schema for testing app connection"""
    base_url: str = Field(..., description="Base URL to test")
    api_key: Optional[str] = Field(None, description="API key to test")
    password: Optional[str] = Field(None, description="Password to test")
    app_type: AppType = Field(..., description="Type of application")

class AppTestResponse(BaseModel):
    """Schema for connection test result"""
    status: TestStatus
    message: str
    details: Optional[dict] = None  # Additional info like version, indexer count, etc.

class AppListResponse(BaseModel):
    """Schema for list of apps"""
    apps: list[AppResponse]
    total: int