# 🦠 Evolibrary - Docker Development Guide

**"Evolve Your Reading"**  
By CookieBytes Technologies

---

## 📋 What You Have

This is the foundational Docker container structure for Evolibrary. Here's what's been created:

### ✅ Core Docker Files
- **Dockerfile** - Multi-stage build for optimal image size
- **docker-compose.yml** - Complete orchestration setup
- **.dockerignore** - Build optimization
- **docker/entrypoint.sh** - Initialization script

### ✅ Backend Structure
- **FastAPI Application** - Async REST API framework
- **SQLAlchemy Models** - Book, BookFile, Download, Author
- **Database Management** - SQLite/PostgreSQL support
- **Configuration System** - Environment-based settings
- **Health Checks** - Docker-ready monitoring

### ✅ Key Features Implemented
- Multi-stage Docker build
- User/group permission handling (PUID/PGID)
- Volume management (config, books, downloads)
- Health check endpoint
- Environment variable configuration
- Auto-initialization on first run

---

## 🚀 Quick Start

### 1. Prerequisites

You need:
- **Docker** (20.10+) and Docker Compose (2.0+)
- At least 2GB RAM and 10GB disk space
- A download client (qBittorrent, Deluge, etc.)

### 2. Project Structure

Create this directory structure:

```
evolibrary/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   └── __init__.py
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── database.py
│   │       └── models.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── src/
│   └── dist/ (after build)
├── docker/
│   └── entrypoint.sh
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── README.md
```

### 3. Environment Setup

Create `.env` file:

```bash
# Copy the example and edit
cat > .env <<EOF
# User/Group
PUID=1000
PGID=1000
TZ=America/New_York

# Security (CHANGE THESE!)
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Database
DATABASE_URL=sqlite:////config/evolibrary.db

# Optional: PostgreSQL
# DATABASE_URL=postgresql://evolibrary:password@postgres:5432/evolibrary

# External Services (configure later)
PROWLARR_URL=
PROWLARR_API_KEY=
JACKETT_URL=
JACKETT_API_KEY=
KAVITA_URL=
KAVITA_API_KEY=
EOF
```

### 4. Build and Run

```bash
# Build the image
docker-compose build

# Start the container
docker-compose up -d

# Check logs
docker-compose logs -f evolibrary

# Access the application
open http://localhost:8787
```

---

## 📦 What's Not Yet Implemented

### Frontend (Priority: HIGH)
- [ ] React application in `frontend/`
- [ ] Package.json with dependencies
- [ ] Vite build configuration
- [ ] TypeScript setup
- [ ] Tailwind CSS configuration
- [ ] Components (LoadingScreen, Dashboard, Library, etc.)
- [ ] State management (Zustand)
- [ ] Theme system implementation

### Backend APIs (Priority: HIGH)
- [ ] Books API endpoints (`/api/books`)
- [ ] Authors API endpoints (`/api/authors`)
- [ ] Downloads API endpoints (`/api/downloads`)
- [ ] Indexers API endpoints (`/api/indexers`)
- [ ] Settings API endpoints (`/api/settings`)
- [ ] Search functionality
- [ ] Metadata fetching service
- [ ] Download client integrations

### Services (Priority: MEDIUM)
- [ ] Task queue (Dramatiq/Celery)
- [ ] Scheduled tasks (monitoring, updates)
- [ ] Notification system
- [ ] Webhook handlers
- [ ] File import service
- [ ] Format conversion service

### Integrations (Priority: MEDIUM)
- [ ] Prowlarr client
- [ ] Jackett client
- [ ] Kavita client
- [ ] Download clients (qBittorrent, Deluge, Transmission, etc.)
- [ ] Metadata providers (Google Books, Goodreads, OpenLibrary)

### Database (Priority: LOW)
- [ ] Additional models (Series, Tag, User, Settings, etc.)
- [ ] Alembic migrations
- [ ] Database seeding/fixtures
- [ ] Backup utilities

---

## 🛠️ Development Workflow

### Local Development (Without Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Docker Development

```bash
# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec evolibrary bash

# Stop container
docker-compose down

# Remove volumes (WARNING: deletes data!)
docker-compose down -v
```

### Testing

```bash
# Inside container
docker-compose exec evolibrary pytest

# Or locally
cd backend
pytest
```

---

## 📝 Next Steps

### Phase 1: Basic Frontend (2-3 days)
1. Set up React + Vite + TypeScript
2. Configure Tailwind CSS
3. Create basic layout (header, sidebar, main)
4. Implement theme system
5. Add LoadingScreen component
6. Create placeholder pages

### Phase 2: Core APIs (3-5 days)
1. Implement Books API (CRUD)
2. Add Authors API
3. Create Downloads API
4. Build search functionality
5. Add pagination and filtering

### Phase 3: Integrations (1 week)
1. Prowlarr integration
2. Jackett integration
3. Download client support (qBittorrent first)
4. Metadata fetching (Google Books)

### Phase 4: Advanced Features (2+ weeks)
1. Evolution Profiles (quality management)
2. Automated monitoring
3. Kavita integration
4. Notification system
5. Task queue implementation

---

## 🐳 Docker Hub Publishing

### Build Multi-Architecture Images

```bash
# Set up buildx
docker buildx create --name evolibrary-builder --use
docker buildx inspect --bootstrap

# Build and push
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t cookiebytestech/evolibrary:latest \
  -t cookiebytestech/evolibrary:0.1.0 \
  --push \
  .
```

### Version Tags

```bash
# Tag versions
docker tag evolibrary:latest cookiebytestech/evolibrary:0.1.0
docker tag evolibrary:latest cookiebytestech/evolibrary:0.1
docker tag evolibrary:latest cookiebytestech/evolibrary:latest

# Push
docker push cookiebytestech/evolibrary:0.1.0
docker push cookiebytestech/evolibrary:0.1
docker push cookiebytestech/evolibrary:latest
```

---

## 🔧 Configuration

### Volume Mounts

- **`/config`** - Database, config files, logs
- **`/books`** - Your organized library
- **`/downloads`** - Download client output

### Environment Variables

See `docker-compose.yml` for all available variables. Key ones:

- `PUID/PGID` - User/group for file permissions
- `TZ` - Timezone
- `DATABASE_URL` - Database connection
- `SECRET_KEY` - App secret (CHANGE THIS!)
- `JWT_SECRET` - JWT signing key (CHANGE THIS!)

---

## 🐛 Troubleshooting

### Permission Issues

```bash
# Check your user ID
id

# Update PUID/PGID in docker-compose.yml to match
```

### Database Issues

```bash
# Reset database (WARNING: loses data!)
docker-compose down
rm -rf ./config/evolibrary.db
docker-compose up -d
```

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "8788:8787"  # Use 8788 instead
```

### Container Won't Start

```bash
# Check logs
docker-compose logs evolibrary

# Check health
docker-compose ps
```

---

## 📚 Resources

- **Documentation**: Your uploaded docs (planning doc, README, etc.)
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **React**: https://react.dev
- **Docker**: https://docs.docker.com

---

## 💖 Support

**Evolibrary** is developed by **CookieBytes Technologies**

- **Venmo**: @cookiebytestech
- **Cash App**: $cookiebytestech
- **GitHub**: https://github.com/cookiebytestech/evolibrary

---

## 📜 License

GNU General Public License v3.0

---

<div align="center">

**🦠 Morpho says: "Let's evolve your reading!"**

Made with ❤️ and ☕ by CookieBytes Technologies

</div>
