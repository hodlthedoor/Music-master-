// Pattern Generator - Intelligent music generation with music theory

import {
  ScaleType,
  randomChoice,
  randomInt,
  euclideanRhythm,
  rotatePattern,
  applySwing,
  probabilisticPattern,
  MELODIC_RHYTHMS,
  MELODIC_CONTOURS,
  generateMelody,
  NOTE_NAMES,
} from './MusicTheory';

import { SYNTH_PRESETS } from '../audio/SynthPresets';

export type PatternStyle =
  | 'rock'
  | 'hiphop'
  | 'electronic'
  | 'funk'
  | 'latin'
  | 'jazz'
  | 'trap'
  | 'house'
  | 'dubstep'
  | 'ambient'
  | 'random';

export interface GeneratedPattern {
  name: string;
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  synthNotes: number[]; // MIDI notes for each step (0 = no note)
  bpm: number;
  description: string;
  key: { root: number; scale: ScaleType };
  synthPreset?: string;
  swing?: number;
}

// Drum pattern probability templates
const DRUM_PROBABILITIES = {
  kick: {
    rock: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hiphop: [1, 0, 0.2, 0, 0, 0.3, 1, 0, 0, 0.2, 1, 0, 0, 0, 0.5, 0],
    electronic: [1, 0, 0, 0.5, 1, 0, 0, 0, 1, 0, 0, 0.5, 1, 0, 0, 0],
    funk: [1, 0, 0.4, 0.6, 0, 0, 1, 0, 0, 0.6, 0, 0.4, 1, 0, 0.5, 0],
    latin: [1, 0, 0, 0.7, 0, 0, 0, 0.8, 0, 0, 0.7, 0, 0, 0, 0.8, 0],
    jazz: [1, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.5, 0, 0, 0, 0.3, 0],
    trap: [1, 0, 0, 0, 0, 0, 0.8, 0, 0, 0.7, 0, 0, 0, 0, 0.8, 0],
    house: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    dubstep: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.5, 0, 0, 0, 1, 0],
    ambient: [1, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0],
  },
  snare: {
    rock: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hiphop: [0, 0, 0, 0, 1, 0, 0, 0.3, 0, 0, 0, 0, 1, 0, 0, 0.2],
    electronic: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.5],
    funk: [0, 0.3, 0.5, 0, 1, 0, 0, 0.4, 0, 0.3, 0.5, 0, 1, 0, 0, 0.5],
    latin: [0, 0, 0, 0.8, 0, 0, 0.8, 0, 0, 0, 0.8, 0, 0.8, 0, 0, 0],
    jazz: [0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0],
    trap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    house: [0, 0, 0.3, 0, 1, 0, 0.3, 0, 0, 0, 0.3, 0, 1, 0, 0.3, 0],
    dubstep: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.5, 0],
    ambient: [0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0.3, 0, 0, 0],
  },
  hihat: {
    rock: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    hiphop: [1, 0.7, 1, 0.7, 1, 0.7, 1, 0, 1, 0.7, 1, 0.7, 1, 0.7, 1, 0],
    electronic: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    funk: [1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8],
    latin: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    jazz: [1, 0, 0, 0.8, 0, 0, 1, 0, 1, 0, 0, 0.8, 0, 0, 1, 0],
    trap: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    house: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    dubstep: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    ambient: [0.3, 0, 0, 0, 0.2, 0, 0, 0, 0.3, 0, 0, 0, 0.2, 0, 0, 0],
  },
  clap: {
    rock: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hiphop: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    electronic: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0.7],
    funk: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    latin: [0, 0.8, 0, 0, 0, 0.8, 0, 0, 0, 0.8, 0, 0, 0, 0.8, 0, 0],
    jazz: [0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0],
    trap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    house: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    dubstep: [0, 0, 0, 0, 1, 0, 0, 0.5, 0, 0, 0, 0, 1, 0, 0, 0],
    ambient: [0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0],
  },
};

// BPM ranges per genre
const BPM_RANGES: Record<PatternStyle, [number, number]> = {
  rock: [110, 140],
  hiphop: [80, 100],
  electronic: [120, 135],
  funk: [100, 120],
  latin: [95, 115],
  jazz: [110, 140],
  trap: [130, 160],
  house: [118, 130],
  dubstep: [138, 150],
  ambient: [60, 90],
  random: [80, 150],
};

// Key preferences per genre (some genres prefer minor, etc.)
const KEY_PREFERENCES: Record<PatternStyle, { roots: number[]; scales: ScaleType[] }> = {
  rock: { roots: [0, 5, 7], scales: ['major', 'pentatonicMinor'] },
  hiphop: { roots: [0, 2, 7], scales: ['minor', 'pentatonicMinor', 'dorian'] },
  electronic: { roots: [0, 5, 7], scales: ['minor', 'phrygian'] },
  funk: { roots: [0, 5, 7], scales: ['dorian', 'mixolydian'] },
  latin: { roots: [0, 5, 7], scales: ['major', 'mixolydian'] },
  jazz: { roots: [0, 2, 5, 7, 9], scales: ['dorian', 'mixolydian', 'major'] },
  trap: { roots: [0, 5, 7], scales: ['minor', 'phrygian', 'harmonicMinor'] },
  house: { roots: [0, 5, 7], scales: ['minor', 'dorian'] },
  dubstep: { roots: [0, 5], scales: ['minor', 'phrygian'] },
  ambient: { roots: [0, 4, 7, 9], scales: ['major', 'pentatonicMajor', 'dorian'] },
  random: { roots: [0, 2, 4, 5, 7, 9, 11], scales: ['major', 'minor', 'pentatonicMinor', 'dorian'] },
};

// Melody style preferences per genre
const MELODY_STYLES: Record<PatternStyle, { rhythms: (keyof typeof MELODIC_RHYTHMS)[]; contours: (keyof typeof MELODIC_CONTOURS)[] }> = {
  rock: { rhythms: ['simple', 'syncopated'], contours: ['ascending', 'arch'] },
  hiphop: { rhythms: ['syncopated', 'trap'], contours: ['stable', 'zigzag'] },
  electronic: { rhythms: ['driving', 'syncopated'], contours: ['wave', 'arch'] },
  funk: { rhythms: ['groove', 'syncopated'], contours: ['zigzag', 'valley'] },
  latin: { rhythms: ['syncopated', 'groove'], contours: ['arch', 'wave'] },
  jazz: { rhythms: ['syncopated', 'dotted'], contours: ['zigzag', 'arch'] },
  trap: { rhythms: ['trap', 'sparse'], contours: ['stable', 'leap'] },
  house: { rhythms: ['offbeat', 'driving'], contours: ['stable', 'wave'] },
  dubstep: { rhythms: ['syncopated', 'sparse'], contours: ['leap', 'stable'] },
  ambient: { rhythms: ['sparse', 'simple'], contours: ['stable', 'ascending'] },
  random: { rhythms: ['simple', 'syncopated', 'groove', 'driving'], contours: ['arch', 'wave', 'zigzag', 'stable'] },
};

// Exclude 'random' from styles that have drum probabilities
type DrumStyle = Exclude<PatternStyle, 'random'>;

// Helper to get style for drum probabilities
function getDrumStyle(style: PatternStyle): DrumStyle {
  if (style === 'random') {
    const styles: DrumStyle[] = ['rock', 'hiphop', 'electronic', 'funk', 'latin', 'jazz', 'trap', 'house', 'dubstep', 'ambient'];
    return randomChoice(styles);
  }
  return style;
}

// Generate drum patterns from probabilities
function generateDrumPatterns(style: PatternStyle): boolean[][] {
  const drumStyle = getDrumStyle(style);
  const kickProbs = DRUM_PROBABILITIES.kick[drumStyle];
  const snareProbs = DRUM_PROBABILITIES.snare[drumStyle];
  const hihatProbs = DRUM_PROBABILITIES.hihat[drumStyle];
  const clapProbs = DRUM_PROBABILITIES.clap[drumStyle];

  // Add some randomization
  const randomize = (probs: number[], variance: number = 0.2) =>
    probs.map(p => Math.min(1, Math.max(0, p + (Math.random() - 0.5) * variance)));

  return [
    probabilisticPattern(randomize(kickProbs), [0]), // Always kick on 1
    probabilisticPattern(randomize(snareProbs)),
    probabilisticPattern(randomize(hihatProbs)),
    probabilisticPattern(randomize(clapProbs)),
  ];
}

// Generate synth melody
function generateSynthMelody(
  style: PatternStyle,
  key: { root: number; scale: ScaleType }
): { pattern: boolean[]; notes: number[] } {
  const melodyStyle = MELODY_STYLES[style];
  const rhythmType = randomChoice(melodyStyle.rhythms);
  const contourType = randomChoice(melodyStyle.contours);

  // Choose octave based on genre (bass-heavy vs lead-heavy)
  const bassGenres: PatternStyle[] = ['dubstep', 'trap', 'hiphop'];
  const octave = bassGenres.includes(style) ? 2 : randomChoice([3, 4]);

  const melody = generateMelody(key.root, key.scale, rhythmType, contourType, octave);

  // Convert to pattern format
  const pattern: boolean[] = new Array(16).fill(false);
  const notes: number[] = new Array(16).fill(0);

  melody.forEach(({ step, note }) => {
    if (step >= 0 && step < 16) {
      pattern[step] = true;
      notes[step] = note;
    }
  });

  return { pattern, notes };
}

// Main generation function for each style
const PATTERN_GENERATORS: Record<PatternStyle, () => GeneratedPattern> = {
  rock: () => {
    const keyPrefs = KEY_PREFERENCES.rock;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.rock;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('rock');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('rock', key);
    const presetName = randomChoice(['classicLead', 'punchyBass', 'retroLead']);

    return {
      name: 'Rock Groove',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} rock groove at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  hiphop: () => {
    const keyPrefs = KEY_PREFERENCES.hiphop;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.hiphop;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('hiphop');
    drums[2] = applySwing(drums[2], 0.4); // Swung hi-hats
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('hiphop', key);
    const presetName = randomChoice(['deepBass', 'punchyBass', 'retroLead']);

    return {
      name: 'Hip Hop Beat',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} boom bap at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0.3,
    };
  },

  electronic: () => {
    const keyPrefs = KEY_PREFERENCES.electronic;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.electronic;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('electronic');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('electronic', key);
    const presetName = randomChoice(['brightLead', 'acidBass', 'stab']);

    return {
      name: 'Electronic',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} electronic at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  funk: () => {
    const keyPrefs = KEY_PREFERENCES.funk;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.funk;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('funk');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('funk', key);
    const presetName = randomChoice(['punchyBass', 'electricPiano', 'retroLead']);

    return {
      name: 'Funky Groove',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} funk at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0.2,
    };
  },

  latin: () => {
    const keyPrefs = KEY_PREFERENCES.latin;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.latin;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('latin');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('latin', key);
    const presetName = randomChoice(['electricPiano', 'softPluck', 'classicLead']);

    return {
      name: 'Latin Rhythm',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} latin groove at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0.15,
    };
  },

  jazz: () => {
    const keyPrefs = KEY_PREFERENCES.jazz;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.jazz;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('jazz');
    drums[2] = applySwing(drums[2], 0.5); // Heavily swung
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('jazz', key);
    const presetName = randomChoice(['electricPiano', 'warmPad', 'softPluck']);

    return {
      name: 'Jazz Groove',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} jazz at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0.4,
    };
  },

  trap: () => {
    const keyPrefs = KEY_PREFERENCES.trap;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.trap;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('trap');
    // Trap hi-hats: add rolls
    drums[2] = drums[2].map(() => Math.random() < 0.7);
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('trap', key);
    const presetName = randomChoice(['deepBass', 'brightLead', 'darkPad']);

    return {
      name: 'Trap Beat',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} trap at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  house: () => {
    const keyPrefs = KEY_PREFERENCES.house;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.house;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('house');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('house', key);
    const presetName = randomChoice(['acidBass', 'classicLead', 'warmPad']);

    return {
      name: 'House',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} house at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  dubstep: () => {
    const keyPrefs = KEY_PREFERENCES.dubstep;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.dubstep;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('dubstep');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('dubstep', key);
    const presetName = randomChoice(['wobbleBass', 'stab', 'darkPad']);

    return {
      name: 'Dubstep',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} dubstep at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  ambient: () => {
    const keyPrefs = KEY_PREFERENCES.ambient;
    const key = { root: randomChoice(keyPrefs.roots), scale: randomChoice(keyPrefs.scales) };
    const [minBpm, maxBpm] = BPM_RANGES.ambient;
    const bpm = randomInt(minBpm, maxBpm);
    const drums = generateDrumPatterns('ambient');
    const { pattern: synthPattern, notes: synthNotes } = generateSynthMelody('ambient', key);
    const presetName = randomChoice(['warmPad', 'darkPad', 'softPluck']);

    return {
      name: 'Ambient',
      synthPattern,
      synthNotes,
      drumPatterns: drums,
      bpm,
      description: `${NOTE_NAMES[key.root]} ${key.scale} ambient at ${bpm} BPM`,
      key,
      synthPreset: presetName,
      swing: 0,
    };
  },

  random: () => {
    // Pick a random base style and add extra randomization
    const baseStyles: PatternStyle[] = ['rock', 'hiphop', 'electronic', 'funk', 'trap', 'house', 'dubstep'];
    const baseStyle = randomChoice(baseStyles);
    const base = PATTERN_GENERATORS[baseStyle]();

    // Further randomize
    const extraRandomization = Math.random();

    // Maybe rotate patterns
    if (extraRandomization < 0.3) {
      const rotation = randomInt(1, 4);
      base.drumPatterns = base.drumPatterns.map(p => rotatePattern(p, rotation));
      base.synthPattern = rotatePattern(base.synthPattern, rotation);
      base.synthNotes = rotatePattern(base.synthNotes, rotation);
    }

    // Maybe apply euclidean rhythm to one drum
    if (extraRandomization > 0.5) {
      const drumIndex = randomInt(0, 3);
      const pulses = randomInt(3, 8);
      base.drumPatterns[drumIndex] = euclideanRhythm(pulses, 16);
    }

    // Random preset
    base.synthPreset = randomChoice(Object.keys(SYNTH_PRESETS));

    return {
      ...base,
      name: 'Random Fusion',
      description: `Randomized ${base.description}`,
    };
  },
};

// Main export function
export function generatePattern(style: PatternStyle): GeneratedPattern {
  return PATTERN_GENERATORS[style]();
}

// Get available styles
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
    { value: 'dubstep', label: 'Dubstep' },
    { value: 'ambient', label: 'Ambient' },
    { value: 'random', label: 'Random' },
  ];
}

// Mutate pattern with musical awareness
export function mutatePattern(pattern: boolean[], intensity: number = 0.2): boolean[] {
  return pattern.map((step, i) => {
    if (Math.random() < intensity) {
      // Prefer to keep strong beats
      const isStrongBeat = i === 0 || i === 4 || i === 8 || i === 12;
      if (isStrongBeat) {
        return Math.random() < 0.8 ? step : !step;
      }
      return !step;
    }
    return step;
  });
}

// Create fill pattern
export function createFill(drumPatterns: boolean[][]): boolean[][] {
  const fill = drumPatterns.map(p => [...p]);

  // Snare roll on last 4 steps
  for (let i = 12; i < 16; i++) {
    fill[1][i] = true;
    fill[3][i] = i % 2 === 0;
  }

  // Remove kick on last 2 steps
  fill[0][14] = false;
  fill[0][15] = false;

  return fill;
}

// Humanize pattern
export function humanizePattern(pattern: boolean[], variation: number = 0.1): boolean[] {
  return pattern.map((step) => {
    if (step && Math.random() < variation) {
      return false;
    }
    return step;
  });
}

// Generate with specific parameters
export function generateCustomPattern(options: {
  root?: number;
  scale?: ScaleType;
  bpm?: number;
  style?: PatternStyle;
  preset?: string;
}): GeneratedPattern {
  const style = options.style || 'random';
  const base = generatePattern(style);

  if (options.root !== undefined) {
    base.key.root = options.root;
    // Regenerate melody with new key
    const { pattern, notes } = generateSynthMelody(style, base.key);
    base.synthPattern = pattern;
    base.synthNotes = notes;
  }

  if (options.scale) {
    base.key.scale = options.scale;
    const { pattern, notes } = generateSynthMelody(style, base.key);
    base.synthPattern = pattern;
    base.synthNotes = notes;
  }

  if (options.bpm) {
    base.bpm = options.bpm;
  }

  if (options.preset) {
    base.synthPreset = options.preset;
  }

  return base;
}
