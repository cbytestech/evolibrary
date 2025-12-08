#!/bin/bash
set -e

echo "================================================"
echo "🦠 Starting Evolibrary"
echo "================================================"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Set PUID and PGID from environment or use defaults
PUID=${PUID:-1000}
PGID=${PGID:-1000}

log "Target UID: $PUID, GID: $PGID"
log "Current UID: $(id -u), GID: $(id -g)"

# If we're running as root, set up directories and prepare to drop privileges
if [ "$(id -u)" = "0" ]; then
    log "Running as root - setting up directories and permissions..."
    
    # Create necessary directories
    mkdir -p /config /books /downloads
    
    # Change ownership to target PUID:PGID
    log "Setting ownership to $PUID:$PGID..."
    chown -R ${PUID}:${PGID} /config /books /downloads 2>/dev/null || log "⚠️  chown failed (continuing anyway)"
    
    # Ensure app directory has correct permissions
    chown -R ${PUID}:${PGID} /app 2>/dev/null || true
    
    log "================================================"
    log "Configuration:"
    log "  - Config directory: /config"
    log "  - Books directory: /books"
    log "  - Downloads directory: /downloads"
    log "  - Database: ${DATABASE_URL:-sqlite:////config/evolibrary.db}"
    log "  - Backend Port: ${PORT:-8000}"
    log "  - Frontend Port: 3000"
    log "  - Running as: UID $PUID, GID $PGID"
    log "================================================"
    
    # Start backend using gosu to drop privileges
    log "Starting backend server..."
    gosu ${PUID}:${PGID} uvicorn backend.app.main:app \
        --host 0.0.0.0 \
        --port ${PORT:-8000} \
        --log-level ${LOG_LEVEL:-info} &
    
    BACKEND_PID=$!
    log "Backend started (PID: $BACKEND_PID)"
    
    # Start frontend using gosu to drop privileges
    log "Starting frontend server..."
    gosu ${PUID}:${PGID} python -m http.server 3000 \
        --directory /app/frontend/dist &
    
    FRONTEND_PID=$!
    log "Frontend started (PID: $FRONTEND_PID)"
    
else
    # Not running as root - just start services
    log "Running as non-root user - starting services..."
    
    # Create directories if they don't exist (may fail if no permissions)
    mkdir -p /config /books /downloads 2>/dev/null || true
    
    log "================================================"
    log "Configuration:"
    log "  - Config directory: /config"
    log "  - Books directory: /books"
    log "  - Downloads directory: /downloads"
    log "  - Database: ${DATABASE_URL:-sqlite:////config/evolibrary.db}"
    log "  - Backend Port: ${PORT:-8000}"
    log "  - Frontend Port: 3000"
    log "================================================"
    
    # Start backend
    log "Starting backend server..."
    uvicorn backend.app.main:app \
        --host 0.0.0.0 \
        --port ${PORT:-8000} \
        --log-level ${LOG_LEVEL:-info} &
    
    BACKEND_PID=$!
    log "Backend started (PID: $BACKEND_PID)"
    
    # Start frontend  
    log "Starting frontend server..."
    python -m http.server 3000 --directory /app/frontend/dist &
    
    FRONTEND_PID=$!
    log "Frontend started (PID: $FRONTEND_PID)"
fi

log "================================================"
log "🦠 Evolibrary is running!"
log "  - Frontend: http://0.0.0.0:3000"
log "  - Backend: http://0.0.0.0:${PORT:-8000}"
log "================================================"

# Wait for any process to exit
wait -n
EXIT_CODE=$?
log "Process exited with code: $EXIT_CODE"
exit $EXIT_CODE