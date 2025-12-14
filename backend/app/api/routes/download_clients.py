from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import json

from backend.app.db.database import get_db
from backend.app.db.models.download_client import DownloadClient
from backend.app.schemas.download_clients import (
    DownloadClientCreate,
    DownloadClientUpdate,
    DownloadClientResponse,
    DownloadClientListResponse,
    DownloadClientTestRequest,
    DownloadClientTestResponse,
    TestStatus
)
from backend.app.services.download_client_tester import download_client_tester

router = APIRouter(prefix="/download-clients", tags=["download-clients"])

@router.get("", response_model=DownloadClientListResponse)
async def list_download_clients(
    db: AsyncSession = Depends(get_db),
    enabled_only: bool = False
):
    """List all configured download clients"""
    query = select(DownloadClient)
    
    if enabled_only:
        query = query.where(DownloadClient.enabled == True)
    
    result = await db.execute(query)
    clients = result.scalars().all()
    
    # Parse JSON fields for response
    response_clients = []
    for client in clients:
        client_dict = {
            "id": client.id,
            "name": client.name,
            "client_type": client.client_type,
            "host": client.host,
            "port": client.port,
            "username": client.username,
            "password": client.password,
            "api_key": client.api_key,
            "use_ssl": client.use_ssl,
            "label_mappings": json.loads(client.label_mappings) if client.label_mappings else None,
            "config": json.loads(client.config) if client.config else None,
            "enabled": client.enabled,
            "is_default": client.is_default,
            "last_test_at": client.last_test_at,
            "last_test_status": client.last_test_status,
            "last_test_message": client.last_test_message,
            "created_at": client.created_at,
            "updated_at": client.updated_at
        }
        response_clients.append(DownloadClientResponse(**client_dict))
    
    return DownloadClientListResponse(
        clients=response_clients,
        total=len(response_clients)
    )

@router.get("/{client_id}", response_model=DownloadClientResponse)
async def get_download_client(
    client_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific download client by ID"""
    result = await db.execute(select(DownloadClient).where(DownloadClient.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download client with ID {client_id} not found"
        )
    
    # Parse JSON fields
    client_dict = {
        "id": client.id,
        "name": client.name,
        "client_type": client.client_type,
        "host": client.host,
        "port": client.port,
        "username": client.username,
        "password": client.password,
        "api_key": client.api_key,
        "use_ssl": client.use_ssl,
        "label_mappings": json.loads(client.label_mappings) if client.label_mappings else None,
        "config": json.loads(client.config) if client.config else None,
        "enabled": client.enabled,
        "is_default": client.is_default,
        "last_test_at": client.last_test_at,
        "last_test_status": client.last_test_status,
        "last_test_message": client.last_test_message,
        "created_at": client.created_at,
        "updated_at": client.updated_at
    }
    
    return DownloadClientResponse(**client_dict)

@router.post("", response_model=DownloadClientResponse, status_code=status.HTTP_201_CREATED)
async def create_download_client(
    client_data: DownloadClientCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new download client connection"""
    
    # Check for duplicate names
    result = await db.execute(
        select(DownloadClient).where(DownloadClient.name == client_data.name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Download client with name '{client_data.name}' already exists"
        )
    
    # If this is set as default, unset all other defaults
    if client_data.is_default:
        await db.execute(
            select(DownloadClient).where(DownloadClient.is_default == True)
        )
        existing_defaults = (await db.execute(
            select(DownloadClient).where(DownloadClient.is_default == True)
        )).scalars().all()
        
        for default_client in existing_defaults:
            default_client.is_default = False
    
    # Serialize label_mappings properly (convert Pydantic models to dicts)
    label_mappings_json = None
    if client_data.label_mappings:
        label_mappings_dict = {}
        for key, mapping in client_data.label_mappings.items():
            label_mappings_dict[key] = mapping.model_dump() if hasattr(mapping, 'model_dump') else mapping
        label_mappings_json = json.dumps(label_mappings_dict)
    
    # Create new download client
    new_client = DownloadClient(
        name=client_data.name,
        client_type=client_data.client_type.value,
        host=client_data.host,
        port=client_data.port,
        username=client_data.username,
        password=client_data.password,
        api_key=client_data.api_key,
        use_ssl=client_data.use_ssl,
        label_mappings=label_mappings_json,
        config=json.dumps(client_data.config) if client_data.config else None,
        enabled=client_data.enabled,
        is_default=client_data.is_default
    )
    
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    
    # Parse JSON for response
    client_dict = {
        "id": new_client.id,
        "name": new_client.name,
        "client_type": new_client.client_type,
        "host": new_client.host,
        "port": new_client.port,
        "username": new_client.username,
        "password": new_client.password,
        "api_key": new_client.api_key,
        "use_ssl": new_client.use_ssl,
        "label_mappings": json.loads(new_client.label_mappings) if new_client.label_mappings else None,
        "config": json.loads(new_client.config) if new_client.config else None,
        "enabled": new_client.enabled,
        "is_default": new_client.is_default,
        "last_test_at": new_client.last_test_at,
        "last_test_status": new_client.last_test_status,
        "last_test_message": new_client.last_test_message,
        "created_at": new_client.created_at,
        "updated_at": new_client.updated_at
    }
    
    return DownloadClientResponse(**client_dict)

@router.put("/{client_id}", response_model=DownloadClientResponse)
async def update_download_client(
    client_id: int,
    client_data: DownloadClientUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing download client connection"""
    result = await db.execute(select(DownloadClient).where(DownloadClient.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download client with ID {client_id} not found"
        )
    
    # If setting as default, unset other defaults
    if client_data.is_default and not client.is_default:
        existing_defaults = (await db.execute(
            select(DownloadClient).where(DownloadClient.is_default == True)
        )).scalars().all()
        
        for default_client in existing_defaults:
            if default_client.id != client_id:
                default_client.is_default = False
    
    # Update fields
    update_data = client_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "client_type" and value:
            setattr(client, field, value.value)
        elif field == "label_mappings" and value:
            # Convert Pydantic models to dicts
            label_mappings_dict = {}
            for key, mapping in value.items():
                label_mappings_dict[key] = mapping.model_dump() if hasattr(mapping, 'model_dump') else mapping
            setattr(client, field, json.dumps(label_mappings_dict))
        elif field == "config" and value:
            setattr(client, field, json.dumps(value))
        else:
            setattr(client, field, value)
    
    client.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(client)
    
    # Parse JSON for response
    client_dict = {
        "id": client.id,
        "name": client.name,
        "client_type": client.client_type,
        "host": client.host,
        "port": client.port,
        "username": client.username,
        "password": client.password,
        "api_key": client.api_key,
        "use_ssl": client.use_ssl,
        "label_mappings": json.loads(client.label_mappings) if client.label_mappings else None,
        "config": json.loads(client.config) if client.config else None,
        "enabled": client.enabled,
        "is_default": client.is_default,
        "last_test_at": client.last_test_at,
        "last_test_status": client.last_test_status,
        "last_test_message": client.last_test_message,
        "created_at": client.created_at,
        "updated_at": client.updated_at
    }
    
    return DownloadClientResponse(**client_dict)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_download_client(
    client_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a download client connection"""
    result = await db.execute(select(DownloadClient).where(DownloadClient.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download client with ID {client_id} not found"
        )
    
    await db.delete(client)
    await db.commit()
    
    return None

@router.post("/test", response_model=DownloadClientTestResponse)
async def test_download_client_connection(
    test_request: DownloadClientTestRequest
):
    """Test connection to a download client without saving it"""
    result = await download_client_tester.test_connection(
        client_type=test_request.client_type,
        host=test_request.host,
        port=test_request.port,
        username=test_request.username,
        password=test_request.password,
        api_key=test_request.api_key,
        use_ssl=test_request.use_ssl
    )
    
    return result

@router.post("/{client_id}/test", response_model=DownloadClientTestResponse)
async def test_existing_download_client(
    client_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Test connection for an existing download client and update its test status"""
    result = await db.execute(select(DownloadClient).where(DownloadClient.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Download client with ID {client_id} not found"
        )
    
    # Test the connection
    test_result = await download_client_tester.test_connection(
        client_type=client.client_type,
        host=client.host,
        port=client.port,
        username=client.username,
        password=client.password,
        api_key=client.api_key,
        use_ssl=client.use_ssl
    )
    
    # Update client with test results
    client.last_test_at = datetime.utcnow()
    client.last_test_status = test_result.status.value
    client.last_test_message = test_result.message
    client.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return test_result