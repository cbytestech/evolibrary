"""
🦠 Evolibrary - Configuration Management
Settings loaded from environment variables and config.yaml
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from pathlib import Path
from typing import List, Optional
import os
import warnings


class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    app_name: str = Field(default="Evolibrary", alias="APP_NAME")
    version: str = "0.1.0"
    environment: str = Field(default="production", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8787, alias="PORT")
    log_level: str = Field(default="info", alias="LOG_LEVEL")
    workers: int = Field(default=1, alias="WORKERS")
    
    # Paths
    config_dir: Path = Field(default=Path("/config"), alias="CONFIG_DIR")
    books_dir: Path = Field(default=Path("/books"), alias="BOOKS_DIR")
    downloads_dir: Path = Field(default=Path("/downloads"), alias="DOWNLOADS_DIR")
    logs_dir: Path = Field(default=Path("/app/logs"), alias="LOGS_DIR")
    
    # Database
    database_url: str = Field(
        default="sqlite:////config/evolibrary.db",
        alias="DATABASE_URL"
    )
    db_pool_size: int = Field(default=10, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=20, alias="DB_MAX_OVERFLOW")
    db_echo: bool = Field(default=False, alias="DB_ECHO")
    
    # Security
    secret_key: str = Field(default="CHANGE_ME", alias="SECRET_KEY")
    jwt_secret: str = Field(default="CHANGE_ME", alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8787"],
        alias="CORS_ORIGINS"
    )
    
    # Features
    enable_notifications: bool = Field(default=True, alias="ENABLE_NOTIFICATIONS")
    enable_webhooks: bool = Field(default=True, alias="ENABLE_WEBHOOKS")
    enable_metadata_fetching: bool = Field(default=True, alias="ENABLE_METADATA_FETCHING")
    
    # External Services
    prowlarr_url: Optional[str] = Field(default=None, alias="PROWLARR_URL")
    prowlarr_api_key: Optional[str] = Field(default=None, alias="PROWLARR_API_KEY")
    
    jackett_url: Optional[str] = Field(default=None, alias="JACKETT_URL")
    jackett_api_key: Optional[str] = Field(default=None, alias="JACKETT_API_KEY")
    
    kavita_url: Optional[str] = Field(default=None, alias="KAVITA_URL")
    kavita_api_key: Optional[str] = Field(default=None, alias="KAVITA_API_KEY")
    
    # Metadata Providers
    google_books_api_key: Optional[str] = Field(default=None, alias="GOOGLE_BOOKS_API_KEY")
    goodreads_api_key: Optional[str] = Field(default=None, alias="GOODREADS_API_KEY")
    
    # Task Queue
    redis_url: Optional[str] = Field(default=None, alias="REDIS_URL")
    
    # User/Group (Docker)
    puid: int = Field(default=1000, alias="PUID")
    pgid: int = Field(default=1000, alias="PGID")
    tz: str = Field(default="UTC", alias="TZ")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator("secret_key", "jwt_secret")
    @classmethod
    def validate_secrets(cls, v, info):
        """Warn if using default secrets"""
        if v == "CHANGE_ME":
            warnings.warn(
                f"⚠️  {info.field_name} is set to default value. "
                "Please change it in production!",
                UserWarning
            )
        return v
    
    @field_validator("config_dir", "books_dir", "downloads_dir", "logs_dir")
    @classmethod
    def ensure_path_exists(cls, v):
        """Ensure directory exists"""
        if isinstance(v, str):
            v = Path(v)
        # Only create directories if we're not in Windows development mode
        # (directories like /config don't make sense on Windows)
        if not str(v).startswith("/") or os.name != 'nt':
            try:
                v.mkdir(parents=True, exist_ok=True)
            except (PermissionError, OSError):
                # On Windows with paths like /config, this will fail - that's okay
                pass
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment == "development"
    
    @property
    def database_is_sqlite(self) -> bool:
        """Check if using SQLite"""
        return self.database_url.startswith("sqlite")
    
    @property
    def database_is_postgres(self) -> bool:
        """Check if using PostgreSQL"""
        return self.database_url.startswith("postgresql")


# Create global settings instance
settings = Settings()


# Export for easy import
__all__ = ["settings", "Settings"]
