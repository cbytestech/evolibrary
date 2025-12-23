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
from .routes.quality_profiles import router as quality_profiles_router  # ADDED - NEW
from .routes.search import router as search_router  # ADDED - NEW

# Include routers
# NOTE: Don't add prefix here if the router already has one defined!
router.include_router(books_router, tags=["Books"])
router.include_router(libraries_router, tags=["Libraries"])
router.include_router(apps_router, tags=["Apps"])
router.include_router(indexers_router, tags=["Indexers"])
router.include_router(system_router, tags=["System"])
router.include_router(admin_router, tags=["Admin"])
router.include_router(download_clients_router, tags=["Download Clients"])
router.include_router(quality_profiles_router, tags=["Quality Profiles"])  # ADDED - NEW
router.include_router(search_router, tags=["Search"])  # ADDED - NEW

# TODO: Implement these routers
# from .routes import authors, downloads, settings
# router.include_router(authors.router, prefix="/authors", tags=["Authors"])
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
            "download_clients": "/api/download-clients - Manage download clients (Deluge, qBittorrent)",
            "quality_profiles": "/api/quality-profiles - Manage format preferences",  # ADDED - NEW
            "search": "/api/search - Search and download books",  # ADDED - NEW
            "authors": "/api/authors - (Coming soon)",
            "settings": "/api/settings - (Coming soon)"
        }
    }


__all__ = ["router"]