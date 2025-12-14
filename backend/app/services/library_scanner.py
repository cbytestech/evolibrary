# File: backend/app/services/library_scanner.py
import os
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
import logging
from datetime import datetime
import hashlib
from sqlalchemy import select, text
from backend.app.services.metadata_manager import metadata_manager
from backend.app.services.google_books import google_books_service

logger = logging.getLogger(__name__)


class LibraryScanner:
    """
    Library scanner service for detecting and importing books
    
    🎁 SECRET FEATURE #1: Smart duplicate detection using file hashing
    🎁 NEW: Multi-file audiobook support - groups MP3/FLAC chapters as one book
    """
    
    SUPPORTED_FORMATS = {
        'books': ['.epub', '.mobi', '.azw3', '.pdf', '.djvu'],
        'audiobooks': ['.m4b', '.mp3', '.m4a', '.aac', '.flac'],
        'comics': ['.cbz', '.cbr', '.cb7', '.cbt'],
        'magazines': ['.pdf', '.epub']
    }
    
    # Audiobook formats that are typically multi-file
    MULTI_FILE_FORMATS = ['.mp3', '.m4a', '.aac', '.flac']
    
    def __init__(self, db_session):
        self.db = db_session
        self.scan_stats = {
            'total_files': 0,
            'processed': 0,
            'added': 0,
            'updated': 0,
            'deleted': 0,
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
        
        # Find all files (or grouped audiobooks)
        if library.library_type == 'audiobooks':
            items = self._find_audiobook_folders(library.path)
        else:
            items = self._find_files(library.path, library.library_type)
        
        self.scan_stats['total_files'] = len(items)
        
        logger.info(f"📚 Found {len(items)} items to process")
        
        # 🎁 SECRET FEATURE #1: Build hash map of existing books
        existing_hashes = await self._build_hash_map(library_id)
        
        # Process each item
        for item in items:
            try:
                if library.library_type == 'audiobooks' and isinstance(item, dict):
                    # Process multi-file audiobook
                    await self._process_audiobook_folder(
                        item, 
                        library, 
                        existing_hashes
                    )
                else:
                    # Process single file
                    await self._process_file(
                        item, 
                        library, 
                        existing_hashes
                    )
                self.scan_stats['processed'] += 1
                
                # Yield control every 10 files to keep responsive
                if self.scan_stats['processed'] % 10 == 0:
                    await asyncio.sleep(0)
                    
            except Exception as e:
                logger.error(f"❌ Error processing item: {e}")
                self.scan_stats['errors'] += 1
        
        # 🧹 CLEANUP: Remove books whose files no longer exist
        await self._cleanup_missing_files(library)
        
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
    
    async def _cleanup_missing_files(self, library):
        """
        Remove books from database whose files no longer exist
        """
        from ..db.models.book import Book
        
        # Get all books for this library
        result = await self.db.execute(
            select(Book).where(Book.library_id == library.id)
        )
        books = result.scalars().all()
        
        removed_count = 0
        for book in books:
            file_path = Path(book.file_path)
            
            # Check if file/folder exists
            if not file_path.exists():
                logger.info(f"🗑️  Removing missing file: {book.title}")
                await self.db.delete(book)
                removed_count += 1
                self.scan_stats['deleted'] = self.scan_stats.get('deleted', 0) + 1
        
        if removed_count > 0:
            await self.db.commit()
            logger.info(f"🧹 Cleaned up {removed_count} missing files")
    
    def _find_audiobook_folders(self, path: str) -> List[Dict]:
        """
        Find audiobook folders (each folder = one audiobook)
        Returns list of dicts with folder info and file list
        """
        base_path = Path(path)
        if not base_path.exists():
            logger.warning(f"⚠️  Path does not exist: {path}")
            return []
        
        audiobooks = []
        
        # Look for folders containing audio files
        for folder in base_path.iterdir():
            if not folder.is_dir():
                continue
            
            # Find audio files in this folder
            audio_files = []
            for ext in self.MULTI_FILE_FORMATS + ['.m4b']:
                audio_files.extend(folder.glob(f'*{ext}'))
            
            if not audio_files:
                continue
            
            # Sort files by name (usually Part01, Part02, etc.)
            audio_files.sort()
            
            # Look for cover image
            cover = None
            for cover_ext in ['.jpg', '.jpeg', '.png']:
                cover_files = list(folder.glob(f'*{cover_ext}'))
                if cover_files:
                    cover = cover_files[0]
                    break
            
            # Calculate total size
            total_size = sum(f.stat().st_size for f in audio_files)
            
            audiobooks.append({
                'folder': folder,
                'files': audio_files,
                'cover': cover,
                'total_size': total_size,
                'file_count': len(audio_files)
            })
        
        # Sort by modification time (newest first)
        audiobooks.sort(
            key=lambda x: max(f.stat().st_mtime for f in x['files']), 
            reverse=True
        )
        
        logger.info(f"🎧 Found {len(audiobooks)} audiobook folders")
        return audiobooks
    
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
                # Quick hash: combine file size and path
                quick_hash = hashlib.md5(f"{file_path}{file_size}".encode()).hexdigest()
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
    
    async def _process_audiobook_folder(
        self,
        audiobook_data: Dict,
        library,
        existing_hashes: Dict[str, int]
    ):
        """Process a multi-file audiobook folder as ONE book"""
        from ..db.models.book import Book
        
        folder = audiobook_data['folder']
        files = audiobook_data['files']
        cover = audiobook_data['cover']
        
        # Use first file path as reference (but store folder path)
        folder_path = str(folder)
        
        # Check for duplicates using folder path
        quick_hash = hashlib.md5(f"{folder_path}{audiobook_data['total_size']}".encode()).hexdigest()
        if quick_hash in existing_hashes:
            logger.debug(f"⭕ Skipping duplicate audiobook: {folder.name}")
            self.scan_stats['duplicates'] += 1
            return
        
        # Extract metadata from folder name
        metadata = self._parse_audiobook_folder_name(folder)
        
        # Check if book exists by folder path
        result = await self.db.execute(
            text("SELECT id FROM books WHERE file_path = :file_path"),
            {"file_path": folder_path}
        )
        existing = result.fetchone()
        
        if existing:
            # Update existing book
            book = await self.db.get(Book, existing[0])
            if book:
                book.file_size = audiobook_data['total_size']
                book.updated_at = datetime.utcnow()
                book.page_count = audiobook_data['file_count']  # Store file count as "page count"
                await self.db.commit()
                logger.debug(f"🔄 Updated audiobook: {book.title}")
            self.scan_stats['updated'] += 1
        else:
            # Add new book
            book = Book(
                library_id=library.id,
                title=metadata['title'],
                author_name=metadata['author'],
                isbn=None,
                file_path=folder_path,  # Store folder path, not individual file
                file_format='audiobook',  # Special format identifier
                file_size=audiobook_data['total_size'],
                page_count=audiobook_data['file_count'],  # Number of audio files
                status='available',
                description=f"Multi-file audiobook with {audiobook_data['file_count']} parts"
            )
            
            self.db.add(book)
            await self.db.commit()
            
            logger.debug(f"➕ Added audiobook: {book.title} ({audiobook_data['file_count']} files)")
            self.scan_stats['added'] += 1
    
    def _parse_audiobook_folder_name(self, folder: Path) -> Dict:
        """
        Parse audiobook metadata from folder name
        Supports formats:
        - "Author Name - Book Title"
        - "Author Name/Book Title"  
        - "Book Title"
        """
        folder_name = folder.name
        
        # Pattern: "Author - Title"
        if ' - ' in folder_name:
            parts = folder_name.split(' - ', 1)
            return {
                'title': parts[1].strip() if len(parts) > 1 else parts[0].strip(),
                'author': parts[0].strip()
            }
        
        # Pattern: "Author/Title" (shouldn't happen with folder names, but just in case)
        if '/' in folder_name:
            parts = folder_name.split('/', 1)
            return {
                'title': parts[1].strip() if len(parts) > 1 else parts[0].strip(),
                'author': parts[0].strip()
            }
        
        # Default: Use parent folder as author if reasonable
        parent = folder.parent.name
        if parent not in ['audiobooks', 'downloads', 'Audiobooks', 'Downloads', 'complete']:
            return {
                'title': folder_name,
                'author': parent
            }
        
        # Last resort: folder name as title
        return {
            'title': folder_name,
            'author': 'Unknown'
        }
    
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
            logger.debug(f"⭕ Skipping duplicate: {file_path.name}")
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
        """
        Extract metadata from file
        PRIORITY:
        1. Check for saved metadata.json file (from previous Google Books fetch)
        2. Try to extract from file itself (EPUB, PDF)
        3. Parse filename as fallback
        """
        # 🎯 PRIORITY 1: Check for saved metadata
        try:
            saved_metadata = asyncio.run(metadata_manager.load_metadata(str(file_path)))
            if saved_metadata:
                logger.info(f"✅ Using saved metadata for {file_path.name}")
                return {
                    'title': saved_metadata.get('title', file_path.stem),
                    'author': saved_metadata.get('author_name', 'Unknown'),
                    'isbn': saved_metadata.get('isbn'),
                    'description': saved_metadata.get('description'),
                    'published_date': saved_metadata.get('published_date'),
                    'page_count': saved_metadata.get('page_count'),
                    'language': saved_metadata.get('language'),
                    'publisher': saved_metadata.get('publisher'),
                    'categories': saved_metadata.get('categories')
                }
        except Exception as e:
            logger.debug(f"No saved metadata found for {file_path.name}: {e}")
        
        # 🎯 PRIORITY 2: Extract from file
        ext = file_path.suffix.lower()
        
        if ext == '.epub':
            return self._extract_epub_metadata(file_path)
        elif ext == '.pdf':
            return self._extract_pdf_metadata(file_path)
        
        # 🎯 PRIORITY 3: Parse filename
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
                
                if info and info.get('/Title'):
                    title = info.get('/Title', '').strip()
                    author = info.get('/Author', 'Unknown').strip()
                    
                    # If PDF title looks like internal/code name, use filename instead
                    if title and (
                        title.lower() == file_path.stem.lower() or  # Same as filename
                        '_' in title and ' ' not in title or  # Looks like code (e.g. "mbs_master")
                        title.startswith('untitled') or
                        title.startswith('document') or
                        len(title) < 3  # Too short
                    ):
                        # Use filename instead
                        title = self._clean_title(file_path.stem)
                    
                    return {
                        'title': title or self._clean_title(file_path.stem),
                        'author': author if author != 'Unknown' else 'Unknown',
                        'isbn': None
                    }
        except Exception as e:
            logger.debug(f"Could not extract PDF metadata: {e}")
        
        return self._parse_filename(file_path)
    
    def _clean_title(self, title: str) -> str:
        """Clean up title by replacing underscores and normalizing"""
        # Replace underscores with spaces
        title = title.replace('_', ' ')
        # Title case
        title = ' '.join(word.capitalize() for word in title.split())
        return title
    
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
                'title': self._clean_title(parts[1].strip()),
                'author': self._clean_title(parts[0].strip()),
                'isbn': None
            }
        
        # Pattern: "Title (Author)"
        if '(' in filename and ')' in filename:
            title = filename.split('(')[0].strip()
            author = filename.split('(')[1].split(')')[0].strip()
            return {
                'title': self._clean_title(title),
                'author': self._clean_title(author),
                'isbn': None
            }
        
        # Use parent folder as author if it's not a generic name
        if parent not in ['books', 'downloads', 'Books', 'Downloads', 'complete', 'audiobooks', 'Audiobooks']:
            return {
                'title': self._clean_title(filename),
                'author': self._clean_title(parent),
                'isbn': None
            }
        
        # Default: filename as title
        return {
            'title': self._clean_title(filename),
            'author': 'Unknown',
            'isbn': None
        }
    
    async def _add_book(self, library_id: int, metadata: Dict, file_path: Path):
        """Add new book to database with optional Google Books enrichment"""
        from ..db.models.book import Book
        
        # 🌟 Try to enrich with Google Books
        google_metadata = None
        try:
            # Try ISBN first if available
            if metadata.get('isbn'):
                logger.info(f"🔍 Searching Google Books by ISBN: {metadata['isbn']}")
                google_metadata = await google_books_service.search_by_isbn(metadata['isbn'])
            
            # Fallback to title/author search
            if not google_metadata and metadata.get('title') and metadata.get('author'):
                logger.info(f"🔍 Searching Google Books: {metadata['title']} by {metadata['author']}")
                google_metadata = await google_books_service.search_by_title_author(
                    metadata['title'],
                    metadata['author']
                )
            
            # Merge Google Books data with existing metadata (Google Books takes priority)
            if google_metadata:
                logger.info(f"✨ Enriched metadata from Google Books for: {metadata['title']}")
                metadata.update(google_metadata)
                
                # Save enriched metadata to disk
                await metadata_manager.save_all(
                    str(file_path),
                    metadata,
                    cover_url=metadata.get('cover_url')
                )
        except Exception as e:
            logger.warning(f"⚠️ Google Books enrichment failed: {e}")
            # Continue without enrichment
        
        # Convert categories list to JSON string for SQLite
        categories_json = None
        if metadata.get('categories'):
            if isinstance(metadata['categories'], list):
                import json
                categories_json = json.dumps(metadata['categories'])
            else:
                categories_json = metadata['categories']
        
        book = Book(
            library_id=library_id,
            title=metadata.get('title', 'Unknown'),
            author_name=metadata.get('author', 'Unknown'),
            isbn=metadata.get('isbn'),
            description=metadata.get('description'),
            published_date=metadata.get('published_date'),
            page_count=metadata.get('page_count'),
            language=metadata.get('language'),
            publisher=metadata.get('publisher'),
            categories=categories_json,
            cover_url=metadata.get('cover_url'),
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