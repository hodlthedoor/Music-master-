// Trance Generator - Hypnotic, driving trance patterns
import { ScaleType, randomChoice, randomInt, getScaleNotes } from './MusicTheory';
import { GeneratedPattern } from './PatternGenerator';

// Trance root notes (C, F, G, Bb - common trance keys)
const TRANCE_ROOTS = [0, 5, 7, 10];

// Trance sub-genres
export type TranceStyle = 'hypnotic' | 'uplifting' | 'dark' | 'progressive' | 'psytrance';

// BPM ranges for trance styles
const TRANCE_BPM: Record<TranceStyle, [number, number]> = {
  hypnotic: [130, 138],
  uplifting: [136, 142],
  dark: [135, 140],
  progressive: [126, 132],
  psytrance: [140, 150],
};

// Trance-specific drum patterns (16 steps = 1 bar)
const TRANCE_DRUMS = {
  // 4-on-the-floor kick is essential
  kick: {
    hypnotic: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    uplifting: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    dark: [1, 0, 0, 0.3, 1, 0, 0, 0, 1, 0, 0, 0.3, 1, 0, 0, 0],
    progressive: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.3, 0],
    psytrance: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  },
  // Offbeat hi-hats are the trance signature
  hihat: {
    hypnotic: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    uplifting: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    dark: [0, 0, 1, 0.5, 0, 0, 1, 0, 0, 0, 1, 0.5, 0, 0, 1, 0],
    progressive: [0.5, 0, 1, 0.3, 0.5, 0, 1, 0.3, 0.5, 0, 1, 0.3, 0.5, 0, 1, 0.3],
    psytrance: [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5],
  },
  // Claps/snares on 2 and 4
  clap: {
    hypnotic: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    uplifting: [0, 0, 0, 0, 1, 0, 0, 0.3, 0, 0, 0, 0, 1, 0, 0, 0.3],
    dark: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    progressive: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    psytrance: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  // Snare accents
  snare: {
    hypnotic: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5],
    uplifting: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0],
    dark: [0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0.3, 0, 0, 0, 0],
    progressive: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.3, 0.3],
    psytrance: [0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5],
  },
};

// Trance arpeggio patterns (step patterns for 16 steps)
const TRANCE_ARPS = {
  // Classic rolling arp
  rolling: [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 7, 4, 0, 4, 7, 12],
  // Gated/stab style
  gated: [0, -1, 0, -1, 7, -1, 7, -1, 12, -1, 12, -1, 7, -1, 0, -1],
  // Uplifting riser
  uplifting: [0, 4, 7, 4, 12, 7, 12, 16, 12, 7, 12, 7, 4, 7, 4, 0],
  // Hypnotic minimal
  hypnotic: [0, -1, -1, 7, -1, -1, 0, -1, -1, 7, -1, -1, 12, -1, -1, 7],
  // Dark stabs
  dark: [0, -1, -1, -1, 0, -1, 7, -1, -1, -1, 0, -1, 7, 12, -1, -1],
  // Psytrance 16th notes
  psy: [0, 3, 7, 3, 0, 3, 7, 3, 0, 3, 7, 10, 7, 3, 0, 3],
};

// Convert arp pattern to synth pattern and notes
function generateTranceArp(
  style: TranceStyle,
  root: number,
  scale: ScaleType,
  octave: number = 3
): { pattern: boolean[]; notes: number[] } {
  const scaleNotes = getScaleNotes(root, scale, octave);

  // Pick arp pattern based on style
  let arpPattern: number[];
  switch (style) {
    case 'hypnotic':
      arpPattern = randomChoice([TRANCE_ARPS.hypnotic, TRANCE_ARPS.rolling]);
      break;
    case 'uplifting':
      arpPattern = randomChoice([TRANCE_ARPS.uplifting, TRANCE_ARPS.rolling]);
      break;
    case 'dark':
      arpPattern = randomChoice([TRANCE_ARPS.dark, TRANCE_ARPS.gated]);
      break;
    case 'psytrance':
      arpPattern = TRANCE_ARPS.psy;
      break;
    default:
      arpPattern = randomChoice([TRANCE_ARPS.rolling, TRANCE_ARPS.gated]);
  }

  const pattern: boolean[] = [];
  const notes: number[] = [];

  for (let i = 0; i < 16; i++) {
    const interval = arpPattern[i];
    if (interval === -1) {
      // Rest
      pattern.push(false);
      notes.push(0);
    } else {
      pattern.push(true);
      // Map interval to scale note
      const baseNote = scaleNotes[0] + interval;
      notes.push(baseNote);
    }
  }

  return { pattern, notes };
}

// Generate drums from probabilities
function generateTranceDrums(style: TranceStyle, variation: number = 0.1): boolean[][] {
  const applyVariation = (probs: number[]) =>
    probs.map(p => (Math.random() < p + (Math.random() - 0.5) * variation ? true : false));

  return [
    applyVariation(TRANCE_DRUMS.kick[style]),
    applyVariation(TRANCE_DRUMS.snare[style]),
    applyVariation(TRANCE_DRUMS.hihat[style]),
    applyVariation(TRANCE_DRUMS.clap[style]),
  ];
}

// Preset recommendations per style
const TRANCE_PRESETS: Record<TranceStyle, string[]> = {
  hypnotic: ['acidBass', 'classicLead', 'darkPad'],
  uplifting: ['brightLead', 'warmPad', 'softPluck'],
  dark: ['darkPad', 'wobbleBass', 'stab'],
  progressive: ['warmPad', 'electricPiano', 'softPluck'],
  psytrance: ['acidBass', 'stab', 'brightLead'],
};

// Main trance pattern generator
export function generateTrancePattern(style: TranceStyle = 'hypnotic'): GeneratedPattern {
  const root = randomChoice(TRANCE_ROOTS);
  const scale = style === 'uplifting'
    ? randomChoice(['harmonicMinor', 'major'] as ScaleType[])
    : randomChoice(['minor', 'phrygian', 'dorian'] as ScaleType[]);

  const [minBpm, maxBpm] = TRANCE_BPM[style];
  const bpm = randomInt(minBpm, maxBpm);

  const octave = style === 'dark' ? 2 : style === 'uplifting' ? 4 : 3;
  const { pattern: synthPattern, notes: synthNotes } = generateTranceArp(style, root, scale, octave);
  const drumPatterns = generateTranceDrums(style);

  const presetName = randomChoice(TRANCE_PRESETS[style]);

  const styleNames: Record<TranceStyle, string> = {
    hypnotic: 'Hypnotic Trance',
    uplifting: 'Uplifting Trance',
    dark: 'Dark Trance',
    progressive: 'Progressive Trance',
    psytrance: 'Psytrance',
  };

  return {
    name: styleNames[style],
    synthPattern,
    synthNotes,
    drumPatterns,
    bpm,
    description: `${styleNames[style]} in ${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root]} ${scale} @ ${bpm} BPM`,
    key: { root, scale },
    synthPreset: presetName,
    swing: 0, // Trance is straight, no swing
  };
}

// Evolution/variation functions for live mode
export function evolvePattern(
  current: GeneratedPattern,
  intensity: number = 0.3
): GeneratedPattern {
  const evolved = { ...current };

  // Slight variation in synth pattern
  evolved.synthPattern = current.synthPattern.map((step) => {
    if (Math.random() < intensity * 0.3) {
      return !step;
    }
    return step;
  });

  // Slight variation in synth notes (stay in key)
  evolved.synthNotes = current.synthNotes.map((note) => {
    if (note > 0 && Math.random() < intensity * 0.2) {
      // Shift up or down by scale interval
      const shift = randomChoice([-7, -5, -3, 3, 5, 7, 12]);
      return note + shift;
    }
    return note;
  });

  // Drum variations (keep kick solid, vary others)
  evolved.drumPatterns = current.drumPatterns.map((pattern, drumIndex) => {
    if (drumIndex === 0) return pattern; // Keep kick solid
    return pattern.map((step) => {
      if (Math.random() < intensity * 0.2) {
        return !step;
      }
      return step;
    });
  });

  evolved.name = `${current.name} (Evolved)`;

  return evolved;
}

// Build-up generator (intensifies pattern)
export function createBuildUp(
  current: GeneratedPattern,
  bars: number = 2
): GeneratedPattern {
  const buildup = { ...current };

  // Extend patterns for build-up
  const extendedSynth: boolean[] = [];
  const extendedNotes: number[] = [];
  const extendedDrums: boolean[][] = [[], [], [], []];

  for (let bar = 0; bar < bars; bar++) {
    const intensity = (bar + 1) / bars; // 0.5, 1.0 for 2 bars

    for (let step = 0; step < 16; step++) {
      // Synth gets more notes as intensity increases
      const shouldPlay = current.synthPattern[step] || Math.random() < intensity * 0.3;
      extendedSynth.push(shouldPlay);
      extendedNotes.push(current.synthNotes[step] || 0);

      // Drums get busier
      current.drumPatterns.forEach((pattern, i) => {
        if (i === 0) {
          // Kick stays solid
          extendedDrums[i].push(pattern[step]);
        } else if (i === 1) {
          // Snare roll in last bar
          if (bar === bars - 1 && step >= 8) {
            extendedDrums[i].push(step % 2 === 0);
          } else {
            extendedDrums[i].push(pattern[step]);
          }
        } else if (i === 2) {
          // Hi-hats get busier
          extendedDrums[i].push(pattern[step] || Math.random() < intensity * 0.5);
        } else {
          extendedDrums[i].push(pattern[step]);
        }
      });
    }
  }

  buildup.synthPattern = extendedSynth;
  buildup.synthNotes = extendedNotes;
  buildup.drumPatterns = extendedDrums;
  buildup.name = `${current.name} (Build-Up)`;

  return buildup;
}

// Drop generator (full energy)
export function createDrop(style: TranceStyle = 'hypnotic'): GeneratedPattern {
  const drop = generateTrancePattern(style);

  // Make everything more intense
  drop.synthPattern = drop.synthPattern.map((step, i) => step || i % 2 === 0);
  drop.drumPatterns[2] = drop.drumPatterns[2].map(() => true); // Full hi-hats
  drop.name = `${drop.name} (DROP)`;

  return drop;
}

// Breakdown generator (minimal, atmospheric)
export function createBreakdown(
  current: GeneratedPattern
): GeneratedPattern {
  const breakdown = { ...current };

  // Remove kick and most drums
  breakdown.drumPatterns = [
    new Array(16).fill(false), // No kick
    current.drumPatterns[1].map((s, i) => i === 4 || i === 12 ? s : false), // Minimal snare
    current.drumPatterns[2].map((_s, i) => i % 4 === 2), // Sparse hi-hats
    new Array(16).fill(false), // No clap
  ];

  // Sparse synth
  breakdown.synthPattern = current.synthPattern.map((_s, i) => i % 8 === 0);
  breakdown.synthNotes = current.synthNotes.map((n, i) => i % 8 === 0 ? n : 0);

  breakdown.name = `${current.name} (Breakdown)`;
  breakdown.synthPreset = 'warmPad';

  return breakdown;
}

// Get all trance styles
export function getTranceStyles(): { value: TranceStyle; label: string }[] {
  return [
    { value: 'hypnotic', label: 'Hypnotic' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'dark', label: 'Dark' },
    { value: 'progressive', label: 'Progressive' },
    { value: 'psytrance', label: 'Psytrance' },
  ];
}
