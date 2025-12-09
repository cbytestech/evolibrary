"""
Indexers API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from backend.app.db.database import get_db
from backend.app.db.models.indexer import Indexer
from backend.app.db.models.app import App
from backend.app.services.indexer_sync import indexer_sync_service

router = APIRouter()


@router.get("/indexers")
async def list_indexers(
    enabled_only: bool = Query(False, description="Filter to enabled indexers only"),
    protocol: Optional[str] = Query(None, description="Filter by protocol (torrent/usenet)"),
    configured_only: bool = Query(False, description="Filter to configured indexers only"),
    search: Optional[str] = Query(None, description="Search indexer names"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all indexers with optional filters
    """
    query = select(Indexer, App).join(App, Indexer.app_id == App.id)
    
    if enabled_only:
        query = query.where(Indexer.enabled == True)
    
    if configured_only:
        query = query.where(Indexer.configured == True)
    
    if protocol:
        query = query.where(Indexer.protocol == protocol.lower())
    
    if search:
        query = query.where(Indexer.name.ilike(f"%{search}%"))
    
    # Order by priority (lower = higher priority), then by name
    query = query.order_by(Indexer.priority.asc(), Indexer.name.asc())
    
    result = await db.execute(query)
    rows = result.all()
    
    indexers = []
    for indexer, app in rows:
        indexers.append({
            "id": indexer.id,
            "name": indexer.name,
            "description": indexer.description,
            "protocol": indexer.protocol,
            "categories": indexer.categories.split(",") if indexer.categories else [],
            "enabled": indexer.enabled,
            "configured": indexer.configured,
            "priority": indexer.priority,
            "app_name": app.name,
            "app_type": app.app_type,
            "total_searches": indexer.total_searches or 0,
            "total_grabs": indexer.total_grabs or 0,
            "last_search_at": indexer.last_search_at.isoformat() if indexer.last_search_at else None,
            "last_sync_at": indexer.last_sync_at.isoformat() if indexer.last_sync_at else None
        })
    
    # Get summary stats - simple count approach
    all_indexers_query = select(Indexer)
    all_result = await db.execute(all_indexers_query)
    all_indexers_list = all_result.scalars().all()
    
    stats = {
        "total": len(all_indexers_list),
        "enabled": sum(1 for idx in all_indexers_list if idx.enabled),
        "configured": sum(1 for idx in all_indexers_list if idx.configured)
    }
    
    return {
        "indexers": indexers,
        "stats": stats
    }


@router.get("/indexers/{indexer_id}")
async def get_indexer(
    indexer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific indexer by ID"""
    query = select(Indexer, App).join(App, Indexer.app_id == App.id).where(Indexer.id == indexer_id)
    result = await db.execute(query)
    row = result.one_or_none()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indexer with ID {indexer_id} not found"
        )
    
    indexer, app = row
    
    return {
        "id": indexer.id,
        "name": indexer.name,
        "description": indexer.description,
        "protocol": indexer.protocol,
        "categories": indexer.categories.split(",") if indexer.categories else [],
        "enabled": indexer.enabled,
        "configured": indexer.configured,
        "priority": indexer.priority,
        "app_name": app.name,
        "app_type": app.app_type,
        "app_id": app.id,
        "external_id": indexer.external_id,
        "total_searches": indexer.total_searches or 0,
        "total_grabs": indexer.total_grabs or 0,
        "last_search_at": indexer.last_search_at.isoformat() if indexer.last_search_at else None,
        "last_sync_at": indexer.last_sync_at.isoformat() if indexer.last_sync_at else None,
        "created_at": indexer.created_at.isoformat(),
        "updated_at": indexer.updated_at.isoformat()
    }


@router.patch("/indexers/{indexer_id}")
async def update_indexer(
    indexer_id: int,
    enabled: Optional[bool] = None,
    priority: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update an indexer (enable/disable, change priority)"""
    query = select(Indexer).where(Indexer.id == indexer_id)
    result = await db.execute(query)
    indexer = result.scalar_one_or_none()
    
    if not indexer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indexer with ID {indexer_id} not found"
        )
    
    if enabled is not None:
        indexer.enabled = enabled
    
    if priority is not None:
        indexer.priority = priority
    
    await db.commit()
    await db.refresh(indexer)
    
    return {
        "id": indexer.id,
        "name": indexer.name,
        "enabled": indexer.enabled,
        "priority": indexer.priority,
        "message": "Indexer updated successfully"
    }


@router.post("/indexers/sync")
async def sync_indexers(
    db: AsyncSession = Depends(get_db)
):
    """
    Sync indexers from all connected apps (Prowlarr, Jackett)
    """
    result = await indexer_sync_service.sync_all_indexers(db)
    
    if result["errors"]:
        return {
            "status": "partial",
            "message": f"Synced {result['total_synced']} indexers with some errors",
            **result
        }
    
    return {
        "status": "success",
        "message": f"Successfully synced {result['total_synced']} indexers",
        **result
    }


from pydantic import BaseModel

class BulkEnableRequest(BaseModel):
    indexer_ids: List[int]
    enabled: bool


@router.post("/indexers/bulk-enable")
async def bulk_enable_indexers(
    request: BulkEnableRequest,
    db: AsyncSession = Depends(get_db)
):
    """Enable or disable multiple indexers at once"""
    stmt = update(Indexer).where(Indexer.id.in_(request.indexer_ids)).values(enabled=request.enabled)
    await db.execute(stmt)
    await db.commit()
    
    return {
        "status": "success",
        "message": f"{'Enabled' if request.enabled else 'Disabled'} {len(request.indexer_ids)} indexers",
        "count": len(request.indexer_ids)
    }


@router.delete("/indexers/{indexer_id}")
async def delete_indexer(
    indexer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete an indexer"""
    query = select(Indexer).where(Indexer.id == indexer_id)
    result = await db.execute(query)
    indexer = result.scalar_one_or_none()
    
    if not indexer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indexer with ID {indexer_id} not found"
        )
    
    await db.delete(indexer)
    await db.commit()
    
    return {
        "status": "success",
        "message": f"Deleted indexer: {indexer.name}"
    }