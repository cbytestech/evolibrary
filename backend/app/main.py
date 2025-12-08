"""
🦠 Evolibrary - Main Application
Self-hosted library management system
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from .config import settings
from .db.database import init_db, close_db, get_db
from .db.migrations import run_migrations
from .api import router as api_router
from .logging_config import (
    setup_logging,
    log_startup,
    log_shutdown,
    log_database,
    log_success,
    log_error
)

# Setup enhanced logging
setup_logging(
    log_level="DEBUG" if settings.debug else "INFO",
    log_file=settings.logs_dir / "evolibrary.log" if settings.logs_dir.exists() else None,
    enable_colors=True
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    log_startup(logger, "🦠 Morpho is waking up!")
    log_startup(logger, f"Environment: {settings.environment}")
    log_startup(logger, f"Version: {settings.version}")
    log_startup(logger, f"Debug mode: {settings.debug}")
    
    try:
        log_database(logger, "Initializing database connection...")
        await init_db()
        log_success(logger, "Database initialized successfully!")
        
        # Run database migrations
        log_database(logger, "Running database migrations...")
        try:
            async for db in get_db():
                await run_migrations(db)
                break
            log_success(logger, "Database migrations complete!")
        except Exception as e:
            log_error(logger, "Migration error (non-critical)", exc=e)
            # Don't crash - migrations might fail if columns already exist
        
    except Exception as e:
        log_error(logger, "Failed to initialize database", exc=e)
        raise
    
    log_success(logger, "🦠 Morpho is ready! Application startup complete!")
    
    yield
    
    # Shutdown
    log_shutdown(logger, "🦠 Morpho is going to sleep...")
    try:
        await close_db()
        log_success(logger, "Database connection closed")
    except Exception as e:
        log_error(logger, "Error closing database", exc=e)
    
    log_shutdown(logger, "🛑 Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="🦠 Self-hosted library management - Evolve Your Reading",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
logger.info(f"🔧 Setting up CORS for origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
logger.info("🔀 Registering API routes")
app.include_router(api_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    logger.debug("💚 Health check requested")
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.version,
        "morpho_says": "🦠 Ready to evolve your reading!"
    }


@app.get("/api")
async def root():
    """Root API endpoint"""
    logger.debug("🌐 Root API endpoint requested")
    return {
        "app": settings.app_name,
        "version": settings.version,
        "message": "Welcome to Evolibrary! 🦠",
        "docs": "/api/docs",
        "health": "/api/health"
    }


# Serve static files from frontend build (for production)
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    logger.info(f"📦 Serving frontend from: {frontend_dist}")
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend or fallback to index.html for React Router"""
        # Skip API routes
        if full_path.startswith("api/"):
            return JSONResponse({"error": "Not found"}, status_code=404)
        
        file_path = frontend_dist / full_path
        
        # If file exists, serve it
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise, serve index.html (for React Router)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        return JSONResponse({"error": "Frontend not built"}, status_code=404)
else:
    logger.warning("⚠️  Frontend build directory not found. Run 'npm run build' in frontend/")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting Evolibrary in standalone mode")
    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )