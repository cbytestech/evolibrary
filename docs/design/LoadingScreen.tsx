// LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  theme?: 'homestead' | 'homestead-dark' | 'evolution' | 'evolution-dark' | 'pixelated' | 'pixelated-dark';
  message?: string;
}

// Taglines database with sprite associations
const TAGLINES = {
  universal: [
    { text: "Organizing your digital library...", sprite: null },
    { text: "Indexing the shelves...", sprite: null },
    { text: "Cataloging new arrivals...", sprite: null },
    { text: "Searching for the perfect read...", sprite: null },
    { text: "Transforming formats...", sprite: null },
    { text: "Building your collection...", sprite: null },
    { text: "Scanning the archives...", sprite: null },
    { text: "Fetching metadata...", sprite: null },
  ],
  evolution: [
    { text: "Gotta Read 'Em All!", sprite: "morpho" },
    { text: "Morpho is evolving...", sprite: "morpho" },
    { text: "Choose your evolution!", sprite: "morpho" },
    { text: "Collecting evolution stones...", sprite: "morpho" },
    { text: "Vaporeon streams audiobooks...", sprite: "vaporeon" },
    { text: "Jolteon charging your ePub...", sprite: "jolteon" },
    { text: "Flareon warming up PDFs...", sprite: "flareon" },
    { text: "Espeon senses new releases...", sprite: "espeon" },
    { text: "Umbreon prowls for comics...", sprite: "umbreon" },
    { text: "Leafeon growing your TXT collection...", sprite: "leafeon" },
    { text: "Glaceon preserving archives...", sprite: "glaceon" },
    { text: "Sylveon organizing articles...", sprite: "sylveon" },
    { text: "A wild book appeared!", sprite: "morpho" },
    { text: "Searching tall grass for books...", sprite: "morpho" },
    { text: "Your library grew to level 99!", sprite: "morpho" },
    { text: "Evolution in progress...", sprite: "morpho" },
  ]
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  theme = 'homestead', 
  message 
}) => {
  const [currentTagline, setCurrentTagline] = useState<{ text: string; sprite: string | null }>(
    TAGLINES.universal[0]
  );
  const [progress, setProgress] = useState(0);

  // Determine if we should use evolution taglines
  const useEvolutionTaglines = theme.includes('evolution') || theme.includes('pixelated');
  
  // Get appropriate taglines for theme
  const availableTaglines = useEvolutionTaglines 
    ? TAGLINES.evolution 
    : TAGLINES.universal;

  // Random tagline on mount and rotation
  useEffect(() => {
    if (!message) {
      const randomIndex = Math.floor(Math.random() * availableTaglines.length);
      setCurrentTagline(availableTaglines[randomIndex]);

      // Rotate taglines every 5 seconds
      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableTaglines.length);
        setCurrentTagline(availableTaglines[randomIndex]);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [message, useEvolutionTaglines]);

  // Simulate progress (you'd replace this with actual loading progress)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0; // Loop for demo
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Determine sprite path based on theme
  const getSpritePath = (spriteName: string | null) => {
    if (!spriteName) return null;
    
    const isPixelated = theme.includes('pixelated');
    const folder = isPixelated ? 'retro' : 'modern';
    
    return `/sprites/${folder}/${spriteName}-run.png`;
  };

  const spritePath = getSpritePath(currentTagline.sprite);
  const isPixelated = theme.includes('pixelated');
  const isGameBoyTheme = theme === 'pixelated' || theme === 'pixelated-dark';

  return (
    <div className={`loading-screen ${theme}`}>
      {/* Game Boy Frame (only for pixelated themes) */}
      {isGameBoyTheme && (
        <div className="gameboy-frame">
          <div className="gameboy-screen">
            <div className="screen-content">
              {spritePath && (
                <div className="sprite-container">
                  <div 
                    className="sprite-runner"
                    style={{
                      backgroundImage: `url(${spritePath})`,
                    }}
                  />
                </div>
              )}
              <div className="loading-text">
                {message || currentTagline.text}
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="gameboy-dpad">
            <div className="dpad-cross">
              <div className="dpad-up"></div>
              <div className="dpad-down"></div>
              <div className="dpad-left"></div>
              <div className="dpad-right"></div>
              <div className="dpad-center"></div>
            </div>
          </div>
          <div className="gameboy-buttons">
            <div className="button-b">B</div>
            <div className="button-a">A</div>
          </div>
        </div>
      )}

      {/* Standard Layout (non-Game Boy themes) */}
      {!isGameBoyTheme && (
        <>
          {spritePath && (
            <div className="sprite-container">
              <div 
                className="sprite-runner"
                style={{
                  backgroundImage: `url(${spritePath})`,
                }}
              />
            </div>
          )}
          
          <div className="loading-text">
            {message || currentTagline.text}
          </div>
          
          <div className="progress-container">
            <div 
              className="progress-bar"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Optional Pokéball spinner for Evolution themes */}
          {useEvolutionTaglines && (
            <svg className="pokeball-spinner" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.3"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" 
                strokeDasharray="141 141" strokeDashoffset="141" className="pokeball-top"/>
              <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="5" opacity="0.5"/>
              <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="50" r="6" fill="currentColor"/>
            </svg>
          )}
        </>
      )}
    </div>
  );
};

export default LoadingScreen;
