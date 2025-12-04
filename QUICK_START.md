# 🦠 Evolibrary Docker - Quick Start Guide

## 📦 What You Downloaded

A complete Docker container foundation for Evolibrary, your self-hosted library management system!

**Package Contents:**
- Complete Docker setup (Dockerfile, docker-compose.yml, entrypoint script)
- FastAPI backend foundation with database models
- React/TypeScript frontend configuration
- Automated setup script
- Comprehensive documentation

---

## 🚀 Getting Started in 3 Steps

### Step 1: Extract the Archive

```bash
# Extract the tarball
tar -xzf evolibrary-docker.tar.gz
cd evolibrary-docker
```

### Step 2: Run Setup

```bash
# Make scripts executable (if needed)
chmod +x setup.sh docker/entrypoint.sh

# Run the automated setup
./setup.sh
```

The setup script will:
- Check for Docker and Docker Compose
- Generate secure environment variables
- Create necessary directories
- Optionally build and start the container

### Step 3: Access Your Library

Once running, visit: **http://localhost:8787**

Check the API docs at: **http://localhost:8787/api/docs**

---

## 📁 Project Structure

```
evolibrary-docker/
├── 📄 README.md                  ← Start here for full guide
├── 📄 PROJECT_STATUS.md          ← Detailed status and roadmap
├── 📄 Dockerfile                 ← Docker image definition
├── 📄 docker-compose.yml         ← Container orchestration
├── 📄 .dockerignore              ← Build optimization
├── 📄 setup.sh                   ← Automated setup script
│
├── 🐳 docker/
│   └── entrypoint.sh            ← Container initialization
│
├── 🐍 backend/                   ← Python/FastAPI backend
│   ├── requirements.txt         ← Python dependencies
│   └── app/
│       ├── __init__.py
│       ├── main.py              ← Main application
│       ├── config.py            ← Configuration management
│       ├── api/
│       │   └── __init__.py      ← API router (ready for expansion)
│       └── db/
│           ├── __init__.py
│           ├── database.py      ← Database setup
│           └── models.py        ← SQLAlchemy models
│
└── ⚛️  frontend/                 ← React/TypeScript frontend
    ├── package.json             ← Node dependencies
    ├── vite.config.ts           ← Vite bundler config
    └── tailwind.config.js       ← Tailwind CSS config
```

---

## 🔧 Manual Setup (Alternative)

If you prefer manual setup instead of using `setup.sh`:

```bash
# 1. Create .env file with your settings
cat > .env <<EOF
PUID=1000
PGID=1000
TZ=America/New_York
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_URL=sqlite:////config/evolibrary.db
EOF

# 2. Create directories
mkdir -p config books downloads logs

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f
```

---

## 📖 Key Files to Read

1. **README.md** - Complete development guide
   - Development workflow
   - Configuration options
   - Troubleshooting
   - Docker Hub publishing

2. **PROJECT_STATUS.md** - Project status and roadmap
   - What's complete (25%)
   - What needs building
   - Week-by-week development path
   - Estimated timelines

---

## 🎯 What Works Right Now

✅ **Infrastructure (100%)**
- Docker container builds and runs
- Health checks working
- Volume management configured
- Database auto-initialization
- Configuration auto-generation

✅ **Backend Foundation (70%)**
- FastAPI server running
- Database models defined
- API structure in place
- Configuration system working
- Health check endpoint: `/api/health`

✅ **Frontend Setup (30%)**
- Build configuration ready
- Dependencies defined
- Tailwind CSS configured
- Ready for component development

---

## 🚧 What Needs Building

❌ **Frontend Application** (Priority 1)
- React components
- Pages and routing
- API integration
- UI implementation

❌ **API Endpoints** (Priority 1)
- Books CRUD operations
- Downloads management
- Search functionality
- Settings API

❌ **Services** (Priority 2)
- Download clients integration
- Metadata fetching
- Background tasks
- Notifications

❌ **Integrations** (Priority 2)
- Prowlarr/Jackett
- Kavita
- External metadata sources

See **PROJECT_STATUS.md** for detailed roadmap!

---

## 💻 Development Commands

```bash
# Start development
docker-compose up -d

# View logs
docker-compose logs -f evolibrary

# Restart after changes
docker-compose restart

# Stop everything
docker-compose down

# Rebuild after major changes
docker-compose up -d --build

# Access container shell
docker-compose exec evolibrary bash

# Check health
curl http://localhost:8787/api/health
```

---

## 🐛 Common Issues

### Port 8787 already in use
Edit `docker-compose.yml` and change:
```yaml
ports:
  - "8788:8787"  # Use 8788 instead
```

### Permission denied
Check your PUID/PGID match your user:
```bash
id  # Shows your user/group ID
```

Update in `.env` or `docker-compose.yml`

### Container won't start
Check logs:
```bash
docker-compose logs evolibrary
```

---

## 📚 Next Steps

### Immediate (This Week)
1. Get the container running
2. Explore the FastAPI docs at `/api/docs`
3. Start building frontend components
4. Implement first API endpoint (Books GET)

### Short Term (Next 2 Weeks)
1. Complete basic CRUD for books
2. Add search functionality
3. Integrate metadata provider (Google Books)
4. Build core UI pages

### Long Term (Months)
1. Download client integration
2. Prowlarr/Jackett connection
3. Automated monitoring
4. Evolution profiles
5. Multi-user support

See the 18-week roadmap in your planning document!

---

## 🆘 Need Help?

**Documentation:**
- Check `README.md` for detailed guides
- Review `PROJECT_STATUS.md` for roadmap
- Your uploaded planning doc has full specifications

**Resources:**
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- Docker: https://docs.docker.com
- SQLAlchemy: https://docs.sqlalchemy.org

**You Also Have:**
- Complete logo system (from your docs)
- LoadingScreen component ready to use
- Theme system specifications
- Database schema design
- API endpoint specifications

---

## 💖 About Evolibrary

**Evolibrary** is a self-hosted library management system inspired by the \*arr ecosystem (Radarr, Sonarr). It automates discovery, download, and organization of books, audiobooks, comics, and more.

**Mascot:** Morpho 🦠 - Your friendly library shapeshifter  
**Tagline:** "Evolve Your Reading"  
**By:** CookieBytes Technologies

**Support:**
- Venmo: @cookiebytestech
- Cash App: $cookiebytestech

---

## 🎉 You're Ready!

You have everything you need to start building:
- ✅ Docker container infrastructure
- ✅ Backend foundation
- ✅ Frontend configuration
- ✅ Complete documentation
- ✅ Development roadmap

**Start with:** `./setup.sh`

Then begin building your frontend or backend APIs!

---

<div align="center">

**🦠 Morpho says: "Let's evolve your reading!"**

**Made with ❤️ and ☕**

</div>
