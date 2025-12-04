# 🔄 Rebranding Guide: Eeveelution → Evolibrary

## 🎯 New Brand Identity

### Name: **Evolibrary**
- **Evolution** + **Library** = Perfect combination!
- Keeps the transformation theme
- 100% legally safe
- Professional and memorable

### Mascot: **Morpho**
- Friendly blob shapeshifter
- Teal/turquoise color scheme
- Completely original design
- Ditto-inspired but legally distinct

### Tagline: **"Evolve Your Reading"**

---

## 🎨 Visual Identity

### Logo Variations
You now have 4 logo designs:
1. **Full Logo (Dark)** - For dark mode, social media
2. **Banner with Tagline** - For README, website header
3. **Circular Icon** - For favicon, app icon, avatar
4. **Minimal** - For watermarks, small uses

### Color Palette

**Morpho Colors:**
- Primary: `#6B9F7F` (Teal green)
- Light: `#7ABF8F` (Light teal)
- Dark: `#5A8F6F` (Deep teal)
- Shimmer: `#FFFFFF` at 40% opacity

**Evolution Format Colors:** (Keep these!)
- Vaporeon Blue: `#7ac7e8` → Audiobooks
- Jolteon Yellow: `#ffd700` → EPUB
- Flareon Orange: `#ff6b35` → PDF
- Espeon Purple: `#b565d8` → MOBI
- Umbreon Dark: `#34495e` → Comics
- Leafeon Green: `#8fbc8f` → TXT
- Glaceon Blue: `#b0e0e6` → Archives
- Sylveon Pink: `#ffb6e1` → Articles

**Homestead Theme Colors:** (Keep these!)
- Light: `#f5efe6`, `#5a5a42`, `#c89968`
- Dark: `#1e1e16`, `#7a8a5f`, `#d4a574`

---

## 📝 Find & Replace Checklist

### Text Changes

**Find:** `Eeveelution`  
**Replace:** `Evolibrary`

**Find:** `eeveelution`  
**Replace:** `evolibrary`

**Find:** `EEVEELUTION`  
**Replace:** `EVOLIBRARY`

**Keep but rename context:**
- "Eeveelution theme" → "Evolution theme" or "Morpho theme"
- "eeveelution-dark" (CSS class) → "evolution-dark"  
- But internal code can still use "evolution" - that's fine!

### URLs & Paths

**Find:** `eeveelution`  
**Replace:** `evolibrary`

Examples:
- GitHub: `github.com/cookiebytestech/evolibrary`
- Docker: `cookiebytestech/evolibrary`
- Folder: `C:\Users\Nicholas Hess\Desktop\evolibrary`

### File Names

Rename these files:
- `eeveelution-planning-doc.md` → `evolibrary-planning-doc.md`
- `eeveelution-logo-*.png` → `evolibrary-logo-*.png`
- Any other files with "eeveelution" in the name

---

## 🔄 Terminology Updates

### Theme Names

**OLD:**
- Eeveelution (Light)
- Eeveelution (Dark)

**NEW:**
- Evolution (Light) *or* Morpho (Light)
- Evolution (Dark) *or* Morpho (Dark)

### UI Terminology

**Keep These (Still Works!):**
- Evolution Preferences ✅
- Evolution Stones ✅
- Training ✅
- Wild Books ✅

**Update These:**
- ~~PokéDex~~ → **Library** or **Catalog**
- ~~Gotta Read 'Em All~~ → **Evolve Your Reading** (main tagline)

### Loading Screen Taglines

**Remove Pokémon-specific:**
- ~~"Professor Oak is analyzing..."~~
- ~~"Checking the PokéDex..."~~
- ~~"Visiting the Pokémon Center..."~~
- ~~"A wild book appeared!"~~ (keep this, it's generic enough!)

**Add New Morpho-themed:**
- "Morpho is transforming formats..."
- "Shapeshifting your library..."
- "Morpho found a new book!"
- "Transforming into your preferred format..."
- "Morpho is organizing shelves..."
- "Format evolution in progress..."
- "Morpho's magic is working..."
- "Shapeshifter mode activated!"

---

## 📂 File Organization Updates

### New Logo Files

Place in: `assets/logo/`

```
assets/
└── logo/
    ├── full/
    │   ├── evolibrary-logo-dark.svg
    │   └── evolibrary-logo-dark.png
    ├── banner/
    │   ├── evolibrary-banner.svg
    │   └── evolibrary-banner.png
    ├── icon/
    │   ├── evolibrary-icon.svg
    │   ├── evolibrary-icon.png
    │   └── favicon.ico
    └── minimal/
        ├── evolibrary-minimal.svg
        └── evolibrary-minimal.png
```

### Sprite Files (Keep Structure)

```
public/
└── sprites/
    ├── modern/
    │   ├── morpho-run.png        ← Main character
    │   ├── morph-water.png       ← Water form
    │   ├── morph-electric.png    ← Electric form
    │   ├── morph-fire.png        ← Fire form
    │   └── ... (other forms)
    └── retro/
        └── (same structure)
```

---

## 💻 Code Updates

### CSS Classes

**Global Find & Replace in CSS:**

```css
/* OLD */
.eeveelution { }
.eeveelution-dark { }

/* NEW */
.evolution { } 
/* OR */
.morpho { }
.morpho-dark { }
```

**Theme-specific:**
```css
/* Keep this structure */
.loading-screen.evolution { }
.loading-screen.evolution-dark { }
.loading-screen.pixelated { }
.loading-screen.pixelated-dark { }
.loading-screen.homestead { }
.loading-screen.homestead-dark { }
```

### React/TypeScript

**Update theme type:**
```typescript
// OLD
type Theme = 'homestead' | 'homestead-dark' | 'eeveelution' | 'eeveelution-dark' | 'pixelated' | 'pixelated-dark';

// NEW
type Theme = 'homestead' | 'homestead-dark' | 'evolution' | 'evolution-dark' | 'pixelated' | 'pixelated-dark';
```

**Update component names:**
```typescript
// Can keep internal names if you want, but for clarity:
// LoadingScreen.tsx - no change needed
// ThemeProvider.tsx - no change needed
// Just update theme values
```

### API/Backend

**Update app name:**
```python
# backend/app/main.py
app = FastAPI(
    title="Evolibrary API",  # Changed from Eeveelution
    description="Library management API",
    version="0.1.0"
)
```

**Environment variables:**
```env
# .env
APP_NAME=Evolibrary  # Changed from Eeveelution
```

---

## 📄 Documentation Updates

### README.md

**Update header:**
```markdown
# 🦠 Evolibrary

<div align="center">

![Evolibrary Logo](assets/logo/banner/evolibrary-banner.png)

**"Evolve Your Reading"**

...
```

**Update description:**
```markdown
**Evolibrary** is a powerful, self-hosted library management system...

### Why Evolibrary?
- 🎯 **All-in-One Solution**: ...
- 🔄 **Smart Evolution**: Automatic format transformation...
- 🦠 **Meet Morpho**: Your friendly library shapeshifter...
```

**Update tags:**
```markdown
`evolibrary` `library-management` `format-evolution` `morpho` 
`self-hosted` `docker` ...
```

### Planning Document

Update all instances of:
- Project name
- Theme references  
- Character references (Eevee → Morpho)
- Keep "evolution" terminology (it's generic!)

---

## 🌐 Online Presence Setup

### GitHub

1. **Create repository:**
   - Name: `evolibrary`
   - Description: "🦠 Self-hosted library manager that evolves your reading collection across all formats"

2. **Upload logo:**
   - Repository Settings → General → Social Preview
   - Upload: `evolibrary-icon.png` (1280×640px version)

3. **Update README:**
   - Add banner logo at top
   - Use new branding throughout

4. **Topics/Tags:**
   - evolibrary
   - library-management
   - self-hosted
   - docker
   - fastapi
   - react
   - ebook-manager
   - audiobook
   - format-evolution

### Docker Hub

1. **Create repository:**
   - Name: `cookiebytestech/evolibrary`
   - Short description: "Self-hosted library manager - Evolve your reading"

2. **Upload logo:**
   - Use: `evolibrary-logo-dark.png`
   - Icon: `evolibrary-icon.png`

3. **Description:**
```markdown
# Evolibrary

Self-hosted library management for books, audiobooks, comics, magazines & more.

Features:
- 🔄 Automatic format transformation
- 🦠 Morpho - your friendly library assistant
- 📚 Multi-format support (EPUB, MOBI, PDF, M4B, CBZ, etc.)
- 🔌 Integrates with Prowlarr, Jackett, Kavita
- 🎨 Beautiful themes (Homestead, Evolution, Pixelated)

**"Evolve Your Reading"**
```

### Social Media

**Twitter/X Bio:**
```
🦠 Evolibrary - Self-hosted library manager
Evolve your reading collection across all formats
By @cookiebytestech
```

**Discord Server Name:**
```
Evolibrary - Evolve Your Reading
```

**Avatar:** Use circular icon version

---

## 🎨 Brand Guidelines (Quick Reference)

### Voice & Tone
- **Friendly but professional**
- **Helpful and encouraging**
- **Focus on transformation/evolution**
- **Welcoming to all skill levels**

### Do's ✅
- Use "evolve," "transform," "morph," "shapeshift"
- Emphasize format flexibility
- Show Morpho as helpful assistant
- Focus on automation and ease of use
- Highlight professional use cases

### Don'ts ❌
- Reference Pokémon, Nintendo, Game Freak
- Use Pokémon character names
- Use Pokémon terminology (trainer, gym, etc.)
- Call it "Pokémon-inspired" publicly
- Use red/white pokéball colors prominently

### Morpho Personality
- **Helpful:** Always ready to assist
- **Cheerful:** Happy, smiling, positive
- **Magical:** Transforms books effortlessly  
- **Friendly:** Approachable and cute
- **Smart:** Knows all about formats and books

---

## ⏱️ Rebranding Timeline

### Phase 1: Assets (1-2 hours)
- [x] Download new logos from HTML generator
- [ ] Convert SVG to PNG (various sizes)
- [ ] Generate favicons
- [ ] Organize into folder structure

### Phase 2: Documentation (1-2 hours)
- [ ] Update README.md
- [ ] Update planning doc
- [ ] Update all markdown files
- [ ] Update code comments

### Phase 3: Code (2-3 hours)
- [ ] Find & replace in all files
- [ ] Update CSS classes
- [ ] Update TypeScript types
- [ ] Update Python constants
- [ ] Update environment variables
- [ ] Test that everything still works

### Phase 4: Online (1 hour)
- [ ] Create GitHub repository
- [ ] Create Docker Hub page
- [ ] Update any social media
- [ ] Push initial commit

**Total time: ~6-8 hours** (can be done over a weekend)

---

## ✅ Verification Checklist

Before going live, check:

### Visual
- [ ] All logos display correctly
- [ ] No old Eevee images anywhere
- [ ] Morpho appears in all theme modes
- [ ] Colors are consistent
- [ ] Favicon works

### Text
- [ ] No "Eeveelution" in user-facing text
- [ ] No Pokémon references
- [ ] Tagline appears everywhere
- [ ] All URLs updated
- [ ] All filenames updated

### Code
- [ ] App runs without errors
- [ ] Themes work correctly
- [ ] Loading screen displays Morpho
- [ ] API responds with correct name
- [ ] No broken imports

### Legal
- [ ] No copyrighted imagery
- [ ] No trademarked names
- [ ] All original content
- [ ] Can monetize freely
- [ ] Ready for public release

---

## 🎉 Benefits of Rebranding

### Legal ✅
- Zero copyright risk
- No trademark conflicts
- Can monetize freely
- Can sell merchandise
- No fear of cease & desist

### Professional ✅
- More credible
- Better for business use
- Easier to pitch to companies
- Suitable for corporate environments
- Professional brand identity

### Marketing ✅
- Unique and memorable
- Clear brand message
- Original character mascot
- Clean, modern aesthetic
- Easy to explain

### Community ✅
- No controversy
- Welcoming to all users
- Not limited by franchise
- Can grow in any direction
- Your own identity

---

## 💬 Announcement Template

For when you launch:

```markdown
# Introducing Evolibrary! 🦠

Meet **Morpho**, your friendly library shapeshifter! 

Evolibrary is a self-hosted library manager that helps you 
evolve your reading collection across all formats.

✨ Features:
- 📚 Manage books, audiobooks, comics, magazines & more
- 🔄 Automatic format transformation
- 🎨 Beautiful themes (Homestead, Evolution, Pixelated)
- 🔌 Integrates with Prowlarr, Jackett, Kavita
- 🦠 Meet Morpho - your helpful guide

**"Evolve Your Reading"**

Star on GitHub: github.com/cookiebytestech/evolibrary
```

---

## 🆘 Need Help?

If you need assistance with:
- Logo conversions
- Find & replace scripts
- Testing after rebrand
- Anything else!

Just ask! The rebrand is straightforward and you'll have it done in no time! 🚀

---

*Last updated: 2025-12-03*
*Evolibrary by CookieBytes Technologies*
*Featuring Morpho, your friendly library shapeshifter! 🦠*
