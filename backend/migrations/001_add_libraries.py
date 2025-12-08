"""Add libraries table

Revision ID: 001
Create Date: 2025-12-07
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime


def upgrade():
    # Create libraries table
    op.create_table(
        'libraries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('path', sa.String(500), nullable=False),
        sa.Column('library_type', sa.String(50), nullable=False, server_default='books'),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default='1'),
        
        # Scan settings
        sa.Column('auto_scan', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('scan_schedule', sa.String(50), nullable=False, server_default='hourly'),
        sa.Column('last_scan', sa.DateTime(), nullable=True),
        sa.Column('scan_on_startup', sa.Boolean(), nullable=False, server_default='0'),
        
        # Metadata settings
        sa.Column('fetch_metadata', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('download_covers', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('organize_files', sa.Boolean(), nullable=False, server_default='0'),
        
        # Stats
        sa.Column('total_items', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_size', sa.BigInteger(), nullable=False, server_default='0'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Add library_id to books table
    op.add_column('books', sa.Column('library_id', sa.Integer(), nullable=True))
    op.add_column('books', sa.Column('file_path', sa.String(1000), nullable=True))
    op.add_column('books', sa.Column('file_format', sa.String(10), nullable=True))
    op.add_column('books', sa.Column('file_size', sa.BigInteger(), nullable=True))
    
    # Create foreign key
    op.create_foreign_key(
        'fk_books_library_id',
        'books', 'libraries',
        ['library_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Create index on library_id for faster queries
    op.create_index('ix_books_library_id', 'books', ['library_id'])


def downgrade():
    op.drop_constraint('fk_books_library_id', 'books', type_='foreignkey')
    op.drop_index('ix_books_library_id', 'books')
    op.drop_column('books', 'file_size')
    op.drop_column('books', 'file_format')
    op.drop_column('books', 'file_path')
    op.drop_column('books', 'library_id')
    op.drop_table('libraries')