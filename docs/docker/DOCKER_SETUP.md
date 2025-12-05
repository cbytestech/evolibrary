# 🦠 Evolibrary Docker Setup

## Quick Start

1. **Edit `docker-compose.yml`** - Change `/path/to/books` to your actual book directory
2. **Run:** `docker-compose up -d`
3. **Access:** 
   - Frontend: http://localhost:3000
   - API: http://localhost:8000

---

## Configuration Explained

### Volumes

```yaml
volumes:
  - ./config:/config          # Database and settings
  - /path/to/books:/books     # Your book collection
```

**`./config:/config`**
- Creates a `config` folder next to docker-compose.yml
- SQLite database stored here: `config/evolibrary.db`
- App settings and preferences saved here
- **Important:** Backup this folder!

**`/path/to/books:/books`**
- Mount your actual book library here
- **Example:** `/mnt/storage/Books:/books`
- **Example:** `C:\Users\YourName\Books:/books` (Windows)
- The app will scan this directory for books

---

### Database URL

```yaml
- DATABASE_URL=sqlite:///config/evolibrary.db
```

**What this means:**
- `sqlite://` = Use SQLite database (simple, no extra setup)
- `/config/evolibrary.db` = Database file location inside container
- This maps to `./config/evolibrary.db` on your host

**SQLite vs PostgreSQL:**
- **SQLite** (default): Single file, easy backup, perfect for home use
- **PostgreSQL** (optional): More powerful, for heavy usage
  - To use PostgreSQL: See "Advanced Setup" below

---

### Ports

```yaml
ports:
  - "8000:8000"  # Backend API
  - "3000:3000"  # Frontend
```

- **8000**: Backend API (FastAPI)
- **3000**: Frontend UI (React)
- Change left side if ports conflict: `"8080:8000"` makes API available on port 8080

---

## Full Example with Real Paths

### Linux/Pi:
```yaml
volumes:
  - ./config:/config
  - /mnt/usb/Books:/books
```

### Windows:
```yaml
volumes:
  - ./config:/config
  - C:/Users/Nicholas/Books:/books
```

### Synology NAS:
```yaml
volumes:
  - ./config:/config
  - /volume1/Books:/books
```

---

## Advanced Setup (Optional)

### Using PostgreSQL Instead of SQLite

1. **Uncomment PostgreSQL service** in docker-compose.yml:

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: evolibrary-postgres
    environment:
      - POSTGRES_USER=evolibrary
      - POSTGRES_PASSWORD=your_secure_password_here
      - POSTGRES_DB=evolibrary
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

2. **Update DATABASE_URL:**

```yaml
- DATABASE_URL=postgresql://evolibrary:your_secure_password_here@postgres:5432/evolibrary
```

**When to use PostgreSQL:**
- Large library (1000+ books)
- Multiple users accessing simultaneously
- Heavy search usage
- Otherwise, SQLite is perfect!

---

## Integration with Other Apps

Evolibrary will detect and integrate with these apps if running:

- **Prowlarr** - Indexer management
- **Readarr** - Book collection manager
- **Kavita** - Book reader
- **Calibre** - Book management

*These are configured in the Evolibrary web UI, not in docker-compose.yml*

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs evolibrary
```

### Database permission errors
```bash
sudo chown -R 1000:1000 ./config
```

### Port already in use
Change the left port number:
```yaml
ports:
  - "8080:8000"  # Use 8080 instead of 8000
```

### Can't see books
- Check volume path is correct
- Make sure books directory has read permissions
- Check logs: `docker-compose logs -f evolibrary`

---

## Backup

**Important files to backup:**
```
./config/evolibrary.db    # Your database
./config/settings.json    # App settings
```

**Backup command:**
```bash
tar -czf evolibrary-backup-$(date +%Y%m%d).tar.gz config/
```

---

## Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | sqlite:///config/evolibrary.db | Database connection string |
| `HOST` | 0.0.0.0 | Server host (0.0.0.0 = all interfaces) |
| `PORT` | 8000 | Backend API port |

---

## Network

Evolibrary uses the default Docker bridge network, so it can communicate with other containers on the same Docker host (like Prowlarr, Readarr, etc).

**Example:** If Prowlarr is running on the same host, use `http://prowlarr:9696` as the URL in Evolibrary settings.
