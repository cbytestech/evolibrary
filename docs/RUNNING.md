# 🚀 Running Evolibrary - Quick Guide

## 🎯 Quick Start Commands

### **Development Mode (Recommended for Coding):**
```bash
# Just double-click this file:
start-dev.bat

# Or from command line:
.\start-dev.bat
```

**Features:**
- ✅ Auto-reload on code changes
- ✅ DEBUG logging with emojis 🦠
- ✅ Detailed error messages
- ✅ Runs on port 8000

**Access at:**
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Health: http://localhost:8000/api/health

---

### **Production Mode (For Testing Performance):**
```bash
.\start-prod.bat
```

**Features:**
- ✅ No auto-reload (faster)
- ✅ INFO logging (less verbose)
- ✅ Multiple workers
- ✅ Runs on port 8787

---

## 📋 Manual Commands

If you prefer to run manually:

### **Development:**
```bash
# Activate venv
venv\Scripts\activate

# Start server with DEBUG logging
set DEBUG=true
set LOG_LEVEL=DEBUG
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### **Production:**
```bash
# Activate venv
venv\Scripts\activate

# Start server with INFO logging
set DEBUG=false
set LOG_LEVEL=INFO
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8787 --workers 4
```

---

## 🦠 Enhanced Logging Features

Your logs now include:

### **Emojis for Quick Identification:**
- 🚀 Startup events
- 🛑 Shutdown events
- 🗄️  Database operations
- 🌐 API requests
- 💚 Health checks
- ✅ Success messages
- ❌ Errors
- ⚡ Processing events
- 🦠 Morpho (general app messages)

### **Color-Coded Log Levels:**
- 🔍 DEBUG (Cyan)
- ℹ️  INFO (Green)
- ⚠️  WARNING (Yellow)
- ❌ ERROR (Red)
- 🔥 CRITICAL (Magenta)

### **Detailed Information:**
- Timestamp (HH:MM:SS.mmm)
- Log level with emoji
- Component emoji
- File and line number
- Clear message

---

## 📊 Example Log Output

```
14:23:45.123 🚀 INFO     🦠 main.py:42               🦠 Morpho is waking up!
14:23:45.125 🚀 INFO     🦠 main.py:43               Environment: development
14:23:45.126 🚀 INFO     🦠 main.py:44               Version: 0.1.0
14:23:45.127 🚀 INFO     🦠 main.py:45               Debug mode: True
14:23:45.130 🗄️  INFO     🦠 main.py:48               🗄️  Initializing database connection...
14:23:45.245 ✅ INFO     🦠 main.py:50               ✅ Database initialized successfully!
14:23:45.246 ✅ INFO     🦠 main.py:55               ✅ 🦠 Morpho is ready! Application startup complete!
14:23:45.250 ℹ️  INFO     🌐 main.py:78               🔀 Registering API routes
14:23:45.251 🚀 INFO     🌐 uvicorn:62               Application startup complete
```

---

## 🔍 Troubleshooting

### **Can't start server?**
```bash
# Check if venv is activated (you should see (venv) in prompt)
venv\Scripts\activate

# Check if packages are installed
pip list | findstr fastapi

# Reinstall if needed
pip install fastapi uvicorn[standard] sqlalchemy aiosqlite pydantic pydantic-settings python-dotenv
```

### **Port already in use?**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
python -m uvicorn backend.app.main:app --reload --port 8001
```

### **Import errors?**
```bash
# Make sure you're in the project root
cd C:\Users\Nicholas Hess\Desktop\evolibrary

# Activate venv
venv\Scripts\activate

# Try running again
.\start-dev.bat
```

---

## 🎨 Log Level Configuration

You can control log verbosity:

```bash
# Maximum verbosity (shows everything)
set LOG_LEVEL=DEBUG

# Normal (shows info, warnings, errors)
set LOG_LEVEL=INFO

# Quiet (only warnings and errors)
set LOG_LEVEL=WARNING

# Silent (only errors)
set LOG_LEVEL=ERROR
```

---

## 📝 Log Files

Logs are also saved to files:
- Location: `logs/evolibrary.log` (when running in Docker)
- Format: Plain text without colors (good for parsing)
- Contains: All DEBUG level logs for troubleshooting

---

## 🚀 Next Steps

1. **Backend is running!** ✅
2. **Frontend setup:** Open new terminal and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Access frontend:** http://localhost:3000

---

## 💡 Pro Tips

- **Keep logs open** - Watch the emoji-enhanced logs to understand what's happening
- **Use DEBUG mode** - More verbose = easier debugging
- **Check health endpoint** - Quick way to verify server is up: http://localhost:8000/api/health
- **API docs are interactive** - Visit /api/docs to test endpoints

---

🦠 **Morpho says: "Happy coding! Your logs are now beautiful and informative!"**