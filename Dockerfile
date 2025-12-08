# Stage 1: Frontend Builder
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend source
COPY frontend/ ./

# Install dependencies
RUN npm ci

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
LABEL org.opencontainers.image.description="Modern self-hosted book manager with dark mode, themes, and automation"
LABEL org.opencontainers.image.licenses="GPL-3.0"

# Install runtime dependencies including gosu
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    sqlite3 \
    gosu \
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
COPY --chown=root:root backend/ ./backend/

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=root:root /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /config /books /downloads && \
    chown -R root:root /app

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PUID=1000 \
    PGID=1000 \
    TZ=UTC \
    DATABASE_URL=sqlite:////config/evolibrary.db \
    HOST=0.0.0.0 \
    PORT=8000 \
    LOG_LEVEL=info \
    DEBUG=false

# Expose ports
EXPOSE 8000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start as root (entrypoint will handle privilege dropping)
USER root

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
