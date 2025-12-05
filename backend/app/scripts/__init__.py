"""
🦠 Evolibrary - API Router
Main API routing configuration
"""

from fastapi import APIRouter

# Create main API router
router = APIRouter()

# Import and include books router
from backend.app.api.routes.books import router as books_router

router.include_router(books_router, prefix="/books", tags=["Books"])

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
            "authors": "/api/authors - (Coming soon)",
            "downloads": "/api/downloads - (Coming soon)",
            "settings": "/api/settings - (Coming soon)",
            "indexers": "/api/indexers - (Coming soon)"
        }
    }


__all__ = ["router"]