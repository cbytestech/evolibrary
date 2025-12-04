# 🦠 Evolibrary Docker Container

**"Evolve Your Reading"**

A complete, production-ready Docker container foundation for a self-hosted library management system.

---

## 🎯 What This Is

This package contains everything you need to start developing **Evolibrary**, a self-hosted book/audiobook management system inspired by the \*arr ecosystem (Radarr, Sonarr, Prowlarr).

**Current Status:** 25% Complete - Foundation Ready  
**Docker:** ✅ 100% Working  
**Backend:** ✅ 70% Foundation  
**Frontend:** ⚠️ 30% Configuration  

---

## 📦 Package Contents

```
evolibrary-docker/
├── 📄 Documentation (READ THESE FIRST!)
│   ├── QUICK_START.md         ⭐ Start here!
│   ├── PACKAGE_SUMMARY.md     ⭐ Package overview
│   ├── README.md              ⭐ Full development guide
│   ├── PROJECT_STATUS.md      📊 Detailed status & roadmap
│   ├── CHECKLIST.md           ✅ 103-task implementation plan
│   └── DIRECTORY_TREE.txt     📂 File structure
│
├── 🐳 Docker Files
│   ├── Dockerfile             Multi-stage optimized build
│   ├── docker-compose.yml     Complete orchestration
│   ├── .dockerignore          Build optimization
│   ├── setup.sh               ⭐ Automated setup script
│   └── docker/
│       └── entrypoint.sh      Container initialization
│
├── 🐍 Backend (Python/FastAPI)
│   ├── requirements.txt       Complete dependencies
│   └── app/
│       ├── main.py            ⭐ Application entry point
│       ├── config.py          Configuration system
│       ├── api/
│       │   └── __init__.py    API router structure
│       └── db/
│           ├── database.py    Database management
│           └── models.py      ⭐ Book/Author/Download models
│
└── ⚛️ Frontend (React/TypeScript)
    ├── package.json           Node dependencies
    ├── vite.config.ts         Vite configuration
    └── tailwind.config.js     Tailwind CSS setup
```

**Total:** 22 files | 7 Python files | 5 documentation files | 4 config files

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Extract the Archive
```bash
tar -xzf evolibrary-docker.tar.gz
cd evolibrary-docker
```

### 2️⃣ Run Setup
```bash
chmod +x setup.sh docker/entrypoint.sh
./setup.sh
```

The script will:
- ✅ Check Docker installation
- ✅ Generate secure secrets
- ✅ Create `.env` file
- ✅ Create directories
- ✅ Optionally build and start

### 3️⃣ Access Your Library
- **Web UI:** http://localhost:8787
- **API Docs:** http://localhost:8787/api/docs
- **Health Check:** http://localhost:8787/api/health

---

## 📖 Documentation Guide

### 🌟 Start Here
1. **QUICK_START.md** - Get running in 5 minutes
2. **PACKAGE_SUMMARY.md** - Package overview and features

### 📚 For Development
3. **README.md** - Complete development guide
   - Project structure
   - Development workflow
   - Docker commands
   - Configuration
   - Troubleshooting

4. **PROJECT_STATUS.md** - Detailed roadmap
   - What's complete (25%)
   - What needs building (75%)
   - Week-by-week development path
   - Time estimates
   - Component breakdown

5. **CHECKLIST.md** - Task-by-task implementation
   - 9 phases of development
   - 103 core tasks with checkboxes
   - Progress tracking
   - Tips and best practices

---

## ✅ What's Working

### Docker Infrastructure (100% Complete)
- ✅ Multi-stage Dockerfile optimized for size
- ✅ docker-compose with PostgreSQL and Redis options
- ✅ Automated entrypoint script
- ✅ Health checks built-in
- ✅ Volume management (config, books, downloads)
- ✅ User/group permission handling (PUID/PGID)
- ✅ Environment-based configuration
- ✅ One-command deployment

### Backend Foundation (70% Complete)
- ✅ FastAPI application with async support
- ✅ SQLAlchemy 2.0 with async database
- ✅ Database models: Book, BookFile, Download, Author
- ✅ Configuration management with Pydantic
- ✅ API router structure ready for expansion
- ✅ Health check endpoint
- ✅ Auto-generated API documentation
- ✅ SQLite and PostgreSQL support
- ✅ Complete dependency list

### Frontend Configuration (30% Complete)
- ✅ React 18 + TypeScript setup
- ✅ Vite build configuration
- ✅ Tailwind CSS with custom theme
- ✅ Morpho color palette configured
- ✅ Package.json with all dependencies
- ⚠️ Need to create: Components, pages, routing

---

## 🚧 What Needs Building

See **PROJECT_STATUS.md** and **CHECKLIST.md** for complete details!

### Priority 1: Core Application (Weeks 1-3)
- [ ] React application structure (pages, components)
- [ ] API endpoints (Books CRUD, Search, Downloads)
- [ ] Metadata integration (Google Books)
- [ ] Basic UI implementation

### Priority 2: Automation (Weeks 4-6)
- [ ] Download client integration (qBittorrent, Deluge)
- [ ] Prowlarr/Jackett integration
- [ ] Background task queue
- [ ] Author monitoring

### Priority 3: Features (Weeks 7-9)
- [ ] Notification system
- [ ] Evolution Profiles (quality management)
- [ ] Kavita integration
- [ ] Testing and polish

---

## 💻 Development Options

### Option 1: Docker Development
```bash
docker-compose up -d --build
docker-compose logs -f
```

### Option 2: Local Development (Faster iteration)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

---

## 🎨 Features from Your Documentation

You already have comprehensive planning docs! This package integrates:

### Implemented
- ✅ Database schema (all tables designed)
- ✅ 6-theme system (Homestead, Evolution, Pixelated)
- ✅ Morpho color palette (#6B9F7F and variants)
- ✅ Format-specific colors (8 formats)
- ✅ Docker configuration
- ✅ Volume management
- ✅ Configuration system

### Ready to Integrate
- LoadingScreen component (in your docs)
- Logo system (4 variations)
- Sprite animation specs
- API endpoint specifications
- 18-week development roadmap
- Theme system details

---

## 📊 Development Roadmap

```
Week 1:   Foundation setup + Basic React app
Week 2-3: Core features (Books CRUD, Search, Metadata)
Week 4-6: Download automation + Prowlarr integration
Week 7-9: Notifications + Evolution Profiles + Testing
Week 10+: Advanced features (Multi-user, Kavita, etc.)
```

**Detailed roadmap in PROJECT_STATUS.md**

---

## 🔧 Useful Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Logs
docker-compose logs -f evolibrary

# Shell access
docker-compose exec evolibrary bash

# Check status
docker-compose ps

# Health check
curl http://localhost:8787/api/health
```

---

## 🎯 Success Metrics

- ✅ Container builds successfully
- ✅ Health check returns "healthy"
- ✅ API docs accessible
- ✅ Database initializes
- ✅ Configuration loads
- ⏳ Frontend serves pages
- ⏳ API endpoints respond
- ⏳ Books can be added/viewed

---

## 💡 Pro Tips

1. **Read QUICK_START.md first** - Get running quickly
2. **Follow CHECKLIST.md** - Track your progress
3. **Use PROJECT_STATUS.md** - Reference for what's needed
4. **Test frequently** - Use the API docs at /api/docs
5. **Commit often** - Small, focused commits
6. **Ask for help** - Check documentation and communities

---

## 🆘 Common Issues

### Port 8787 in use
Change in `docker-compose.yml`:
```yaml
ports:
  - "8788:8787"
```

### Permission denied
Match PUID/PGID to your user:
```bash
id  # Shows your IDs
# Update in .env or docker-compose.yml
```

### Container won't start
```bash
docker-compose logs evolibrary  # Check logs
```

**Full troubleshooting in README.md**

---

## 📚 Technologies Used

**Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, Dramatiq  
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand  
**Database:** SQLite (default) or PostgreSQL  
**Infrastructure:** Docker, docker-compose, Redis (optional)  

---

## 💖 About Evolibrary

**Name:** Evolibrary  
**Tagline:** "Evolve Your Reading"  
**Mascot:** Morpho 🦠 - Your friendly library shapeshifter  
**License:** GPL-3.0  
**By:** CookieBytes Technologies  

### Support
- **Venmo:** @cookiebytestech
- **Cash App:** $cookiebytestech

---

## 🎉 You're All Set!

### What You Have
✅ Complete Docker setup  
✅ Backend foundation (FastAPI + SQLAlchemy)  
✅ Frontend configuration (React + TypeScript)  
✅ Comprehensive documentation (5 guides)  
✅ Development roadmap (18 weeks planned)  
✅ Implementation checklist (103 tasks)  

### What to Do
1. Extract the archive
2. Run `./setup.sh`
3. Read QUICK_START.md
4. Follow CHECKLIST.md
5. Start building!

---

<div align="center">

## 🦠 Morpho Says:

**"You've got everything you need - now let's build something amazing!"**

---

### Quick Commands

```bash
tar -xzf evolibrary-docker.tar.gz
cd evolibrary-docker
./setup.sh
```

---

**"Evolve Your Reading"**

Made with ❤️ and ☕ by CookieBytes Technologies

---

📖 Start with: **QUICK_START.md**

</div>
