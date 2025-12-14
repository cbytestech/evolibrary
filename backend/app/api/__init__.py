# File: backend/app/api/__init__.py
"""
🦋 Evolibrary - API Router
Main API routing configuration
"""

from fastapi import APIRouter

# Create main API router
router = APIRouter()

# Import and include routers
from .routes.books import router as books_router
from .routes.libraries import router as libraries_router
from .routes.apps import router as apps_router
from .routes.indexers import router as indexers_router
from .routes.system import router as system_router
from .routes.admin import router as admin_router
from .routes.download_clients import router as download_clients_router 

# Include routers
# NOTE: Don't add prefix here if the router already has one defined!
router.include_router(books_router, tags=["Books"])  # ← FIXED: Removed prefix="/books" (router already has it)
router.include_router(libraries_router, tags=["Libraries"])  # Libraries router already has /libraries prefix
router.include_router(apps_router, tags=["Apps"])  # Apps router already has /apps prefix
router.include_router(indexers_router, tags=["Indexers"])  # Indexers router already has /indexers prefix
router.include_router(system_router, tags=["System"])  # System info endpoints
router.include_router(admin_router, tags=["Admin"])
router.include_router(download_clients_router, tags=["Download Clients"])

# TODO: Implement these routers
# from .routes import authors, downloads, settings
# router.include_router(authors.router, prefix="/authors", tags=["Authors"])
# router.include_router(downloads.router, prefix="/downloads", tags=["Downloads"])
# router.include_router(settings.router, prefix="/settings", tags=["Settings"])


@router.get("/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "operational",
        "message": "Morpho is ready! 🦋",
        "endpoints": {
            "books": "/api/books - List, search, create, update, delete books",
            "libraries": "/api/libraries - Manage book libraries and scanning",
            "apps": "/api/apps - Manage external app connections (Prowlarr, Jackett, etc.)",
            "indexers": "/api/indexers - Manage search indexers from apps",
            "authors": "/api/authors - (Coming soon)",
            "downloads": "/api/downloads - (Coming soon)",
            "settings": "/api/settings - (Coming soon)"
        }
    }


__all__ = ["router"]