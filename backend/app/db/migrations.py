"""
Database migration helper
Automatically adds missing columns to existing tables
"""
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
        # Add future migrations here
        # {
        #     "table": "another_table",
        #     "column": "new_column",
        #     "type": "INTEGER",
        #     "description": "Description of what this column does"
        # },
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
    
    logger.info("🎉 Database migrations complete!")