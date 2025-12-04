# Evolibrary - Windows Development Setup Guide
## (Without Docker Desktop)

**Project Path:** `C:\Users\Nicholas Hess\Desktop\evolibrary`

---

## 📋 Prerequisites & Installation

### 1. Python 3.11+ (Backend)

**Download & Install:**
1. Go to: https://www.python.org/downloads/
2. Download Python 3.11 or 3.12 (latest stable)
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Install for all users (recommended)

**Verify Installation:**
```powershell
python --version
# Should show: Python 3.11.x or 3.12.x

pip --version
# Should show pip version
```

### 2. Node.js 20+ (Frontend)

**Download & Install:**
1. Go to: https://nodejs.org/
2. Download LTS version (20.x)
3. Run installer with default options

**Verify Installation:**
```powershell
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

### 3. Git for Windows

**Download & Install:**
1. Go to: https://git-scm.com/download/win
2. Download and install
3. Use default options (or enable "Git Bash Here" for convenience)

**Verify Installation:**
```powershell
git --version
# Should show: git version 2.x.x
```

### 4. Code Editor - VSCode (Recommended)

**Download & Install:**
1. Go to: https://code.microsoft.com/
2. Download and install
3. Install recommended extensions (see below)

**Recommended VSCode Extensions:**
- Python (Microsoft)
- Pylance
- ESLint
- Prettier - Code formatter
- Auto Rename Tag
- Path Intellisense
- GitLens
- Thunder Client (for API testing)
- Tailwind CSS IntelliSense

### 5. Database Tool (Optional but Helpful)

**DB Browser for SQLite:**
1. Go to: https://sqlitebrowser.org/dl/
2. Download Windows installer
3. Install for viewing/editing SQLite databases

---

## 🚀 Project Setup

### Step 1: Create Project Structure

Open PowerShell or Command Prompt:

```powershell
# Navigate to your project folder
cd "C:\Users\Nicholas Hess\Desktop\evolibrary"

# Create folder structure
mkdir backend, frontend, docs, assets\logo, scripts

# Create subdirectories
mkdir backend\app, backend\app\api, backend\app\core, backend\app\models, backend\app\services, backend\tests
mkdir frontend\src, frontend\public, frontend\public\sprites, frontend\public\sprites\modern, frontend\public\sprites\retro
mkdir assets\logo\full, assets\logo\banner, assets\logo\icon
```

### Step 2: Backend Setup (Python/FastAPI)

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate
# You should see (venv) in your prompt

# Create requirements.txt
```

Create `backend\requirements.txt`:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.25.2
watchdog==3.0.0
dramatiq[redis]==1.15.0
python-dotenv==1.0.0
```

**Install dependencies:**
```powershell
# Make sure venv is activated (you should see (venv))
pip install -r requirements.txt
```

### Step 3: Frontend Setup (React/TypeScript)

Open a **new** terminal (keep backend terminal open):

```powershell
cd "C:\Users\Nicholas Hess\Desktop\evolibrary\frontend"

# Create React + TypeScript app with Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom
npm install zustand
npm install axios
npm install @headlessui/react
npm install lucide-react
npm install clsx tailwind-merge

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 4: Configure Tailwind

Edit `frontend\tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Homestead theme
        homestead: {
          light: '#f5efe6',
          cream: '#e5dcc8',
          olive: '#5a5a42',
          brown: '#c89968',
          'dark-olive': '#3a3a2e',
        },
        // Evolibrary theme
        morpho: {
          brown: '#c4a57b',
          cream: '#f5deb3',
          'dark-brown': '#8b7355',
        },
        // Evolution colors
        vaporeon: '#7ac7e8',
        jolteon: '#ffd700',
        flareon: '#ff6b35',
        espeon: '#b565d8',
        umbreon: '#2e2e3d',
        leafeon: '#8fbc8f',
        glaceon: '#b0e0e6',
        sylveon: '#ffb6e1',
      },
    },
  },
  plugins: [],
}
```

Edit `frontend\src\index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom styles will go here */
```

### Step 5: Environment Variables

**Backend `.env` file:**
Create `backend\.env`:
```env
# Database
DATABASE_URL=sqlite:///./evolibrary.db

# Security
SECRET_KEY=your-secret-key-change-this-in-production-use-long-random-string
API_KEY=your-api-key-here

# Application
APP_NAME=Evolibrary
DEBUG=True
LOG_LEVEL=INFO

# Paths (Windows paths)
BOOKS_PATH=C:\Users\Nicholas Hess\Desktop\books
DOWNLOADS_PATH=C:\Users\Nicholas Hess\Desktop\downloads
CONFIG_PATH=C:\Users\Nicholas Hess\Desktop\evolibrary\backend\config

# Integrations (fill in when you set these up)
PROWLARR_URL=
PROWLARR_API_KEY=
JACKETT_URL=
JACKETT_API_KEY=
KAVITA_URL=
KAVITA_API_KEY=
```

**Frontend `.env` file:**
Create `frontend\.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Evolibrary
```

### Step 6: Add Loading Screen Component

Copy your files:
```powershell
# In frontend directory
mkdir src\components

# Copy LoadingScreen.tsx and LoadingScreen.css to src\components\
# (You have these files already from our earlier work)
```

### Step 7: Add Logos

```powershell
# Copy your 7 logo images to:
# C:\Users\Nicholas Hess\Desktop\evolibrary\assets\logo\

# Organize them:
# assets\logo\full\logo-dark-bg.webp
# assets\logo\banner\banner-with-tagline.webp
# assets\logo\icon\icon-circle-front.webp
# etc.
```

---

## 🏃 Running the Development Environment

### Terminal 1 - Backend (FastAPI)

```powershell
cd "C:\Users\Nicholas Hess\Desktop\evolibrary\backend"

# Activate virtual environment
.\venv\Scripts\activate

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: http://localhost:8000

### Terminal 2 - Frontend (React)

```powershell
cd "C:\Users\Nicholas Hess\Desktop\evolibrary\frontend"

# Run development server
npm run dev
```

Frontend will run at: http://localhost:5173

---

## 📁 Project Structure (Full)

```
C:\Users\Nicholas Hess\Desktop\evolibrary\
├── backend\
│   ├── venv\                    # Python virtual environment
│   ├── app\
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── api\
│   │   │   ├── __init__.py
│   │   │   └── routes\
│   │   │       ├── __init__.py
│   │   │       ├── books.py
│   │   │       ├── authors.py
│   │   │       └── ...
│   │   ├── core\
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models\
│   │   │   ├── __init__.py
│   │   │   ├── book.py
│   │   │   └── ...
│   │   ├── schemas\
│   │   │   ├── __init__.py
│   │   │   └── ...
│   │   └── services\
│   │       ├── __init__.py
│   │       └── ...
│   ├── tests\
│   ├── alembic\                 # Database migrations
│   ├── .env
│   ├── requirements.txt
│   └── evolibrary.db          # SQLite database (created on first run)
├── frontend\
│   ├── node_modules\
│   ├── public\
│   │   ├── sprites\
│   │   │   ├── modern\
│   │   │   │   ├── morpho-run.png
│   │   │   │   └── ...
│   │   │   └── retro\
│   │   │       └── ...
│   │   └── favicon.ico
│   ├── src\
│   │   ├── components\
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── LoadingScreen.css
│   │   │   └── ...
│   │   ├── pages\
│   │   ├── hooks\
│   │   ├── services\
│   │   ├── store\
│   │   ├── styles\
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── assets\
│   └── logo\
│       ├── full\
│       ├── banner\
│       └── icon\
├── docs\
│   ├── PLANNING.md
│   ├── API.md
│   └── ...
├── scripts\
│   └── init-db.py
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔧 Useful Commands

### Backend Commands

```powershell
# Activate virtual environment
cd backend
.\venv\Scripts\activate

# Install new package
pip install package-name
pip freeze > requirements.txt  # Update requirements

# Run server
uvicorn app.main:app --reload

# Run tests
pytest

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Commands

```powershell
cd frontend

# Install new package
npm install package-name

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

---

## 🐛 Troubleshooting

### Python virtual environment won't activate

**Error:** `venv\Scripts\activate` not found

**Solution:**
```powershell
# Try this instead:
.\venv\Scripts\Activate.ps1

# Or if execution policy blocks it:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use

**Error:** Port 8000 or 5173 already in use

**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Module not found errors

**Solution:**
```powershell
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### npm install fails

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Reinstall
npm install
```

---

## 📝 Git Setup

Initialize repository:

```powershell
cd "C:\Users\Nicholas Hess\Desktop\evolibrary"

# Initialize git
git init

# Create .gitignore
```

Create `.gitignore`:
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.env
*.db
*.db-journal

# Node
node_modules/
dist/
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Build artifacts
build/
*.egg-info/
```

```powershell
# Add all files
git add .

# First commit
git commit -m "Initial commit: Evolibrary project setup"

# Add remote (when you create GitHub repo)
git remote add origin https://github.com/cookiebytestech/evolibrary.git
git branch -M main
git push -u origin main
```

---

## 🎯 Next Steps

### 1. Test Basic Setup
```powershell
# Terminal 1 - Start backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 - Start frontend  
cd frontend
npm run dev
```

Visit http://localhost:5173 - you should see the Vite + React default page

### 2. Create First Backend Endpoint

Create `backend\app\main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Evolibrary API",
    description="Library management API",
    version="0.1.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Evolibrary API!", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

Test: Visit http://localhost:8000 - you should see the welcome message!

### 3. Test API from Frontend

Create `frontend\src\App.tsx`:
```typescript
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiMessage, setApiMessage] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8000')
      .then(res => res.json())
      .then(data => setApiMessage(data.message))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="App">
      <h1>Evolibrary</h1>
      <p>Gotta Read 'Em All!</p>
      {apiMessage && <p>API says: {apiMessage}</p>}
    </div>
  )
}

export default App
```

### 4. Add Loading Screen

Once basic setup works, integrate the LoadingScreen component!

---

## 📚 Resources

### Documentation:
- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **SQLAlchemy:** https://docs.sqlalchemy.org/

### Tutorials:
- **FastAPI Tutorial:** https://fastapi.tiangolo.com/tutorial/
- **React Router:** https://reactrouter.com/en/main
- **Zustand (State):** https://github.com/pmndrs/zustand

### Tools:
- **Thunder Client (VSCode):** API testing
- **Postman:** Alternative API testing
- **DB Browser for SQLite:** Database viewing

---

## ✅ Setup Checklist

- [ ] Python 3.11+ installed and verified
- [ ] Node.js 20+ installed and verified
- [ ] Git installed and verified
- [ ] VSCode installed with extensions
- [ ] Project folders created
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Tailwind CSS configured
- [ ] Environment variables created
- [ ] Git initialized
- [ ] .gitignore created
- [ ] Backend server runs successfully
- [ ] Frontend dev server runs successfully
- [ ] API test endpoint works
- [ ] Frontend can fetch from API
- [ ] Loading screen component copied
- [ ] Logos organized in assets folder

---

## 🎉 You're Ready to Code!

Once all checkboxes are complete, you're ready to start development following the 18-week roadmap in the planning doc!

**Start with:**
- Phase 1, Week 1: Database setup and basic models
- Create the SQLAlchemy models for books, authors, series
- Set up Alembic for migrations
- Create first API endpoints

Good luck! 🚀🦊📚

---

*Last updated: 2025-12-03*
*Project: Evolibrary by CookieBytes Technologies*
