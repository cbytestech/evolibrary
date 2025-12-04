#!/bin/bash
set -e

# 🦠 Evolibrary - Docker Entrypoint Script
# "Evolve Your Reading"
# By CookieBytes Technologies

echo "================================================"
echo "🦠 Starting Evolibrary"
echo "================================================"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Set PUID and PGID if not already set
export PUID=${PUID:-1000}
export PGID=${PGID:-1000}

log "Running as UID: $PUID, GID: $PGID"

# Create necessary directories if they don't exist
log "Ensuring required directories exist..."
mkdir -p /config /books /downloads /app/logs

# Check if running as root (shouldn't be, but handle it)
if [ "$(id -u)" = "0" ]; then
    log "WARNING: Running as root. This is not recommended!"
    
    # Change ownership of volumes to evolibrary user
    chown -R evolibrary:evolibrary /config /books /downloads /app/logs
    
    # Switch to evolibrary user and re-execute script
    exec gosu evolibrary "$0" "$@"
fi

# Database initialization
log "Checking database..."
if [ ! -f "/config/evolibrary.db" ]; then
    log "Database not found. Creating new database..."
    python -m backend.app.db.init
    log "Database created successfully!"
else
    log "Database found. Checking for migrations..."
    python -m backend.app.db.migrate
fi

# Create default config if it doesn't exist
if [ ! -f "/config/config.yaml" ]; then
    log "Creating default configuration..."
    cat > /config/config.yaml <<EOF
# Evolibrary Configuration
# Generated: $(date)

app:
  name: "Evolibrary"
  version: "0.1.0"
  environment: "production"
  debug: false

server:
  host: "${HOST:-0.0.0.0}"
  port: ${PORT:-8787}
  workers: 1
  log_level: "${LOG_LEVEL:-info}"

paths:
  config: "/config"
  books: "/books"
  downloads: "/downloads"
  logs: "/app/logs"

database:
  url: "${DATABASE_URL:-sqlite:////config/evolibrary.db}"
  pool_size: 10
  max_overflow: 20
  echo: false

security:
  secret_key: "${SECRET_KEY}"
  jwt_secret: "${JWT_SECRET}"
  jwt_algorithm: "HS256"
  access_token_expire_minutes: 30
  refresh_token_expire_days: 7

features:
  notifications: ${ENABLE_NOTIFICATIONS:-true}
  webhooks: ${ENABLE_WEBHOOKS:-true}
  metadata_fetching: ${ENABLE_METADATA_FETCHING:-true}

theme:
  default: "homestead"
  available:
    - "homestead"
    - "homestead-dark"
    - "evolution"
    - "evolution-dark"
    - "pixelated"
    - "pixelated-dark"

# External integrations (configure in web UI)
integrations:
  prowlarr:
    enabled: false
    url: "${PROWLARR_URL}"
    api_key: "${PROWLARR_API_KEY}"
  
  jackett:
    enabled: false
    url: "${JACKETT_URL}"
    api_key: "${JACKETT_API_KEY}"
  
  kavita:
    enabled: false
    url: "${KAVITA_URL}"
    api_key: "${KAVITA_API_KEY}"

# Metadata providers
metadata:
  google_books:
    enabled: true
    api_key: "${GOOGLE_BOOKS_API_KEY}"
  
  goodreads:
    enabled: false
    api_key: "${GOODREADS_API_KEY}"
  
  openlibrary:
    enabled: true

EOF
    log "Default configuration created at /config/config.yaml"
fi

# Print configuration info
log "================================================"
log "Configuration:"
log "  - Config directory: /config"
log "  - Books directory: /books"
log "  - Downloads directory: /downloads"
log "  - Database: ${DATABASE_URL:-sqlite:////config/evolibrary.db}"
log "  - Host: ${HOST:-0.0.0.0}:${PORT:-8787}"
log "  - Timezone: ${TZ:-UTC}"
log "================================================"

# Health check
log "Performing startup health check..."
python -c "
import sys
from pathlib import Path

checks = {
    'Config directory': Path('/config').is_dir(),
    'Books directory': Path('/books').is_dir(),
    'Downloads directory': Path('/downloads').is_dir(),
}

all_passed = all(checks.values())

for check, passed in checks.items():
    status = '✓' if passed else '✗'
    print(f'{status} {check}')

sys.exit(0 if all_passed else 1)
"

if [ $? -eq 0 ]; then
    log "✓ All health checks passed!"
else
    log "✗ Some health checks failed. Check your volume mounts."
    exit 1
fi

# Start the application
log "================================================"
log "🦠 Morpho is ready to help you evolve your reading!"
log "================================================"
log "Access Evolibrary at: http://localhost:${PORT:-8787}"
log "================================================"

# Execute the command passed to the container
exec "$@"
