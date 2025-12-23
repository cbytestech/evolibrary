"""
📚 Books Service - Business logic for book operations
"""

import logging
from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from sqlalchemy import func
from backend.app.db.models import Book, Author
from backend.app.schemas.books import BookCreate, BookUpdate, BookSearchParams

logger = logging.getLogger(__name__)


class BookService:
    """Service for book operations"""
    
    @staticmethod
    async def get_books(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[list[Book], int]:
        """Get paginated list of books"""
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get total count
        count_query = select(func.count(Book.id))
        result = await db.execute(count_query)
        total = result.scalar_one()
        
        # Get books
        query = select(Book).offset(offset).limit(page_size).order_by(Book.created_at.desc())
        result = await db.execute(query)
        books = list(result.scalars().all())
        
        logger.info(f"[BOOKS] Retrieved {len(books)} books (page {page}/{(total + page_size - 1) // page_size})")
        
        return books, total
    
    @staticmethod
    async def get_book_by_id(db: AsyncSession, book_id: int) -> Optional[Book]:
        """Get a book by ID"""
        query = select(Book).where(Book.id == book_id)
        result = await db.execute(query)
        book = result.scalar_one_or_none()
        
        if book:
            logger.info(f"[BOOKS] Retrieved book: {book.title}")
        else:
            logger.warning(f"[BOOKS] Book not found: ID {book_id}")
        
        return book
    
    @staticmethod
    async def search_books(
        db: AsyncSession,
        params: BookSearchParams
    ) -> tuple[list[Book], int]:
        """Search books with filters"""
        
        # Build query
        query = select(Book)
        
        # Apply filters
        filters = []
        
        if params.query:
            # Search in title and description
            search_term = f"%{params.query}%"
            filters.append(
                or_(
                    Book.title.ilike(search_term),
                    Book.description.ilike(search_term)
                )
            )
        
        if params.author:
            filters.append(Book.author_name.ilike(f"%{params.author}%"))
        
        if params.isbn:
            filters.append(Book.isbn == params.isbn)
        
        if params.language:
            filters.append(Book.language == params.language)
        
        if params.category:
            # Search in JSON array (SQLite)
            filters.append(Book.categories.contains(params.category))
        
        # Apply all filters
        if filters:
            query = query.where(*filters)
        
        # Get total count with filters
        count_query = select(func.count()).select_from(query.subquery())
        result = await db.execute(count_query)
        total = result.scalar_one()
        
        # Apply pagination
        offset = (params.page - 1) * params.page_size
        query = query.offset(offset).limit(params.page_size).order_by(Book.created_at.desc())
        
        # Execute
        result = await db.execute(query)
        books = list(result.scalars().all())
        
        logger.info(f"[BOOKS] Search returned {len(books)} results (total: {total})")
        
        return books, total
    
    @staticmethod
    async def create_book(db: AsyncSession, book_data: BookCreate) -> Book:
        """Create a new book"""
        
        # Check if author exists, create if not
        author_query = select(Author).where(Author.name == book_data.author_name)
        result = await db.execute(author_query)
        author = result.scalar_one_or_none()
        
        if not author:
            author = Author(name=book_data.author_name)
            db.add(author)
            await db.flush()  # Get the author ID
            logger.info(f"[BOOKS] Created new author: {author.name}")
        
        # Create book
        book = Book(
            title=book_data.title,
            author_id=author.id,
            author_name=book_data.author_name,
            isbn=book_data.isbn,
            publisher=book_data.publisher,
            published_date=book_data.published_date,
            description=book_data.description,
            cover_url=book_data.cover_url,
            language=book_data.language,
            page_count=book_data.page_count,
            categories=book_data.categories
        )
        
        db.add(book)
        await db.commit()
        await db.refresh(book)
        
        logger.info(f"[SUCCESS] Created book: {book.title} by {book.author_name}")
        
        return book
    
    @staticmethod
    async def update_book(
        db: AsyncSession,
        book_id: int,
        book_data: BookUpdate
    ) -> Optional[Book]:
        """Update a book"""
        
        # Get book
        book = await BookService.get_book_by_id(db, book_id)
        if not book:
            return None
        
        # Update fields
        update_data = book_data.model_dump(exclude_unset=True)
        
        # If author name is being updated, handle author relationship
        if "author_name" in update_data:
            author_query = select(Author).where(Author.name == update_data["author_name"])
            result = await db.execute(author_query)
            author = result.scalar_one_or_none()
            
            if not author:
                author = Author(name=update_data["author_name"])
                db.add(author)
                await db.flush()
                logger.info(f"[BOOKS] Created new author: {author.name}")
            
            update_data["author_id"] = author.id
        
        # Apply updates
        for key, value in update_data.items():
            setattr(book, key, value)
        
        await db.commit()
        await db.refresh(book)
        
        logger.info(f"[SUCCESS] Updated book: {book.title}")
        
        return book
    
    @staticmethod
    async def delete_book(db: AsyncSession, book_id: int) -> bool:
        """Delete a book"""
        
        book = await BookService.get_book_by_id(db, book_id)
        if not book:
            return False
        
        await db.delete(book)
        await db.commit()
        
        logger.info(f"[SUCCESS] Deleted book: {book.title}")
        
        return True
