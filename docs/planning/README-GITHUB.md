# 🦠 Evolibrary

<div align="center">

![Evolibrary Banner](assets/logo/banner/evolibrary-banner.png)

**"Evolve Your Reading"**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Docker Pulls](https://img.shields.io/docker/pulls/cookiebytestech/evolibrary?style=flat-square)](https://hub.docker.com/r/cookiebytestech/evolibrary)
[![GitHub Stars](https://img.shields.io/github/stars/cookiebytestech/evolibrary?style=flat-square)](https://github.com/cookiebytestech/evolibrary/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/cookiebytestech/evolibrary?style=flat-square)](https://github.com/cookiebytestech/evolibrary/issues)

**Self-Hosted Library Management for Books, Audiobooks, Comics, Magazines & More**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots) • [Support](#-support-this-project)

</div>

---

## 📖 What is Evolibrary?

**Evolibrary** is a powerful, self-hosted library management system inspired by the \*arr ecosystem (Radarr, Sonarr). It automates the discovery, download, and organization of your entire reading collection across all formats.

Meet **Morpho** 🦠 - your friendly shapeshifter assistant who helps transform your books into any format you need!

### Why Choose Evolibrary?

- 📚 **All Formats, One Place** - eBooks, audiobooks, comics, magazines, and articles
- 🔄 **Smart Evolution** - Automatic format transformation and quality management  
- 🔌 **Seamless Integration** - Works with Prowlarr, Jackett, Kavita, and major download clients
- 🎨 **Beautiful Themes** - Professional Homestead, playful Evolution, and retro Pixelated themes
- 🤖 **Full Automation** - Monitor authors, track series, never miss new releases
- 🐳 **Easy Deployment** - Docker support with simple setup
- 🆓 **100% Free & Open Source** - No subscriptions, no telemetry, complete control

---

## ✨ Features

### 📚 Comprehensive Format Support
- **eBooks**: EPUB, MOBI, AZW3, PDF, TXT, MD
- **Audiobooks**: M4B, MP3, FLAC
- **Comics**: CBZ, CBR, CB7
- **Magazines**: PDF, EPUB
- **Articles**: PDF, EPUB, HTML

### 🤖 Intelligent Automation
- **Auto-Discovery**: Automatically import indexers from Prowlarr and Jackett
- **Author Tracking**: Monitor your favorite authors for new releases
- **Series Completion**: Find and download missing books
- **Evolution Profiles**: Prioritize formats (EPUB over MOBI, high-quality audiobooks)
- **Smart Upgrades**: Replace lower quality files automatically
- **Release Calendar**: Never miss a new book

### 🔍 Powerful Search & Metadata
- Multi-indexer search (Prowlarr, Jackett)
- Google Books API integration
- Goodreads ratings and reviews
- OpenLibrary support
- Automatic metadata tagging
- Cover art management

### 📥 Download Management
- **Supported Clients**: Deluge, qBittorrent, Transmission, SABnzbd, NZBGet, rTorrent
- Smart client routing based on indexer
- Real-time progress tracking
- Configurable seeding rules
- Category and label management

### 🔔 Notifications & Webhooks
- Discord, Telegram, Slack, Email
- Apprise integration (80+ services)
- Custom webhooks
- Browser push notifications
- Configurable triggers (grab, import, upgrade, failure)

### 🎨 Beautiful Themes
- **Homestead**: Professional vintage design (light & dark)
- **Evolution**: Morpho-themed with transformation animations (light & dark)
- **Pixelated**: Retro 8-bit/16-bit Game Boy aesthetic (light & dark)

### 🔗 Deep Integrations
- **Kavita**: Wishlist monitoring, reading progress sync
- **Prowlarr**: Auto-import indexers, unified search
- **Jackett**: Secondary indexer support
- **Organizr**: Iframe-friendly dashboard integration

---

## 🚀 Quick Start

### Docker Compose (Recommended)

1. Create `docker-compose.yml`:

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

2. Start the container:

```bash
docker-compose up -d
```

3. Access the web interface:

```
http://localhost:8787
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

---

## 📋 Prerequisites

- **Docker** and Docker Compose (or Podman)
- **Download Client** (Deluge, qBittorrent, Transmission, SABnzbd, NZBGet, or rTorrent)
- **Optional**: Prowlarr or Jackett for indexers
- **Optional**: Kavita for reading progress sync

---

## 🖥️ Supported Platforms

- Linux (x86_64, ARM64, ARMv7)
- Windows (via Docker Desktop or WSL2)
- macOS (Intel & Apple Silicon)
- Synology DSM
- QNAP
- Unraid (Community Apps)
- TrueNAS Scale

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard
![Dashboard Overview](https://via.placeholder.com/800x500/6B9F7F/FFFFFF?text=Dashboard+Overview)

*Modern dashboard showing your library at a glance*

### Library View
![Library Grid](https://via.placeholder.com/800x500/7ABF8F/FFFFFF?text=Library+Grid+View)

*Beautiful grid view with cover art and metadata*

### Book Details
![Book Details](https://via.placeholder.com/800x500/6B9F7F/FFFFFF?text=Book+Details+Page)

*Comprehensive book information with format management*

### Evolution Theme (Morpho)
![Evolution Theme](https://via.placeholder.com/800x500/7ABF8F/FFFFFF?text=Evolution+Theme+with+Morpho)

*Playful Morpho-themed interface with transformation animations*

### Pixelated Retro Theme
![Pixelated Theme](https://via.placeholder.com/800x500/9bbc0f/306230?text=Pixelated+Retro+Theme)

*Nostalgic 8-bit Game Boy aesthetic*

### Mobile Responsive
![Mobile View](https://via.placeholder.com/400x700/6B9F7F/FFFFFF?text=Mobile+Responsive)

*Fully responsive design works great on mobile*

</details>

---

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Evolution Profiles Setup](docs/EVOLUTION_PROFILES.md)
- [Indexer Configuration](docs/INDEXERS.md)
- [Download Client Setup](docs/DOWNLOAD_CLIENTS.md)
- [Kavita Integration](docs/KAVITA.md)
- [API Documentation](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [FAQ](docs/FAQ.md)

---

## 🗺️ Roadmap

### v0.1.0 - Alpha (Current)
- ✅ Core library management
- ✅ Prowlarr/Jackett integration
- ✅ Multi-client download support
- ✅ Evolution profiles (quality management)
- ✅ Three theme system (Homestead, Evolution, Pixelated)
- ✅ Metadata providers (Google Books, Goodreads, OpenLibrary)
- ✅ Notifications (Discord, Telegram, Slack, Email, Apprise)

### v0.2.0 - Beta
- 🔄 Kavita wishlist integration
- 🔄 Reading progress sync
- 🔄 Advanced statistics and analytics
- 🔄 Bulk operations
- 🔄 VSCode extension

### v1.0.0 - Stable Release
- 📅 Multi-user support with permissions
- 📅 Request system (Overseerr-style)
- 📅 Reading challenges and goals
- 📅 Social features (book clubs, shared lists)
- 📅 AI-powered recommendations
- 📅 Mobile app (iOS/Android)

[View Full Roadmap](https://github.com/cookiebytestech/evolibrary/projects)

---

## 🛠️ Tech Stack

**Backend**
- Python 3.11+
- FastAPI (async REST API)
- SQLAlchemy 2.0 (ORM)
- SQLite / PostgreSQL
- Dramatiq (task queue)

**Frontend**
- React 18+
- TypeScript
- Tailwind CSS
- Vite
- Zustand (state management)

**Infrastructure**
- Docker (multi-stage builds)
- Docker Compose
- Nginx/Traefik compatible

---

## 🤝 Contributing

We love contributions! Whether you're:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Improving documentation
- 🔧 Submitting pull requests
- 🎨 Designing themes/UI
- 🌍 Adding translations

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Development Setup

```bash
# Clone repository
git clone https://github.com/cookiebytestech/evolibrary.git
cd evolibrary

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Run development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend  
cd frontend && npm run dev
```

---

## 💖 Support This Project

**Evolibrary** is developed and maintained by **CookieBytes Technologies** with passion for the self-hosting community. Your support helps us continue development!

### Financial Support 💵

- **Venmo**: [@cookiebytestech](https://venmo.com/cookiebytestech)
- **Cash App**: [$cookiebytestech](https://cash.app/$cookiebytestech)
- [Buy Me a Coffee](https://buymeacoffee.com/cookiebytestech) ☕
- [GitHub Sponsors](https://github.com/sponsors/cookiebytestech) ⭐

### Free Ways to Help 🎉

- **Star this repository** ⭐ - Help others discover Evolibrary
- **Share on social media** 📢 - Spread the word
- **Write a blog post** 📝 - Share your experience
- **Report bugs** 🐛 - Help us improve
- **Contribute code** 🔧 - Make Evolibrary better
- **Join our Discord** 💬 - Be part of the community

### Why Donate?

Your contributions help us:
- 🖥️ Cover hosting and development infrastructure costs
- ☕ Fuel late-night coding sessions
- 📚 Purchase API access for metadata providers
- 🎨 Hire designers for UI/UX improvements
- 🌍 Support translation efforts
- 🚀 Develop new features faster

**Every dollar makes a difference!** Even $5 helps keep this project alive and growing. Thank you for your support! 💙

---

## 👥 Credits

**Developed By:**
- 🤖 **Claude (Anthropic)** - AI Development Partner
- 👨‍💻 **CookieBytes Technologies** - [cookiebytestech.com](https://cookiebytestech.com)

**Special Thanks:**
- The \*arr team (Radarr, Sonarr, Prowlarr) for inspiration
- The self-hosting community on Reddit
- All contributors and supporters
- Coffee, for making this possible ☕
- Morpho 🦠, our shapeshifter mascot

**Inspired By:**
- Radarr, Sonarr, Lidarr, Readarr
- Calibre, Kavita, Komga
- The \*arr ecosystem philosophy

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

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```

---

## 🔗 Links

- 🌐 **Website**: [cookiebytestech.com](https://cookiebytestech.com)
- 📖 **Documentation**: [docs.cookiebytestech.com/evolibrary](https://docs.cookiebytestech.com/evolibrary)
- 🐳 **Docker Hub**: [hub.docker.com/r/cookiebytestech/evolibrary](https://hub.docker.com/r/cookiebytestech/evolibrary)
- 💬 **Discord**: [discord.gg/evolibrary](https://discord.gg/evolibrary)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/cookiebytestech/evolibrary/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/cookiebytestech/evolibrary/discussions)
- 📧 **Email**: support@cookiebytestech.com

---

## 🏷️ Keywords

`self-hosted` `docker` `library-management` `ebook-manager` `audiobook-manager` `comic-manager` `book-automation` `radarr` `sonarr` `prowlarr` `jackett` `kavita` `calibre-alternative` `readarr-alternative` `arr-stack` `media-server` `homelab` `python` `fastapi` `react` `typescript` `open-source` `book-downloader` `morpho` `shapeshifter` `evolution` `format-transformation` `usenet` `torrent` `bibliophile` `reading`

---

## 📊 Stats

[![Star History Chart](https://api.star-history.com/svg?repos=cookiebytestech/evolibrary&type=Date)](https://star-history.com/#cookiebytestech/evolibrary&Date)

---

## 🎯 Similar Projects

If Evolibrary isn't quite what you need, check out these alternatives:

- [Readarr](https://github.com/Readarr/Readarr) - Book/audiobook automation (part of \*arr)
- [LazyLibrarian](https://github.com/LazyLibrarian/LazyLibrarian) - Automated book downloader
- [Calibre](https://calibre-ebook.com/) - E-book management & conversion
- [Kavita](https://github.com/Kareadita/Kavita) - Self-hosted digital library reader
- [Komga](https://github.com/gotson/komga) - Comic/manga server

---

## 💬 Community

Join our growing community:

- 💬 **Discord**: Chat with users and developers
- 🐦 **Twitter**: [@cookiebytestech](https://twitter.com/cookiebytestech) - Updates and announcements
- 📢 **Reddit**: [r/selfhosted](https://reddit.com/r/selfhosted) - Share your setup
- 📝 **Blog**: [cookiebytestech.com/blog](https://cookiebytestech.com/blog) - Tutorials and guides

---

## ❓ FAQ

<details>
<summary><b>How is Evolibrary different from Readarr?</b></summary>

Evolibrary focuses on format flexibility and transformation. While Readarr is excellent, Evolibrary adds:
- Multi-format support in one interface
- Evolution profiles for format preferences
- Automatic format upgrades
- Beautiful modern themes
- Tighter Kavita integration

Both are great! Choose based on your needs.
</details>

<details>
<summary><b>Can I use Evolibrary with Calibre?</b></summary>

Yes! Evolibrary can organize files that Calibre can then manage. We're working on direct Calibre integration for a future release.
</details>

<details>
<summary><b>Does Evolibrary work with Plex/Jellyfin?</b></summary>

Evolibrary organizes your library files. For reading, we recommend Kavita (which Evolibrary integrates with). Plex/Jellyfin are primarily for video, though Plex does support audiobooks.
</details>

<details>
<summary><b>Is this legal?</b></summary>

Evolibrary is a library management tool, like Radarr or Sonarr. What you use it for is your responsibility. We encourage supporting authors by purchasing books legally.
</details>

<details>
<summary><b>What about privacy?</b></summary>

Evolibrary is 100% self-hosted with no telemetry, no analytics, and no phone-home features. Your data stays on your server.
</details>

<details>
<summary><b>Can I help translate Evolibrary?</b></summary>

Yes! Translations are coming in v0.2.0. Join our Discord to get notified when translation efforts begin.
</details>

---

## 🔒 Security

Found a security vulnerability? Please email security@cookiebytestech.com instead of opening a public issue. We take security seriously and will respond promptly.

---

<div align="center">

### Made with ❤️ by [CookieBytes Technologies](https://cookiebytestech.com)

**Powered by ☕ and the self-hosting community**

**Meet Morpho 🦠 - Your friendly library shapeshifter!**

**"Evolve Your Reading"**

⭐ **Star this repo if you find it useful!** ⭐

[⬆ Back to Top](#-evolibrary)

</div>
