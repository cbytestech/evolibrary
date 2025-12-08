"""
📚 Book Schemas - Data validation and serialization
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AuthorBase(BaseModel):
    """Base author schema"""
    name: str = Field(..., min_length=1, max_length=200)
    bio: Optional[str] = None


class AuthorCreate(AuthorBase):
    """Schema for creating an author"""
    pass


class AuthorResponse(AuthorBase):
    """Schema for author responses"""
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BookBase(BaseModel):
    """Base book schema"""
    title: str = Field(..., min_length=1, max_length=500)
    author_name: str = Field(..., min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    published_date: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    language: Optional[str] = Field(None, max_length=10)
    page_count: Optional[int] = Field(None, ge=0)
    categories: Optional[list[str]] = Field(default_factory=list)


class BookCreate(BookBase):
    """Schema for creating a book"""
    pass


class BookUpdate(BaseModel):
    """Schema for updating a book"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    author_name: Optional[str] = Field(None, min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, max_length=13)
    publisher: Optional[str] = Field(None, max_length=200)
    published_date: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    language: Optional[str] = Field(None, max_length=10)
    page_count: Optional[int] = Field(None, ge=0)
    categories: Optional[list[str]] = None


class BookResponse(BookBase):
    """Schema for book responses"""
    id: int
    author_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BookListResponse(BaseModel):
    """Schema for paginated book list"""
    books: list[BookResponse]
    total: int
    page: int
    page_size: int
    pages: int
    
    model_config = ConfigDict(from_attributes=True)


class BookSearchParams(BaseModel):
    """Schema for book search parameters"""
    query: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)