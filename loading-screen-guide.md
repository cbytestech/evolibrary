# Loading Screen Implementation Guide

## What I Need From You (Graphics)

### Sprite Sheets Needed

Create 9 sprite sheets (one for each evolution):

#### File Naming Convention:
```
/public/sprites/morpho-run.png
/public/sprites/vaporeon-run.png
/public/sprites/jolteon-run.png
/public/sprites/flareon-run.png
/public/sprites/espeon-run.png
/public/sprites/umbreon-run.png
/public/sprites/leafeon-run.png
/public/sprites/glaceon-run.png
/public/sprites/sylveon-run.png
```

#### Sprite Sheet Specifications:

**Modern Theme (Evolibrary):**
- **Size**: 256×64px total (4 frames × 64px width)
- **Format**: PNG with transparency
- **Layout**: Horizontal strip, 4 frames of running animation
- **Frame size**: 64×64px each
- **Style**: Clean, modern Pokemon sprites (like Gen 6-8)

```
┌────────┬────────┬────────┬────────┐
│ Frame1 │ Frame2 │ Frame3 │ Frame4 │  = 256×64px total
│  64×64 │  64×64 │  64×64 │  64×64 │
└────────┴────────┴────────┴────────┘
```

**Pixelated Theme (Retro):**
- **Size**: 128×32px total (4 frames × 32px width)
- **Format**: PNG with transparency
- **Layout**: Horizontal strip, 4 frames
- **Frame size**: 32×32px each
- **Style**: 8-bit/16-bit pixel art (like Gen 1-2)

```
┌──────┬──────┬──────┬──────┐
│Frame1│Frame2│Frame3│Frame4│  = 128×32px total
│32×32 │32×32 │32×32 │32×32 │
└──────┴──────┴──────┴──────┘
```

**Optional: Smaller Retro Version**
- **Size**: 64×16px total (4 frames × 16px width)
- **Frame size**: 16×16px each
- **For**: Super authentic Game Boy feel

### Animation Frames

Each sprite sheet should have 4 frames showing a running/walking cycle:
- **Frame 1**: Right leg forward
- **Frame 2**: Both legs together (mid-stride)
- **Frame 3**: Left leg forward
- **Frame 4**: Both legs together (mid-stride)

Or use any 4-frame running animation that loops smoothly.

### Where to Get/Create Sprites

**Option 1: Create Your Own**
- Use Aseprite, Piskel, or Photoshop
- Follow the dimensions above
- Make sure frames loop smoothly

**Option 2: Use Existing Pokemon Sprites**
- **Spriters Resource**: https://www.spriters-resource.com/
- **PokéSprite**: https://github.com/msikma/pokesprite (open source)
- **Bulbapedia**: Has official sprites
- **Caution**: Check licensing for commercial use

**Option 3: Commission an Artist**
- Fiverr, itch.io, or r/PixelArt
- Provide the specifications above
- Budget: ~$50-100 for all 9 sprites

### File Organization

Place sprites in your project:
```
evolibrary/
├── frontend/
│   ├── public/
│   │   ├── sprites/
│   │   │   ├── modern/          ← 64×64 sprites
│   │   │   │   ├── morpho-run.png
│   │   │   │   ├── vaporeon-run.png
│   │   │   │   └── ... (7 more)
│   │   │   └── retro/           ← 32×32 pixel art
│   │   │       ├── morpho-run.png
│   │   │       ├── vaporeon-run.png
│   │   │       └── ... (7 more)
```

---

## Code I'm Providing

Below is the complete React component that will work once you add your sprites.

