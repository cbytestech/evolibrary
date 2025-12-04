# 🦠 Evolibrary

<div align="center">

![Evolibrary Logo](https://via.placeholder.com/1200x400/6B9F7F/FFFFFF?text=Evolibrary+-+Evolve+Your+Reading)

**"Evolve Your Reading"**

[![Docker Pulls](https://img.shields.io/docker/pulls/cookiebytestech/evolibrary?style=flat-square)](https://hub.docker.com/r/cookiebytestech/evolibrary)
[![GitHub Stars](https://img.shields.io/github/stars/cookiebytestech/evolibrary?style=flat-square)](https://github.com/cookiebytestech/evolibrary)
[![License](https://img.shields.io/github/license/cookiebytestech/evolibrary?style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?style=flat-square&logo=discord)](https://discord.gg/YOUR_INVITE)

**The Ultimate Self-Hosted Library Manager for Books, Audiobooks, Comics, Magazines & More**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Support](#-support-this-project) • [Screenshots](#-screenshots)

</div>

---

## 📖 About

**Evolibrary** is a powerful, self-hosted library management system designed for bibliophiles, audiobook enthusiasts, comic collectors, and digital hoarders. Built with the same philosophy as Radarr and Sonarr, Evolibrary automates the discovery, download, and organization of your entire reading collection.

Meet **Morpho** 🦠 - your friendly library shapeshifter who helps transform your books into any format you need!

### Why Evolibrary?

- 🎯 **All-in-One Solution**: Manage books, audiobooks, comics, magazines, and articles in a single app
- 🔄 **Smart Evolution**: Automatic format transformation and quality management
- 🦠 **Meet Morpho**: Your helpful shapeshifter assistant
- 🔌 **Deep Integration**: Seamlessly works with Prowlarr, Jackett, Kavita, and major download clients
- 📱 **Modern UI**: Beautiful, responsive interface that works on desktop, tablet, and mobile
- 🐳 **Easy Deployment**: Full Docker support with simple setup
- 🆓 **100% Free & Open Source**: No subscriptions, no telemetry, complete control

---

## ✨ Key Features

### 📚 Comprehensive Format Support
- **eBooks**: EPUB, MOBI, AZW3, PDF, TXT, MD
- **Audiobooks**: M4B, MP3, FLAC
- **Comics**: CBZ, CBR, CB7
- **Magazines**: PDF, EPUB
- **Articles**: PDF, EPUB, HTML

### 🤖 Intelligent Automation
- **Auto-Discovery**: Automatically import indexers from Prowlarr and Jackett
- **Smart Monitoring**: Track authors, series, and new releases
- **Evolution Profiles**: Prioritize preferred formats (EPUB over MOBI, etc.)
- **Upgrade System**: Automatically replace lower-quality files
- **Series Completion**: Find and download missing books in series
- **Release Calendar**: Never miss a new release from your favorite authors

### 🔍 Powerful Search
- Multi-indexer support (Prowlarr, Jackett)
- Google Books API integration
- Goodreads integration
- OpenLibrary support
- Manual and automatic search modes
- Failed search retry with exponential backoff

### 📥 Download Management
- **Multiple Client Support**: Deluge, qBittorrent, Transmission, SABnzbd, NZBGet, rTorrent
- **Smart Routing**: Route downloads to specific clients based on indexer
- **Progress Monitoring**: Real-time download tracking
- **Seeding Control**: Configure seeding rules per client
- **Category Management**: Organize downloads with labels

### 📖 Library Organization
- Customizable folder structures
- Flexible naming templates
- Automatic metadata tagging
- Duplicate detection across formats
- Multi-format bundling (group audiobook + ebook)
- Smart file organization

### 🔔 Notifications & Webhooks
- Discord, Telegram, Slack, Email
- Apprise integration (80+ services)
- Custom webhooks
- Browser push notifications
- Configurable triggers (on grab, import, upgrade, failure)

### 🎨 Gorgeous Themes
- **Homestead Theme**: Professional, vintage-inspired design with light and dark modes
- **Evolution Theme**: Morpho-themed interface with transformation-based format icons
- **Pixelated Theme**: Retro 8-bit/16-bit theme for nostalgic readers
- Toggle between themes instantly
- Per-user theme preferences

### 🔗 Integrations
- **Kavita**: Wishlist monitoring and reading progress sync
- **Prowlarr**: Auto-import indexers, unified search
- **Jackett**: Additional indexer support
- **Organizr**: Iframe-friendly, perfect for dashboards
- **VSCode**: Extension for quick management (coming soon)

### 📊 Analytics & Insights
- Library growth statistics
- Download success rates
- Indexer performance metrics
- Reading progress tracking
- Storage usage analysis
- Activity history and logs

---

## 🚀 Quick Start

### Docker Compose (Recommended)

```yaml
version: '3.8'

services:
  evolibrary:
    image: cookiebytestech/evolibrary:latest
    container_name: evolibrary
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
    volumes:
      - ./config:/config
      - /path/to/books:/books
      - /path/to/downloads:/downloads
    ports:
      - "8787:8787"
    restart: unless-stopped
```

### Docker Run

```bash
docker run -d \
  --name=evolibrary \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=America/New_York \
  -p 8787:8787 \
  -v ./config:/config \
  -v /path/to/books:/books \
  -v /path/to/downloads:/downloads \
  --restart unless-stopped \
  cookiebytestech/evolibrary:latest
```

After starting, access the web interface at `http://localhost:8787`

---

## 📋 Installation

### Prerequisites
- Docker and Docker Compose
- Download client (Deluge, qBittorrent, etc.)
- (Optional) Prowlarr or Jackett for indexers
- (Optional) Kavita for reading progress sync

### Step-by-Step Guide

1. **Create docker-compose.yml**
   ```bash
   mkdir evolibrary && cd evolibrary
   curl -o docker-compose.yml https://raw.githubusercontent.com/cookiebytestech/evolibrary/main/docker-compose.yml
   ```

2. **Edit Configuration**
   - Update volume paths
   - Set your timezone
   - Configure PUID/PGID

3. **Start Container**
   ```bash
   docker-compose up -d
   ```

4. **Initial Setup**
   - Navigate to `http://localhost:8787`
   - Complete first-run wizard
   - Add your download clients
   - Connect Prowlarr/Jackett
   - Set up evolution profiles
   - Start adding books!

📚 **Full documentation**: [https://docs.cookiebytestech.com/evolibrary](https://docs.cookiebytestech.com/evolibrary)

---

## 🎨 Screenshots

<details>
<summary>Click to expand screenshots</summary>

### Dashboard
![Dashboard](https://via.placeholder.com/800x500/6B9F7F/FFFFFF?text=Dashboard+View)

### Library View
![Library](https://via.placeholder.com/800x500/6B9F7F/FFFFFF?text=Library+Grid+View)

### Book Details
![Book Details](https://via.placeholder.com/800x500/6B9F7F/FFFFFF?text=Book+Details)

### Evolution Theme (Morpho)
![Evolution Theme](https://via.placeholder.com/800x500/7ABF8F/FFFFFF?text=Evolution+Theme)

### Mobile View
![Mobile](https://via.placeholder.com/400x700/6B9F7F/FFFFFF?text=Mobile+Responsive)

</details>

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Dramatiq
- **Frontend**: React 18+, TypeScript, Tailwind CSS, Vite
- **Database**: SQLite (default) / PostgreSQL (optional)
- **Container**: Docker, multi-stage builds
- **APIs**: Google Books, Goodreads, OpenLibrary, Prowlarr, Jackett, Kavita

---

## 📖 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [API Documentation](docs/API.md)
- [Evolution Profiles](docs/EVOLUTION_PROFILES.md)
- [Indexer Setup](docs/INDEXERS.md)
- [Download Clients](docs/DOWNLOAD_CLIENTS.md)
- [Kavita Integration](docs/KAVITA.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [FAQ](docs/FAQ.md)

---

## 🗺️ Roadmap

### Current Version: 0.1.0 (Alpha)
- ✅ Core library management
- ✅ Prowlarr/Jackett integration
- ✅ Download client support
- ✅ Evolution profiles
- ✅ Dual theme system

### Coming Soon (v0.2.0)
- 🔄 Kavita wishlist integration
- 🔄 VSCode extension
- 🔄 Advanced statistics
- 🔄 Reading progress tracking

### Future Plans
- 📅 Multi-user support
- 📅 Request system (Overseerr-style)
- 📅 Mobile app
- 📅 AI-powered recommendations
- 📅 Reading challenges and goals
- 📅 Social features (book clubs, shared lists)

[View full roadmap](https://github.com/cookiebytestech/evolibrary/projects/1)

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions
- 🎨 Theme/UI enhancements
- 🌍 Translations

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Setup

```bash
# Clone repository
git clone https://github.com/cookiebytestech/evolibrary.git
cd evolibrary

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Run development servers
# Terminal 1 (backend)
cd backend && uvicorn main:app --reload

# Terminal 2 (frontend)
cd frontend && npm run dev
```

---

## 💖 Support This Project

**Evolibrary** is developed and maintained by **CookieBytes Technologies** with love for the self-hosting community. Your support helps us dedicate more time to making Evolibrary even better!

### Ways to Support

💵 **Financial Support**
- **Venmo**: [@cookiebytestech](https://venmo.com/cookiebytestech)
- **Cash App**: [$cookiebytestech](https://cash.app/$cookiebytestech)
- [Buy Me a Coffee](https://buymeacoffee.com/cookiebytestech)
- [GitHub Sponsors](https://github.com/sponsors/cookiebytestech)

⭐ **Free Ways to Help**
- Star this repository ⭐
- Share with friends and on social media 📢
- Write a blog post or review 📝
- Join our Discord community 💬
- Contribute code or documentation 🔧
- Report bugs and suggest features 🐛

### Why Donate?

Your contributions help us:
- 🖥️ Cover server costs for development and testing
- ☕ Buy coffee for late-night coding sessions
- 📚 Purchase API access for better metadata sources
- 🎨 Hire designers for UI/UX improvements
- 🌍 Support translation efforts
- 🚀 Develop new features faster

**Every dollar helps us make Evolibrary better for everyone!** 💙

Even $5 makes a difference! Your support keeps this project alive and growing.

---

## 👥 Credits

**Developed By:**
- 🤖 **Claude (Anthropic)** - AI Development Partner
- 👨‍💻 **CookieBytes Technologies** - [cookiebytestech.com](https://cookiebytestech.com)

**Special Thanks:**
- The *arr team (Radarr, Sonarr, Prowlarr) for inspiration
- The self-hosting community
- All contributors and supporters
- Coffee, for making this possible ☕
- Morpho, for being the cutest shapeshifter 🦠

**Built With:**
- FastAPI, React, Tailwind CSS
- Prowlarr, Jackett, Kavita APIs
- The power of open source

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

```
Evolibrary - Self-Hosted Library Management
Copyright (C) 2025 CookieBytes Technologies

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

---

## 🔗 Links

- 🌐 **Website**: [cookiebytestech.com](https://cookiebytestech.com)
- 📖 **Documentation**: [docs.cookiebytestech.com/evolibrary](https://docs.cookiebytestech.com/evolibrary)
- 🐳 **Docker Hub**: [hub.docker.com/r/cookiebytestech/evolibrary](https://hub.docker.com/r/cookiebytestech/evolibrary)
- 💬 **Discord**: [discord.gg/evolibrary](https://discord.gg/evolibrary)
- 🐦 **Twitter**: [@cookiebytestech](https://twitter.com/cookiebytestech)
- 📧 **Email**: support@cookiebytestech.com

---

## 🏷️ Tags & Keywords

`self-hosted` `docker` `library-management` `ebook-manager` `audiobook-manager` `comic-manager` `book-automation` `radarr` `sonarr` `prowlarr` `jackett` `kavita` `calibre-alternative` `readarr-alternative` `lazylibrarian-alternative` `arr-stack` `media-server` `homelab` `plex-alternative` `jellyfin` `python` `fastapi` `react` `typescript` `open-source` `free-software` `book-downloader` `ebook-downloader` `audiobook-downloader` `comic-downloader` `magazine-manager` `reading-tracker` `book-organizer` `metadata-manager` `book-collection` `digital-library` `personal-library` `book-catalog` `series-tracker` `author-tracker` `release-calendar` `evolution-profiles` `format-transformation` `download-automation` `usenet` `torrent` `deluge` `qbittorrent` `transmission` `sabnzbd` `goodreads` `google-books` `openlibrary` `epub` `mobi` `pdf` `cbz` `m4b` `linux` `windows` `macos` `raspberry-pi` `unraid` `synology` `truenas` `morpho` `shapeshifter` `bibliophile` `book-lover` `reading` `books` `audiobooks` `comics` `magazines`

---

## 📊 SEO Keywords

**Primary Keywords:**
- self hosted library manager
- ebook management software
- audiobook organizer docker
- book automation tool
- readarr alternative
- lazylibrarian alternative
- calibre alternative
- arr stack for books
- automated book downloader
- format evolution manager

**Secondary Keywords:**
- prowlarr book integration
- kavita library manager
- jackett ebook search
- docker book manager
- organize ebook collection
- audiobook automation
- comic book manager docker
- magazine organizer
- self hosted calibre
- personal library software
- book format transformer

**Long-tail Keywords:**
- how to automatically download ebooks
- self hosted book management like sonarr
- docker container for managing books
- best alternative to readarr
- organize book collection with docker
- automated ebook library management
- prowlarr integration for books
- kavita wishlist automation
- book evolution profiles like radarr
- transform book formats automatically

**Technical Keywords:**
- fastapi book manager
- react library interface
- python ebook automation
- docker compose book stack
- sqlite book database
- postgresql library manager
- restful api for books
- websocket download progress
- format transformation engine

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cookiebytestech/evolibrary&type=Date)](https://star-history.com/#cookiebytestech/evolibrary&Date)

---

<div align="center">

**Made with ❤️ by [CookieBytes Technologies](https://cookiebytestech.com)**

**Powered by ☕ and the self-hosting community**

**Meet Morpho 🦠 - Your friendly library shapeshifter!**

[⬆ Back to Top](#-evolibrary)

</div>
