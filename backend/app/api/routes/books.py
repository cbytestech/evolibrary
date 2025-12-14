# File: backend/app/api/routes/books.py
"""
📚 Books API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.app.db.database import get_db
from backend.app.db.models import Book, Library
from backend.app.schemas.books import (
    BookResponse,
    BookListResponse,
    BookCreate,
    BookUpdate
)
from backend.app.services.metadata_manager import metadata_manager
from sqlalchemy import select, func, or_, and_
import logging

router = APIRouter(prefix="/books", tags=["books"])
logger = logging.getLogger(__name__)


def deserialize_book_categories(book, db_session=None):
    """Convert categories JSON string to list for API response"""
    if book.categories and isinstance(book.categories, str):
        import json
        try:
            book.categories = json.loads(book.categories)
        except:
            book.categories = []
    
    # Expunge from session to prevent it from being saved back to DB
    if db_session:
        try:
            from sqlalchemy import inspect
            if inspect(book).persistent or inspect(book).pending:
                db_session.expunge(book)
        except:
            pass
    
    return book


@router.get("", response_model=BookListResponse)
async def get_books(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    media_type: Optional[str] = Query(None, description="Comma-separated list of file extensions"),
    library_type: Optional[str] = Query(None, description="Filter by library type (books, audiobooks, comics, magazines)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of books with optional media type and library type filtering
    
    Args:
        page: Page number (starting at 1)
        page_size: Number of items per page
        media_type: Comma-separated file extensions (e.g., "epub,mobi,pdf")
        library_type: Library type to filter by (e.g., "books", "magazines")
        db: Database session
    """
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Build query - join with libraries to get library_type
    query = select(Book).join(Library, Book.library_id == Library.id)
    count_query = select(func.count(Book.id)).select_from(Book).join(Library, Book.library_id == Library.id)
    
    filters = []
    
    # Apply media type filter if provided
    if media_type:
        extensions = [ext.strip().lower() for ext in media_type.split(',')]
        # Filter books by file_format (extension)
        media_filter = or_(*[Book.file_format.ilike(f"%{ext}%") for ext in extensions])
        filters.append(media_filter)
    
    # Apply library type filter if provided
    if library_type:
        filters.append(Library.library_type == library_type)
    
    # Apply all filters
    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))
    
    # Get total count
    result = await db.execute(count_query)
    total = result.scalar_one()
    
    # Get paginated books
    query = query.offset(offset).limit(page_size).order_by(Book.created_at.desc())
    result = await db.execute(query)
    books = list(result.scalars().all())
    
    # Deserialize categories for each book (expunge to prevent auto-save)
    books = [deserialize_book_categories(book, db) for book in books]
    
    # Calculate total pages
    pages = (total + page_size - 1) // page_size
    
    return BookListResponse(
        books=books,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/search", response_model=BookListResponse)
async def search_books(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    media_type: Optional[str] = Query(None, description="Comma-separated list of file extensions"),
    library_type: Optional[str] = Query(None, description="Filter by library type"),
    author: Optional[str] = None,
    isbn: Optional[str] = None,
    language: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Search books with filters
    
    Args:
        query: Search term for title and description
        page: Page number
        page_size: Items per page
        media_type: Comma-separated file extensions
        library_type: Filter by library type
        author: Filter by author name
        isbn: Filter by ISBN
        language: Filter by language
        category: Filter by category
        db: Database session
    """
    # Build base query with library join
    search_query = select(Book).join(Library, Book.library_id == Library.id)
    
    # Apply filters
    filters = []
    
    # Search in title and description
    if query:
        search_term = f"%{query}%"
        filters.append(
            or_(
                Book.title.ilike(search_term),
                Book.description.ilike(search_term)
            )
        )
    
    # Media type filter
    if media_type:
        extensions = [ext.strip().lower() for ext in media_type.split(',')]
        media_filter = or_(*[Book.file_format.ilike(f"%{ext}%") for ext in extensions])
        filters.append(media_filter)
    
    # Library type filter
    if library_type:
        filters.append(Library.library_type == library_type)
    
    # Additional filters
    if author:
        filters.append(Book.author_name.ilike(f"%{author}%"))
    
    if isbn:
        filters.append(Book.isbn == isbn)
    
    if language:
        filters.append(Book.language == language)
    
    if category:
        filters.append(Book.categories.contains(category))
    
    # Apply all filters
    if filters:
        search_query = search_query.where(and_(*filters))
    
    # Get total count
    count_query = select(func.count()).select_from(Book).join(Library, Book.library_id == Library.id)
    if filters:
        count_query = count_query.where(and_(*filters))
    
    result = await db.execute(count_query)
    total = result.scalar_one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    search_query = search_query.offset(offset).limit(page_size).order_by(Book.created_at.desc())
    
    # Execute
    result = await db.execute(search_query)
    books = list(result.scalars().all())
    
    # Deserialize categories for each book (expunge to prevent auto-save)
    books = [deserialize_book_categories(book, db) for book in books]
    
    # Calculate pages
    pages = (total + page_size - 1) // page_size
    
    return BookListResponse(
        books=books,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific book by ID"""
    query = select(Book).where(Book.id == book_id)
    result = await db.execute(query)
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return deserialize_book_categories(book, db)


@router.post("", response_model=BookResponse, status_code=201)
async def create_book(
    book_data: BookCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new book"""
    book = Book(**book_data.model_dump())
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a book and save metadata files to disk"""
    query = select(Book).where(Book.id == book_id)
    result = await db.execute(query)
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Update fields
    update_data = book_data.model_dump(exclude_unset=True)
    
    # 🔧 Convert categories list to JSON string for SQLite
    if 'categories' in update_data and update_data['categories'] is not None:
        import json
        if isinstance(update_data['categories'], list):
            update_data['categories'] = json.dumps(update_data['categories'])
    
    for key, value in update_data.items():
        setattr(book, key, value)
    
    await db.commit()
    await db.refresh(book)
    
    # 💾 Save metadata files to disk (JSON + OPF + cover)
    if book.file_path:
        try:
            metadata = {
                'title': book.title,
                'author_name': book.author_name,
                'description': book.description,
                'isbn': book.isbn,
                'published_date': book.published_date.isoformat() if book.published_date else None,
                'page_count': book.page_count,
                'language': book.language,
                'publisher': book.publisher,
                'categories': book.categories,
                'file_format': book.file_format,
                'file_size': book.file_size
            }
            
            # Save all metadata formats
            results = await metadata_manager.save_all(
                book.file_path,
                metadata,
                cover_url=book.cover_url
            )
            
            logger.info(f"📝 Metadata saved for '{book.title}': {results}")
            
        except Exception as e:
            # Don't fail the update if metadata save fails
            logger.error(f"Failed to save metadata files: {e}")
    
    return deserialize_book_categories(book, db)


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a book"""
    query = select(Book).where(Book.id == book_id)
    result = await db.execute(query)
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    await db.delete(book)
    await db.commit()