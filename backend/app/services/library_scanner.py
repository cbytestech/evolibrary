import os
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
import logging
from datetime import datetime
import hashlib
from sqlalchemy import select, text

logger = logging.getLogger(__name__)


class LibraryScanner:
    """
    Library scanner service for detecting and importing books
    
    🎁 SECRET FEATURE #1: Smart duplicate detection using file hashing
    """
    
    SUPPORTED_FORMATS = {
        'books': ['.epub', '.mobi', '.azw3', '.pdf', '.txt', '.djvu'],
        'audiobooks': ['.m4b', '.mp3', '.m4a', '.aac', '.flac'],
        'comics': ['.cbz', '.cbr', '.cb7', '.cbt'],
        'magazines': ['.pdf', '.epub']
    }
    
    def __init__(self, db_session):
        self.db = db_session
        self.scan_stats = {
            'total_files': 0,
            'processed': 0,
            'added': 0,
            'updated': 0,
            'duplicates': 0,  # 🎁 SECRET FEATURE #1
            'errors': 0,
            'skipped': 0
        }
    
    async def scan_library(self, library_id: int) -> Dict:
        """Main scan function"""
        from ..db.models.library import Library
        from ..db.models.book import Book
        
        logger.info(f"🔍 Starting library scan for library_id={library_id}")
        
        # Get library
        library = await self.db.get(Library, library_id)
        if not library:
            raise ValueError(f"Library {library_id} not found")
        
        # Reset stats
        self.scan_stats = {k: 0 for k in self.scan_stats.keys()}
        
        # Find all files
        files = self._find_files(library.path, library.library_type)
        self.scan_stats['total_files'] = len(files)
        
        logger.info(f"📚 Found {len(files)} potential book files")
        
        # 🎁 SECRET FEATURE #1: Build hash map of existing books
        existing_hashes = await self._build_hash_map(library_id)
        
        # Process each file
        for file_path in files:
            try:
                await self._process_file(
                    file_path, 
                    library, 
                    existing_hashes
                )
                self.scan_stats['processed'] += 1
                
                # Yield control every 10 files to keep responsive
                if self.scan_stats['processed'] % 10 == 0:
                    await asyncio.sleep(0)
                    
            except Exception as e:
                logger.error(f"❌ Error processing {file_path}: {e}")
                self.scan_stats['errors'] += 1
        
        # Update library stats - count ALL books in library, not just new ones
        result = await self.db.execute(
            text("SELECT COUNT(*) FROM books WHERE library_id = :library_id"),
            {"library_id": library.id}
        )
        total_books = result.scalar_one()
        
        library.total_items = total_books
        library.last_scan = datetime.utcnow()
        await self.db.commit()
        
        logger.info(f"✅ Scan complete: {self.scan_stats}")
        
        return self.scan_stats
    
    def _find_files(self, path: str, library_type: str) -> List[Path]:
        """Recursively find all supported files"""
        extensions = self.SUPPORTED_FORMATS.get(library_type, [])
        files = []
        
        base_path = Path(path)
        if not base_path.exists():
            logger.warning(f"⚠️  Path does not exist: {path}")
            return files
        
        for ext in extensions:
            files.extend(base_path.rglob(f'*{ext}'))
        
        # Sort by modification time (newest first)
        files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        
        return files
    
    async def _build_hash_map(self, library_id: int) -> Dict[str, int]:
        """
        🎁 SECRET FEATURE #1: Build hash map of existing books
        This prevents duplicate imports!
        """
        from ..db.models.book import Book
        
        hash_map = {}
        
        # Get all books in this library
        result = await self.db.execute(
            text("SELECT id, file_path, file_size FROM books WHERE library_id = :library_id"),
            {"library_id": library_id}
        )
        existing_books = result.fetchall()
        
        for book_id, file_path, file_size in existing_books:
            if file_path and os.path.exists(file_path):
                # Quick hash: combine file size and first 1KB
                quick_hash = self._quick_hash(file_path)
                hash_map[quick_hash] = book_id
        
        logger.info(f"📊 Built hash map with {len(hash_map)} existing books")
        return hash_map
    
    def _quick_hash(self, file_path: str) -> str:
        """
        🎁 SECRET FEATURE #1: Quick file hash
        Uses file size + first 1KB for fast duplicate detection
        """
        try:
            size = os.path.getsize(file_path)
            
            with open(file_path, 'rb') as f:
                # Read first 1KB
                chunk = f.read(1024)
            
            # Hash: size + first chunk
            hasher = hashlib.md5()
            hasher.update(str(size).encode())
            hasher.update(chunk)
            
            return hasher.hexdigest()
        except Exception as e:
            logger.error(f"Error hashing {file_path}: {e}")
            return ""
    
    async def _process_file(
        self, 
        file_path: Path, 
        library, 
        existing_hashes: Dict[str, int]
    ):
        """Process a single file"""
        from ..db.models.book import Book
        
        # 🎁 SECRET FEATURE #1: Check for duplicates
        quick_hash = self._quick_hash(str(file_path))
        if quick_hash in existing_hashes:
            logger.debug(f"⏭️  Skipping duplicate: {file_path.name}")
            self.scan_stats['duplicates'] += 1
            return
        
        # Extract metadata
        metadata = self._extract_metadata(file_path)
        
        # Check if book exists by path
        result = await self.db.execute(
            text("SELECT id FROM books WHERE file_path = :file_path"),
            {"file_path": str(file_path)}
        )
        existing = result.fetchone()
        
        if existing:
            # Update existing book
            await self._update_book(existing[0], metadata, file_path)
            self.scan_stats['updated'] += 1
        else:
            # Add new book
            await self._add_book(library.id, metadata, file_path)
            self.scan_stats['added'] += 1
    
    def _extract_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from file"""
        ext = file_path.suffix.lower()
        
        if ext == '.epub':
            return self._extract_epub_metadata(file_path)
        elif ext == '.pdf':
            return self._extract_pdf_metadata(file_path)
        else:
            # Fallback: parse filename
            return self._parse_filename(file_path)
    
    def _extract_epub_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from EPUB file"""
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            
            with zipfile.ZipFile(file_path, 'r') as zip_file:
                # Read OPF file
                for name in zip_file.namelist():
                    if name.endswith('.opf'):
                        content = zip_file.read(name).decode('utf-8')
                        root = ET.fromstring(content)
                        
                        # Parse metadata
                        ns = {'dc': 'http://purl.org/dc/elements/1.1/'}
                        
                        title = root.find('.//dc:title', ns)
                        creator = root.find('.//dc:creator', ns)
                        identifier = root.find('.//dc:identifier[@opf:scheme="ISBN"]', {
                            'opf': 'http://www.idpf.org/2007/opf',
                            'dc': 'http://purl.org/dc/elements/1.1/'
                        })
                        
                        return {
                            'title': title.text if title is not None else file_path.stem,
                            'author': creator.text if creator is not None else 'Unknown',
                            'isbn': identifier.text if identifier is not None else None
                        }
        except Exception as e:
            logger.debug(f"Could not extract EPUB metadata: {e}")
        
        return self._parse_filename(file_path)
    
    def _extract_pdf_metadata(self, file_path: Path) -> Dict:
        """Extract metadata from PDF file"""
        try:
            import PyPDF2
            
            with open(file_path, 'rb') as f:
                pdf = PyPDF2.PdfReader(f)
                info = pdf.metadata
                
                if info:
                    return {
                        'title': info.get('/Title', file_path.stem),
                        'author': info.get('/Author', 'Unknown'),
                        'isbn': None
                    }
        except Exception as e:
            logger.debug(f"Could not extract PDF metadata: {e}")
        
        return self._parse_filename(file_path)
    
    def _parse_filename(self, file_path: Path) -> Dict:
        """
        Parse metadata from filename
        Supports formats:
        - "Author Name - Book Title.epub"
        - "Author Name/Book Title.epub"
        - "Book Title (Author Name).epub"
        """
        filename = file_path.stem
        parent = file_path.parent.name
        
        # Pattern: "Author - Title"
        if ' - ' in filename:
            parts = filename.split(' - ', 1)
            return {
                'title': parts[1].strip(),
                'author': parts[0].strip(),
                'isbn': None
            }
        
        # Pattern: "Title (Author)"
        if '(' in filename and ')' in filename:
            title = filename.split('(')[0].strip()
            author = filename.split('(')[1].split(')')[0].strip()
            return {
                'title': title,
                'author': author,
                'isbn': None
            }
        
        # Use parent folder as author if it's not a generic name
        if parent not in ['books', 'downloads', 'Books', 'Downloads']:
            return {
                'title': filename,
                'author': parent,
                'isbn': None
            }
        
        # Default: filename as title
        return {
            'title': filename,
            'author': 'Unknown',
            'isbn': None
        }
    
    async def _add_book(self, library_id: int, metadata: Dict, file_path: Path):
        """Add new book to database"""
        from ..db.models.book import Book
        
        book = Book(
            library_id=library_id,
            title=metadata.get('title', 'Unknown'),
            author_name=metadata.get('author', 'Unknown'),
            isbn=metadata.get('isbn'),
            file_path=str(file_path),
            file_format=file_path.suffix[1:].lower(),
            file_size=os.path.getsize(file_path),
            status='available'
        )
        
        self.db.add(book)
        await self.db.commit()
        
        logger.debug(f"➕ Added: {book.title} by {book.author_name}")
    
    async def _update_book(self, book_id: int, metadata: Dict, file_path: Path):
        """Update existing book"""
        from ..db.models.book import Book
        
        book = await self.db.get(Book, book_id)
        if book:
            book.title = metadata.get('title', book.title)
            book.author_name = metadata.get('author', book.author_name)
            book.file_size = os.path.getsize(file_path)
            book.updated_at = datetime.utcnow()
            
            await self.db.commit()
            
            logger.debug(f"🔄 Updated: {book.title}")