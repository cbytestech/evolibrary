# Loading Screen - Usage Guide

## Quick Start

### 1. Copy Files to Your Project

```bash
# Copy component files
cp LoadingScreen.tsx frontend/src/components/LoadingScreen.tsx
cp LoadingScreen.css frontend/src/components/LoadingScreen.css
```

### 2. Add Your Sprites

Place your sprite sheets in the public folder:
```
frontend/public/sprites/
├── modern/
│   ├── morpho-run.png (256×64px, 4 frames)
│   ├── vaporeon-run.png
│   ├── jolteon-run.png
│   ├── flareon-run.png
│   ├── espeon-run.png
│   ├── umbreon-run.png
│   ├── leafeon-run.png
│   ├── glaceon-run.png
│   └── sylveon-run.png
└── retro/
    ├── morpho-run.png (128×32px, 4 frames)
    ├── vaporeon-run.png
    └── ... (same as above)
```

### 3. Use in Your App

```tsx
import React from 'react';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [theme, setTheme] = React.useState('homestead');

  return (
    <>
      {isLoading && <LoadingScreen theme={theme} />}
      
      {/* Your app content */}
      <div>App Content Here</div>
    </>
  );
}
```

## Component Props

```typescript
interface LoadingScreenProps {
  theme?: 'homestead' | 'homestead-dark' | 'evolibrary' | 'evolibrary-dark' | 'pixelated' | 'pixelated-dark';
  message?: string;  // Optional custom message (overrides random taglines)
}
```

## Usage Examples

### Basic Usage (Random Taglines)
```tsx
<LoadingScreen theme="homestead" />
```

### Custom Message
```tsx
<LoadingScreen 
  theme="evolibrary" 
  message="Downloading Project Gutenberg..." 
/>
```

### With Loading State
```tsx
function MyComponent() {
  const [loading, setLoading] = React.useState(true);
  const userTheme = useThemeStore(state => state.theme);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (loading) {
    return <LoadingScreen theme={userTheme} />;
  }

  return <div>Content loaded!</div>;
}
```

### Integration with React Router
```tsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Suspense fallback={<LoadingScreen theme="homestead" />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Suspense>
  );
}
```

## Theming

### Available Themes

1. **homestead** - Professional light theme (cream background, serif font)
2. **homestead-dark** - Professional dark theme (dark olive background)
3. **evolibrary** - Pokémon light theme (animated sprites, rainbow progress)
4. **evolibrary-dark** - Pokémon dark theme (dark background, bright sprites)
5. **pixelated** - Retro Game Boy Color theme (green palette, 8-bit style)
6. **pixelated-dark** - Original Game Boy theme (dark green, with Game Boy frame)

### Dynamic Theme Switching

```tsx
function AppWithTheme() {
  const [theme, setTheme] = React.useState('homestead');
  const [loading, setLoading] = React.useState(true);

  return (
    <>
      {loading && <LoadingScreen theme={theme} />}
      
      <div>
        <button onClick={() => setTheme('evolibrary')}>
          Switch to Evolibrary
        </button>
        <button onClick={() => setTheme('pixelated')}>
          Switch to Retro
        </button>
      </div>
    </>
  );
}
```

## Sprite Specifications

### Modern Sprites (64×64px)
For `evolibrary` and `evolibrary-dark` themes:

```
File: /public/sprites/modern/[pokemon]-run.png
Dimensions: 256×64px (4 frames of 64×64px each)
Format: PNG with transparency
Layout: Horizontal sprite sheet

┌────────┬────────┬────────┬────────┐
│ 64×64  │ 64×64  │ 64×64  │ 64×64  │
│ Frame1 │ Frame2 │ Frame3 │ Frame4 │
└────────┴────────┴────────┴────────┘
```

### Retro Sprites (32×32px)
For `pixelated` and `pixelated-dark` themes:

```
File: /public/sprites/retro/[pokemon]-run.png
Dimensions: 128×32px (4 frames of 32×32px each)
Format: PNG with transparency
Layout: Horizontal sprite sheet

┌──────┬──────┬──────┬──────┐
│32×32 │32×32 │32×32 │32×32 │
│Frame1│Frame2│Frame3│Frame4│
└──────┴──────┴──────┴──────┘
```

## Creating Placeholder Sprites

If you don't have sprites yet, create simple placeholder PNGs:

### Quick Photoshop/GIMP Process:
1. Create canvas: 256×64px
2. Create 4 squares: 64×64px each, side by side
3. Draw simple shapes in each (circle, oval, etc.)
4. Export as PNG with transparency
5. Name: `morpho-run.png`

### Using Code (Canvas):
```javascript
// Generate placeholder sprite sheet
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 64;
const ctx = canvas.getContext('2d');

// Draw 4 frames
for (let i = 0; i < 4; i++) {
  const x = i * 64;
  ctx.fillStyle = '#c4a57b';
  ctx.fillRect(x + 16, 20, 32, 32); // Simple square
}

// Download
const link = document.createElement('a');
link.download = 'morpho-run.png';
link.href = canvas.toDataURL();
link.click();
```

## Customizing Taglines

Edit the `TAGLINES` object in `LoadingScreen.tsx`:

```typescript
const TAGLINES = {
  universal: [
    { text: "Your custom message...", sprite: null },
    { text: "Another message...", sprite: null },
  ],
  evolibrary: [
    { text: "Custom Pokémon message...", sprite: "morpho" },
    { text: "Flareon is working hard!", sprite: "flareon" },
    // sprite: null = no sprite animation
    // sprite: "morpho" = show morpho running
    // sprite: "vaporeon" = show vaporeon running
  ]
};
```

## Progress Bar Behavior

The component simulates progress for demo purposes. Replace with real progress:

```tsx
// In your actual implementation:
function MyLoadingScreen({ actualProgress }: { actualProgress: number }) {
  return (
    <LoadingScreen 
      theme="homestead"
      // Pass real progress value
    />
  );
}

// Then modify LoadingScreen.tsx to accept and use the prop:
// Remove the simulated progress useEffect
// Use the real progress value instead
```

## Font Setup

The pixelated theme uses **Press Start 2P** font. Add to your HTML:

```html
<!-- In public/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

Or install locally:
```bash
npm install @fontsource/press-start-2p
```

```typescript
// In your main.tsx or App.tsx
import '@fontsource/press-start-2p';
```

## Performance Tips

1. **Preload sprites** on app init:
```typescript
const spriteNames = ['morpho', 'vaporeon', 'jolteon', ...];
spriteNames.forEach(name => {
  const img = new Image();
  img.src = `/sprites/modern/${name}-run.png`;
});
```

2. **Lazy load for retro sprites** (they're smaller):
```typescript
const loadSprite = (name: string, type: 'modern' | 'retro') => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.src = `/sprites/${type}/${name}-run.png`;
  });
};
```

3. **Reduce animation on slow devices**:
The CSS already includes `prefers-reduced-motion` support.

## Troubleshooting

### Sprites not showing?
1. Check file paths: `/public/sprites/modern/morpho-run.png`
2. Check file names: exact match required (`morpho-run.png` not `morpho_run.png`)
3. Check browser console for 404 errors
4. Verify sprite dimensions (256×64 or 128×32)

### Animation not smooth?
1. Ensure sprite sheet is exactly 4 frames
2. Check that frames are equal width
3. Verify image-rendering CSS is applied for pixel art

### Game Boy frame not showing?
1. Only appears on `pixelated` and `pixelated-dark` themes
2. Check that theme prop is set correctly

### Progress bar stuck at 0%?
1. The component uses simulated progress for demo
2. Replace with real loading progress in production
3. Pass actual percentage via props (requires component modification)

## Next Steps

1. ✅ Copy component files
2. ✅ Set up sprite folders
3. 🎨 Create or obtain sprites (see sprite guide)
4. ✅ Import and use component
5. 🔧 Customize taglines (optional)
6. 🎨 Add custom loading messages (optional)
7. 📊 Connect to real loading progress (optional)

## Need Help with Sprites?

If you need help creating the sprites, I can:
1. Generate placeholder sprites for testing
2. Provide more detailed sprite creation tutorials
3. Recommend sprite artists or resources

Let me know what you need!
