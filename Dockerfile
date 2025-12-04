# 🦠 Evolibrary - Multi-stage Docker Build
# "Evolve Your Reading"
# By CookieBytes Technologies

# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend Base
FROM python:3.11-slim AS backend-base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final Image
FROM python:3.11-slim

# Labels
LABEL maintainer="CookieBytes Technologies <support@cookiebytestech.com>"
LABEL description="Evolibrary - Self-Hosted Library Management"
LABEL version="0.1.0"
LABEL org.opencontainers.image.source="https://github.com/cookiebytestech/evolibrary"
LABEL org.opencontainers.image.description="Self-hosted library management for books, audiobooks, comics & more"
LABEL org.opencontainers.image.licenses="GPL-3.0"

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd -g 1000 evolibrary && \
    useradd -u 1000 -g evolibrary -s /bin/bash -m evolibrary

# Set working directory
WORKDIR /app

# Copy Python dependencies from backend-base
COPY --from=backend-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-base /usr/local/bin /usr/local/bin

# Copy backend application
COPY --chown=evolibrary:evolibrary backend/ ./backend/

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=evolibrary:evolibrary /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /config /books /downloads && \
    chown -R evolibrary:evolibrary /config /books /downloads /app

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PUID=1000 \
    PGID=1000 \
    TZ=UTC \
    CONFIG_DIR=/config \
    BOOKS_DIR=/books \
    DOWNLOADS_DIR=/downloads \
    DATABASE_URL=sqlite:////config/evolibrary.db \
    HOST=0.0.0.0 \
    PORT=8787

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8787/api/health || exit 1

# Switch to app user
USER evolibrary

# Volume mount points
VOLUME ["/config", "/books", "/downloads"]

# Copy entrypoint script
COPY --chown=evolibrary:evolibrary docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8787"]
