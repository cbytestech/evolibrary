"""
📚 Books API Router
"""

import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import get_db_session
from backend.app.schemas.books import (
    BookCreate,
    BookUpdate,
    BookResponse,
    BookListResponse,
    BookSearchParams
)
from backend.app.services.books import BookService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Books"])


@router.get("", response_model=BookListResponse)
async def list_books(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    📚 List all books with pagination
    
    Returns a paginated list of all books in the library.
    """
    logger.debug(f"[API] Listing books: page={page}, page_size={page_size}")
    
    books, total = await BookService.get_books(db, page=page, page_size=page_size)
    
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
    query: str = Query(None, description="Search in title and description"),
    author: str = Query(None, description="Filter by author name"),
    isbn: str = Query(None, description="Filter by ISBN"),
    language: str = Query(None, description="Filter by language"),
    category: str = Query(None, description="Filter by category"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db_session)
):
    """
    🔍 Search books with filters
    
    Search for books using various filters:
    - **query**: Search in title and description
    - **author**: Filter by author name
    - **isbn**: Filter by ISBN
    - **language**: Filter by language code (e.g., 'en', 'es')
    - **category**: Filter by category
    """
    logger.debug(f"[API] Searching books: query={query}, author={author}")
    
    params = BookSearchParams(
        query=query,
        author=author,
        isbn=isbn,
        language=language,
        category=category,
        page=page,
        page_size=page_size
    )
    
    books, total = await BookService.search_books(db, params)
    
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
    db: AsyncSession = Depends(get_db_session)
):
    """
    📖 Get a specific book by ID
    
    Returns detailed information about a single book.
    """
    logger.debug(f"[API] Getting book: ID={book_id}")
    
    book = await BookService.get_book_by_id(db, book_id)
    
    if not book:
        logger.warning(f"[ERROR] Book not found: ID={book_id}")
        raise HTTPException(status_code=404, detail=f"Book with ID {book_id} not found")
    
    return book


@router.post("", response_model=BookResponse, status_code=201)
async def create_book(
    book_data: BookCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    ➕ Create a new book
    
    Add a new book to the library. If the author doesn't exist, they will be created automatically.
    """
    logger.debug(f"[API] Creating book: {book_data.title} by {book_data.author_name}")
    
    book = await BookService.create_book(db, book_data)
    
    return book


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    ✏️ Update a book
    
    Update an existing book's information. Only provided fields will be updated.
    """
    logger.debug(f"[API] Updating book: ID={book_id}")
    
    book = await BookService.update_book(db, book_id, book_data)
    
    if not book:
        logger.warning(f"[ERROR] Book not found for update: ID={book_id}")
        raise HTTPException(status_code=404, detail=f"Book with ID {book_id} not found")
    
    return book


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: int,
    db: AsyncSession = Depends(get_db_session)
):
    """
    🗑️ Delete a book
    
    Remove a book from the library.
    """
    logger.debug(f"[API] Deleting book: ID={book_id}")
    
    success = await BookService.delete_book(db, book_id)
    
    if not success:
        logger.warning(f"[ERROR] Book not found for deletion: ID={book_id}")
        raise HTTPException(status_code=404, detail=f"Book with ID {book_id} not found")
    
    return None