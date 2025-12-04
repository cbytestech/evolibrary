"""
🦠 Evolibrary - Database Management
SQLAlchemy database setup and connection management
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool
from contextlib import asynccontextmanager
import logging

from ..config import settings

logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Create async engine
if settings.database_is_sqlite:
    # SQLite configuration
    engine = create_async_engine(
        settings.database_url.replace("sqlite://", "sqlite+aiosqlite://"),
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.db_echo
    )
else:
    # PostgreSQL configuration
    engine = create_async_engine(
        settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        echo=settings.db_echo
    )

# Create async session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """Initialize database tables"""
    try:
        async with engine.begin() as conn:
            # Import all models here to ensure they're registered
            from . import models  # noqa
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"✗ Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connections"""
    try:
        await engine.dispose()
        logger.info("✓ Database connections closed")
    except Exception as e:
        logger.error(f"✗ Failed to close database: {e}")


@asynccontextmanager
async def get_db():
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Dependency function for FastAPI
async def get_db_session() -> AsyncSession:
    """FastAPI dependency for database session"""
    async with get_db() as session:
        yield session


__all__ = ["Base", "engine", "AsyncSessionLocal", "get_db", "get_db_session", "init_db", "close_db"]
