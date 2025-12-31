# CLAUDE.md - AI Assistant Guide for Music-master-

This document provides guidance for AI assistants working on this codebase.

## Repository Overview

**Repository:** Music-master-
**Type:** Synth Loop & Percussion Beats UI Application
**Platform:** Web-based (Browser)

A browser-based music creation application featuring synthesizer loops and percussion/drum beat sequencing. Users can create, layer, and arrange synth patterns alongside drum beats through an intuitive visual interface.

## Core Features

- **Synthesizer Engine:** Oscillator-based synth with waveform selection, ADSR envelope, and effects
- **Drum Machine:** Sample-based percussion with multiple drum kit sounds
- **Step Sequencer:** Grid-based pattern editor for programming beats and melodies
- **Loop System:** Create, save, and layer multiple loops
- **Transport Controls:** Play, pause, stop, BPM control, metronome
- **Pattern Management:** Save, load, and arrange patterns into songs

## Project Structure

```
Music-master-/
├── CLAUDE.md              # AI assistant guidance (this file)
├── README.md              # Project documentation
├── index.html             # Main HTML entry point
├── src/
│   ├── components/        # UI components
│   │   ├── sequencer/     # Step sequencer grid UI
│   │   ├── controls/      # Transport, BPM, volume controls
│   │   ├── synth/         # Synth parameter controls (knobs, sliders)
│   │   └── drums/         # Drum pad UI and kit selector
│   ├── audio/
│   │   ├── engine/        # Core audio engine (AudioContext management)
│   │   ├── synth/         # Synthesizer (oscillators, filters, envelopes)
│   │   ├── drums/         # Drum sampler and triggering
│   │   ├── effects/       # Audio effects (reverb, delay, distortion)
│   │   └── scheduler/     # Timing and loop scheduling
│   ├── state/             # Application state management
│   ├── utils/             # Utility functions
│   └── styles/            # CSS/styling
├── assets/
│   ├── samples/           # Drum samples and audio files
│   └── icons/             # UI icons
├── tests/                 # Test files
└── dist/                  # Built/bundled output
```

## Technical Stack

### Audio
- **Web Audio API:** Core audio processing and synthesis
- **AudioContext:** Central audio graph management
- **OscillatorNode:** Synth sound generation
- **AudioBufferSourceNode:** Drum sample playback
- **GainNode, BiquadFilterNode:** Volume and filtering

### Timing
- **AudioContext.currentTime:** High-precision scheduling
- **requestAnimationFrame:** UI sync with audio
- **Web Worker (optional):** Background timing for stability

## Development Guidelines

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd Music-master-

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Code Conventions

- **File Naming:** Use kebab-case (e.g., `step-sequencer.js`, `drum-sampler.js`)
- **Functions/Variables:** camelCase (e.g., `playNote`, `currentBpm`)
- **Classes/Components:** PascalCase (e.g., `Synthesizer`, `DrumMachine`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_BPM`, `MAX_STEPS`)
- **Audio Parameters:** Use descriptive names (e.g., `attackTime`, `filterCutoff`)

### Git Workflow

- Create feature branches from `main`
- Conventional commit messages:
  - `feat:` new features (e.g., `feat: add reverb effect`)
  - `fix:` bug fixes (e.g., `fix: timing drift on loop restart`)
  - `docs:` documentation
  - `refactor:` code improvements
  - `test:` test additions
  - `chore:` maintenance

## Audio Development Guidelines

### Web Audio API Best Practices

1. **Single AudioContext:** Create one AudioContext instance, reuse it
2. **User Gesture Requirement:** Resume AudioContext on first user interaction
3. **Proper Cleanup:** Disconnect and stop nodes when not in use
4. **Scheduling:** Use `audioContext.currentTime` for precise timing, not `setTimeout`

### Synthesizer Implementation

```javascript
// Example: Basic synth note structure
- Create OscillatorNode with waveform (sine, square, sawtooth, triangle)
- Connect through GainNode for ADSR envelope
- Apply filter via BiquadFilterNode
- Connect to master output/effects chain
```

### Drum Machine Implementation

```javascript
// Example: Drum trigger structure
- Load samples into AudioBuffers on init
- Create new AudioBufferSourceNode per hit (they're one-shot)
- Apply velocity via GainNode
- Connect to drum bus for group processing
```

### Sequencer Timing

- **Look-ahead scheduling:** Schedule notes ~100ms ahead
- **Tick resolution:** 16th notes minimum (16 steps per bar typical)
- **BPM calculation:** `stepDuration = 60 / bpm / 4` (for 16th notes)
- **Swing:** Offset even steps for groove feel

### Common Audio Pitfalls

- AudioBufferSourceNodes can only be played once - create new instances
- Don't start/stop oscillators rapidly - use gain envelope instead
- Avoid clicks - ramp gain to zero before stopping
- Mobile browsers may have stricter autoplay policies

## AI Assistant Instructions

### When Working on This Repository

1. **Understand Audio Flow:** Trace signal path from source to output
2. **Timing is Critical:** Be precise with scheduling code
3. **Test in Browser:** Audio code must be tested in actual browser
4. **Memory Leaks:** Ensure audio nodes are properly disconnected
5. **Cross-browser:** Test AudioContext compatibility

### Key Architecture Decisions

- **Separation of Concerns:** Keep audio engine separate from UI
- **State Management:** Centralize pattern/sequence data
- **Event-Driven:** UI triggers audio events, doesn't directly manipulate audio
- **Modular Effects:** Effects chain should be configurable

### Common Tasks

#### Adding a New Synth Waveform/Sound
1. Add oscillator type or wavetable to synth engine
2. Update UI controls to expose new option
3. Ensure proper gain staging
4. Test for clicks/pops during transitions

#### Adding a New Drum Sound
1. Add sample file to `assets/samples/`
2. Register in drum kit configuration
3. Map to pad/sequencer step
4. Adjust gain to match existing sounds

#### Fixing Timing Issues
1. Check scheduling look-ahead buffer
2. Verify BPM calculations
3. Ensure AudioContext isn't suspended
4. Check for garbage collection pauses (use Web Worker if needed)

#### Adding Effects
1. Create effect node chain (input → effect → output)
2. Implement wet/dry mix control
3. Add bypass functionality
4. Connect to appropriate bus (synth, drums, master)

### Key Files to Review

- Main audio engine initialization
- Sequencer/scheduler implementation
- Synth and drum sound generation
- State management for patterns
- Main UI component structure

## Dependencies (Recommended)

```json
{
  "dependencies": {
    "tone": "^14.x"        // Optional: High-level Web Audio framework
  },
  "devDependencies": {
    "vite": "^5.x",        // Fast build tool
    "vitest": "^1.x"       // Testing framework
  }
}
```

**Note:** Can be built with vanilla Web Audio API for smaller bundle size.

## Testing

- **Unit Tests:** Audio utility functions, BPM calculations, pattern data
- **Integration Tests:** Sequencer timing, audio node connections
- **Manual Testing:** Actual audio output, latency, cross-browser
- **Performance:** Monitor CPU usage during playback

## Browser Compatibility

- Chrome/Edge: Full Web Audio API support
- Firefox: Full support
- Safari: May need webkit prefix, stricter autoplay
- Mobile: Touch events, reduced polyphony, autoplay restrictions

## Performance Considerations

- Limit polyphony (simultaneous voices)
- Use AudioWorklet for custom DSP (if needed)
- Efficient DOM updates (don't re-render on every tick)
- Consider Web Worker for timing stability

---

*Update this document as the project evolves. AI assistants should reference this for context on audio architecture and conventions.*
