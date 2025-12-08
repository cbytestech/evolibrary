"""
🦠 Evolibrary - API Router
Main API routing configuration
"""

from fastapi import APIRouter

# Create main API router
router = APIRouter()

# Import and include routers
from .routes.books import router as books_router
from .routes.libraries import router as libraries_router
from .routes.apps import router as apps_router
from .routes.admin import router as admin_router

router.include_router(books_router, prefix="/books", tags=["Books"])
router.include_router(libraries_router, tags=["Libraries"])  # Libraries router already has /libraries prefix
router.include_router(apps_router, tags=["Apps"])  # Apps router already has /apps prefix
router.include_router(admin_router, tags=["Admin"])

# TODO: Implement these routers
# from .routes import authors, downloads, settings, indexers
# router.include_router(authors.router, prefix="/authors", tags=["Authors"])
# router.include_router(downloads.router, prefix="/downloads", tags=["Downloads"])
# router.include_router(settings.router, prefix="/settings", tags=["Settings"])
# router.include_router(indexers.router, prefix="/indexers", tags=["Indexers"])


@router.get("/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "operational",
        "message": "Morpho is ready! 🦠",
        "endpoints": {
            "books": "/api/books - List, search, create, update, delete books",
            "libraries": "/api/libraries - Manage book libraries and scanning",
            "apps": "/api/apps - Manage external app connections (Prowlarr, Jackett, etc.)",
            "authors": "/api/authors - (Coming soon)",
            "downloads": "/api/downloads - (Coming soon)",
            "settings": "/api/settings - (Coming soon)",
            "indexers": "/api/indexers - (Coming soon)"
        }
    }


__all__ = ["router"]