// Music Theory Utility - Scales, Chords, Progressions, and Musical Intelligence

// Note names for display
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale intervals (semitones from root)
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
} as const;

export type ScaleType = keyof typeof SCALES;

// Chord types (intervals from root)
export const CHORD_TYPES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  power: [0, 7], // Power chord (5th)
} as const;

export type ChordType = keyof typeof CHORD_TYPES;

// Common chord progressions (scale degrees, 1-indexed)
export const PROGRESSIONS = {
  pop: [[1, 'major'], [5, 'major'], [6, 'minor'], [4, 'major']], // I-V-vi-IV
  blues: [[1, 'dominant7'], [4, 'dominant7'], [1, 'dominant7'], [5, 'dominant7']], // 12-bar simplified
  jazz: [[2, 'minor7'], [5, 'dominant7'], [1, 'major7'], [1, 'major7']], // ii-V-I
  rock: [[1, 'power'], [4, 'power'], [5, 'power'], [4, 'power']], // I-IV-V-IV
  edm: [[6, 'minor'], [4, 'major'], [1, 'major'], [5, 'major']], // vi-IV-I-V
  sad: [[6, 'minor'], [4, 'major'], [5, 'major'], [1, 'major']], // vi-IV-V-I
  epic: [[1, 'major'], [5, 'major'], [6, 'minor'], [3, 'minor']], // I-V-vi-iii
  dark: [[1, 'minor'], [6, 'major'], [3, 'major'], [7, 'major']], // i-VI-III-VII
} as const;

export type ProgressionType = keyof typeof PROGRESSIONS;

// Get scale notes for a given root and scale type
export function getScaleNotes(root: number, scale: ScaleType, octave: number = 3): number[] {
  const baseNote = root + (octave + 1) * 12; // MIDI note
  return SCALES[scale].map(interval => baseNote + interval);
}

// Get chord notes
export function getChordNotes(root: number, chordType: ChordType, octave: number = 3): number[] {
  const baseNote = root + (octave + 1) * 12;
  return CHORD_TYPES[chordType].map(interval => baseNote + interval);
}

// Convert MIDI note to frequency
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Convert frequency to MIDI note
export function freqToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / 440) + 69);
}

// Get note name from MIDI
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

// Get scale degree note (1-indexed)
export function getScaleDegree(root: number, scale: ScaleType, degree: number, octave: number = 3): number {
  const scaleNotes = SCALES[scale];
  const adjustedDegree = ((degree - 1) % scaleNotes.length + scaleNotes.length) % scaleNotes.length;
  const octaveOffset = Math.floor((degree - 1) / scaleNotes.length);
  return root + (octave + 1 + octaveOffset) * 12 + scaleNotes[adjustedDegree];
}

// Generate a chord progression
export function generateProgression(
  root: number,
  scale: ScaleType,
  progressionType: ProgressionType,
  octave: number = 3
): number[][] {
  const progression = PROGRESSIONS[progressionType];
  return progression.map(([degree, chordType]) => {
    const chordRoot = getScaleDegree(root, scale, degree as number, octave);
    return getChordNotes(chordRoot % 12, chordType as ChordType, Math.floor(chordRoot / 12) - 1);
  });
}

// Melodic patterns - rhythm and contour templates
export const MELODIC_RHYTHMS = {
  simple: [0, 4, 8, 12], // Quarter notes
  offbeat: [2, 6, 10, 14], // Off-beat
  syncopated: [0, 3, 6, 10, 14], // Syncopated
  driving: [0, 2, 4, 6, 8, 10, 12, 14], // 8th notes
  sparse: [0, 8], // Half notes
  dotted: [0, 6, 8, 14], // Dotted rhythm
  trap: [0, 6, 8, 10, 14], // Trap-style
  groove: [0, 3, 4, 7, 8, 11, 12, 15], // Funky groove
};

export const MELODIC_CONTOURS = {
  ascending: [0, 1, 2, 3, 4],
  descending: [4, 3, 2, 1, 0],
  arch: [0, 2, 4, 2, 0],
  valley: [4, 2, 0, 2, 4],
  zigzag: [0, 3, 1, 4, 2],
  stable: [0, 0, 1, 0, 0],
  leap: [0, 4, 0, 3, 0],
  wave: [0, 2, 1, 3, 2, 4],
};

// Generate a melodic pattern based on scale
export function generateMelody(
  root: number,
  scale: ScaleType,
  rhythmType: keyof typeof MELODIC_RHYTHMS,
  contourType: keyof typeof MELODIC_CONTOURS,
  octave: number = 3
): { step: number; note: number }[] {
  const rhythm = MELODIC_RHYTHMS[rhythmType];
  const contour = MELODIC_CONTOURS[contourType];
  const scaleNotes = getScaleNotes(root, scale, octave);

  return rhythm.map((step, i) => {
    const contourIndex = i % contour.length;
    const noteIndex = contour[contourIndex] % scaleNotes.length;
    return { step, note: scaleNotes[noteIndex] };
  });
}

// Bass patterns
export const BASS_PATTERNS = {
  root: (root: number, octave: number = 2) => [
    { step: 0, note: root + (octave + 1) * 12 },
  ],
  rootFifth: (root: number, octave: number = 2) => [
    { step: 0, note: root + (octave + 1) * 12 },
    { step: 8, note: root + (octave + 1) * 12 + 7 },
  ],
  walking: (root: number, scale: ScaleType, octave: number = 2) => {
    const notes = getScaleNotes(root, scale, octave);
    return [
      { step: 0, note: notes[0] },
      { step: 4, note: notes[2] },
      { step: 8, note: notes[4] },
      { step: 12, note: notes[3] },
    ];
  },
  octave: (root: number, octave: number = 2) => [
    { step: 0, note: root + (octave + 1) * 12 },
    { step: 4, note: root + (octave + 2) * 12 },
    { step: 8, note: root + (octave + 1) * 12 },
    { step: 12, note: root + (octave + 2) * 12 },
  ],
  driving: (root: number, octave: number = 2) =>
    [0, 2, 4, 6, 8, 10, 12, 14].map(step => ({
      step,
      note: root + (octave + 1) * 12,
    })),
  syncopated: (root: number, octave: number = 2) => [
    { step: 0, note: root + (octave + 1) * 12 },
    { step: 3, note: root + (octave + 1) * 12 },
    { step: 6, note: root + (octave + 1) * 12 + 7 },
    { step: 10, note: root + (octave + 1) * 12 },
    { step: 14, note: root + (octave + 1) * 12 + 7 },
  ],
};

// Arpeggio patterns
export function generateArpeggio(
  root: number,
  chordType: ChordType,
  pattern: 'up' | 'down' | 'updown' | 'random',
  steps: number[] = [0, 4, 8, 12],
  octave: number = 3
): { step: number; note: number }[] {
  const chordNotes = getChordNotes(root, chordType, octave);
  let noteSequence: number[];

  switch (pattern) {
    case 'up':
      noteSequence = chordNotes;
      break;
    case 'down':
      noteSequence = [...chordNotes].reverse();
      break;
    case 'updown':
      noteSequence = [...chordNotes, ...chordNotes.slice(1, -1).reverse()];
      break;
    case 'random':
      noteSequence = chordNotes.map(() => chordNotes[Math.floor(Math.random() * chordNotes.length)]);
      break;
  }

  return steps.map((step, i) => ({
    step,
    note: noteSequence[i % noteSequence.length],
  }));
}

// Random selection helpers
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom<T>(options: { value: T; weight: number }[]): T {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) return option.value;
  }

  return options[options.length - 1].value;
}

// Generate random key
export function randomKey(): { root: number; scale: ScaleType } {
  const roots = [0, 2, 4, 5, 7, 9, 11]; // Common keys
  const scales: ScaleType[] = ['major', 'minor', 'pentatonicMinor', 'dorian'];
  return {
    root: randomChoice(roots),
    scale: randomChoice(scales),
  };
}

// Probability-based step generation
export function probabilisticPattern(
  probabilities: number[], // 16 values between 0-1
  guarantee: number[] = [] // Steps that are always on
): boolean[] {
  const pattern = probabilities.map(prob => Math.random() < prob);
  guarantee.forEach(step => {
    if (step >= 0 && step < 16) pattern[step] = true;
  });
  return pattern;
}

// Euclidean rhythm generator (creates well-distributed patterns)
export function euclideanRhythm(pulses: number, steps: number): boolean[] {
  if (pulses >= steps) return new Array(steps).fill(true);
  if (pulses <= 0) return new Array(steps).fill(false);

  const pattern: boolean[] = new Array(steps).fill(false);
  let bucket = 0;

  for (let i = 0; i < steps; i++) {
    bucket += pulses;
    if (bucket >= steps) {
      bucket -= steps;
      pattern[i] = true;
    }
  }

  return pattern;
}

// Rotate pattern (for variations)
export function rotatePattern<T>(pattern: T[], amount: number): T[] {
  const len = pattern.length;
  const shift = ((amount % len) + len) % len;
  return [...pattern.slice(shift), ...pattern.slice(0, shift)];
}

// Apply groove/swing to pattern
export function applySwing(pattern: boolean[], amount: number = 0.3): boolean[] {
  // Swing delays even 16th notes slightly
  // This just moves some even-positioned hits to odd positions
  const swung = [...pattern];
  for (let i = 2; i < 16; i += 4) {
    if (pattern[i] && Math.random() < amount) {
      swung[i] = false;
      swung[Math.min(i + 1, 15)] = true;
    }
  }
  return swung;
}

// Add ghost notes (quieter hits between main hits)
export function addGhostNotes(pattern: boolean[], density: number = 0.3): boolean[] {
  const result = [...pattern];
  for (let i = 0; i < 16; i++) {
    if (!pattern[i] && Math.random() < density) {
      // Check if adjacent steps have notes
      const hasPrev = i > 0 && pattern[i - 1];
      const hasNext = i < 15 && pattern[i + 1];
      if (hasPrev || hasNext) {
        result[i] = true;
      }
    }
  }
  return result;
}
