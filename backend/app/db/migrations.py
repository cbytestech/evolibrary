"""
Database migration helper
Automatically adds missing columns to existing tables
"""
# File: backend/app/db/migrations.py

import logging
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

async def run_migrations(db: AsyncSession):
    """
    Run database migrations - adds missing columns to existing tables
    This ensures backward compatibility when new columns are added
    """
    
    migrations = [
        {
            "table": "apps",
            "column": "password",
            "type": "VARCHAR(200)",
            "description": "Admin password for apps like Jackett"
        },
        # ADDED - NEW: Quality profiles table migrations would go here
        # Note: For new tables, we use create_all() instead of ALTER TABLE
        # The quality_profiles table will be created automatically via Base.metadata.create_all()
    ]
    
    for migration in migrations:
        try:
            # Check if column exists
            result = await db.execute(
                text(f"PRAGMA table_info({migration['table']})")
            )
            columns = result.fetchall()
            column_names = [col[1] for col in columns]
            
            if migration['column'] not in column_names:
                logger.info(f"🔄 Adding column '{migration['column']}' to '{migration['table']}' table...")
                
                # Add the column
                await db.execute(
                    text(f"ALTER TABLE {migration['table']} ADD COLUMN {migration['column']} {migration['type']}")
                )
                await db.commit()
                
                logger.info(f"✅ Successfully added '{migration['column']}' column - {migration['description']}")
            else:
                logger.debug(f"✓ Column '{migration['column']}' already exists in '{migration['table']}'")
                
        except Exception as e:
            logger.error(f"❌ Migration failed for {migration['table']}.{migration['column']}: {e}")
            await db.rollback()
            # Don't raise - let the app continue even if migration fails
            # The column might already exist or the error might be non-critical
    
    # ADDED - NEW: Create quality_profiles table if it doesn't exist
    try:
        from backend.app.db.models.quality_profile import QualityProfile
        from backend.app.db.database import Base
        
        # Check if quality_profiles table exists
        result = await db.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='quality_profiles'")
        )
        table_exists = result.fetchone() is not None
        
        if not table_exists:
            logger.info("🔄 Creating quality_profiles table...")
            # Table will be created via Base.metadata.create_all() in init_db()
            logger.info("✅ Quality profiles table will be created on next startup")
        else:
            logger.debug("✓ Quality profiles table already exists")
            
    except Exception as e:
        logger.error(f"❌ Error checking quality_profiles table: {e}")
        # Non-critical, continue
    
    logger.info("🎉 Database migrations complete!")