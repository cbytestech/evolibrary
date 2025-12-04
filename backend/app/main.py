"""
🦠 Evolibrary - Main Application
"Evolve Your Reading"
By CookieBytes Technologies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging
from pathlib import Path

from .config import settings
from .db.database import init_db, close_db
from .api import router as api_router

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events"""
    # Startup
    logger.info("🦠 Starting Evolibrary...")
    logger.info(f"Version: {settings.version}")
    logger.info(f"Environment: {settings.environment}")
    
    # Initialize database
    await init_db()
    logger.info("✓ Database initialized")
    
    # TODO: Initialize task queue (Dramatiq)
    # TODO: Start scheduled tasks
    
    logger.info("🦠 Morpho is ready to help you evolve your reading!")
    
    yield
    
    # Shutdown
    logger.info("🦠 Shutting down Evolibrary...")
    await close_db()
    logger.info("✓ Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Self-hosted library management for books, audiobooks, comics & more",
    version=settings.version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for Docker healthcheck"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.version,
        "morpho_says": "🦠 Ready to evolve your reading!"
    }


# Root endpoint
@app.get("/api")
async def root():
    """API root endpoint"""
    return {
        "app": settings.app_name,
        "version": settings.version,
        "tagline": "Evolve Your Reading",
        "mascot": "Morpho 🦠",
        "docs": "/api/docs",
        "health": "/api/health"
    }


# Include API router
app.include_router(api_router, prefix="/api")


# Serve frontend static files (from React build)
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React frontend for all non-API routes"""
        file_path = frontend_dist / full_path
        
        # If file exists, serve it
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise serve index.html (for React Router)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="Not found")
else:
    logger.warning("⚠️  Frontend dist directory not found. Running in API-only mode.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower()
    )
