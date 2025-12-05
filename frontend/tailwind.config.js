/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ← MUST be here at top level!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Morpho colors
        morpho: {
          primary: '#6B9F7F',
          light: '#7ABF8F',
          dark: '#5A8F6F',
        },
        // Homestead theme
        homestead: {
          light: {
            bg: '#f5efe6',
            text: '#5a5a42',
            accent: '#c89968',
          },
          dark: {
            bg: '#1e1e16',
            text: '#7a8a5f',
            accent: '#d4a574',
          },
        },
        // Format colors (from your docs)
        formats: {
          audiobook: '#7ac7e8',  // Vaporeon blue
          epub: '#ffd700',       // Jolteon yellow
          pdf: '#ff6b35',        // Flareon orange
          mobi: '#b565d8',       // Espeon purple
          comic: '#34495e',      // Umbreon dark
          txt: '#8fbc8f',        // Leafeon green
          archive: '#b0e0e6',    // Glaceon blue
          article: '#ffb6e1',    // Sylveon pink
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}