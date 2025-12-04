# Evolibrary - Project Planning Document
**Tagline:** "Evolve Your Reading"

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Theming System](#theming-system)
4. [Technical Architecture](#technical-architecture)
5. [Integration Points](#integration-points)
6. [User Interface Design](#user-interface-design)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Development Roadmap](#development-roadmap)
10. [Future Enhancements](#future-enhancements)

---

## Project Overview

**Name:** Evolibrary  
**Purpose:** Automated library management for books, audiobooks, comics, magazines, and articles  
**Target Users:** Self-hosters, media enthusiasts, homelab users  
**Deployment:** Docker container (similar to Radarr/Sonarr ecosystem)

### Key Differentiators
- **Multi-format support:** Books, audiobooks, comics, magazines, articles in one app
- **Dual theming:** Professional homestead theme + optional Evolution/Morpho theme
- **Prowlarr/Jackett auto-import:** Automatically discover and add indexers
- **Kavita integration:** Wishlist reading and reading progress sync
- **Format flexibility:** Profile-based format prioritization

---

## Core Features

### 1. Library Management
- **Multi-format support:**
  - eBooks: EPUB, MOBI, AZW3, PDF
  - Audiobooks: M4B, MP3, FLAC
  - Comics: CBZ, CBR, CB7
  - Magazines: PDF, EPUB
  - Articles: PDF, EPUB, HTML
  - Plain text: TXT, MD

- **Organization:**
  - Configurable folder structures (Author/Series/Title)
  - Custom naming templates
  - Automatic metadata tagging
  - Series detection and tracking
  - Duplicate detection across formats
  - Multi-format bundling (group audiobook + ebook of same title)

- **Metadata Management:**
  - Google Books API integration
  - Goodreads integration (ratings, reviews)
  - OpenLibrary API
  - Custom metadata providers
  - Manual metadata editing
  - Cover art fetching and management
  - ISBN/ASIN lookup

### 2. Automated Search & Acquisition
- **Indexer Support:**
  - Prowlarr integration (primary)
  - Jackett integration (secondary)
  - **Auto-discovery feature:** Automatically import indexers from Prowlarr/Jackett
  - Per-indexer priority/weighting
  - Indexer health monitoring
  - Custom search templates

- **Search Capabilities:**
  - Manual search
  - Automatic monitoring (RSS-style)
  - Author tracking (auto-grab new releases)
  - Series completion (find missing books)
  - Release calendar
  - Failed search retry with backoff

- **Quality/Format Profiles:**
  - "Evolution Preferences" (Pokémon theme) / "Quality Profiles" (Professional theme)
  - Format priority ordering (prefer EPUB over MOBI, etc.)
  - Audiobook bitrate preferences
  - File size limits
  - Upgrade existing files when better quality available
  - Custom profile creation

### 3. Download Client Integration
- **Supported Clients:**
  - Deluge
  - qBittorrent
  - Transmission
  - SABnzbd
  - NZBGet
  - rTorrent

- **Download Management:**
  - Multiple client support simultaneously
  - Category/label assignment per client
  - Client priority routing
  - Bandwidth scheduling
  - Seeding rules for torrents
  - Completed download handling
  - Failed download detection and retry

### 4. Content Discovery
- **Lists & Tracking:**
  - Kavita wishlist integration (read-only monitoring)
  - NYT Bestseller lists
  - Goodreads lists
  - Custom RSS feeds
  - Release calendar
  - Coming soon tracking

- **Author & Series Management:**
  - Author pages with bibliography
  - Automatic new release detection
  - Series ordering and gap detection
  - Publisher/imprint filtering
  - Genre/category browsing

### 5. Automation & Monitoring
- **Scheduled Tasks:**
  - RSS sync intervals
  - Automatic search scheduling
  - Library scanning
  - Metadata refresh
  - Health checks

- **Smart Automation:**
  - Series auto-completion
  - Format upgrading
  - Release date monitoring
  - Schedule-based searching (e.g., new release Tuesdays)
  - Retry logic with exponential backoff

### 6. Notifications & Webhooks
- **Notification Services:**
  - Discord webhooks
  - Telegram
  - Slack
  - Email (SMTP)
  - Apprise integration (80+ services)
  - Custom webhooks
  - Browser push notifications

- **Notification Triggers:**
  - On grab (book found and sent to download client)
  - On import (book successfully added to library)
  - On upgrade (better quality found and imported)
  - On failure (search or download failed)
  - On author new release
  - On health check issues
  - Custom trigger creation

### 7. Web UI Features
- **Dashboard:**
  - Recent activity feed
  - Upcoming releases calendar
  - Quick stats (library size, recent additions, active downloads)
  - Customizable widgets
  - Search bar (global)

- **Library Views:**
  - Grid view (covers)
  - List view (detailed)
  - Author view
  - Series view
  - Advanced filtering and sorting
  - Bulk operations (search, edit, delete, tag)

- **Activity/History:**
  - Download history
  - Search history
  - Import logs
  - Failed attempts log
  - Activity timeline

- **Statistics:**
  - Library growth over time
  - Download success rates
  - Indexer performance
  - Storage usage
  - Reading progress (via Kavita sync)

### 8. API & Developer Features
- **RESTful API:**
  - Full CRUD operations
  - Search and filter endpoints
  - Following *arr API conventions
  - OpenAPI/Swagger documentation
  - API key authentication
  - Webhook endpoints

- **Integrations:**
  - Organizr compatibility (iframe-friendly, no forced new tab)
  - Overseerr/Ombi-style request system (future)
  - Custom script hooks (post-processing)
  - Import/export functionality (CSV, JSON)

### 9. VSCode Integration (Kavita Watchlist)
- **Watchlist Monitoring:**
  - Read Kavita API for user wishlists
  - Automatic monitoring when items added to Kavita wishlist
  - Bi-directional sync options
  - VSCode extension for quick management
  - Custom watchlist creation and management

---

## Theming System

### Theme Modes
1. **Homestead (Professional)** - Default
2. **Homestead Dark** - Professional dark mode
3. **Evolibrary (Light)** - Pokémon theme
4. **Evolibrary (Dark)** - Pokémon dark mode
5. **Pixelated (Retro)** - 8-bit/16-bit pixel art theme for OG Pokémon fans
6. **Pixelated Dark** - Retro pixel art with dark Game Boy color palette

### Homestead Theme
**Inspiration:** Hess Homestead vintage aesthetic

**Color Palette:**
```
Light Mode:
- Primary: #5A5A42 (Olive green from logo)
- Secondary: #C89968 (Turnip orange/brown)
- Background: #F5EFE6 (Cream/parchment)
- Text: #3A3A2E (Dark olive)
- Accent: #8B7355 (Warm brown)
- Border: #D4C5B0 (Light tan)

Dark Mode:
- Primary: #7A8A5F (Muted sage)
- Secondary: #D4A574 (Warm tan)
- Background: #1E1E16 (Deep charcoal-olive)
- Surface: #2A2A20 (Dark olive surface)
- Text: #E5DCC8 (Warm cream)
- Accent: #A08968 (Dusty brown)
- Border: #3A3A2E (Dark olive)
```

**Typography:**
- Headers: Serif font (Georgia, Baskerville style)
- Body: Clean sans-serif (Inter, System UI)
- Monospace: For paths/technical info

**Visual Elements:**
- Clean, minimal icons
- Subtle textures (paper-like backgrounds)
- Botanical/garden motifs (optional subtle accents)
- Vintage-inspired UI elements
- Professional file type icons

**Terminology:**
- Quality Profiles
- Download Clients
- Library Management
- Standard technical terms

### Evolibrary Theme
**Inspiration:** Pokémon Morpho evolutions

**Color Palette:**
```
Light Mode:
- Primary: #C4A57B (Morpho brown)
- Secondary: #F5DEB3 (Morpho cream)
- Background: #FFF9F0 (Light cream)
- Text: #4A3C2E (Dark brown)
- Evolution Accents:
  - Vaporeon: #7AC7E8 (Water blue)
  - Jolteon: #FFD700 (Electric yellow)
  - Flareon: #FF6B35 (Fire orange)
  - Espeon: #B565D8 (Psychic purple)
  - Umbreon: #2E2E3D (Dark blue-black)
  - Leafeon: #8FBC8F (Grass green)
  - Glaceon: #B0E0E6 (Ice blue)
  - Sylveon: #FFB6E1 (Fairy pink)

Dark Mode:
- Primary: #D4A373 (Warm morpho brown)
- Secondary: #8B7355 (Deep brown)
- Background: #1A1A2E (Dark navy-black)
- Surface: #252539 (Deep purple-navy)
- Text: #F5E6D3 (Warm cream)
- Evolution accents remain vibrant
```

**Typography:**
- Headers: Playful rounded sans-serif
- Body: Readable sans-serif
- Special: Pokémon-style text for headings (optional)

**Visual Elements:**
- Evolution sprites/icons for formats
- Morpho mascot in corner (minimally intrusive)
- Pokéball progress bars
- Evolution stone animations
- Type badges (format indicators)
- Celebration animations on completion

**Terminology:**
- Evolution Preferences (instead of Quality Profiles)
- Evolution Stones (Download Clients)
- PokéDex (Library)
- Training (Monitoring)
- Wild Books (Search Results)

**Special Features:**
- Loading screen with Morpho animation
- Evolution celebration when downloads complete
- Easter eggs (Shiny variants for special editions)
- Day/Night cycle indicator (for scheduled tasks)

### Pixelated Theme (Retro)
**Inspiration:** Original Pokémon Red/Blue/Yellow, Game Boy, 8-bit/16-bit era

**Color Palette:**
```
Light Mode (Game Boy Color):
- Primary: #9bbc0f (Game Boy green)
- Secondary: #8bac0f (Medium green)
- Background: #e0f8d0 (Light mint)
- Text: #306230 (Dark green)
- Accent: #0f380f (Darkest green)

Dark Mode (Original Game Boy):
- Primary: #0f380f (Near black)
- Secondary: #306230 (Dark olive)
- Background: #0f380f (Dark screen)
- Surface: #306230 (Medium surface)
- Text: #9bbc0f (Light green)
- Accent: #8bac0f (Bright green)

Alternative Dark (GBA):
- Deep purple-blacks
- Backlit screen glow
- RGB color support
```

**Typography:**
- Headers: Pixel font (Press Start 2P, or custom pixel font)
- Body: Monospace pixel-style (VT323, Pixel Operator)
- All text should feel chunky and pixelated

**Visual Elements:**
- 8×8 or 16×16 pixel grid aesthetic
- Pixelated sprites for all icons
- Dithered gradients (Game Boy style)
- Scanline effects (optional CRT filter)
- Pixel-perfect borders and buttons
- 8-bit style animations
- Retro progress bars (chunk-based, not smooth)
- Pokémon Red/Blue UI inspiration
- Game Boy screen frame (optional border mode)

**UI Elements:**
- Textboxes with chunky pixel borders
- Speech bubble style notifications
- Health bar style progress indicators
- Pokémon menu-inspired navigation
- Pixelated book cover placeholders
- 8-bit evolution stone icons
- Retro sound effects (optional, user toggle)

**Terminology:**
- Same as Evolibrary theme but with retro styling
- "Press START" on loading screens
- "SELECT" and "START" button references
- A/B button UI elements

### Theme Toggle Implementation
```
Settings > Appearance > Theme:
- Homestead (Light)
- Homestead (Dark)
- Evolibrary (Light)
- Evolibrary (Dark)

Settings > Appearance > Advanced:
- Enable evolution animations
- Enable easter eggs
- Show evolution icons
- Enable celebration effects
```

### Loading Screen Taglines

**System:**
- Each loading screen randomly selects a tagline
- **Evolibrary & Pixelated themes**: Animated sprite matches the tagline theme when applicable
- **Sprite animations**: 4-frame walk/run cycle for smooth movement
- **Pixelated theme**: 8-bit style sprites with optional scanline effects
- Sprite cycles across screen during loading

**Sprite Matching Logic:**
```javascript
// Sprite selection based on tagline
const spriteMap = {
  'Vaporeon': 'vaporeon-running',
  'Jolteon': 'jolteon-running',
  'Flareon': 'flareon-running',
  'Espeon': 'espeon-running',
  'Umbreon': 'umbreon-running',
  'Leafeon': 'leafeon-running',
  'Glaceon': 'glaceon-running',
  'Sylveon': 'sylveon-running',
  'Morpho': 'morpho-running',
  'default': 'random-evolibrary' // Cycles through all
};

// Match tagline to sprite
function getSpriteForTagline(tagline) {
  for (const [key, sprite] of Object.entries(spriteMap)) {
    if (tagline.includes(key)) return sprite;
  }
  return spriteMap.default;
}
```

**Sprite Specifications:**
- **Standard sprites**: 64×64px (4 frames, 256px total width sprite sheet)
- **Pixelated sprites**: 32×32px or 16×16px for authentic retro feel
- **Animation speed**: 150ms per frame (4 FPS for retro, 6 FPS for modern)
- **Movement**: Sprite runs left-to-right across screen, loops back
- **Variants**: Walking (slow), Running (fast), Idle (stationary with bounce)

**Universal (all themes):**
- "Organizing your digital library..."
- "Indexing the shelves..."
- "Cataloging new arrivals..."
- "Searching for the perfect read..."
- "Connecting to indexers..."
- "Transforming formats..."
- "Building your collection..."
- "Scanning the archives..."
- "Fetching metadata..."
- "Optimizing your library..."
- "Rewriting the book on automation..."
- "Don't judge a book by its cover art..."
- "Reading between the lines of code..."
- "Chapter loading: Please wait..."
- "Turning the page..."
- "Bookmarking your progress..."
- "Adding to your reading list..."
- "The plot thickens..."
- "Writing your library's story..."
- "Once upon a download..."

**Evolibrary Theme Only:**
- "Gotta Read 'Em All!"
- "Morpho is evolving..."
- "Choose your evolution!"
- "Collecting evolution stones..."
- "Increasing friendship level..."
- "Training your reading list..."
- "Evolving your library..."
- "Which evolution will you choose?"
- "Checking the PokéDex..."
- "Professor Oak is analyzing..."
- "Morpho used Download! It's super effective!"
- "A wild book appeared!"
- "Searching tall grass for books..."
- "Your library grew to level 99!"
- "Teaching Morpho new formats..."
- "Evolution in progress..."
- "Catching rare editions..."
- "Visiting the Pokémon Center..."
- "Day/Night cycle detected..."
- "Espeon senses new releases..."
- "Umbreon prowls for comics..."
- "Vaporeon streams audiobooks..."
- "Jolteon charging your ePub..."
- "Flareon warming up PDFs..."
- "Sylveon organizing articles..."
- "Glaceon preserving archives..."
- "Leafeon growing your TXT collection..."

---

## Technical Architecture

### Tech Stack

**Backend:**
- **Language:** Python 3.11+
- **Framework:** FastAPI (async, modern, *arr-compatible)
- **Database:** SQLite (default) with PostgreSQL option
- **Task Queue:** Dramatiq or Celery (background jobs)
- **ORM:** SQLAlchemy 2.0
- **HTTP Client:** httpx (async)
- **File Handling:** watchdog (filesystem monitoring)

**Frontend:**
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS (easy theming via CSS variables)
- **State Management:** Zustand or Redux Toolkit
- **UI Components:** Headless UI + custom components
- **Build Tool:** Vite
- **Icons:** Lucide React (customizable)

**Infrastructure:**
- **Container:** Docker (multi-stage build)
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Traefik/Nginx compatible
- **Health Checks:** Built-in endpoints

**External APIs:**
- Google Books API
- Goodreads API (if available) or web scraping
- OpenLibrary API
- Prowlarr API
- Jackett API
- Kavita API
- Download client APIs (various)

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Library  │  │ Settings │  │ Activity │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes & Controllers                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Business Logic Layer                  │  │
│  │  - Search Manager    - Download Manager               │  │
│  │  - Metadata Manager  - Notification Manager           │  │
│  │  - Library Manager   - Indexer Manager                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Background Task Processor                  │  │
│  │  - Scheduled searches  - RSS monitoring               │  │
│  │  - Download monitoring - Metadata refresh             │  │
│  │  - Health checks      - Library scanning              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  Database (SQLite/PostgreSQL)                │
│  - Books  - Authors  - Series  - Profiles                   │
│  - Downloads  - History  - Settings  - Queue                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Prowlarr │  │  Jackett │  │  Kavita  │  │ Download │   │
│  │          │  │          │  │          │  │ Clients  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Google  │  │Goodreads │  │OpenLib   │                 │
│  │  Books   │  │          │  │          │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
evolibrary/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── books.py
│   │   │   │   ├── authors.py
│   │   │   │   ├── series.py
│   │   │   │   ├── search.py
│   │   │   │   ├── downloads.py
│   │   │   │   ├── settings.py
│   │   │   │   ├── indexers.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── system.py
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   ├── book.py
│   │   │   ├── author.py
│   │   │   ├── series.py
│   │   │   ├── download.py
│   │   │   ├── indexer.py
│   │   │   └── settings.py
│   │   ├── schemas/
│   │   │   └── (Pydantic models)
│   │   ├── services/
│   │   │   ├── search/
│   │   │   │   ├── prowlarr.py
│   │   │   │   ├── jackett.py
│   │   │   │   └── manager.py
│   │   │   ├── metadata/
│   │   │   │   ├── googlebooks.py
│   │   │   │   ├── goodreads.py
│   │   │   │   └── manager.py
│   │   │   ├── downloads/
│   │   │   │   ├── deluge.py
│   │   │   │   ├── qbittorrent.py
│   │   │   │   └── manager.py
│   │   │   ├── library/
│   │   │   │   ├── scanner.py
│   │   │   │   ├── organizer.py
│   │   │   │   └── manager.py
│   │   │   ├── notifications/
│   │   │   │   └── manager.py
│   │   │   └── integrations/
│   │   │       └── kavita.py
│   │   ├── tasks/
│   │   │   ├── scheduled.py
│   │   │   ├── workers.py
│   │   │   └── monitoring.py
│   │   └── utils/
│   │       ├── file_utils.py
│   │       ├── metadata_utils.py
│   │       └── validation.py
│   ├── tests/
│   ├── alembic/ (database migrations)
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── public/
│   │   ├── themes/
│   │   │   ├── homestead/
│   │   │   │   ├── icons/
│   │   │   │   └── assets/
│   │   │   └── evolibrary/
│   │   │       ├── sprites/
│   │   │       └── animations/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── library/
│   │   │   ├── search/
│   │   │   ├── settings/
│   │   │   └── theme/
│   │   │       ├── ThemeProvider.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Library.tsx
│   │   │   ├── Activity.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   ├── styles/
│   │   │   ├── themes/
│   │   │   │   ├── homestead-light.css
│   │   │   │   ├── homestead-dark.css
│   │   │   │   ├── evolibrary-light.css
│   │   │   │   └── evolibrary-dark.css
│   │   │   └── globals.css
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/
│   ├── API.md
│   ├── INSTALLATION.md
│   └── CONFIGURATION.md
├── scripts/
│   └── init-db.py
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

### Docker Configuration

**Dockerfile (multi-stage):**
```dockerfile
# Build stage for frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM python:3.11-slim AS backend-build
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /config /books /downloads

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8787/api/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8787"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  evolibrary:
    image: evolibrary:latest
    container_name: evolibrary
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
      - DATABASE_URL=sqlite:///config/evolibrary.db
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - /path/to/config:/config
      - /path/to/books:/books
      - /path/to/downloads:/downloads
    ports:
      - "8787:8787"
    restart: unless-stopped
    networks:
      - media-network

networks:
  media-network:
    external: true
```

---

## Integration Points

### 1. Prowlarr Integration
**Purpose:** Primary indexer source, automatic indexer discovery

**API Endpoints Used:**
- `GET /api/v1/indexer` - List all indexers
- `GET /api/v1/indexer/{id}` - Get specific indexer details
- `GET /api/v1/search` - Search across indexers
- `GET /api/v1/config/downloadclient` - Get download clients

**Auto-Import Feature:**
- Poll Prowlarr every 5 minutes (configurable)
- Compare Prowlarr indexers with Evolibrary indexers
- Auto-add new indexers found in Prowlarr
- Inherit categories, priorities, and capabilities
- Map Prowlarr capabilities to Evolibrary book categories
- Sync indexer status (enabled/disabled)

**Configuration:**
```
Settings > Indexers > Prowlarr:
- API URL: http://prowlarr:9696
- API Key: [your-key]
- Auto-sync enabled: [toggle]
- Sync interval: 5 minutes
- Auto-enable new indexers: [toggle]
```

### 2. Jackett Integration
**Purpose:** Secondary indexer source (fallback/supplement)

**API Endpoints Used:**
- `GET /api/v2.0/indexers/all/results` - Search
- `GET /api/v2.0/indexers` - List indexers

**Similar auto-import functionality as Prowlarr**

### 3. Kavita Integration
**Purpose:** Wishlist monitoring, reading progress sync

**API Endpoints Used:**
- `GET /api/Series/want-to-read` - Get wishlist
- `GET /api/User/progress` - Get reading progress
- `GET /api/Series/{id}` - Get series details

**Wishlist Monitoring:**
- Poll Kavita API every 10 minutes (configurable)
- Check user's "Want to Read" shelf
- Auto-add to Evolibrary monitoring
- Remove from monitoring when marked as read in Kavita
- Sync reading progress for statistics

**VSCode Extension (Future):**
- Quick-add to monitoring from VSCode
- View library status in VSCode sidebar
- Trigger manual searches
- Check download progress

### 4. Download Clients
**Deluge (Primary Example):**
```python
# Connection details
- Host: localhost
- Port: 8112 (web) / 58846 (daemon)
- Password: [password]

# Operations
- Add torrent via magnet/file
- Monitor download progress
- Set category/label
- Manage seeding rules
- Remove completed downloads
```

**qBittorrent, Transmission, SABnzbd, NZBGet:**
- Similar API-based integration
- Standardized interface in Evolibrary
- Per-client configuration
- Priority routing based on indexer

### 5. Metadata Providers

**Google Books API:**
```
- ISBN/Title/Author search
- Cover images
- Descriptions
- Publisher info
- Page counts
- Categories/genres
```

**Goodreads (Web Scraping if API unavailable):**
```
- Ratings
- Reviews
- Similar books
- Author info
- Series information
```

**OpenLibrary:**
```
- ISBN lookup
- Alternative metadata source
- Cover images
- Edition information
```

### 6. Organizr Integration
**Requirements:**
- iframe-compatible (no X-Frame-Options blocking)
- Session persistence
- No forced new tab redirects
- Responsive design for small frames

**Implementation:**
```
Response Headers:
- X-Frame-Options: SAMEORIGIN
- Content-Security-Policy: frame-ancestors 'self' https://organizr.domain.com

Settings > General > Organizr Mode:
- Enable Organizr compatibility: [toggle]
- Hide external link prompts
- Adjust UI spacing for frames
```

---

## User Interface Design

### Main Navigation
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Evolibrary        [Search...]        [User] [⚙️]   │
├─────────────────────────────────────────────────────────┤
│  📊 Dashboard                                            │
│  📚 Library                                              │
│  🔍 Add New                                             │
│  📅 Calendar                                            │
│  📥 Activity                                            │
│  ⚙️  Settings                                           │
│  📈 Statistics                                          │
└─────────────────────────────────────────────────────────┘
```

### Dashboard View
```
┌─────────────────────────────────────────────────────────┐
│  Recent Activity                    │  Upcoming Releases │
│  ────────────────                   │  ──────────────── │
│  📖 Book imported                   │  📅 Author X       │
│  🔍 Searching for...                │  📅 Series Y Vol 3 │
│  ⬇️  Downloading...                 │                    │
├─────────────────────────────────────┼────────────────────┤
│  Quick Stats                        │  Recent Additions  │
│  ────────────                       │  ────────────────  │
│  Total Books: 1,234                 │  [Cover] [Cover]   │
│  Authors: 456                       │  [Cover] [Cover]   │
│  Series: 89                         │                    │
└─────────────────────────────────────┴────────────────────┘
```

### Library View
**Toolbar:**
```
[View: Grid ▼] [Sort: Title ▼] [Filter: All ▼] [Search...]
[Select All] [Bulk Actions ▼]
```

**Grid View:**
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Cover│ │Cover│ │Cover│ │Cover│
│Title│ │Title│ │Title│ │Title│
│Auth │ │Auth │ │Auth │ │Auth │
└─────┘ └─────┘ └─────┘ └─────┘
```

**List View:**
```
Title              | Author        | Series      | Formats | Status
─────────────────────────────────────────────────────────────────
Book Title         | Author Name   | Series #1   | 📱📖🎧  | ✓
Another Book       | Another Auth  | -           | 📖      | 🔍
```

### Book Detail View
```
┌─────────────────────────────────────────────────────────┐
│  ┌───────┐   Title: Book Title                          │
│  │       │   Author: Author Name                         │
│  │ Cover │   Series: Series Name #1                      │
│  │ Image │   Published: 2024                             │
│  │       │   Pages: 350                                  │
│  └───────┘   Rating: ⭐⭐⭐⭐☆ (4.2/5)                    │
│                                                           │
│  Description:                                            │
│  Lorem ipsum dolor sit amet...                          │
│                                                           │
│  Formats: [📱 EPUB] [🎧 Audiobook] [📄 PDF]             │
│                                                           │
│  [🔍 Search Again] [✏️ Edit] [🗑️ Delete]                │
│                                                           │
│  Files:                                                  │
│  📁 /books/Author Name/Book Title/                       │
│    └─ book_title.epub (2.3 MB)                          │
│    └─ book_title.m4b (145 MB)                           │
└─────────────────────────────────────────────────────────┘
```

### Settings Sections
1. **General**
   - Theme selection
   - Language
   - Date/time format

2. **Media Management**
   - Root folders
   - Naming templates
   - File organization
   - Quality profiles (Evolution Preferences)

3. **Indexers**
   - Prowlarr connection
   - Jackett connection
   - Manual indexer addition
   - Indexer priorities

4. **Download Clients**
   - Add/edit clients
   - Categories
   - Priorities

5. **Metadata**
   - Provider priority
   - Auto-fetch settings
   - Cover art quality

6. **Integrations**
   - Kavita connection
   - Organizr mode
   - Custom scripts

7. **Notifications**
   - Discord, Telegram, Email, etc.
   - Notification triggers
   - Browser notifications

8. **UI**
   - Theme selection (Homestead/Evolibrary)
   - Dark mode
   - Loading taglines
   - Animation settings
   - Easter egg toggles

---

## Database Schema

### Core Tables

**books**
```sql
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    title_sort TEXT,
    isbn TEXT UNIQUE,
    asin TEXT,
    description TEXT,
    published_date DATE,
    publisher TEXT,
    page_count INTEGER,
    language TEXT DEFAULT 'en',
    cover_url TEXT,
    cover_path TEXT,
    series_id INTEGER,
    series_position REAL,
    monitored BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'wanted', -- wanted, downloaded, upgrading, missing
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id)
);
```

**authors**
```sql
CREATE TABLE authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    name_sort TEXT,
    bio TEXT,
    born_date DATE,
    died_date DATE,
    goodreads_id TEXT,
    image_url TEXT,
    monitored BOOLEAN DEFAULT FALSE,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**book_authors** (many-to-many)
```sql
CREATE TABLE book_authors (
    book_id INTEGER,
    author_id INTEGER,
    role TEXT DEFAULT 'author', -- author, narrator, editor, etc.
    PRIMARY KEY (book_id, author_id, role),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);
```

**series**
```sql
CREATE TABLE series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    goodreads_id TEXT,
    monitored BOOLEAN DEFAULT FALSE,
    book_count INTEGER DEFAULT 0,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**book_files**
```sql
CREATE TABLE book_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_format TEXT NOT NULL, -- epub, mobi, pdf, m4b, cbz, etc.
    file_size INTEGER,
    quality_profile_id INTEGER,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (quality_profile_id) REFERENCES quality_profiles(id)
);
```

**quality_profiles**
```sql
CREATE TABLE quality_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    cutoff_format TEXT, -- Stop upgrading after this format
    is_default BOOLEAN DEFAULT FALSE,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**quality_profile_items**
```sql
CREATE TABLE quality_profile_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    format TEXT NOT NULL, -- epub, mobi, pdf, m4b, etc.
    priority INTEGER NOT NULL, -- Lower = higher priority
    enabled BOOLEAN DEFAULT TRUE,
    min_size INTEGER, -- In MB
    max_size INTEGER, -- In MB
    FOREIGN KEY (profile_id) REFERENCES quality_profiles(id) ON DELETE CASCADE
);
```

**indexers**
```sql
CREATE TABLE indexers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    implementation TEXT NOT NULL, -- prowlarr, jackett, custom
    base_url TEXT NOT NULL,
    api_key TEXT,
    categories TEXT, -- JSON array of supported categories
    capabilities TEXT, -- JSON object of indexer capabilities
    priority INTEGER DEFAULT 25,
    enabled BOOLEAN DEFAULT TRUE,
    auto_imported BOOLEAN DEFAULT FALSE, -- From Prowlarr/Jackett
    source_id INTEGER, -- Prowlarr/Jackett indexer ID
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**download_clients**
```sql
CREATE TABLE download_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    implementation TEXT NOT NULL, -- deluge, qbittorrent, etc.
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT,
    password TEXT,
    category TEXT,
    priority INTEGER DEFAULT 1,
    enabled BOOLEAN DEFAULT TRUE,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**downloads**
```sql
CREATE TABLE downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    indexer_id INTEGER,
    download_client_id INTEGER,
    title TEXT NOT NULL,
    download_url TEXT,
    info_hash TEXT, -- For torrents
    nzb_id TEXT, -- For usenet
    size INTEGER,
    status TEXT DEFAULT 'queued', -- queued, downloading, completed, failed, import_pending
    progress REAL DEFAULT 0,
    eta INTEGER, -- Seconds
    error_message TEXT,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (indexer_id) REFERENCES indexers(id),
    FOREIGN KEY (download_client_id) REFERENCES download_clients(id)
);
```

**search_history**
```sql
CREATE TABLE search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    query TEXT NOT NULL,
    indexer_id INTEGER,
    results_count INTEGER DEFAULT 0,
    successful BOOLEAN DEFAULT FALSE,
    search_type TEXT DEFAULT 'manual', -- manual, automatic, rss
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (indexer_id) REFERENCES indexers(id)
);
```

**import_history**
```sql
CREATE TABLE import_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    file_id INTEGER,
    download_id INTEGER,
    event_type TEXT NOT NULL, -- grabbed, imported, upgraded, failed
    source TEXT, -- Manual, Download, Automatic
    details TEXT, -- JSON with additional info
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES book_files(id),
    FOREIGN KEY (download_id) REFERENCES downloads(id)
);
```

**notifications**
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    implementation TEXT NOT NULL, -- discord, telegram, email, etc.
    config TEXT NOT NULL, -- JSON config
    on_grab BOOLEAN DEFAULT TRUE,
    on_import BOOLEAN DEFAULT TRUE,
    on_upgrade BOOLEAN DEFAULT TRUE,
    on_download_failure BOOLEAN DEFAULT TRUE,
    on_health_issue BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**settings**
```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**scheduled_tasks**
```sql
CREATE TABLE scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    interval INTEGER NOT NULL, -- Minutes
    last_run DATETIME,
    next_run DATETIME,
    enabled BOOLEAN DEFAULT TRUE
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_books_monitored ON books(monitored);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_series ON books(series_id);
CREATE INDEX idx_book_files_book ON book_files(book_id);
CREATE INDEX idx_book_files_format ON book_files(file_format);
CREATE INDEX idx_downloads_status ON downloads(status);
CREATE INDEX idx_downloads_book ON downloads(book_id);
CREATE INDEX idx_search_history_book ON search_history(book_id);
CREATE INDEX idx_import_history_book ON import_history(book_id);
CREATE INDEX idx_book_authors_book ON book_authors(book_id);
CREATE INDEX idx_book_authors_author ON book_authors(author_id);
```

---

## API Endpoints

### Books
```
GET    /api/v1/books                    - List all books (with filters)
GET    /api/v1/books/{id}               - Get book details
POST   /api/v1/books                    - Add new book (manual or search)
PUT    /api/v1/books/{id}               - Update book
DELETE /api/v1/books/{id}               - Delete book
GET    /api/v1/books/{id}/files         - Get book files
POST   /api/v1/books/{id}/search        - Trigger search for book
PUT    /api/v1/books/{id}/monitor       - Toggle monitoring
GET    /api/v1/books/wanted             - Get wanted books
POST   /api/v1/books/import             - Import existing library
```

### Authors
```
GET    /api/v1/authors                  - List all authors
GET    /api/v1/authors/{id}             - Get author details
POST   /api/v1/authors                  - Add author
PUT    /api/v1/authors/{id}             - Update author
DELETE /api/v1/authors/{id}             - Delete author
GET    /api/v1/authors/{id}/books       - Get author's books
PUT    /api/v1/authors/{id}/monitor     - Toggle author monitoring
```

### Series
```
GET    /api/v1/series                   - List all series
GET    /api/v1/series/{id}              - Get series details
POST   /api/v1/series                   - Add series
PUT    /api/v1/series/{id}              - Update series
DELETE /api/v1/series/{id}              - Delete series
GET    /api/v1/series/{id}/books        - Get series books
PUT    /api/v1/series/{id}/monitor      - Toggle series monitoring
```

### Search
```
POST   /api/v1/search                   - Manual search (title/author/isbn)
GET    /api/v1/search/release           - Search for releases
POST   /api/v1/search/batch             - Batch search multiple books
GET    /api/v1/search/history           - Search history
```

### Downloads
```
GET    /api/v1/downloads                - List active downloads
GET    /api/v1/downloads/{id}           - Get download details
DELETE /api/v1/downloads/{id}           - Cancel download
POST   /api/v1/downloads/{id}/retry     - Retry failed download
```

### Indexers
```
GET    /api/v1/indexers                 - List all indexers
GET    /api/v1/indexers/{id}            - Get indexer details
POST   /api/v1/indexers                 - Add indexer
PUT    /api/v1/indexers/{id}            - Update indexer
DELETE /api/v1/indexers/{id}            - Delete indexer
POST   /api/v1/indexers/test            - Test indexer connection
POST   /api/v1/indexers/sync/prowlarr   - Sync from Prowlarr
POST   /api/v1/indexers/sync/jackett    - Sync from Jackett
```

### Download Clients
```
GET    /api/v1/downloadclients          - List all clients
GET    /api/v1/downloadclients/{id}     - Get client details
POST   /api/v1/downloadclients          - Add client
PUT    /api/v1/downloadclients/{id}     - Update client
DELETE /api/v1/downloadclients/{id}     - Delete client
POST   /api/v1/downloadclients/{id}/test - Test client connection
```

### Quality Profiles
```
GET    /api/v1/qualityprofiles          - List all profiles
GET    /api/v1/qualityprofiles/{id}     - Get profile details
POST   /api/v1/qualityprofiles          - Create profile
PUT    /api/v1/qualityprofiles/{id}     - Update profile
DELETE /api/v1/qualityprofiles/{id}     - Delete profile
```

### Metadata
```
GET    /api/v1/metadata/book            - Search metadata providers
GET    /api/v1/metadata/author          - Search author metadata
POST   /api/v1/metadata/refresh/{id}    - Refresh book metadata
```

### Notifications
```
GET    /api/v1/notifications            - List all notifications
GET    /api/v1/notifications/{id}       - Get notification details
POST   /api/v1/notifications            - Add notification
PUT    /api/v1/notifications/{id}       - Update notification
DELETE /api/v1/notifications/{id}       - Delete notification
POST   /api/v1/notifications/{id}/test  - Test notification
```

### Activity/History
```
GET    /api/v1/history                  - Get history (imports, searches)
GET    /api/v1/activity                 - Get current activity
GET    /api/v1/queue                    - Get download queue
```

### Calendar
```
GET    /api/v1/calendar                 - Get upcoming releases
GET    /api/v1/calendar/{date}          - Get releases for specific date
```

### Statistics
```
GET    /api/v1/stats/library            - Library statistics
GET    /api/v1/stats/downloads          - Download statistics
GET    /api/v1/stats/indexers           - Indexer performance stats
```

### System
```
GET    /api/v1/system/status            - System status
GET    /api/v1/system/health            - Health check
POST   /api/v1/system/restart           - Restart application
POST   /api/v1/system/shutdown          - Shutdown application
GET    /api/v1/system/logs              - Get logs
POST   /api/v1/system/backup            - Create backup
POST   /api/v1/system/restore           - Restore from backup
```

### Settings
```
GET    /api/v1/settings                 - Get all settings
GET    /api/v1/settings/{key}           - Get specific setting
PUT    /api/v1/settings                 - Update settings
```

### Integrations
```
POST   /api/v1/integrations/kavita/sync - Sync Kavita wishlist
GET    /api/v1/integrations/kavita/progress - Get reading progress
```

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Docker, backend, frontend scaffolding)
- [ ] Database schema implementation
- [ ] Basic API structure (FastAPI)
- [ ] Authentication system
- [ ] Frontend routing and basic layout
- [ ] Theme system foundation (CSS variables)
- [ ] Homestead theme implementation (light + dark)

### Phase 2: Core Library Management (Weeks 3-4)
- [ ] Book model and CRUD operations
- [ ] Author and Series management
- [ ] File scanning and import
- [ ] Library organization logic
- [ ] Basic UI for library browsing
- [ ] Search/filter functionality
- [ ] Book detail pages

### Phase 3: Metadata Integration (Week 5)
- [ ] Google Books API integration
- [ ] OpenLibrary integration
- [ ] Goodreads scraper (or API if available)
- [ ] Metadata refresh system
- [ ] Cover art management
- [ ] Manual metadata editing

### Phase 4: Indexer Integration (Weeks 6-7)
- [ ] Prowlarr API integration
- [ ] Jackett API integration
- [ ] Auto-import indexers feature
- [ ] Indexer management UI
- [ ] Search functionality across indexers
- [ ] Result parsing and presentation

### Phase 5: Download Management (Weeks 8-9)
- [ ] Download client abstractions
- [ ] Deluge integration
- [ ] qBittorrent integration
- [ ] Other clients (Transmission, SABnzbd, etc.)
- [ ] Download queue management
- [ ] Progress monitoring
- [ ] Failed download handling

### Phase 6: Automation (Weeks 10-11)
- [ ] Background task processor setup
- [ ] Scheduled searching
- [ ] RSS monitoring
- [ ] Author/series monitoring
- [ ] Automatic quality upgrades
- [ ] Health check system
- [ ] Retry logic

### Phase 7: Quality Profiles (Week 12)
- [ ] Quality profile system
- [ ] Format prioritization
- [ ] Cutoff logic
- [ ] Profile assignment
- [ ] UI for profile management

### Phase 8: Notifications (Week 13)
- [ ] Notification system architecture
- [ ] Discord webhook
- [ ] Telegram bot
- [ ] Email (SMTP)
- [ ] Apprise integration
- [ ] Browser push notifications
- [ ] Custom webhook support

### Phase 9: Evolibrary Theme (Week 14)
- [ ] Evolibrary theme CSS (light + dark)
- [ ] Evolution icons/sprites
- [ ] Loading animations
- [ ] Celebration effects
- [ ] Easter eggs
- [ ] Theme toggle UI
- [ ] Pokémon-specific taglines

### Phase 10: Advanced Features (Weeks 15-16)
- [ ] Kavita integration
- [ ] Wishlist monitoring
- [ ] Reading progress sync
- [ ] Calendar view
- [ ] Statistics dashboard
- [ ] Activity history
- [ ] Bulk operations

### Phase 11: Polish & UX (Week 17)
- [ ] Mobile responsiveness
- [ ] Organizr compatibility
- [ ] Loading states and error handling
- [ ] Tooltips and help text
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

### Phase 12: Documentation & Testing (Week 18)
- [ ] API documentation (Swagger)
- [ ] User guide
- [ ] Installation guide
- [ ] Configuration examples
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker testing

### Phase 13: Beta Release (Week 19)
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta deployment
- [ ] User feedback collection

### Phase 14: VSCode Extension (Future)
- [ ] Extension scaffolding
- [ ] Kavita watchlist integration
- [ ] Quick add to monitoring
- [ ] Status sidebar
- [ ] Search trigger
- [ ] Download progress view

---

## Future Enhancements

### Post-Launch Features
1. **Request System**
   - User requests (like Overseerr)
   - Approval workflow
   - Request notifications

2. **Reading Lists**
   - Custom list creation
   - Import from CSV/Goodreads
   - Share lists between users

3. **Multi-user Support**
   - User accounts
   - Per-user quality profiles
   - Per-user monitoring
   - Reading progress per user

4. **Advanced Metadata**
   - Publisher tracking
   - Genre/tag management
   - Award tracking (Hugo, Nebula, etc.)
   - Custom fields

5. **Mobile App**
   - React Native app
   - Push notifications
   - Quick search
   - Library browsing

6. **Smart Recommendations**
   - Based on reading history
   - Similar books suggestions
   - Author recommendations
   - ML-based suggestions

7. **Reading Progress Tracking**
   - Built-in reading tracker
   - Progress graphs
   - Reading goals
   - Statistics and insights

8. **Social Features**
   - Share reading lists
   - Book clubs
   - Reading challenges
   - Friend recommendations

9. **Format Conversion**
   - Built-in Calibre integration
   - Auto-convert to preferred format
   - Batch conversion

10. **Advanced Search**
    - Full-text search across books
    - Natural language queries
    - Saved searches
    - Smart filters

### Technical Improvements
- Elasticsearch for advanced search
- Redis for caching
- GraphQL API option
- Microservices architecture (if needed at scale)
- Kubernetes deployment option
- Prometheus metrics
- Grafana dashboards

---

## Configuration Examples

### Environment Variables
```bash
# Database
DATABASE_URL=sqlite:///config/evolibrary.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost/evolibrary

# Security
SECRET_KEY=your-secret-key-here
API_KEY=your-api-key-here

# Application
APP_NAME=Evolibrary
DEBUG=false
LOG_LEVEL=INFO

# Paths
BOOKS_PATH=/books
DOWNLOADS_PATH=/downloads
CONFIG_PATH=/config

# Integrations (optional, can be set in UI)
PROWLARR_URL=http://prowlarr:9696
PROWLARR_API_KEY=
JACKETT_URL=http://jackett:9117
JACKETT_API_KEY=
KAVITA_URL=http://kavita:5000
KAVITA_API_KEY=

# Features
ENABLE_AUTO_INDEXER_SYNC=true
ENABLE_BROWSER_NOTIFICATIONS=true
DEFAULT_THEME=homestead-light
```

### Initial Quality Profile Example
```json
{
  "name": "Standard",
  "description": "Prefer EPUB, fallback to other formats",
  "cutoff": "epub",
  "items": [
    {
      "format": "epub",
      "priority": 1,
      "enabled": true,
      "min_size": 0,
      "max_size": 50
    },
    {
      "format": "mobi",
      "priority": 2,
      "enabled": true,
      "min_size": 0,
      "max_size": 50
    },
    {
      "format": "pdf",
      "priority": 3,
      "enabled": true,
      "min_size": 0,
      "max_size": 100
    }
  ]
}
```

### Naming Template Examples
```
Books:
{Author Name}/{Series Name}/{Series Name} - {Book #} - {Book Title}

Audiobooks:
{Author Name}/{Book Title}/{Book Title} - {Narrator}

Comics:
{Publisher}/{Series Name}/{Series Name} #{Issue} ({Year})

Magazines:
{Magazine Name}/{Year}/{Magazine Name} - {Year}-{Month}
```

---

## Summary

This planning document outlines **Evolibrary**, a comprehensive library management system that:

✅ Handles multiple content types (books, audiobooks, comics, magazines, articles)  
✅ Features dual theming (Professional Homestead + Pokémon Evolibrary)  
✅ Integrates with Prowlarr/Jackett with auto-import  
✅ Supports multiple download clients  
✅ Connects to Kavita for wishlist monitoring  
✅ Provides flexible quality/format profiles  
✅ Offers comprehensive notifications  
✅ Works seamlessly with Organizr  
✅ Built on modern, maintainable tech stack  
✅ Designed for Docker deployment  

**Next Steps:**
1. Review and refine this document
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterative development following roadmap
5. Regular testing and feedback cycles

---

*Document Version: 1.0*  
*Last Updated: 2025-12-03*  
*"Gotta Read 'Em All!"*
