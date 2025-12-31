# CLAUDE.md - AI Assistant Guide for Music-master-

This document provides guidance for AI assistants working on this codebase.

## Repository Overview

**Repository:** Music-master-
**Type:** Synth Loop & Percussion Beats UI Application
**Platform:** Web-based (Browser), Responsive Design
**Live Demo:** [Vercel Deployment](https://music-master.vercel.app)

A browser-based music creation application featuring synthesizer loops, percussion/drum beat sequencing, and a professional mixer interface. Users can create, layer, and arrange synth patterns alongside drum beats through an intuitive, responsive visual interface that works on desktop and mobile devices.

## Core Features

- **Synthesizer Engine:** Oscillator-based synth with waveform selection, ADSR envelope, and effects
- **Drum Machine:** Sample-based percussion with multiple drum kit sounds
- **Step Sequencer:** Grid-based pattern editor for programming beats and melodies
- **Mixer Console:** Professional mixing interface with channel strips, faders, and controls
- **Loop System:** Create, save, and layer multiple loops
- **Transport Controls:** Play, pause, stop, BPM control, metronome
- **Pattern Management:** Save, load, and arrange patterns into songs
- **Responsive UI:** Fully adaptive interface for desktop, tablet, and mobile

## Mixer Features

### Channel Strip Components
- **Volume Fader:** Vertical slider for level control (0 to +6dB range)
- **Pan Knob:** Stereo positioning control (-100L to +100R)
- **Mute Button:** Silence channel without losing settings
- **Solo Button:** Isolate channel(s) for focused listening
- **VU Meter:** Real-time level visualization with peak indicators
- **Channel Label:** Editable track name

### Mixer Channels
- **Synth Channels:** Individual channels per synth voice/layer
- **Drum Channels:** Separate channels for kick, snare, hi-hat, etc.
- **Effect Returns:** Aux channels for reverb, delay sends
- **Master Bus:** Final output with master fader and metering

### Mixer Audio Flow
```
Source → Channel Gain → Pan → Mute → Channel Fader →
  → Effect Sends → Master Bus → Master Fader → Output
```

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
│   │   ├── drums/         # Drum pad UI and kit selector
│   │   ├── mixer/         # Mixer console UI
│   │   │   ├── channel-strip.js    # Individual channel component
│   │   │   ├── fader.js            # Volume fader control
│   │   │   ├── pan-knob.js         # Pan rotary control
│   │   │   ├── vu-meter.js         # Level meter display
│   │   │   ├── mute-solo.js        # Mute/solo buttons
│   │   │   └── master-bus.js       # Master channel strip
│   │   └── common/        # Shared UI components (knobs, buttons, sliders)
│   ├── audio/
│   │   ├── engine/        # Core audio engine (AudioContext management)
│   │   ├── synth/         # Synthesizer (oscillators, filters, envelopes)
│   │   ├── drums/         # Drum sampler and triggering
│   │   ├── mixer/         # Mixer audio routing and processing
│   │   ├── effects/       # Audio effects (reverb, delay, distortion)
│   │   └── scheduler/     # Timing and loop scheduling
│   ├── state/             # Application state management
│   ├── utils/             # Utility functions
│   └── styles/            # CSS/styling
│       ├── base/          # Reset, variables, typography
│       ├── components/    # Component-specific styles
│       ├── layout/        # Grid, flexbox layouts
│       └── responsive/    # Breakpoint-specific styles
├── assets/
│   ├── samples/           # Drum samples and audio files
│   └── icons/             # UI icons (SVG preferred)
├── tests/                 # Test files
└── dist/                  # Built/bundled output
```

## Responsive UI Design

### Design Principles

1. **Mobile-First:** Start with mobile layout, enhance for larger screens
2. **Touch-Friendly:** Minimum 44px touch targets, gesture support
3. **Fluid Layouts:** Use relative units (%, rem, vw/vh) over fixed pixels
4. **Progressive Enhancement:** Core functionality works everywhere, enhanced on capable devices

### Breakpoints

```css
/* Mobile first - base styles for smallest screens */

/* Small tablets and large phones */
@media (min-width: 576px) { }

/* Tablets */
@media (min-width: 768px) { }

/* Desktops */
@media (min-width: 992px) { }

/* Large desktops */
@media (min-width: 1200px) { }
```

### Layout Adaptations

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sequencer | 8 steps visible, scroll | 16 steps | 16-32 steps |
| Mixer | Horizontal scroll, 2-3 channels visible | 4-6 channels | Full mixer view |
| Drum Pads | 2x4 grid | 4x4 grid | 4x4 grid with velocity |
| Transport | Compact, essential controls | Full controls | Full with keyboard shortcuts |
| Synth Controls | Accordion/tabs | Side panel | Always visible |

### Touch & Gesture Support

- **Faders:** Vertical drag, with momentum
- **Knobs:** Rotary drag or vertical drag for precision
- **Pads:** Touch with velocity based on pressure (if available)
- **Sequencer:** Tap to toggle, drag to paint multiple steps
- **Pinch-to-zoom:** On sequencer grid (optional)

### UI Component Guidelines

#### Faders
```css
.fader {
  width: 60px;          /* Wide enough for touch */
  height: 150px;        /* Tall for precision */
  touch-action: none;   /* Prevent scroll interference */
}
```

#### Knobs
```css
.knob {
  width: 50px;
  height: 50px;
  /* Use CSS transforms for rotation */
  /* Show value tooltip on interaction */
}
```

#### Buttons
```css
.control-button {
  min-width: 44px;
  min-height: 44px;
  /* Clear visual feedback for active state */
}
```

### CSS Architecture

- **CSS Custom Properties:** For theming and dynamic values
- **BEM Naming:** `.mixer__channel--muted`
- **Logical Properties:** Use `inline-size` over `width` for RTL support
- **Container Queries:** For component-level responsiveness (where supported)

```css
:root {
  /* Colors */
  --color-bg-primary: #1a1a2e;
  --color-bg-secondary: #16213e;
  --color-accent: #e94560;
  --color-meter-green: #00ff88;
  --color-meter-yellow: #ffcc00;
  --color-meter-red: #ff4444;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Component sizes */
  --fader-width: 60px;
  --fader-height: 150px;
  --knob-size: 50px;
  --button-min-size: 44px;
}
```

## Technical Stack

### Audio
- **Web Audio API:** Core audio processing and synthesis
- **AudioContext:** Central audio graph management
- **OscillatorNode:** Synth sound generation
- **AudioBufferSourceNode:** Drum sample playback
- **GainNode, BiquadFilterNode:** Volume and filtering
- **StereoPannerNode:** Channel panning
- **AnalyserNode:** VU meter data extraction

### UI
- **Vanilla JS/TypeScript** or **React/Vue** (TBD)
- **CSS Grid & Flexbox:** Responsive layouts
- **CSS Custom Properties:** Theming and dynamic styles
- **Pointer Events API:** Unified mouse/touch handling
- **ResizeObserver:** Component-level responsiveness

### Timing
- **AudioContext.currentTime:** High-precision scheduling
- **requestAnimationFrame:** UI sync (meters, playhead)
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

- **File Naming:** Use kebab-case (e.g., `channel-strip.js`, `vu-meter.js`)
- **Functions/Variables:** camelCase (e.g., `setVolume`, `panValue`)
- **Classes/Components:** PascalCase (e.g., `ChannelStrip`, `VuMeter`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_BPM`, `MAX_CHANNELS`)
- **CSS Classes:** BEM notation (e.g., `.mixer__fader--active`)

### Git Workflow

- Create feature branches from `main`
- Conventional commit messages:
  - `feat:` new features (e.g., `feat: add mixer channel strips`)
  - `fix:` bug fixes (e.g., `fix: fader not responding on touch`)
  - `docs:` documentation
  - `refactor:` code improvements
  - `test:` test additions
  - `style:` CSS/styling changes
  - `chore:` maintenance

## Audio Development Guidelines

### Web Audio API Best Practices

1. **Single AudioContext:** Create one AudioContext instance, reuse it
2. **User Gesture Requirement:** Resume AudioContext on first user interaction
3. **Proper Cleanup:** Disconnect and stop nodes when not in use
4. **Scheduling:** Use `audioContext.currentTime` for precise timing, not `setTimeout`

### Mixer Audio Implementation

```javascript
// Channel strip audio chain
Source
  → GainNode (input gain/trim)
  → GainNode (mute control - 0 or 1)
  → StereoPannerNode (pan)
  → GainNode (channel fader)
  → AnalyserNode (VU meter tap)
  → Master Bus

// Master bus chain
Channel Outputs → GainNode (master fader) → AnalyserNode → Destination
```

### VU Meter Implementation

```javascript
// Use AnalyserNode for level metering
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function updateMeter() {
  analyser.getByteFrequencyData(dataArray);
  const level = Math.max(...dataArray) / 255;
  // Update meter UI
  requestAnimationFrame(updateMeter);
}
```

### Synthesizer Implementation

```javascript
// Basic synth note structure
- Create OscillatorNode with waveform (sine, square, sawtooth, triangle)
- Connect through GainNode for ADSR envelope
- Apply filter via BiquadFilterNode
- Route to mixer channel
```

### Drum Machine Implementation

```javascript
// Drum trigger structure
- Load samples into AudioBuffers on init
- Create new AudioBufferSourceNode per hit (they're one-shot)
- Apply velocity via GainNode
- Route each drum to its mixer channel
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

1. **Understand Audio Flow:** Trace signal path from source through mixer to output
2. **Timing is Critical:** Be precise with scheduling code
3. **Test Responsively:** Verify UI works on multiple screen sizes
4. **Touch Testing:** Ensure controls work with touch input
5. **Memory Leaks:** Ensure audio nodes are properly disconnected
6. **Cross-browser:** Test AudioContext and CSS compatibility

### Key Architecture Decisions

- **Separation of Concerns:** Keep audio engine separate from UI
- **State Management:** Centralize mixer state, pattern/sequence data
- **Event-Driven:** UI triggers audio events, doesn't directly manipulate audio
- **Modular Components:** Mixer channels, controls should be reusable
- **Mobile-First CSS:** Start with mobile styles, enhance upward

### Common Tasks

#### Adding a Mixer Feature
1. Implement audio routing in `src/audio/mixer/`
2. Create UI component in `src/components/mixer/`
3. Connect UI to audio via state/events
4. Add responsive styles for all breakpoints
5. Test touch interactions

#### Adding a New Synth Waveform/Sound
1. Add oscillator type or wavetable to synth engine
2. Update UI controls to expose new option
3. Ensure proper gain staging
4. Route through mixer channel

#### Adding a New Drum Sound
1. Add sample file to `assets/samples/`
2. Register in drum kit configuration
3. Create mixer channel for the new drum
4. Map to pad/sequencer step

#### Fixing Touch/Responsive Issues
1. Check touch-action CSS properties
2. Verify pointer events are handled
3. Test on actual devices or device emulation
4. Check CSS breakpoints and container queries

#### Adding Effects
1. Create effect node chain (input → effect → output)
2. Implement wet/dry mix control
3. Add to effect send bus in mixer
4. Create UI controls with responsive design

### Key Files to Review

- Main audio engine initialization
- Mixer routing and channel management
- Sequencer/scheduler implementation
- Responsive CSS variables and breakpoints
- Component base styles

## Dependencies (Recommended)

```json
{
  "dependencies": {
    "tone": "^14.x"        // Optional: High-level Web Audio framework
  },
  "devDependencies": {
    "vite": "^5.x",        // Fast build tool
    "vitest": "^1.x",      // Testing framework
    "autoprefixer": "^10.x" // CSS vendor prefixes
  }
}
```

**Note:** Can be built with vanilla Web Audio API and CSS for smaller bundle size.

## Testing

- **Unit Tests:** Audio utility functions, BPM calculations, mixer math
- **Integration Tests:** Sequencer timing, audio node connections, mixer routing
- **UI Tests:** Responsive breakpoints, touch interactions
- **Manual Testing:** Actual audio output, device testing
- **Performance:** Monitor CPU usage during playback, frame rate for meters

## Browser Compatibility

- Chrome/Edge: Full Web Audio API support
- Firefox: Full support
- Safari: May need webkit prefix, stricter autoplay
- Mobile Chrome/Safari: Touch events, reduced polyphony, autoplay restrictions

## Performance Considerations

- Limit polyphony (simultaneous voices)
- Throttle VU meter updates (30-60fps is sufficient)
- Use CSS transforms for animations (GPU accelerated)
- Efficient DOM updates (don't re-render on every tick)
- Consider Web Worker for timing stability
- Use `will-change` sparingly for animated elements

## Deployment

### Vercel

This project is deployed on [Vercel](https://vercel.com).

**Live URL:** https://music-master.vercel.app

#### Vercel Configuration

```json
// vercel.json (if needed)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### Deployment Steps

1. **Connect Repository:** Link GitHub repo to Vercel dashboard
2. **Configure Build:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Environment Variables:** Add any required env vars in Vercel dashboard
4. **Deploy:** Push to `main` branch triggers automatic deployment

#### Preview Deployments

- Every pull request gets a unique preview URL
- Preview URLs follow pattern: `music-master-<hash>-<team>.vercel.app`
- Use previews to test changes before merging

#### Vercel CLI (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

#### Audio Considerations for Deployment

- Ensure audio files are in `public/` or `assets/` for proper bundling
- Use relative paths for sample loading
- Test AudioContext initialization on deployed version (HTTPS required for some features)

---

*Update this document as the project evolves. AI assistants should reference this for context on audio architecture, mixer implementation, and responsive UI conventions.*
