// Audio Engine - Core audio context and routing
import { SYNTH_PRESETS, getPreset } from './SynthPresets';
import { midiToFreq } from '../utils/MusicTheory';

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface SynthParams {
  waveform: WaveformType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  filterResonance: number;
}

export interface ChannelState {
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export interface DrumSound {
  name: string;
  frequency?: number;
  decay?: number;
  type: 'synth' | 'noise';
}

// Extended synth parameters for presets
export interface ExtendedSynthParams extends SynthParams {
  octaveOffset: number;
  detune: number;
  useSecondOsc: boolean;
  secondOscWaveform?: WaveformType;
  secondOscDetune?: number;
  secondOscMix?: number;
  distortion?: number;
}

const DRUM_SOUNDS: DrumSound[] = [
  { name: 'Kick', frequency: 60, decay: 0.5, type: 'synth' },
  { name: 'Snare', decay: 0.2, type: 'noise' },
  { name: 'Hi-Hat', decay: 0.05, type: 'noise' },
  { name: 'Clap', decay: 0.15, type: 'noise' },
];

class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private synthGain: GainNode | null = null;
  private drumGains: GainNode[] = [];
  private synthPan: StereoPannerNode | null = null;
  private drumPans: StereoPannerNode[] = [];
  private analyser: AnalyserNode | null = null;
  private synthAnalyser: AnalyserNode | null = null;
  private drumAnalysers: AnalyserNode[] = [];

  private isPlaying = false;
  private currentStep = 0;
  private bpm = 120;
  private scheduleAheadTime = 0.1;
  private lookahead = 25;
  private nextNoteTime = 0;
  private timerID: number | null = null;

  private synthPattern: boolean[] = new Array(16).fill(false);
  private synthNotes: number[] = new Array(16).fill(55); // MIDI notes per step
  private drumPatterns: boolean[][] = DRUM_SOUNDS.map(() => new Array(16).fill(false));
  private swing: number = 0; // 0-1, amount of swing

  private synthParams: SynthParams = {
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
    filterCutoff: 2000,
    filterResonance: 1,
  };

  // Extended synth params for rich sounds
  private extendedParams: ExtendedSynthParams = {
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
    filterCutoff: 2000,
    filterResonance: 1,
    octaveOffset: 0,
    detune: 0,
    useSecondOsc: false,
    secondOscWaveform: 'sawtooth',
    secondOscDetune: 0,
    secondOscMix: 0.5,
    distortion: 0,
  };

  private currentPresetName: string = 'classicLead';

  private channelStates: ChannelState[] = [
    { volume: 0.8, pan: 0, mute: false, solo: false }, // Synth
    { volume: 0.9, pan: 0, mute: false, solo: false }, // Kick
    { volume: 0.7, pan: 0, mute: false, solo: false }, // Snare
    { volume: 0.6, pan: 0.3, mute: false, solo: false }, // Hi-Hat
    { volume: 0.5, pan: -0.3, mute: false, solo: false }, // Clap
  ];

  private masterVolume = 0.8;
  private synthNote = 55; // A1

  private stepCallback: ((step: number) => void) | null = null;
  private levelCallback: ((levels: number[]) => void) | null = null;

  async init(): Promise<void> {
    if (this.context) return;

    this.context = new AudioContext();

    // Create master chain
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.masterVolume;

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    // Create synth channel
    this.synthGain = this.context.createGain();
    this.synthPan = this.context.createStereoPanner();
    this.synthAnalyser = this.context.createAnalyser();
    this.synthAnalyser.fftSize = 256;

    this.synthGain.connect(this.synthPan);
    this.synthPan.connect(this.synthAnalyser);
    this.synthAnalyser.connect(this.masterGain);

    this.updateChannelState(0);

    // Create drum channels
    for (let i = 0; i < DRUM_SOUNDS.length; i++) {
      const gain = this.context.createGain();
      const pan = this.context.createStereoPanner();
      const analyser = this.context.createAnalyser();
      analyser.fftSize = 256;

      gain.connect(pan);
      pan.connect(analyser);
      analyser.connect(this.masterGain);

      this.drumGains.push(gain);
      this.drumPans.push(pan);
      this.drumAnalysers.push(analyser);

      this.updateChannelState(i + 1);
    }

    // Start level monitoring
    this.startLevelMonitoring();
  }

  private startLevelMonitoring(): void {
    const updateLevels = () => {
      if (!this.levelCallback) {
        requestAnimationFrame(updateLevels);
        return;
      }

      const levels: number[] = [];

      // Synth level
      if (this.synthAnalyser) {
        const data = new Uint8Array(this.synthAnalyser.frequencyBinCount);
        this.synthAnalyser.getByteFrequencyData(data);
        levels.push(Math.max(...data) / 255);
      }

      // Drum levels
      for (const analyser of this.drumAnalysers) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        levels.push(Math.max(...data) / 255);
      }

      // Master level
      if (this.analyser) {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        levels.push(Math.max(...data) / 255);
      }

      this.levelCallback(levels);
      requestAnimationFrame(updateLevels);
    };

    requestAnimationFrame(updateLevels);
  }

  private updateChannelState(channelIndex: number): void {
    const state = this.channelStates[channelIndex];

    // Check if any channel is soloed
    const anySolo = this.channelStates.some(ch => ch.solo);
    const shouldMute = state.mute || (anySolo && !state.solo);

    if (channelIndex === 0 && this.synthGain && this.synthPan) {
      this.synthGain.gain.value = shouldMute ? 0 : state.volume;
      this.synthPan.pan.value = state.pan;
    } else {
      const drumIndex = channelIndex - 1;
      if (this.drumGains[drumIndex] && this.drumPans[drumIndex]) {
        this.drumGains[drumIndex].gain.value = shouldMute ? 0 : state.volume;
        this.drumPans[drumIndex].pan.value = state.pan;
      }
    }
  }

  private scheduler(): void {
    if (!this.context || !this.isPlaying) return;

    while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private scheduleStep(step: number, time: number): void {
    if (!this.context) return;

    // Apply swing to even 16th notes (2, 6, 10, 14)
    let swungTime = time;
    if (this.swing > 0 && step % 4 === 2) {
      const swingAmount = (60 / this.bpm / 4) * this.swing * 0.5; // Max 50% of 16th note
      swungTime += swingAmount;
    }

    // Notify UI of current step
    if (this.stepCallback) {
      setTimeout(() => this.stepCallback?.(step), (time - this.context!.currentTime) * 1000);
    }

    // Play synth if step is active
    if (this.synthPattern[step]) {
      this.playSynthNoteWithPreset(step, swungTime);
    }

    // Play drums if steps are active
    for (let i = 0; i < DRUM_SOUNDS.length; i++) {
      if (this.drumPatterns[i][step]) {
        this.playDrumSound(i, swungTime);
      }
    }
  }

  private playSynthNote(time: number): void {
    if (!this.context || !this.synthGain) return;

    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = this.synthParams.waveform;
    osc.frequency.value = this.synthNote;

    filter.type = 'lowpass';
    filter.frequency.value = this.synthParams.filterCutoff;
    filter.Q.value = this.synthParams.filterResonance;

    const { attack, decay, sustain, release } = this.synthParams;
    const noteLength = 60 / this.bpm / 4; // 16th note duration

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(1, time + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, time + attack + decay);
    gainNode.gain.setValueAtTime(sustain, time + noteLength - release);
    gainNode.gain.linearRampToValueAtTime(0, time + noteLength);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.synthGain);

    osc.start(time);
    osc.stop(time + noteLength + 0.1);
  }

  // Enhanced synth note with preset support, per-step notes, and second oscillator
  private playSynthNoteWithPreset(step: number, time: number): void {
    if (!this.context || !this.synthGain) return;

    const params = this.extendedParams;
    const midiNote = this.synthNotes[step] || this.synthNote;

    // Apply octave offset from preset
    const adjustedMidi = midiNote + (params.octaveOffset * 12);
    const frequency = midiToFreq(adjustedMidi);

    const noteLength = 60 / this.bpm / 4; // 16th note duration
    const { attack, decay, sustain, release } = params;

    // Create master gain for this note
    const masterGain = this.context.createGain();
    masterGain.connect(this.synthGain);

    // Create filter
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params.filterCutoff;
    filter.Q.value = params.filterResonance;
    filter.connect(masterGain);

    // Optional distortion
    let distortionNode: WaveShaperNode | null = null;
    if (params.distortion && params.distortion > 0) {
      distortionNode = this.context.createWaveShaper();
      distortionNode.curve = this.makeDistortionCurve(params.distortion * 100);
      distortionNode.oversample = '2x';
    }

    // Create primary oscillator
    const osc1 = this.context.createOscillator();
    const osc1Gain = this.context.createGain();

    osc1.type = params.waveform;
    osc1.frequency.value = frequency;
    osc1.detune.value = params.detune;

    osc1Gain.gain.value = params.useSecondOsc ? (1 - (params.secondOscMix || 0.5)) : 1;

    osc1.connect(osc1Gain);
    if (distortionNode) {
      osc1Gain.connect(distortionNode);
      distortionNode.connect(filter);
    } else {
      osc1Gain.connect(filter);
    }

    // Create second oscillator if enabled
    let osc2: OscillatorNode | null = null;
    if (params.useSecondOsc && params.secondOscWaveform) {
      osc2 = this.context.createOscillator();
      const osc2Gain = this.context.createGain();

      osc2.type = params.secondOscWaveform;
      osc2.frequency.value = frequency;
      osc2.detune.value = params.secondOscDetune || 0;

      osc2Gain.gain.value = params.secondOscMix || 0.5;

      osc2.connect(osc2Gain);
      if (distortionNode) {
        osc2Gain.connect(distortionNode);
      } else {
        osc2Gain.connect(filter);
      }
    }

    // Apply ADSR envelope to master gain
    masterGain.gain.setValueAtTime(0, time);
    masterGain.gain.linearRampToValueAtTime(1, time + attack);
    masterGain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
    masterGain.gain.setValueAtTime(sustain, time + noteLength - release);
    masterGain.gain.linearRampToValueAtTime(0, time + noteLength);

    // Start and stop oscillators
    osc1.start(time);
    osc1.stop(time + noteLength + 0.1);

    if (osc2) {
      osc2.start(time);
      osc2.stop(time + noteLength + 0.1);
    }
  }

  // Create distortion curve for waveshaper
  private makeDistortionCurve(amount: number): Float32Array {
    const k = amount;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    return curve;
  }

  private playDrumSound(drumIndex: number, time: number): void {
    if (!this.context || !this.drumGains[drumIndex]) return;

    const drum = DRUM_SOUNDS[drumIndex];

    if (drum.type === 'synth' && drum.frequency) {
      // Kick drum - sine wave with pitch envelope
      const osc = this.context.createOscillator();
      const gainNode = this.context.createGain();

      osc.frequency.setValueAtTime(drum.frequency * 2, time);
      osc.frequency.exponentialRampToValueAtTime(drum.frequency, time + 0.05);

      gainNode.gain.setValueAtTime(1, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + (drum.decay || 0.5));

      osc.connect(gainNode);
      gainNode.connect(this.drumGains[drumIndex]);

      osc.start(time);
      osc.stop(time + (drum.decay || 0.5));
    } else {
      // Noise-based drums (snare, hi-hat, clap)
      const bufferSize = this.context.sampleRate * (drum.decay || 0.2);
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      noise.buffer = buffer;

      // Different filter settings for different drums
      if (drum.name === 'Hi-Hat') {
        filter.type = 'highpass';
        filter.frequency.value = 7000;
      } else if (drum.name === 'Snare') {
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 0.5;
      } else {
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
      }

      gainNode.gain.setValueAtTime(0.8, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + (drum.decay || 0.2));

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.drumGains[drumIndex]);

      noise.start(time);
    }
  }

  private advanceStep(): void {
    const secondsPerBeat = 60 / this.bpm;
    this.nextNoteTime += secondsPerBeat / 4; // 16th notes
    this.currentStep = (this.currentStep + 1) % 16;
  }

  // Public API

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  play(): void {
    if (!this.context) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.context.currentTime;
    this.scheduler();
  }

  stop(): void {
    this.isPlaying = false;
    this.currentStep = 0;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.stepCallback) {
      this.stepCallback(-1);
    }
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(60, Math.min(200, bpm));
  }

  getBpm(): number {
    return this.bpm;
  }

  setSynthPattern(pattern: boolean[]): void {
    this.synthPattern = [...pattern];
  }

  getSynthPattern(): boolean[] {
    return [...this.synthPattern];
  }

  setDrumPattern(drumIndex: number, pattern: boolean[]): void {
    if (drumIndex >= 0 && drumIndex < this.drumPatterns.length) {
      this.drumPatterns[drumIndex] = [...pattern];
    }
  }

  getDrumPatterns(): boolean[][] {
    return this.drumPatterns.map(p => [...p]);
  }

  getDrumSounds(): DrumSound[] {
    return DRUM_SOUNDS;
  }

  setSynthParams(params: Partial<SynthParams>): void {
    this.synthParams = { ...this.synthParams, ...params };
  }

  getSynthParams(): SynthParams {
    return { ...this.synthParams };
  }

  setSynthNote(note: number): void {
    this.synthNote = note;
  }

  getSynthNote(): number {
    return this.synthNote;
  }

  // Per-step MIDI notes (for melodies)
  setSynthNotes(notes: number[]): void {
    this.synthNotes = [...notes];
  }

  getSynthNotes(): number[] {
    return [...this.synthNotes];
  }

  // Swing (0-1)
  setSwing(amount: number): void {
    this.swing = Math.max(0, Math.min(1, amount));
  }

  getSwing(): number {
    return this.swing;
  }

  // Apply a synth preset
  applySynthPreset(presetName: string): void {
    const preset = getPreset(presetName);
    if (preset) {
      this.currentPresetName = presetName;
      this.extendedParams = {
        waveform: preset.waveform,
        attack: preset.attack,
        decay: preset.decay,
        sustain: preset.sustain,
        release: preset.release,
        filterCutoff: preset.filterCutoff,
        filterResonance: preset.filterResonance,
        octaveOffset: preset.octaveOffset,
        detune: preset.detune,
        useSecondOsc: preset.useSecondOsc,
        secondOscWaveform: preset.secondOscWaveform,
        secondOscDetune: preset.secondOscDetune,
        secondOscMix: preset.secondOscMix,
        distortion: preset.distortion,
      };
      // Also update basic params for compatibility
      this.synthParams = {
        waveform: preset.waveform,
        attack: preset.attack,
        decay: preset.decay,
        sustain: preset.sustain,
        release: preset.release,
        filterCutoff: preset.filterCutoff,
        filterResonance: preset.filterResonance,
      };
    }
  }

  getCurrentPresetName(): string {
    return this.currentPresetName;
  }

  getAvailablePresets(): string[] {
    return Object.keys(SYNTH_PRESETS);
  }

  setChannelVolume(channelIndex: number, volume: number): void {
    if (channelIndex >= 0 && channelIndex < this.channelStates.length) {
      this.channelStates[channelIndex].volume = volume;
      this.updateChannelState(channelIndex);
    }
  }

  setChannelPan(channelIndex: number, pan: number): void {
    if (channelIndex >= 0 && channelIndex < this.channelStates.length) {
      this.channelStates[channelIndex].pan = pan;
      this.updateChannelState(channelIndex);
    }
  }

  setChannelMute(channelIndex: number, mute: boolean): void {
    if (channelIndex >= 0 && channelIndex < this.channelStates.length) {
      this.channelStates[channelIndex].mute = mute;
      // Update all channels because solo logic affects others
      for (let i = 0; i < this.channelStates.length; i++) {
        this.updateChannelState(i);
      }
    }
  }

  setChannelSolo(channelIndex: number, solo: boolean): void {
    if (channelIndex >= 0 && channelIndex < this.channelStates.length) {
      this.channelStates[channelIndex].solo = solo;
      // Update all channels because solo affects others
      for (let i = 0; i < this.channelStates.length; i++) {
        this.updateChannelState(i);
      }
    }
  }

  getChannelStates(): ChannelState[] {
    return this.channelStates.map(s => ({ ...s }));
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  onStep(callback: (step: number) => void): void {
    this.stepCallback = callback;
  }

  onLevels(callback: (levels: number[]) => void): void {
    this.levelCallback = callback;
  }

  triggerDrum(drumIndex: number): void {
    if (!this.context || drumIndex < 0 || drumIndex >= DRUM_SOUNDS.length) return;
    this.playDrumSound(drumIndex, this.context.currentTime);
  }

  triggerSynth(): void {
    if (!this.context) return;
    this.playSynthNote(this.context.currentTime);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
