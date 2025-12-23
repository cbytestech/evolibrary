# File: backend/app/api/routes/apps.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import logging

from backend.app.db.database import get_db
from backend.app.db.models.app import App
from backend.app.db.models.indexer import Indexer
from backend.app.schemas.apps import (
    AppCreate,
    AppUpdate,
    AppResponse,
    AppListResponse,
    AppTestRequest,
    AppTestResponse,
    TestStatus
)
from backend.app.services.app_tester import app_tester

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/apps", tags=["apps"])

@router.get("", response_model=AppListResponse)
async def list_apps(
    db: AsyncSession = Depends(get_db),
    enabled_only: bool = False
):
    """List all configured apps"""
    query = select(App)
    
    if enabled_only:
        query = query.where(App.enabled == True)
    
    result = await db.execute(query)
    apps = result.scalars().all()
    
    return AppListResponse(
        apps=[AppResponse.model_validate(app) for app in apps],
        total=len(apps)
    )

@router.get("/{app_id}", response_model=AppResponse)
async def get_app(
    app_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific app by ID"""
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID {app_id} not found"
        )
    
    return AppResponse.model_validate(app)

@router.post("", response_model=AppResponse, status_code=status.HTTP_201_CREATED)
async def create_app(
    app_data: AppCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new app connection and auto-sync indexers"""
    
    # Check for duplicate names
    result = await db.execute(
        select(App).where(App.name == app_data.name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"App with name '{app_data.name}' already exists"
        )
    
    # Create new app
    new_app = App(
        name=app_data.name,
        app_type=app_data.app_type.value,
        base_url=app_data.base_url.rstrip('/'),
        api_key=app_data.api_key,
        password=app_data.password,
        config=str(app_data.config) if app_data.config else None,
        enabled=app_data.enabled
    )
    
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    
    # AUTO-SYNC INDEXERS for Prowlarr/Jackett
    if new_app.app_type in ['prowlarr', 'jackett']:
        try:
            from backend.app.services.indexer_sync import indexer_sync_service
            await indexer_sync_service.sync_app_indexers(new_app.id, db)
            logger.info(f"✅ Auto-synced indexers for {new_app.name}")
        except Exception as e:
            logger.warning(f"⚠️ Auto-sync failed for {new_app.name}: {e}")
            # Don't fail app creation if sync fails
    
    return AppResponse.model_validate(new_app)

@router.put("/{app_id}", response_model=AppResponse)
async def update_app(
    app_id: int,
    app_data: AppUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing app connection"""
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID {app_id} not found"
        )
    
    # Update fields
    update_data = app_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "app_type" and value:
            setattr(app, field, value.value)
        elif field == "base_url" and value:
            setattr(app, field, value.rstrip('/'))
        elif field == "config" and value:
            setattr(app, field, str(value))
        else:
            setattr(app, field, value)
    
    app.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(app)
    
    return AppResponse.model_validate(app)

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_app(
    app_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete an app connection and all related data (cascade delete)"""
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID {app_id} not found"
        )
    
    # Delete related indexers first (cascade delete)
    indexer_result = await db.execute(
        select(Indexer).where(Indexer.app_id == app_id)
    )
    indexers = indexer_result.scalars().all()
    
    for indexer in indexers:
        await db.delete(indexer)
    
    # Then delete the app
    await db.delete(app)
    await db.commit()
    
    return None

@router.post("/cleanup")
async def cleanup_orphaned_data(
    db: AsyncSession = Depends(get_db)
):
    """Clean up orphaned indexers and other related data"""
    try:
        # Get all valid app IDs
        app_result = await db.execute(select(App.id))
        valid_app_ids = [row[0] for row in app_result.all()]
        
        # Find orphaned indexers
        if valid_app_ids:
            orphaned_result = await db.execute(
                select(Indexer).where(Indexer.app_id.notin_(valid_app_ids))
            )
        else:
            orphaned_result = await db.execute(select(Indexer))
        
        orphaned_indexers = orphaned_result.scalars().all()
        deleted_count = len(orphaned_indexers)
        
        for indexer in orphaned_indexers:
            await db.delete(indexer)
        
        await db.commit()
        
        return {
            "success": True,
            "deleted_indexers": deleted_count,
            "message": f"Cleaned up {deleted_count} orphaned indexer(s)"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clean up: {str(e)}"
        )

@router.post("/test", response_model=AppTestResponse)
async def test_app_connection(
    test_request: AppTestRequest
):
    """Test connection to an app without saving it"""
    result = await app_tester.test_connection(
        app_type=test_request.app_type,
        base_url=test_request.base_url,
        api_key=test_request.api_key,
        password=test_request.password
    )
    
    return result

@router.post("/{app_id}/test", response_model=AppTestResponse)
async def test_existing_app(
    app_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Test connection for an existing app and update its test status"""
    result = await db.execute(select(App).where(App.id == app_id))
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"App with ID {app_id} not found"
        )
    
    # Test the connection
    test_result = await app_tester.test_connection(
        app_type=app.app_type,
        base_url=app.base_url,
        api_key=app.api_key,
        password=app.password
    )
    
    # Update app with test results
    app.last_test_at = datetime.utcnow()
    app.last_test_status = test_result.status.value
    app.last_test_message = test_result.message
    app.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return test_result