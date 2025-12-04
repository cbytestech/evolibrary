#!/bin/bash

# 🦠 Evolibrary - Quick Setup Script
# "Evolve Your Reading"
# By CookieBytes Technologies

set -e

echo "================================================"
echo "🦠 Evolibrary Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed!"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
log_info "Docker found: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed!"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
log_info "Docker Compose found: $(docker-compose --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    log_warn ".env file not found. Creating from template..."
    
    # Generate random secrets
    SECRET_KEY=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > .env <<EOF
# 🦠 Evolibrary Environment Configuration
# Generated: $(date)

# User/Group ID (run 'id' to get yours)
PUID=1000
PGID=1000
TZ=America/New_York

# Security (CHANGE THESE IN PRODUCTION!)
SECRET_KEY=$SECRET_KEY
JWT_SECRET=$JWT_SECRET

# Database
DATABASE_URL=sqlite:////config/evolibrary.db

# Server
HOST=0.0.0.0
PORT=8787
LOG_LEVEL=info
ENVIRONMENT=production

# Features
ENABLE_NOTIFICATIONS=true
ENABLE_WEBHOOKS=true
ENABLE_METADATA_FETCHING=true

# External Services (configure in web UI later)
PROWLARR_URL=
PROWLARR_API_KEY=
JACKETT_URL=
JACKETT_API_KEY=
KAVITA_URL=
KAVITA_API_KEY=

# Metadata Providers
GOOGLE_BOOKS_API_KEY=
GOODREADS_API_KEY=
EOF
    
    log_info ".env file created with random secrets"
else
    log_info ".env file already exists"
fi

# Create necessary directories
log_info "Creating directory structure..."
mkdir -p config books downloads logs

# Set permissions
log_info "Setting permissions..."
chmod +x docker/entrypoint.sh

# Ask user if they want to build now
echo ""
read -p "Build and start Evolibrary now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Building Docker image (this may take a few minutes)..."
    docker-compose build
    
    log_info "Starting Evolibrary..."
    docker-compose up -d
    
    echo ""
    echo "================================================"
    echo "🦠 Evolibrary is starting!"
    echo "================================================"
    echo ""
    echo "Access your library at: http://localhost:8787"
    echo ""
    echo "Useful commands:"
    echo "  docker-compose logs -f        # View logs"
    echo "  docker-compose ps             # Check status"
    echo "  docker-compose down           # Stop"
    echo "  docker-compose restart        # Restart"
    echo ""
    log_info "Setup complete! 🎉"
    echo "================================================"
    echo "🦠 Morpho says: Let's evolve your reading!"
    echo "================================================"
else
    echo ""
    log_info "Setup complete!"
    echo ""
    echo "To start Evolibrary later, run:"
    echo "  docker-compose up -d"
    echo ""
fi
