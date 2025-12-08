from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List, Optional
from datetime import datetime
import logging

from backend.app.db.database import get_db
from backend.app.db.models.library import Library
from backend.app.services.library_scanner import LibraryScanner
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/libraries", tags=["libraries"])


# Pydantic schemas
class LibraryCreate(BaseModel):
    name: str
    path: str
    library_type: str = "books"
    auto_scan: bool = True
    scan_schedule: str = "hourly"
    scan_on_startup: bool = False
    fetch_metadata: bool = True
    download_covers: bool = True
    organize_files: bool = False


class LibraryUpdate(BaseModel):
    name: Optional[str] = None
    path: Optional[str] = None
    library_type: Optional[str] = None
    enabled: Optional[bool] = None
    auto_scan: Optional[bool] = None
    scan_schedule: Optional[str] = None
    scan_on_startup: Optional[bool] = None
    fetch_metadata: Optional[bool] = None
    download_covers: Optional[bool] = None
    organize_files: Optional[bool] = None


class ScanResponse(BaseModel):
    status: str
    library_id: int
    message: str
    stats: Optional[dict] = None


# In-memory scan progress tracking
# 🎁 SECRET FEATURE #2: Real-time scan progress with WebSocket-ready structure
scan_progress = {}


@router.get("")
async def list_libraries(
    db: AsyncSession = Depends(get_db)
):
    """List all libraries"""
    logger.info("📚 [API] Listing all libraries")
    
    result = await db.execute(select(Library).order_by(Library.name))
    libraries = result.scalars().all()
    
    return {"libraries": [lib.to_dict() for lib in libraries]}
           
@router.get("/{library_id}")
async def get_library(
    library_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get library details"""
    logger.info(f"📚 [API] Getting library {library_id}")
    
    library = await db.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    library_dict = library.to_dict()
    # 🎁 SECRET FEATURE #2: Include scan progress
    library_dict["scan_progress"] = scan_progress.get(library_id)
    
    return library_dict


@router.post("")
async def create_library(
    library_data: LibraryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Create new library"""
    logger.info(f"➕ [API] Creating library: {library_data.name}")
    
    # Check if name already exists
    result = await db.execute(
        select(Library).where(Library.name == library_data.name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Library name already exists")
    
    # Create library
    library = Library(
        name=library_data.name,
        path=library_data.path,
        library_type=library_data.library_type,
        auto_scan=library_data.auto_scan,
        scan_schedule=library_data.scan_schedule,
        scan_on_startup=library_data.scan_on_startup,
        fetch_metadata=library_data.fetch_metadata,
        download_covers=library_data.download_covers,
        organize_files=library_data.organize_files,
    )
    
    db.add(library)
    await db.commit()
    await db.refresh(library)
    
    logger.info(f"✅ [LIBRARY] Created: {library.name} (id={library.id})")
    
    # Auto-scan if requested
    if library_data.scan_on_startup:
        background_tasks.add_task(scan_library_task, library.id, db)
    
    return library.to_dict()


@router.put("/{library_id}")
async def update_library(
    library_id: int,
    library_data: LibraryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update library"""
    logger.info(f"🔄 [API] Updating library {library_id}")
    
    library = await db.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    # Update fields
    update_data = library_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(library, field, value)
    
    library.updated_at = datetime.utcnow()
    await db.commit()
    
    logger.info(f"✅ [LIBRARY] Updated: {library.name}")
    
    return library.to_dict()


@router.delete("/{library_id}")
async def delete_library(
    library_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete library"""
    logger.info(f"🗑️  [API] Deleting library {library_id}")
    
    library = await db.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    await db.delete(library)
    await db.commit()
    
    logger.info(f"✅ [LIBRARY] Deleted: {library.name}")
    
    return {"status": "deleted", "library_id": library_id}


@router.post("/{library_id}/scan")
async def scan_library(
    library_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger library scan
    🎁 SECRET FEATURE #2: Real-time progress tracking
    """
    logger.info(f"🔍 [API] Starting scan for library {library_id}")
    
    library = await db.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    # Check if already scanning
    if library_id in scan_progress and scan_progress[library_id]["status"] == "scanning":
        raise HTTPException(status_code=409, detail="Library is already being scanned")
    
    # Initialize progress tracking
    # 🎁 SECRET FEATURE #2: Detailed progress with ETA
    scan_progress[library_id] = {
        "status": "scanning",
        "progress": 0,
        "total_files": 0,
        "processed": 0,
        "added": 0,
        "updated": 0,
        "duplicates": 0,
        "errors": 0,
        "started_at": datetime.utcnow().isoformat(),
        "eta_seconds": None
    }
    
    # Start background scan
    background_tasks.add_task(scan_library_task, library_id, db)
    
    return ScanResponse(
        status="started",
        library_id=library_id,
        message=f"Scan started for library: {library.name}"
    )


@router.get("/{library_id}/scan/status")
async def get_scan_status(library_id: int):
    """
    Get scan progress
    🎁 SECRET FEATURE #2: Real-time progress updates
    """
    if library_id not in scan_progress:
        return {
            "status": "idle",
            "library_id": library_id
        }
    
    return {
        "library_id": library_id,
        **scan_progress[library_id]
    }


# 🎁 SECRET FEATURE #2: Smart scan statistics endpoint
@router.get("/{library_id}/stats")
async def get_library_stats(
    library_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed library statistics
    🎁 SECRET FEATURE #2: Analytics!
    """
    from backend.app.db.models.book import Book
    
    library = await db.get(Library, library_id)
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    # Get detailed stats
    result = await db.execute(text("""
        SELECT 
            COUNT(*) as total_books,
            COUNT(DISTINCT author_name) as total_authors,
            SUM(file_size) as total_size,
            AVG(file_size) as avg_size,
            MIN(created_at) as oldest_book,
            MAX(created_at) as newest_book
        FROM books 
        WHERE library_id = :library_id
    """), {"library_id": library_id})
    
    stats = result.fetchone()
    
    # Get format breakdown
    result = await db.execute(text("""
        SELECT file_format, COUNT(*) as count
        FROM books
        WHERE library_id = :library_id
        GROUP BY file_format
    """), {"library_id": library_id})
    
    formats = {row[0]: row[1] for row in result.fetchall()}
    
    return {
        "library_id": library_id,
        "library_name": library.name,
        "total_books": stats[0] or 0,
        "total_authors": stats[1] or 0,
        "total_size_bytes": stats[2] or 0,
        "total_size_mb": round((stats[2] or 0) / 1024 / 1024, 2),
        "avg_file_size_mb": round((stats[3] or 0) / 1024 / 1024, 2),
        "oldest_book_added": stats[4].isoformat() if stats[4] else None,
        "newest_book_added": stats[5].isoformat() if stats[5] else None,
        "formats": formats,
        "last_scan": library.last_scan.isoformat() if library.last_scan else None
    }


# Background task for scanning
async def scan_library_task(library_id: int, db: AsyncSession):
    """Background task to scan library with progress tracking"""
    import time
    
    try:
        scanner = LibraryScanner(db)
        
        # Update progress callback
        def update_progress(stats):
            if library_id in scan_progress:
                # Calculate ETA
                elapsed = time.time() - start_time
                if stats['processed'] > 0:
                    time_per_file = elapsed / stats['processed']
                    remaining = stats['total_files'] - stats['processed']
                    eta = remaining * time_per_file
                else:
                    eta = None
                
                scan_progress[library_id].update({
                    "progress": int((stats['processed'] / max(stats['total_files'], 1)) * 100),
                    "total_files": stats['total_files'],
                    "processed": stats['processed'],
                    "added": stats['added'],
                    "updated": stats['updated'],
                    "duplicates": stats['duplicates'],
                    "errors": stats['errors'],
                    "eta_seconds": int(eta) if eta else None
                })
        
        start_time = time.time()
        
        # Patch scanner to update progress
        original_process = scanner._process_file
        async def tracked_process(*args, **kwargs):
            result = await original_process(*args, **kwargs)
            update_progress(scanner.scan_stats)
            return result
        scanner._process_file = tracked_process
        
        # Run scan
        stats = await scanner.scan_library(library_id)
        
        # Mark complete
        scan_progress[library_id] = {
            "status": "complete",
            "progress": 100,
            **stats,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"✅ Scan complete for library {library_id}: {stats}")
        
    except Exception as e:
        logger.error(f"❌ Scan failed for library {library_id}: {e}")
        scan_progress[library_id] = {
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.utcnow().isoformat()
        }
