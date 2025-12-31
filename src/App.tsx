import { useEffect, useState, useCallback } from 'react';
import { audioEngine } from './audio/AudioEngine';
import Transport from './components/transport/Transport';
import Sequencer from './components/sequencer/Sequencer';
import Mixer from './components/mixer/Mixer';
import SynthControls from './components/synth/SynthControls';
import DrumPads from './components/drums/DrumPads';
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [levels, setLevels] = useState<number[]>([]);
  const [synthPattern, setSynthPattern] = useState<boolean[]>(new Array(16).fill(false));
  const [drumPatterns, setDrumPatterns] = useState<boolean[][]>([]);

  const initAudio = useCallback(async () => {
    if (isInitialized) return;

    await audioEngine.init();
    await audioEngine.resume();

    audioEngine.onStep((step) => setCurrentStep(step));
    audioEngine.onLevels((lvls) => setLevels(lvls));

    setDrumPatterns(audioEngine.getDrumPatterns());
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    const handleClick = () => {
      initAudio();
    };

    document.addEventListener('click', handleClick, { once: true });
    return () => document.removeEventListener('click', handleClick);
  }, [initAudio]);

  const handlePlay = async () => {
    await initAudio();
    audioEngine.play();
    setIsPlaying(true);
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    audioEngine.setBpm(newBpm);
  };

  const handleSynthPatternChange = (pattern: boolean[]) => {
    setSynthPattern(pattern);
    audioEngine.setSynthPattern(pattern);
  };

  const handleDrumPatternChange = (drumIndex: number, pattern: boolean[]) => {
    const newPatterns = [...drumPatterns];
    newPatterns[drumIndex] = pattern;
    setDrumPatterns(newPatterns);
    audioEngine.setDrumPattern(drumIndex, pattern);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Music Master</h1>
        <p className="app-subtitle">Synth Loop & Percussion Beats</p>
      </header>

      <main className="app-main">
        <section className="section transport-section">
          <Transport
            isPlaying={isPlaying}
            bpm={bpm}
            onPlay={handlePlay}
            onStop={handleStop}
            onBpmChange={handleBpmChange}
          />
        </section>

        <section className="section sequencer-section">
          <h2 className="section-title">Sequencer</h2>
          <Sequencer
            synthPattern={synthPattern}
            drumPatterns={drumPatterns}
            currentStep={currentStep}
            drumSounds={audioEngine.getDrumSounds()}
            onSynthPatternChange={handleSynthPatternChange}
            onDrumPatternChange={handleDrumPatternChange}
          />
        </section>

        <div className="controls-row">
          <section className="section synth-section">
            <h2 className="section-title">Synthesizer</h2>
            <SynthControls />
          </section>

          <section className="section drums-section">
            <h2 className="section-title">Drum Pads</h2>
            <DrumPads drumSounds={audioEngine.getDrumSounds()} />
          </section>
        </div>

        <section className="section mixer-section">
          <h2 className="section-title">Mixer</h2>
          <Mixer levels={levels} drumSounds={audioEngine.getDrumSounds()} />
        </section>
      </main>

      {!isInitialized && (
        <div className="init-overlay">
          <div className="init-message">
            <h2>Click anywhere to start</h2>
            <p>Audio requires user interaction to initialize</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
