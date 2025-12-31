# Music Master

A browser-based synth loop and percussion beats application with a professional mixer interface.

## Features

- **Synthesizer** - Oscillator-based synth with 4 waveforms, ADSR envelope, and lowpass filter
- **Drum Machine** - 4 synthesized drum sounds (Kick, Snare, Hi-Hat, Clap)
- **Step Sequencer** - 16-step pattern editor for synth and drums
- **Mixer Console** - Channel strips with volume faders, pan, mute/solo, and VU meters
- **Responsive UI** - Works on desktop, tablet, and mobile

## Live Demo

[https://music-master.vercel.app](https://music-master.vercel.app)

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect Vite and deploy

Or use the Vercel CLI:
```bash
npx vercel
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Web Audio API
- CSS Custom Properties

## Usage

1. Click anywhere to initialize audio (browser requirement)
2. Click **Play** to start the sequencer
3. Click steps in the grid to create patterns
4. Use the **Mixer** to adjust volumes and panning
5. Tap **Drum Pads** to trigger sounds manually
6. Adjust **Synth Controls** to shape the sound

## License

MIT
