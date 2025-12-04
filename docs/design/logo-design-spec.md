# Eeveelution Logo Design Specification
**Concept C: Minimalist Evolution**

## Overview
A clean, minimalist logo featuring a simplified Eevee silhouette with a bookshelf containing color-coded books representing each evolution/format. Designed for easy recreation in GIMP and scalability.

---

## Design Concept

### Primary Logo (Square Format - 1000x1000px)

```
┌─────────────────────────────────────┐
│                                     │
│         ╭──────────────╮            │
│         │ ▓▓▓▓▓▓▓▓▓▓ │  ← Bookshelf│
│         │ ▓▓▓▓▓▓▓▓▓▓ │            │
│         ╰──────────────╯            │
│                                     │
│            ___                      │
│           /   \                     │
│          | O O |   ← Eevee         │
│           \___/      Silhouette     │
│            | |                      │
│           /   \                     │
│                                     │
│        EEVEELUTION                  │
│                                     │
└─────────────────────────────────────┘
```

---

## Color Palette

### Homestead Theme Colors (Professional)
**Base/Background:**
- Primary Background: `#F5EFE6` (Cream/Parchment)
- Dark Variant: `#1E1E16` (Deep Charcoal-Olive)

**Eevee:**
- Body: `#C4A57B` (Eevee Brown)
- Outline: `#8B7355` (Dark Brown)
- Accent: `#F5DEB3` (Eevee Cream)

**Bookshelf:**
- Frame: `#5A5A42` (Olive Green - from Homestead logo)
- Shadow: `#3A3A2E` (Dark Olive)

### Evolution Book Colors (Book Spines)
Each book spine represents an evolution and format:

1. **Vaporeon** (Water Blue) - Audiobooks
   - `#7AC7E8` or `#5DADE2`
   
2. **Jolteon** (Electric Yellow) - EPUB
   - `#FFD700` or `#F4D03F`
   
3. **Flareon** (Fire Orange) - PDF/Magazines
   - `#FF6B35` or `#E67E22`
   
4. **Espeon** (Psychic Purple) - MOBI/Kindle
   - `#B565D8` or `#9B59B6`
   
5. **Umbreon** (Dark Blue-Black) - Comics (CBZ/CBR)
   - `#2E2E3D` or `#34495E`
   
6. **Leafeon** (Grass Green) - TXT/Plain Text
   - `#8FBC8F` or `#52BE80`
   
7. **Glaceon** (Ice Blue) - DJVU/Archives
   - `#B0E0E6` or `#85C1E9`
   
8. **Sylveon** (Fairy Pink) - DOCX/Articles
   - `#FFB6E1` or `#F8B4D9`

---

## Layout Specifications

### Version 1: Square Logo (1000x1000px)

**Dimensions:**
- Canvas: 1000x1000px
- Safe Zone (for circular crop): 900px diameter circle centered

**Element Positions:**

**Bookshelf:**
- Width: 600px
- Height: 120px
- Position: Top third of canvas (Y: 200)
- Centered horizontally (X: 200)

**Book Spines:**
- Each book: 70px wide × 100px tall
- 8 books total
- Spacing: 5px between books
- Arrangement: Single row within bookshelf
- Colors: Left to right (Vaporeon → Jolteon → Flareon → Espeon → Umbreon → Leafeon → Glaceon → Sylveon)

**Eevee Silhouette:**
- Height: 300px
- Width: 250px
- Position: Center (Y: 450)
- Style: Simplified, recognizable outline
- Details: Pointed ears, fluffy tail, cute face
- Fill: Solid `#C4A57B`
- Outline: 8px stroke `#8B7355`

**Text (Optional for full logo):**
- Font: Bold, modern sans-serif (Montserrat Bold, Poppins Bold, or similar)
- Text: "EEVEELUTION"
- Size: 72pt
- Color: `#5A5A42` (Homestead olive)
- Position: Bottom (Y: 850)
- Centered horizontally

---

### Version 2: Icon Only (512x512px - for favicon/app icon)

**Simplified Version - No Text:**
- Bookshelf: 400px wide × 80px tall
- Book spines: 45px wide × 70px tall
- Eevee: 200px tall × 165px wide
- More padding around edges (40px margin)

---

### Version 3: Horizontal Banner (1200x400px)

**For README header:**
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  [Bookshelf]   [Eevee]   EEVEELUTION                  │
│   8 colored      Icon     Large Text                  │
│   book spines                                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- Bookshelf: Left side (X: 100)
- Eevee: Center-left (X: 400)
- Text: Right side (X: 700)
- Tagline option: "Gotta Read 'Em All!" below main text

---

## GIMP Creation Guide

### Step-by-Step Instructions

#### 1. Setup Canvas
```
File → New Image
- Width: 1000px
- Height: 1000px
- Fill: #F5EFE6 (cream)
- Resolution: 300 DPI (for print) or 72 DPI (web only)
```

#### 2. Create Bookshelf
```
1. Rectangle Select Tool
   - Draw rectangle: 600×120px
   - Position: X:200, Y:200

2. Fill with color #5A5A42
   - Edit → Fill with FG Color

3. Add shadow/depth:
   - Duplicate layer
   - Offset by 5px down, 5px right
   - Set to darker color #3A3A2E
   - Move below main shelf layer
```

#### 3. Create Book Spines
```
For each of 8 books:

1. Rectangle Select: 70×100px
2. Fill with evolution color
3. Add subtle gradient (optional):
   - Blend Tool
   - Gradient: FG to Transparent
   - Top to bottom (subtle)

4. Add book outline:
   - Edit → Stroke Selection
   - Width: 2px
   - Color: Darker shade of book color

5. Position books in row:
   - Book 1 (Vaporeon): X:205
   - Book 2 (Jolteon): X:280
   - Book 3 (Flareon): X:355
   - Book 4 (Espeon): X:430
   - Book 5 (Umbreon): X:505
   - Book 6 (Leafeon): X:580
   - Book 7 (Glaceon): X:655
   - Book 8 (Sylveon): X:730
   - All books Y:210 (10px from shelf top)
```

#### 4. Create Eevee Silhouette

**Option A: Trace from Reference**
```
1. Import Eevee reference image
   - File → Open as Layers
   - Scale to ~300px height

2. Use Paths Tool:
   - Trace outline of Eevee
   - Keep it simple (fewer points = easier to edit)
   - Focus on recognizable features:
     * Large pointed ears
     * Round head
     * Fluffy collar/chest
     * Bushy tail
     * Simple body

3. Convert path to selection:
   - Select → From Path

4. Fill selection:
   - Color: #C4A57B

5. Add outline:
   - Select → Grow by 4px
   - Create new layer below
   - Fill with #8B7355
```

**Option B: Build from Shapes**
```
1. Head: Circle (120px diameter)
2. Body: Oval (100×150px)
3. Ears: Two triangles (50px tall)
4. Tail: Fluffy shape (use Fuzzy Brush)
5. Legs: Small rectangles
6. Merge all shapes
7. Add outline stroke
```

#### 5. Add Text (Optional)
```
1. Text Tool
2. Font: Montserrat Bold or Poppins Bold
3. Size: 72pt
4. Color: #5A5A42
5. Type: "EEVEELUTION"
6. Position: Centered, Y:850
7. Optional: Add subtle drop shadow
   - Filters → Light and Shadow → Drop Shadow
   - Offset X: 3px, Y: 3px
   - Blur: 5px
   - Color: #3A3A2E at 50% opacity
```

#### 6. Export Versions

**Full Logo (PNG with transparency):**
```
File → Export As
- Name: eeveelution-logo.png
- Format: PNG
- Compression: 9
```

**Icon Version (512×512):**
```
Image → Scale Image
- Width: 512px
- Height: 512px
- Interpolation: Cubic

Export as: eeveelution-icon.png
```

**Favicon (256×256, 64×64, 32×32, 16×16):**
```
Scale to each size
Export as separate PNGs
Use online tool to combine into .ico
```

**Banner Version (1200×400):**
```
Image → Canvas Size
- Width: 1200px
- Height: 400px
- Center layers
- Add text to right side

Export as: eeveelution-banner.png
```

---

## Variants to Create

### 1. Standard Versions
- [ ] `logo-full-light.png` (1000×1000, light background)
- [ ] `logo-full-dark.png` (1000×1000, dark background)
- [ ] `logo-icon-light.png` (512×512, light background)
- [ ] `logo-icon-dark.png` (512×512, dark background)
- [ ] `logo-transparent.png` (1000×1000, no background)

### 2. Size Variants
- [ ] `logo-256.png` (256×256)
- [ ] `logo-128.png` (128×128)
- [ ] `logo-64.png` (64×64)
- [ ] `logo-32.png` (32×32)
- [ ] `logo-16.png` (16×16 - favicon)
- [ ] `favicon.ico` (multi-size .ico file)

### 3. Banner Variants
- [ ] `banner-1200x400.png` (GitHub header)
- [ ] `banner-1280x640.png` (Social media)
- [ ] `banner-docker.png` (Docker Hub banner)

### 4. Special Versions
- [ ] `logo-square-github.png` (Social preview - 1280×640)
- [ ] `logo-circle-512.png` (Circular crop for avatars)
- [ ] `logo-monochrome.png` (Single color for special uses)

---

## Usage Guidelines

### Minimum Sizes
- **Full logo with text**: 200px width minimum
- **Icon only**: 32px minimum (still recognizable)
- **Favicon**: 16px (simplified version)

### Clear Space
- Maintain 20% of logo height as clear space around logo
- No text or graphics within this zone

### Color Backgrounds
**Works well on:**
- Light backgrounds (#FFFFFF to #F5EFE6)
- Dark backgrounds (#1E1E16 to #000000)
- Neutral grays

**Avoid:**
- Busy patterns
- Gradients that clash with book colors
- Low contrast backgrounds

### File Formats
- **PNG**: Primary format (supports transparency)
- **SVG**: Vector format (once you're comfortable with Inkscape)
- **ICO**: Favicon only
- **WebP**: Modern web format (optional)

---

## Tips for Easy Recreation

### GIMP Shortcuts
- `R` - Rectangle Select
- `Shift+O` - Color Picker
- `Ctrl+L` - Duplicate Layer
- `Shift+Ctrl+E` - Export
- `Ctrl+,` - Fill with FG color

### Make it Template-Friendly
1. **Use Layers** - Keep each element separate:
   - Background
   - Bookshelf
   - Book 1, Book 2, ... Book 8 (separate layers)
   - Eevee
   - Eevee Outline
   - Text

2. **Save as .xcf** (GIMP project file):
   - Preserves all layers
   - Easy to modify later
   - Save as: `eeveelution-logo-master.xcf`

3. **Use Guides**:
   - Image → Guides → New Guide by Percent
   - Center vertical: 50%
   - Center horizontal: 50%
   - Easy alignment

4. **Color to Palette**:
   - Save your color palette in GIMP
   - Windows → Dockable Dialogs → Palettes
   - Create "Eeveelution Colors" palette
   - Quick color access

### Future Variant Ideas
Once you're comfortable:
- Seasonal versions (snow on bookshelf, autumn leaves)
- Animated GIF (Eevee tail wagging)
- Different Eevee poses
- Themed versions (Halloween Umbreon prominent, etc.)
- Alternative book arrangements

---

## AI Image Generation Prompt

If you want to generate a base image with AI first, then refine in GIMP:

**DALL-E / Midjourney Prompt:**
```
Minimalist logo design featuring a cute simplified Eevee Pokemon sitting in front of a small wooden bookshelf. The bookshelf contains 8 books with colorful spines in this order: water blue, electric yellow, fire orange, psychic purple, dark navy, grass green, ice blue, and fairy pink. Clean vector art style, flat colors, simple shapes, warm cream background. Professional but playful design suitable for a library management app logo. No text.
```

**Refine prompt:**
```
--style minimalist flat design --ar 1:1 --v 5
```

Then import into GIMP to:
- Clean up edges
- Perfect colors
- Add text
- Create variants

---

## Resources

### Free Reference Images
- Bulbapedia (Eevee artwork)
- Official Pokémon website
- Vector Eevee silhouettes (search "free Eevee vector")

### Fonts (Free for commercial use)
- **Montserrat**: https://fonts.google.com/specimen/Montserrat
- **Poppins**: https://fonts.google.com/specimen/Poppins
- **Inter**: https://fonts.google.com/specimen/Inter
- **Nunito**: https://fonts.google.com/specimen/Nunito

### Color Tools
- **Coolors.co**: Palette generator
- **Adobe Color**: Color harmony checker
- **WebAIM Contrast Checker**: Ensure readability

### GIMP Tutorials
- YouTube: "GIMP Logo Design Tutorial"
- GIMP official docs: https://docs.gimp.org
- GIMP subreddit: r/GIMP

---

## Checklist

### Before Starting
- [ ] Install GIMP (2.10+ recommended)
- [ ] Download reference Eevee image
- [ ] Install fonts (Montserrat/Poppins)
- [ ] Create color palette in GIMP
- [ ] Set up canvas with guides

### During Creation
- [ ] Save .xcf file frequently
- [ ] Keep layers organized and named
- [ ] Test logo at small sizes (scale down to check)
- [ ] Export PNG at each major milestone
- [ ] Check colors against specification

### After Creation
- [ ] Export all required variants
- [ ] Test on light and dark backgrounds
- [ ] Create favicon.ico
- [ ] Verify transparency works correctly
- [ ] Save final .xcf as master file

### For GitHub/Docker
- [ ] Upload to repository: `/assets/logo/`
- [ ] Update README.md with logo link
- [ ] Set as repository social preview
- [ ] Add to Docker Hub description
- [ ] Create circular variant for avatar

---

## Final Notes

This minimalist design gives you:
- ✅ Easy to recreate in GIMP
- ✅ Scales well to all sizes
- ✅ Professional yet playful
- ✅ Clearly represents the app concept
- ✅ Works in light and dark modes
- ✅ Simple to create variants
- ✅ Recognizable at small sizes

The key is keeping Eevee simple - think "icon" not "illustration". The fewer details, the better it scales and the easier it is to recreate.

Good luck! Feel free to experiment with the design once you have the base version working. 🎨

---

*Document Version: 1.0*
*Created: 2025-12-03*
