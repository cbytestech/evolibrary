"""
📚 Sample Data - Populate database with test books
Run this to add sample books to your library!
"""

import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.database import AsyncSessionLocal, init_db
from backend.app.schemas.books import BookCreate, BookSearchParams
from backend.app.services.books import BookService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SAMPLE_BOOKS = [
    BookCreate(
        title="The Pragmatic Programmer: Your Journey To Mastery",
        author_name="David Thomas, Andrew Hunt",
        isbn="9780135957059",
        publisher="Addison-Wesley",
        published_date="2019-09-13",
        description="A comprehensive guide to software development best practices and practical advice for programmers at all levels.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/51W1sBPO7tL._SX380_BO1,204,203,200_.jpg",
        language="en",
        page_count=352,
        categories=["Programming", "Software Development", "Technology"]
    ),
    BookCreate(
        title="Clean Code: A Handbook of Agile Software Craftsmanship",
        author_name="Robert C. Martin",
        isbn="9780132350884",
        publisher="Prentice Hall",
        published_date="2008-08-01",
        description="Learn the principles of clean code and how to write code that is easy to read, understand, and maintain.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
        language="en",
        page_count=464,
        categories=["Programming", "Software Engineering", "Best Practices"]
    ),
    BookCreate(
        title="Designing Data-Intensive Applications",
        author_name="Martin Kleppmann",
        isbn="9781449373320",
        publisher="O'Reilly Media",
        published_date="2017-03-16",
        description="The big ideas behind reliable, scalable, and maintainable systems. A deep dive into distributed systems.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/51ZSpMl1-2L._SX379_BO1,204,203,200_.jpg",
        language="en",
        page_count=616,
        categories=["Database Systems", "Distributed Systems", "Technology"]
    ),
    BookCreate(
        title="Python Crash Course, 3rd Edition",
        author_name="Eric Matthes",
        isbn="9781718502703",
        publisher="No Starch Press",
        published_date="2023-01-10",
        description="A fast-paced, thorough introduction to programming with Python that will have you writing programs, solving problems, and making things that work in no time.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81v6V7ttGnL.jpg",
        language="en",
        page_count=552,
        categories=["Python", "Programming", "Beginner"]
    ),
    BookCreate(
        title="The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win",
        author_name="Gene Kim, Kevin Behr, George Spafford",
        isbn="9781942788294",
        publisher="IT Revolution Press",
        published_date="2018-01-01",
        description="A novel about IT, DevOps, and helping your business win. Learn DevOps principles through an engaging story.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81-RrFCq5OL.jpg",
        language="en",
        page_count=432,
        categories=["DevOps", "Business", "IT Management"]
    ),
    BookCreate(
        title="Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
        author_name="James Clear",
        isbn="9780735211292",
        publisher="Avery",
        published_date="2018-10-16",
        description="Tiny changes, remarkable results. A practical guide to building good habits and breaking bad ones.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81YkqyaFVEL.jpg",
        language="en",
        page_count=320,
        categories=["Self-Help", "Personal Development", "Psychology"]
    ),
    BookCreate(
        title="Project Hail Mary",
        author_name="Andy Weir",
        isbn="9780593135204",
        publisher="Ballantine Books",
        published_date="2021-05-04",
        description="A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the author of The Martian.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/91vS+tlWKPL.jpg",
        language="en",
        page_count=496,
        categories=["Science Fiction", "Thriller", "Adventure"]
    ),
    BookCreate(
        title="Dune",
        author_name="Frank Herbert",
        isbn="9780441172719",
        publisher="Ace",
        published_date="1965-08-01",
        description="Set on the desert planet Arrakis, Dune is the story of Paul Atreides. A stunning blend of adventure and mysticism.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81ym2zmGDkL.jpg",
        language="en",
        page_count=688,
        categories=["Science Fiction", "Fantasy", "Classic"]
    ),
    BookCreate(
        title="The Hitchhiker's Guide to the Galaxy",
        author_name="Douglas Adams",
        isbn="9780345391803",
        publisher="Del Rey",
        published_date="1979-10-12",
        description="Seconds before Earth is demolished for a galactic freeway, Arthur Dent is saved by Ford Prefect. The first in a hilarious sci-fi series.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81XS1wZUyOL.jpg",
        language="en",
        page_count=224,
        categories=["Science Fiction", "Humor", "Classic"]
    ),
    BookCreate(
        title="Ready Player One",
        author_name="Ernest Cline",
        isbn="9780307887443",
        publisher="Broadway Books",
        published_date="2011-08-16",
        description="In 2045, Wade Watts escapes to the OASIS, a virtual utopia. When its creator dies, he launches a contest to find his Easter egg.",
        cover_url="https://images-na.ssl-images-amazon.com/images/I/81R8R7YnP5L.jpg",
        language="en",
        page_count=386,
        categories=["Science Fiction", "Adventure", "Dystopian"]
    ),
]


async def add_sample_books():
    """Add sample books to the database"""
    
    logger.info("[START] Adding sample books...")
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            for book_data in SAMPLE_BOOKS:
                # Check if book already exists
                existing = await BookService.search_books(
                    db,
                    BookSearchParams(query=book_data.title, page=1, page_size=1)
                )
                
                if existing[1] > 0:
                    logger.info(f"[SKIP] Book already exists: {book_data.title}")
                    continue
                
                # Create book
                book = await BookService.create_book(db, book_data)
                logger.info(f"[SUCCESS] Added: {book.title} by {book.author_name}")
            
            logger.info(f"[COMPLETE] Sample data added! Total books: {len(SAMPLE_BOOKS)}")
            
        except Exception as e:
            logger.error(f"[ERROR] Failed to add sample books: {e}")
            raise


async def main():
    """Main entry point"""
    await add_sample_books()


if __name__ == "__main__":
    asyncio.run(main())