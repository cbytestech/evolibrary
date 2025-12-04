"""
🦠 Evolibrary - API Router
Main API routing configuration
"""

from fastapi import APIRouter

# Create main API router
router = APIRouter()

# Import and include sub-routers
# from .routers import books, authors, downloads, settings, indexers

# TODO: Implement these routers
# router.include_router(books.router, prefix="/books", tags=["Books"])
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
            "books": "/api/books",
            "authors": "/api/authors",
            "downloads": "/api/downloads",
            "settings": "/api/settings",
            "indexers": "/api/indexers"
        }
    }


__all__ = ["router"]
