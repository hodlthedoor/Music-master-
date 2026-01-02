// Pattern Generator - Auto-generate beat patterns

export type PatternStyle =
  | 'rock'
  | 'hiphop'
  | 'electronic'
  | 'funk'
  | 'latin'
  | 'jazz'
  | 'trap'
  | 'house'
  | 'random';

export interface GeneratedPattern {
  name: string;
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  bpm: number;
  description: string;
}

// Pattern templates for each style
const PATTERN_TEMPLATES: Record<PatternStyle, () => GeneratedPattern> = {
  rock: () => ({
    name: 'Classic Rock',
    synthPattern: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    drumPatterns: [
      // Kick: on 1 and 3
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      // Snare: on 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Hi-hat: 8th notes
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      // Clap: off
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    ],
    bpm: 120,
    description: 'Classic rock beat with kick on 1&3, snare on 2&4'
  }),

  hiphop: () => ({
    name: 'Hip Hop Boom Bap',
    synthPattern: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
    drumPatterns: [
      // Kick: boom bap pattern
      [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      // Snare: on 2 and 4 with ghost
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Hi-hat: 16ths with variation
      [true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, false],
      // Clap: layered with snare
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    ],
    bpm: 90,
    description: 'Boom bap hip hop with swung hi-hats'
  }),

  electronic: () => ({
    name: 'Electronic',
    synthPattern: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    drumPatterns: [
      // Kick: four on the floor with off-beats
      [true, false, false, true, true, false, false, false, true, false, false, true, true, false, false, false],
      // Snare: 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Hi-hat: 16ths
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      // Clap: accents
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
    ],
    bpm: 128,
    description: 'Driving electronic beat with 16th note hi-hats'
  }),

  funk: () => ({
    name: 'Funky Groove',
    synthPattern: [true, false, true, false, false, true, false, false, true, false, true, false, false, true, false, false],
    drumPatterns: [
      // Kick: syncopated funk
      [true, false, false, true, false, false, true, false, false, true, false, false, true, false, true, false],
      // Snare: ghost notes
      [false, false, true, false, true, false, false, true, false, false, true, false, true, false, false, true],
      // Hi-hat: 16ths with open
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      // Clap: accent on 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    ],
    bpm: 110,
    description: 'Syncopated funk groove with ghost notes'
  }),

  latin: () => ({
    name: 'Latin Rhythm',
    synthPattern: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
    drumPatterns: [
      // Kick: tumbao pattern
      [true, false, false, true, false, false, false, true, false, false, true, false, false, false, true, false],
      // Snare: clave-like
      [false, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false],
      // Hi-hat: 16ths
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      // Clap: off-beat accents
      [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
    ],
    bpm: 105,
    description: 'Latin-inspired rhythm with clave feel'
  }),

  jazz: () => ({
    name: 'Jazz Swing',
    synthPattern: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
    drumPatterns: [
      // Kick: sparse, on 1
      [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
      // Snare: rim shots
      [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
      // Hi-hat: swing pattern (implied)
      [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
      // Clap: brush hits
      [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false],
    ],
    bpm: 125,
    description: 'Jazz-inspired swing pattern'
  }),

  trap: () => ({
    name: 'Trap Beat',
    synthPattern: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
    drumPatterns: [
      // Kick: 808 style
      [true, false, false, false, false, false, true, false, false, true, false, false, false, false, true, false],
      // Snare: trap snare
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      // Hi-hat: trap rolls
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      // Clap: on snare hits
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    ],
    bpm: 140,
    description: 'Modern trap beat with rolling hi-hats'
  }),

  house: () => ({
    name: 'House',
    synthPattern: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    drumPatterns: [
      // Kick: four on the floor
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      // Snare: off-beat
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      // Hi-hat: off-beat open hats
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      // Clap: 2 and 4
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    ],
    bpm: 124,
    description: 'Classic house with four-on-the-floor kick'
  }),

  random: () => {
    const createRandomPattern = (density: number): boolean[] => {
      return Array.from({ length: 16 }, () => Math.random() < density);
    };

    // Ensure kick is on beat 1
    const kickPattern = createRandomPattern(0.3);
    kickPattern[0] = true;
    kickPattern[8] = true;

    // Snare on 2 and 4 typically
    const snarePattern = createRandomPattern(0.2);
    snarePattern[4] = true;
    snarePattern[12] = true;

    return {
      name: 'Random Beat',
      synthPattern: createRandomPattern(0.4),
      drumPatterns: [
        kickPattern,
        snarePattern,
        createRandomPattern(0.6),
        createRandomPattern(0.15),
      ],
      bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
      description: 'Randomly generated pattern'
    };
  }
};

export function generatePattern(style: PatternStyle): GeneratedPattern {
  return PATTERN_TEMPLATES[style]();
}

export function getAvailableStyles(): { value: PatternStyle; label: string }[] {
  return [
    { value: 'rock', label: 'Rock' },
    { value: 'hiphop', label: 'Hip Hop' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'funk', label: 'Funk' },
    { value: 'latin', label: 'Latin' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'trap', label: 'Trap' },
    { value: 'house', label: 'House' },
    { value: 'random', label: 'Random' },
  ];
}

// Mutate a pattern slightly for variation
export function mutatePattern(pattern: boolean[], intensity: number = 0.2): boolean[] {
  return pattern.map((step, i) => {
    if (Math.random() < intensity) {
      // Higher chance to keep strong beats
      if (i === 0 || i === 4 || i === 8 || i === 12) {
        return Math.random() < 0.7 ? step : !step;
      }
      return !step;
    }
    return step;
  });
}

// Create a fill pattern
export function createFill(drumPatterns: boolean[][]): boolean[][] {
  const fill = drumPatterns.map(p => [...p]);

  // Add snare roll on last 4 steps
  for (let i = 12; i < 16; i++) {
    fill[1][i] = true; // Snare
    fill[3][i] = i % 2 === 0; // Clap on even
  }

  // Remove kick on last 2 steps
  fill[0][14] = false;
  fill[0][15] = false;

  return fill;
}

// Humanize pattern with slight variations
export function humanizePattern(pattern: boolean[], variation: number = 0.1): boolean[] {
  return pattern.map((step) => {
    if (step && Math.random() < variation) {
      // Small chance to skip a hit (ghost note simulation)
      return false;
    }
    return step;
  });
}
