// File: frontend/src/utils/alienQuotes.ts

export interface AlienQuote {
  text: string
  source: string
}

// Time-based quotes for different parts of the day
const morningQuotes: AlienQuote[] = [
  { text: "In the beginning, the universe was created.", source: "The Hitchhiker's Guide to the Galaxy" },
  { text: "The dawn of a new day brings new possibilities...", source: "Contact" },
  { text: "First contact protocols: Stay calm, be polite.", source: "Ender's Game" }
]

const afternoonQuotes: AlienQuote[] = [
  { text: "So long, and thanks for all the fish!", source: "The Hitchhiker's Guide to the Galaxy" },
  { text: "They're made out of meat.", source: "They're Made Out of Meat" },
  { text: "The answer to life, the universe, and everything...", source: "The Hitchhiker's Guide to the Galaxy" }
]

const eveningQuotes: AlienQuote[] = [
  { text: "The stars are calling...", source: "Contact" },
  { text: "We are not alone in the universe.", source: "2001: A Space Odyssey" },
  { text: "Look to the skies tonight.", source: "The War of the Worlds" }
]

const nightQuotes: AlienQuote[] = [
  { text: "In space, no one can hear you scream.", source: "Alien" },
  { text: "The night sky holds infinite mysteries...", source: "Cosmos" },
  { text: "Strange visitors from distant worlds...", source: "Superman" }
]

// Quotes that work anytime
const allDayQuotes: AlienQuote[] = [
  { text: "We come in peace.", source: "The Day the Earth Stood Still" },
  { text: "Take me to your library...", source: "EvoLibrary" },
  { text: "Greetings, Earthling. Preparing your collection...", source: "EvoLibrary" },
  { text: "Downloading knowledge from across the galaxy...", source: "EvoLibrary" },
  { text: "The truth is out there... in your books.", source: "The X-Files" },
  { text: "Morpho is evolving...", source: "EvoLibrary" }
]

/**
 * Get a random alien-themed quote based on time of day
 * Morning (6-12): Optimistic, fresh start quotes
 * Afternoon (12-17): Quirky, fun quotes
 * Evening (17-21): Contemplative quotes
 * Night (21-6): Mysterious, cosmic quotes
 */
export function getRandomAlienQuote(): AlienQuote {
  const hour = new Date().getHours()
  
  let quotes: AlienQuote[]
  
  if (hour >= 6 && hour < 12) {
    // Morning: Fresh start vibes
    quotes = [...morningQuotes, ...allDayQuotes]
  } else if (hour >= 12 && hour < 17) {
    // Afternoon: Fun and quirky
    quotes = [...afternoonQuotes, ...allDayQuotes]
  } else if (hour >= 17 && hour < 21) {
    // Evening: Contemplative
    quotes = [...eveningQuotes, ...allDayQuotes]
  } else {
    // Night: Mysterious
    quotes = [...nightQuotes, ...allDayQuotes]
  } 
  
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}