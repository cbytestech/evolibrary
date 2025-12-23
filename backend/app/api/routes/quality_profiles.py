# File: backend/app/api/routes/quality_profiles.py
"""
Quality Profiles API Routes
Manage format preferences and download rules
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json

from backend.app.db.database import get_db
from backend.app.db.models.quality_profile import QualityProfile
from backend.app.schemas.quality_profiles import (
    QualityProfileCreate,
    QualityProfileUpdate,
    QualityProfileResponse,
    QualityProfileListResponse,
    FormatItem,
    DEFAULT_PROFILES
)

router = APIRouter(prefix="/quality-profiles", tags=["quality-profiles"])


@router.get("", response_model=QualityProfileListResponse)
async def list_quality_profiles(
    db: AsyncSession = Depends(get_db),
    enabled_only: bool = False,
    media_type: str = None
):
    """List all quality profiles"""
    query = select(QualityProfile)
    
    if enabled_only:
        query = query.where(QualityProfile.enabled == True)
    
    if media_type:
        query = query.where(QualityProfile.media_type == media_type)
    
    result = await db.execute(query)
    profiles = result.scalars().all()
    
    # Deserialize format_items JSON
    response_profiles = []
    for profile in profiles:
        format_items = json.loads(profile.format_items) if profile.format_items else []
        
        profile_dict = {
            "id": profile.id,
            "name": profile.name,
            "description": profile.description,
            "format_items": [FormatItem(**item) for item in format_items],
            "cutoff_format": profile.cutoff_format,
            "allow_upgrades": profile.allow_upgrades,
            "upgrade_until_cutoff": profile.upgrade_until_cutoff,
            "media_type": profile.media_type,
            "enabled": profile.enabled,
            "is_default": profile.is_default,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at
        }
        response_profiles.append(QualityProfileResponse(**profile_dict))
    
    return QualityProfileListResponse(
        profiles=response_profiles,
        total=len(response_profiles)
    )


@router.get("/{profile_id}", response_model=QualityProfileResponse)
async def get_quality_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific quality profile by ID"""
    result = await db.execute(
        select(QualityProfile).where(QualityProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality profile with ID {profile_id} not found"
        )
    
    # Deserialize format_items
    format_items = json.loads(profile.format_items) if profile.format_items else []
    
    profile_dict = {
        "id": profile.id,
        "name": profile.name,
        "description": profile.description,
        "format_items": [FormatItem(**item) for item in format_items],
        "cutoff_format": profile.cutoff_format,
        "allow_upgrades": profile.allow_upgrades,
        "upgrade_until_cutoff": profile.upgrade_until_cutoff,
        "media_type": profile.media_type,
        "enabled": profile.enabled,
        "is_default": profile.is_default,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }
    
    return QualityProfileResponse(**profile_dict)


@router.post("", response_model=QualityProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_quality_profile(
    profile_data: QualityProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new quality profile"""
    
    # Check for duplicate names
    result = await db.execute(
        select(QualityProfile).where(QualityProfile.name == profile_data.name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quality profile with name '{profile_data.name}' already exists"
        )
    
    # If this is set as default, unset all other defaults for this media type
    if profile_data.is_default:
        existing_defaults = (await db.execute(
            select(QualityProfile).where(
                QualityProfile.is_default == True,
                QualityProfile.media_type == profile_data.media_type.value
            )
        )).scalars().all()
        
        for default_profile in existing_defaults:
            default_profile.is_default = False
    
    # Serialize format_items to JSON
    format_items_json = json.dumps([item.model_dump() for item in profile_data.format_items])
    
    # Create new profile
    new_profile = QualityProfile(
        name=profile_data.name,
        description=profile_data.description,
        format_items=format_items_json,
        cutoff_format=profile_data.cutoff_format,
        allow_upgrades=profile_data.allow_upgrades,
        upgrade_until_cutoff=profile_data.upgrade_until_cutoff,
        media_type=profile_data.media_type.value,
        enabled=profile_data.enabled,
        is_default=profile_data.is_default
    )
    
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_profile)
    
    # Return response
    format_items = json.loads(new_profile.format_items)
    profile_dict = {
        "id": new_profile.id,
        "name": new_profile.name,
        "description": new_profile.description,
        "format_items": [FormatItem(**item) for item in format_items],
        "cutoff_format": new_profile.cutoff_format,
        "allow_upgrades": new_profile.allow_upgrades,
        "upgrade_until_cutoff": new_profile.upgrade_until_cutoff,
        "media_type": new_profile.media_type,
        "enabled": new_profile.enabled,
        "is_default": new_profile.is_default,
        "created_at": new_profile.created_at,
        "updated_at": new_profile.updated_at
    }
    
    return QualityProfileResponse(**profile_dict)


@router.put("/{profile_id}", response_model=QualityProfileResponse)
async def update_quality_profile(
    profile_id: int,
    profile_data: QualityProfileUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing quality profile"""
    result = await db.execute(
        select(QualityProfile).where(QualityProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality profile with ID {profile_id} not found"
        )
    
    # If setting as default, unset other defaults for this media type
    if profile_data.is_default and not profile.is_default:
        existing_defaults = (await db.execute(
            select(QualityProfile).where(
                QualityProfile.is_default == True,
                QualityProfile.media_type == profile.media_type
            )
        )).scalars().all()
        
        for default_profile in existing_defaults:
            if default_profile.id != profile_id:
                default_profile.is_default = False
    
    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "format_items" and value:
            # Serialize to JSON
            setattr(profile, field, json.dumps([item.model_dump() for item in value]))
        elif field == "media_type" and value:
            setattr(profile, field, value.value)
        else:
            setattr(profile, field, value)
    
    await db.commit()
    await db.refresh(profile)
    
    # Return response
    format_items = json.loads(profile.format_items)
    profile_dict = {
        "id": profile.id,
        "name": profile.name,
        "description": profile.description,
        "format_items": [FormatItem(**item) for item in format_items],
        "cutoff_format": profile.cutoff_format,
        "allow_upgrades": profile.allow_upgrades,
        "upgrade_until_cutoff": profile.upgrade_until_cutoff,
        "media_type": profile.media_type,
        "enabled": profile.enabled,
        "is_default": profile.is_default,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }
    
    return QualityProfileResponse(**profile_dict)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quality_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a quality profile"""
    result = await db.execute(
        select(QualityProfile).where(QualityProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quality profile with ID {profile_id} not found"
        )
    
    # Don't allow deleting the only default profile
    if profile.is_default:
        other_profiles = (await db.execute(
            select(QualityProfile).where(
                QualityProfile.media_type == profile.media_type,
                QualityProfile.id != profile_id
            )
        )).scalars().all()
        
        if other_profiles:
            # Set another profile as default
            other_profiles[0].is_default = True
    
    await db.delete(profile)
    await db.commit()
    
    return None


@router.post("/seed-defaults", status_code=status.HTTP_201_CREATED)
async def seed_default_profiles(db: AsyncSession = Depends(get_db)):
    """Seed default quality profiles if none exist"""
    
    # Check if any profiles exist
    result = await db.execute(select(QualityProfile))
    existing = result.scalars().first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quality profiles already exist. Delete them first if you want to reset."
        )
    
    # Create default profiles
    created = []
    for profile_data in DEFAULT_PROFILES:
        format_items_json = json.dumps(profile_data["format_items"])
        
        new_profile = QualityProfile(
            name=profile_data["name"],
            description=profile_data["description"],
            format_items=format_items_json,
            cutoff_format=profile_data["cutoff_format"],
            media_type=profile_data["media_type"],
            is_default=profile_data["is_default"],
            enabled=profile_data["enabled"]
        )
        db.add(new_profile)
        created.append(profile_data["name"])
    
    await db.commit()
    
    return {
        "status": "success",
        "message": f"Created {len(created)} default quality profiles",
        "profiles": created
    }