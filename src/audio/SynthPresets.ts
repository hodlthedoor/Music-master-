// Synth Presets - Different sound character configurations

import { SynthParams, WaveformType } from './AudioEngine';

export interface SynthPreset extends SynthParams {
  name: string;
  description: string;
  category: 'bass' | 'lead' | 'pad' | 'pluck' | 'keys' | 'fx';
  octaveOffset: number; // Relative to base note
  detune: number; // Cents of detuning for fatness
  useSecondOsc: boolean;
  secondOscWaveform?: WaveformType;
  secondOscDetune?: number;
  secondOscMix?: number; // 0-1
  distortion?: number; // 0-1
  reverbMix?: number; // 0-1 (for future use)
}

export const SYNTH_PRESETS: Record<string, SynthPreset> = {
  // Bass Sounds
  deepBass: {
    name: 'Deep Bass',
    description: 'Deep sub bass for heavy beats',
    category: 'bass',
    waveform: 'sine',
    attack: 0.01,
    decay: 0.3,
    sustain: 0.8,
    release: 0.2,
    filterCutoff: 200,
    filterResonance: 0.5,
    octaveOffset: -2,
    detune: 0,
    useSecondOsc: false,
  },

  punchyBass: {
    name: 'Punchy Bass',
    description: 'Snappy bass with attack',
    category: 'bass',
    waveform: 'square',
    attack: 0.001,
    decay: 0.15,
    sustain: 0.4,
    release: 0.1,
    filterCutoff: 800,
    filterResonance: 2,
    octaveOffset: -1,
    detune: 5,
    useSecondOsc: true,
    secondOscWaveform: 'sine',
    secondOscDetune: -1200, // One octave down
    secondOscMix: 0.5,
  },

  wobbleBass: {
    name: 'Wobble Bass',
    description: 'Dubstep-style wobble bass',
    category: 'bass',
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.15,
    filterCutoff: 1500,
    filterResonance: 8,
    octaveOffset: -1,
    detune: 10,
    useSecondOsc: true,
    secondOscWaveform: 'square',
    secondOscDetune: 7, // Slightly detuned
    secondOscMix: 0.3,
  },

  acidBass: {
    name: 'Acid Bass',
    description: '303-style acid bass',
    category: 'bass',
    waveform: 'sawtooth',
    attack: 0.001,
    decay: 0.2,
    sustain: 0.3,
    release: 0.1,
    filterCutoff: 600,
    filterResonance: 15,
    octaveOffset: -1,
    detune: 0,
    useSecondOsc: false,
  },

  // Lead Sounds
  classicLead: {
    name: 'Classic Lead',
    description: 'Smooth synth lead',
    category: 'lead',
    waveform: 'sawtooth',
    attack: 0.02,
    decay: 0.2,
    sustain: 0.6,
    release: 0.3,
    filterCutoff: 3000,
    filterResonance: 2,
    octaveOffset: 0,
    detune: 10,
    useSecondOsc: true,
    secondOscWaveform: 'sawtooth',
    secondOscDetune: -10,
    secondOscMix: 0.5,
  },

  brightLead: {
    name: 'Bright Lead',
    description: 'Cutting bright lead',
    category: 'lead',
    waveform: 'square',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    filterCutoff: 5000,
    filterResonance: 1,
    octaveOffset: 1,
    detune: 5,
    useSecondOsc: false,
  },

  retroLead: {
    name: 'Retro Lead',
    description: '80s style synth lead',
    category: 'lead',
    waveform: 'square',
    attack: 0.05,
    decay: 0.3,
    sustain: 0.5,
    release: 0.4,
    filterCutoff: 2500,
    filterResonance: 3,
    octaveOffset: 0,
    detune: 15,
    useSecondOsc: true,
    secondOscWaveform: 'sawtooth',
    secondOscDetune: 7,
    secondOscMix: 0.4,
  },

  // Pluck Sounds
  sharpPluck: {
    name: 'Sharp Pluck',
    description: 'Short plucky sound',
    category: 'pluck',
    waveform: 'triangle',
    attack: 0.001,
    decay: 0.15,
    sustain: 0.1,
    release: 0.1,
    filterCutoff: 4000,
    filterResonance: 1,
    octaveOffset: 0,
    detune: 0,
    useSecondOsc: false,
  },

  softPluck: {
    name: 'Soft Pluck',
    description: 'Mellow pluck sound',
    category: 'pluck',
    waveform: 'sine',
    attack: 0.005,
    decay: 0.3,
    sustain: 0.2,
    release: 0.3,
    filterCutoff: 2000,
    filterResonance: 0.5,
    octaveOffset: 0,
    detune: 3,
    useSecondOsc: true,
    secondOscWaveform: 'triangle',
    secondOscDetune: 1200, // Octave up
    secondOscMix: 0.2,
  },

  // Pad Sounds
  warmPad: {
    name: 'Warm Pad',
    description: 'Warm ambient pad',
    category: 'pad',
    waveform: 'sawtooth',
    attack: 0.5,
    decay: 0.5,
    sustain: 0.8,
    release: 1.0,
    filterCutoff: 1500,
    filterResonance: 0.5,
    octaveOffset: 0,
    detune: 20,
    useSecondOsc: true,
    secondOscWaveform: 'sawtooth',
    secondOscDetune: -20,
    secondOscMix: 0.5,
  },

  darkPad: {
    name: 'Dark Pad',
    description: 'Dark atmospheric pad',
    category: 'pad',
    waveform: 'square',
    attack: 0.8,
    decay: 0.3,
    sustain: 0.9,
    release: 1.5,
    filterCutoff: 800,
    filterResonance: 1,
    octaveOffset: -1,
    detune: 15,
    useSecondOsc: true,
    secondOscWaveform: 'sine',
    secondOscDetune: -1200, // Octave down
    secondOscMix: 0.4,
  },

  // Keys
  electricPiano: {
    name: 'Electric Piano',
    description: 'Classic electric piano',
    category: 'keys',
    waveform: 'sine',
    attack: 0.01,
    decay: 0.4,
    sustain: 0.3,
    release: 0.5,
    filterCutoff: 3000,
    filterResonance: 0.3,
    octaveOffset: 0,
    detune: 2,
    useSecondOsc: true,
    secondOscWaveform: 'sine',
    secondOscDetune: 1200, // Octave up
    secondOscMix: 0.3,
  },

  organ: {
    name: 'Organ',
    description: 'Classic organ sound',
    category: 'keys',
    waveform: 'sine',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.9,
    release: 0.1,
    filterCutoff: 5000,
    filterResonance: 0.2,
    octaveOffset: 0,
    detune: 0,
    useSecondOsc: true,
    secondOscWaveform: 'sine',
    secondOscDetune: 1200, // Octave up
    secondOscMix: 0.6,
  },

  // FX
  riser: {
    name: 'Riser',
    description: 'Building tension riser',
    category: 'fx',
    waveform: 'sawtooth',
    attack: 2.0,
    decay: 0.1,
    sustain: 0.9,
    release: 0.5,
    filterCutoff: 500,
    filterResonance: 5,
    octaveOffset: 0,
    detune: 30,
    useSecondOsc: true,
    secondOscWaveform: 'sawtooth',
    secondOscDetune: -30,
    secondOscMix: 0.5,
  },

  stab: {
    name: 'Stab',
    description: 'Punchy chord stab',
    category: 'fx',
    waveform: 'sawtooth',
    attack: 0.001,
    decay: 0.1,
    sustain: 0.3,
    release: 0.15,
    filterCutoff: 4000,
    filterResonance: 3,
    octaveOffset: 0,
    detune: 8,
    useSecondOsc: true,
    secondOscWaveform: 'square',
    secondOscDetune: 5,
    secondOscMix: 0.4,
  },
};

// Get presets by category
export function getPresetsByCategory(category: SynthPreset['category']): SynthPreset[] {
  return Object.values(SYNTH_PRESETS).filter(p => p.category === category);
}

// Get all preset names
export function getPresetNames(): string[] {
  return Object.keys(SYNTH_PRESETS);
}

// Get preset by name
export function getPreset(name: string): SynthPreset | undefined {
  return SYNTH_PRESETS[name];
}

// Get random preset from category
export function getRandomPreset(category?: SynthPreset['category']): SynthPreset {
  const presets = category
    ? getPresetsByCategory(category)
    : Object.values(SYNTH_PRESETS);
  return presets[Math.floor(Math.random() * presets.length)];
}

// Genre to preset mapping suggestions
export const GENRE_PRESETS: Record<string, { bass: string; lead: string; pad?: string }> = {
  rock: { bass: 'punchyBass', lead: 'classicLead' },
  hiphop: { bass: 'deepBass', lead: 'retroLead' },
  electronic: { bass: 'wobbleBass', lead: 'brightLead', pad: 'warmPad' },
  funk: { bass: 'punchyBass', lead: 'retroLead' },
  latin: { bass: 'deepBass', lead: 'electricPiano' },
  jazz: { bass: 'deepBass', lead: 'electricPiano', pad: 'warmPad' },
  trap: { bass: 'deepBass', lead: 'brightLead' },
  house: { bass: 'acidBass', lead: 'classicLead', pad: 'darkPad' },
  dubstep: { bass: 'wobbleBass', lead: 'stab' },
  ambient: { bass: 'deepBass', lead: 'softPluck', pad: 'darkPad' },
};
