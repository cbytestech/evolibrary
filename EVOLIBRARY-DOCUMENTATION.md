# 📚 Evolibrary - Complete Project Documentation

## 🎯 Project Overview

**Evolibrary** is a self-hosted ebook management system inspired by Radarr/Sonarr, built to organize, manage, and discover ebooks. It features a modern React frontend with a FastAPI backend, running in Docker containers with SQLite database storage.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite
- **Backend:** FastAPI (Python) + SQLAlchemy 2.0 + SQLite
- **Deployment:** Docker + Docker Compose
- **Styling:** Custom Morpho theme with dark mode support

---

## ✨ Current Features

### 📖 Library Management
- ✅ **Create Libraries** - Define multiple ebook libraries with custom paths
- ✅ **Scan Libraries** - Automatic recursive scanning of directories for supported formats
- ✅ **Real-time Progress** - Live scan progress with file counts and status updates
- ✅ **Statistics Dashboard** - Total books, file sizes, and library health metrics
- ✅ **Duplicate Detection** - Hash-based deduplication prevents re-adding same books
- ✅ **Multi-format Support** - EPUB, PDF, MOBI, AZW, AZW3, CBZ, CBR, DJVU

### 📚 Book Management
- ✅ **Book Grid View** - Responsive grid layout (2-7 columns based on screen size)
- ✅ **Pagination** - 35 books per page with Previous/Next controls
- ✅ **Book Metadata** - Title, author, file path, size, format, hash
- ✅ **Search Ready** - Database schema supports future search/filter features
- ✅ **Author Support** - Separate Author model for relationships (foundation laid)

### 🎨 User Interface
- ✅ **Modern Design** - Clean, professional UI with Morpho green theme
- ✅ **Dark Mode** - Full dark mode support throughout
- ✅ **Responsive Layout** - Works on desktop, tablet, and mobile
- ✅ **Radarr-style Settings** - Sidebar navigation with sections
- ✅ **Compact Footer** - Single-row footer with health status and quick links
- ✅ **Theme Switcher** - Morpho (green) and Homestead (amber) themes

### ⚙️ Settings & Configuration

#### Libraries Settings
- ✅ Create/manage multiple libraries
- ✅ Custom paths and display names
- ✅ Scan controls with real-time progress
- ✅ Statistics per library

#### UI Settings
- ✅ Theme selection (Morpho/Homestead)
- ✅ Dark mode toggle
- ✅ Layout preferences (coming soon)

#### Logging & Terminal
- ✅ **Live Log Stream** - Real-time application logs (SSE streaming)
- ✅ **Container Terminal** - Execute commands inside Docker container
- ✅ **Quick Commands** - Pre-built buttons (ls, ps, du, tail logs)
- ✅ **Log Download** - Export logs as .txt files
- ✅ **Log Level Control** - DEBUG, INFO, WARNING, ERROR with persistence
- ✅ **Safety Controls** - Dangerous command blocking

#### Health & System
- ✅ **Health Check API** - Backend status monitoring
- ✅ **Auto-retry Logic** - 5 attempts on startup to handle Docker delays
- ✅ **Version Display** - App name and version in footer
- ✅ **Morpho Messages** - Fun status messages from the mascot

### 🔧 Developer Features
- ✅ **API Documentation** - FastAPI auto-generated docs at `/docs`
- ✅ **Hot Reload** - Development mode with live updates
- ✅ **Docker Compose** - Single-command deployment
- ✅ **Volume Mounts** - Persistent data and config
- ✅ **CORS Configured** - Frontend/backend communication
- ✅ **Structured Logging** - Morpho logger with colors and timestamps

### 🎁 Secret Easter Eggs
- ✅ **Secret Feature 1** - Hidden in the UI (user discovery)
- ✅ **Secret Feature 2** - Special interaction (user discovery)
- ✅ **Secret Feature 3** - Bonus functionality (user discovery)

---

## 🗂️ Project Structure

```
evolibrary/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── **admin.py**              # 🔧 Admin commands & log streaming
│   │   │   │   ├── **books.py**              # 📚 Book CRUD operations
│   │   │   │   ├── **libraries-CLEAN.py**    # 📁 Library management & scanning
│   │   │   │   └── __init__.py
│   │   │   └── **__init__.py**               # API router registration
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── **author.py**             # 👤 Author model
│   │   │   │   ├── **book.py**               # 📖 Book model
│   │   │   │   ├── **library.py**            # 📁 Library model
│   │   │   │   └── __init__.py
│   │   │   ├── **database.py**               # Database session management
│   │   │   └── **init_db.py**                # Database initialization
│   │   ├── schemas/
│   │   │   ├── **books.py**                  # Pydantic schemas for books
│   │   │   └── **libraries.py**              # Pydantic schemas for libraries
│   │   ├── services/
│   │   │   ├── **books-FIXED.py**            # Book service logic
│   │   │   └── **library_scanner.py**        # 🔍 Library scanning engine
│   │   ├── **config.py**                     # Configuration & environment
│   │   ├── **logging_config.py**             # Morpho logger setup
│   │   └── **main.py**                       # FastAPI application entry
│   ├── tests/                        # Backend tests (coming soon)
│   ├── **Dockerfile**                        # Backend container definition
│   └── **requirements.txt**                  # Python dependencies
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── settings/
│   │   │   │   ├── **LoggingSettings-CLEAN.tsx**  # 📋 Logging & terminal UI
│   │   │   │   ├── **LibrariesSettings.tsx**      # 📁 Libraries management UI
│   │   │   │   ├── UISettings.tsx
│   │   │   │   ├── HealthSettings.tsx
│   │   │   │   └── GeneralSettings.tsx
│   │   │   ├── **BookCard.tsx**              # 📖 Individual book display
│   │   │   ├── **Footer.tsx**                # Footer with health check
│   │   │   ├── **Header.tsx**                # Top navigation
│   │   │   ├── **SearchBar.tsx**             # Search component
│   │   │   └── **SettingsLayout.tsx**        # Radarr-style settings sidebar
│   │   ├── config/
│   │   │   └── **api.ts**                    # API URL configuration
│   │   ├── pages/
│   │   │   ├── **BooksPage.tsx**             # 📚 Books grid with pagination
│   │   │   ├── **HomePage.tsx**              # 🏠 Landing page
│   │   │   ├── **LibrariesPage.tsx**         # 📁 Libraries overview
│   │   │   └── **SettingsPage.tsx**          # ⚙️ Settings with sections
│   │   ├── types/
│   │   │   ├── **book.ts**                   # TypeScript book types
│   │   │   └── **library.ts**                # TypeScript library types
│   │   ├── **App.tsx**                       # Main application component
│   │   ├── **index.css**                     # Global styles + animations
│   │   └── **main.tsx**                      # Application entry point
│   ├── public/                       # Static assets
│   ├── **Dockerfile**                        # Frontend container definition
│   ├── **package.json**                      # NPM dependencies
│   ├── **tsconfig.json**                     # TypeScript configuration
│   └── **vite.config.ts**                    # Vite build configuration
│
├── nginx/                            # Nginx Reverse Proxy (future)
├── scripts/                          # Utility scripts
├── docs/                            # Documentation
│   └── **LOGGING-FEATURES-README.txt**       # Logging feature docs
│
├── **.env.example**                          # Environment template
├── **docker-compose.yml**                    # Docker orchestration
├── **entrypoint.sh**                         # Container startup script
└── **README.md**                             # Main project README

```

---

## 🗄️ Database Schema

### Books Table
```sql
CREATE TABLE books (
    id INTEGER PRIMARY KEY,
    title VARCHAR(500),
    author VARCHAR(500),
    file_path VARCHAR(1000) UNIQUE NOT NULL,
    file_size INTEGER,
    file_format VARCHAR(10),
    file_hash VARCHAR(64) UNIQUE,
    library_id INTEGER,
    added_at TIMESTAMP,
    updated_at TIMESTAMP,
    isbn VARCHAR(20),
    publisher VARCHAR(200),
    publish_date DATE,
    language VARCHAR(10),
    description TEXT,
    cover_url VARCHAR(1000),
    rating FLOAT,
    pages INTEGER,
    categories TEXT,  -- JSON array
    FOREIGN KEY (library_id) REFERENCES libraries(id)
)
```

### Libraries Table
```sql
CREATE TABLE libraries (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    path VARCHAR(1000) UNIQUE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_scan_at TIMESTAMP,
    total_items INTEGER DEFAULT 0,
    scan_status VARCHAR(20)
)
```

### Authors Table
```sql
CREATE TABLE authors (
    id INTEGER PRIMARY KEY,
    name VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

---

## 🚀 Deployment

### Docker Compose Setup
```yaml
services:
  backend:
    build: ./backend
    ports: 8001:8000
    volumes:
      - ./config:/config
      - /media/htpc/books:/books
    environment:
      - DATABASE_URL=sqlite:////config/evolibrary.db
  
  frontend:
    build: ./frontend
    ports: 3001:3000
    environment:
      - VITE_API_URL=http://10.0.0.50:8001
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/evolibrary.git
cd evolibrary

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost:3001
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

---

## 🎯 Roadmap - Phase 2 Features

### 📚 Enhanced Book Management
- [ ] **Cover Art Extraction** - Extract covers from EPUB files
- [ ] **Google Books API** - Fetch metadata and covers
- [ ] **Manual Metadata Edit** - Edit book details directly
- [ ] **Bulk Operations** - Multi-select and batch actions
- [ ] **Advanced Search** - Filter by author, format, date, rating
- [ ] **Collections** - Create custom book collections
- [ ] **Reading Progress** - Track reading status and progress

### 🔍 Indexers & Search
- [ ] **MyAnonamouse Integration** - Private tracker indexer
- [ ] **LibGen Integration** - Open library indexer
- [ ] **Anna's Archive** - Additional source
- [ ] **Custom RSS Feeds** - Add any RSS source
- [ ] **Automatic Monitoring** - Watch for new releases
- [ ] **Wanted List** - Queue books for automatic download

### 📥 Download Clients
- [ ] **Deluge Support** - Torrent client integration
- [ ] **qBittorrent Support** - Alternative torrent client
- [ ] **Transmission Support** - Lightweight option
- [ ] **Direct HTTP Downloads** - For open sources
- [ ] **Download Queue Management** - Priority and throttling
- [ ] **Post-Processing** - Auto-organize after download

### 🔔 Notifications
- [ ] **Discord Webhooks** - New book notifications
- [ ] **Telegram Bot** - Interactive bot commands
- [ ] **Email Notifications** - SMTP support
- [ ] **Pushover/Pushbullet** - Mobile notifications
- [ ] **Custom Webhooks** - Generic webhook support

### 📊 Analytics & Insights
- [ ] **Reading Statistics** - Books read, pages, time
- [ ] **Library Growth Charts** - Historical data visualization
- [ ] **Author Analytics** - Most read authors
- [ ] **Format Breakdown** - Pie charts by format
- [ ] **Export Reports** - CSV/JSON data exports

### 🔐 User Management
- [ ] **Multi-user Support** - Individual accounts
- [ ] **Reading Lists** - Per-user collections
- [ ] **Permissions** - Admin vs. read-only users
- [ ] **API Keys** - Secure external access
- [ ] **OAuth Integration** - Social login options

### 🎨 UI Enhancements
- [ ] **List View** - Alternative to grid view
- [ ] **Virtual Scrolling** - Performance for large libraries
- [ ] **Drag & Drop** - Organize collections
- [ ] **Keyboard Shortcuts** - Power user features
- [ ] **Mobile App** - Native iOS/Android apps
- [ ] **PWA Support** - Install as app

### 🔧 System Features
- [ ] **Backup & Restore** - Database backups
- [ ] **Import/Export** - Calibre library import
- [ ] **Cloud Sync** - Google Drive, Dropbox integration
- [ ] **OPDS Server** - Standard ebook protocol
- [ ] **Web Reader** - Read books in browser
- [ ] **API Versioning** - Stable public API

---

## 🐛 Known Issues

1. **No Cover Art** - Books display without covers (Phase 2 feature)
2. **Edit Library Modal** - Gear button in Libraries settings not implemented
3. **Search Not Functional** - Search bar present but not wired to backend
4. **No User Auth** - Single-user system (multi-user in Phase 2)

---

## 🤝 Contributing

Evolibrary is currently in active development. Contributions welcome!

**Development Setup:**
```bash
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn backend.app.main:app --reload

# Frontend development
cd frontend
npm install
npm run dev
```

---

## 📝 Recent Changes

### December 7, 2025
- ✅ Fixed Books API routing (removed double `/books` prefix)
- ✅ Fixed Pydantic validation (Optional fields for null values)
- ✅ Fixed library statistics counting (direct SQL count vs. scan stats)
- ✅ Implemented pagination (35 books per page, 7 columns on 2xl)
- ✅ Added live log streaming with SSE
- ✅ Added container terminal for command execution
- ✅ Redesigned footer (single row, compact, centered branding)
- ✅ Fixed health check auto-retry (5 attempts on startup)
- ✅ Added fade-out toast notifications (no more browser alerts)
- ✅ Fixed log stream auto-scroll behavior

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🙏 Acknowledgments

- **Built with:** Claude Sonnet 4.5 (Anthropic)
- **Inspired by:** Radarr, Sonarr, Readarr
- **Created by:** CookieBytes Technologies
- **Made in:** Muscle Shoals, Alabama 🏈

---

## 🦠 About Morpho

Morpho is the friendly bacteriophage mascot of Evolibrary! Look for Morpho's messages throughout the app for helpful tips and encouragement.

**"Ready to evolve your reading!" - Morpho** 🦠

---

**Last Updated:** December 7, 2025
**Version:** 0.1.0 (Alpha)
**Status:** Active Development
