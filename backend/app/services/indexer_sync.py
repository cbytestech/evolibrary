"""
Indexer Sync Service
Fetches indexers from connected apps (Prowlarr, Jackett) and syncs to database
"""
import httpx
import logging
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models.app import App
from backend.app.db.models.indexer import Indexer

logger = logging.getLogger(__name__)


class IndexerSyncService:
    """Service for syncing indexers from external apps"""
    
    def __init__(self):
        self.timeout = 10.0
    
    async def sync_all_indexers(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Sync indexers from all enabled apps
        Returns summary of sync operation
        """
        result = {
            "total_synced": 0,
            "prowlarr_count": 0,
            "jackett_count": 0,
            "new_indexers": 0,
            "updated_indexers": 0,
            "errors": []
        }
        
        try:
            # Get all enabled apps
            query = select(App).where(App.enabled == True)
            apps_result = await db.execute(query)
            apps = apps_result.scalars().all()
            
            logger.info(f"Found {len(apps)} enabled apps to sync")
            
            for app in apps:
                try:
                    if app.app_type == "prowlarr":
                        count = await self._sync_prowlarr(db, app)
                        result["prowlarr_count"] = count
                        result["total_synced"] += count
                        logger.info(f"Synced {count} indexers from Prowlarr")
                        
                    elif app.app_type == "jackett":
                        count = await self._sync_jackett(db, app)
                        result["jackett_count"] = count
                        result["total_synced"] += count
                        logger.info(f"Synced {count} indexers from Jackett")
                        
                except Exception as e:
                    error_msg = f"Error syncing {app.name}: {str(e)}"
                    logger.error(error_msg)
                    result["errors"].append(error_msg)
            
            await db.commit()
            
            # Count new vs updated (simple heuristic based on last_sync_at)
            all_indexers_query = await db.execute(select(Indexer))
            for indexer in all_indexers_query.scalars().all():
                # If last_sync_at is very recent (within last 5 seconds), consider it updated
                if indexer.last_sync_at:
                    time_diff = datetime.utcnow() - indexer.last_sync_at
                    if time_diff.total_seconds() < 5:
                        result["updated_indexers"] += 1
                    else:
                        result["new_indexers"] += 1
                else:
                    result["new_indexers"] += 1
            
            logger.info(f"Sync complete: {result['total_synced']} total indexers")
            
        except Exception as e:
            logger.error(f"Sync failed: {e}")
            result["errors"].append(str(e))
            await db.rollback()
        
        return result
    
    async def _sync_prowlarr(self, db: AsyncSession, app: App) -> int:
        """Sync indexers from Prowlarr"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{app.base_url}/api/v1/indexer",
                headers={"X-Api-Key": app.api_key}
            )
            
            if response.status_code != 200:
                raise Exception(f"Prowlarr returned {response.status_code}")
            
            indexers_data = response.json()
            count = 0
            
            for idx_data in indexers_data:
                # Check if indexer already exists
                query = select(Indexer).where(
                    Indexer.app_id == app.id,
                    Indexer.external_id == str(idx_data["id"])
                )
                result = await db.execute(query)
                existing = result.scalar_one_or_none()
                
                # Parse protocol
                protocol = "usenet" if "usenet" in idx_data.get("protocol", "").lower() else "torrent"
                
                # Parse categories
                categories = [cat.get("name") for cat in idx_data.get("capabilities", {}).get("categories", [])]
                
                if existing:
                    # Update existing
                    existing.name = idx_data["name"]
                    existing.description = idx_data.get("description", "")
                    existing.protocol = protocol
                    existing.categories = ",".join(categories) if categories else None
                    existing.enabled = idx_data.get("enable", True)
                    existing.last_sync_at = datetime.utcnow()
                else:
                    # Create new
                    new_indexer = Indexer(
                        app_id=app.id,
                        external_id=str(idx_data["id"]),
                        name=idx_data["name"],
                        description=idx_data.get("description", ""),
                        protocol=protocol,
                        categories=",".join(categories) if categories else None,
                        enabled=idx_data.get("enable", True),
                        configured=True,
                        priority=idx_data.get("priority", 50),
                        last_sync_at=datetime.utcnow()
                    )
                    db.add(new_indexer)
                
                count += 1
            
            return count
    
    async def _sync_jackett(self, db: AsyncSession, app: App) -> int:
        """Sync indexers from Jackett"""
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=False) as client:
            # Build request params
            params = {"apikey": app.api_key}
            
            # If password provided, try to authenticate first
            cookies = None
            if app.password:
                try:
                    login_response = await client.post(
                        f"{app.base_url}/UI/Dashboard",
                        data={"password": app.password},
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
                    cookies = login_response.cookies
                except Exception as e:
                    logger.warning(f"Jackett login failed: {e}")
            
            # Fetch indexers
            response = await client.get(
                f"{app.base_url}/api/v2.0/indexers",
                params=params,
                cookies=cookies
            )
            
            if response.status_code != 200:
                raise Exception(f"Jackett returned {response.status_code}")
            
            indexers_data = response.json()
            count = 0
            
            for idx_data in indexers_data:
                # Check if indexer already exists
                query = select(Indexer).where(
                    Indexer.app_id == app.id,
                    Indexer.external_id == idx_data["id"]
                )
                result = await db.execute(query)
                existing = result.scalar_one_or_none()
                
                # Parse protocol
                protocol = "usenet" if idx_data.get("type") == "nzb" else "torrent"
                
                # Parse categories - Jackett uses "caps" array
                categories = []
                for cap in idx_data.get("caps", []):
                    if isinstance(cap, dict) and "Name" in cap:
                        categories.append(cap["Name"])
                
                if existing:
                    # Update existing
                    existing.name = idx_data["name"]
                    existing.description = idx_data.get("description", "")
                    existing.protocol = protocol
                    existing.categories = ",".join(categories) if categories else None
                    existing.configured = idx_data.get("configured", False)
                    existing.last_sync_at = datetime.utcnow()
                else:
                    # Create new
                    new_indexer = Indexer(
                        app_id=app.id,
                        external_id=idx_data["id"],
                        name=idx_data["name"],
                        description=idx_data.get("description", ""),
                        protocol=protocol,
                        categories=",".join(categories) if categories else None,
                        enabled=idx_data.get("configured", False),  # Only enable if configured in Jackett
                        configured=idx_data.get("configured", False),
                        priority=50,  # Default priority
                        last_sync_at=datetime.utcnow()
                    )
                    db.add(new_indexer)
                
                count += 1
            
            return count


# Singleton instance
indexer_sync_service = IndexerSyncService()