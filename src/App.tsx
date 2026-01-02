import { useEffect, useState, useCallback, useRef } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { historyManager, AppState } from './state/HistoryManager';
import { patternStorage, SavedPattern } from './state/PatternStorage';
import { generatePattern, GeneratedPattern } from './utils/PatternGenerator';
import Transport from './components/transport/Transport';
import Sequencer from './components/sequencer/Sequencer';
import BarOverview from './components/sequencer/BarOverview';
import Mixer from './components/mixer/Mixer';
import SynthControls from './components/synth/SynthControls';
import DrumMachine from './components/drums/DrumMachine';
import PatternGenerator from './components/patterns/PatternGenerator';
import FreestyleMode from './components/freestyle/FreestyleMode';
import SectionArranger from './components/arranger/SectionArranger';
import Toolbar from './components/toolbar/Toolbar';
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [levels, setLevels] = useState<number[]>([]);
  const [synthPattern, setSynthPattern] = useState<boolean[]>(new Array(16).fill(false));
  const [drumPatterns, setDrumPatterns] = useState<boolean[][]>([]);
  const [synthNote, setSynthNote] = useState(55);
  const [patternLength, setPatternLength] = useState(16);
  const [selectedBars, setSelectedBars] = useState<number[]>([]);
  const [copiedBars, setCopiedBars] = useState<{ synth: boolean[]; drums: boolean[][] } | null>(null);

  const isInitialLoad = useRef(true);
  const lastSaveTime = useRef(0);

  // Create current state snapshot
  const getCurrentState = useCallback((): AppState => ({
    synthPattern,
    drumPatterns,
    bpm,
    synthNote,
  }), [synthPattern, drumPatterns, bpm, synthNote]);

  // Auto-save current pattern periodically
  useEffect(() => {
    if (!isInitialized) return;

    const now = Date.now();
    if (now - lastSaveTime.current < 2000) return; // Debounce

    lastSaveTime.current = now;
    patternStorage.saveCurrentPattern({
      synthPattern,
      drumPatterns,
      bpm,
      synthNote,
    });
  }, [synthPattern, drumPatterns, bpm, synthNote, isInitialized]);

  const initAudio = useCallback(async () => {
    if (isInitialized) return;

    await audioEngine.init();
    await audioEngine.resume();

    audioEngine.onStep((step) => setCurrentStep(step));
    audioEngine.onLevels((lvls) => setLevels(lvls));

    // Try to load saved pattern
    const savedPattern = patternStorage.loadCurrentPattern();
    if (savedPattern) {
      setSynthPattern(savedPattern.synthPattern);
      setDrumPatterns(savedPattern.drumPatterns);
      setBpm(savedPattern.bpm);
      setSynthNote(savedPattern.synthNote);
      audioEngine.setSynthPattern(savedPattern.synthPattern);
      savedPattern.drumPatterns.forEach((pattern, i) => {
        audioEngine.setDrumPattern(i, pattern);
      });
      audioEngine.setBpm(savedPattern.bpm);
      audioEngine.setSynthNote(savedPattern.synthNote);
    } else {
      setDrumPatterns(audioEngine.getDrumPatterns());
    }

    // Initialize history with current state
    historyManager.initialize({
      synthPattern: savedPattern?.synthPattern || new Array(16).fill(false),
      drumPatterns: savedPattern?.drumPatterns || audioEngine.getDrumPatterns(),
      bpm: savedPattern?.bpm || 120,
      synthNote: savedPattern?.synthNote || 55,
    });

    setIsInitialized(true);
    isInitialLoad.current = false;
  }, [isInitialized]);

  useEffect(() => {
    const handleClick = () => {
      initAudio();
    };

    document.addEventListener('click', handleClick, { once: true });
    return () => document.removeEventListener('click', handleClick);
  }, [initAudio]);

  // Keyboard shortcuts for transport
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          handleStop();
        } else {
          handlePlay();
        }
      } else if (e.key.toLowerCase() === 't') {
        audioEngine.triggerSynth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

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

    if (!isInitialLoad.current) {
      historyManager.push(
        { ...getCurrentState(), bpm: newBpm },
        `Change BPM to ${newBpm}`
      );
    }
  };

  const handleSynthPatternChange = (pattern: boolean[]) => {
    setSynthPattern(pattern);
    audioEngine.setSynthPattern(pattern);

    if (!isInitialLoad.current) {
      historyManager.push(
        { ...getCurrentState(), synthPattern: pattern },
        'Edit synth pattern'
      );
    }
  };

  const handleDrumPatternChange = (drumIndex: number, pattern: boolean[]) => {
    const newPatterns = [...drumPatterns];
    newPatterns[drumIndex] = pattern;
    setDrumPatterns(newPatterns);
    audioEngine.setDrumPattern(drumIndex, pattern);

    if (!isInitialLoad.current) {
      const drumNames = ['Kick', 'Snare', 'Hi-Hat', 'Clap'];
      historyManager.push(
        { ...getCurrentState(), drumPatterns: newPatterns },
        `Edit ${drumNames[drumIndex]} pattern`
      );
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const state = historyManager.undo();
    if (state) {
      applyState(state);
    }
  };

  const handleRedo = () => {
    const state = historyManager.redo();
    if (state) {
      applyState(state);
    }
  };

  const applyState = (state: AppState) => {
    isInitialLoad.current = true; // Prevent adding to history

    setSynthPattern(state.synthPattern);
    setDrumPatterns(state.drumPatterns);
    setBpm(state.bpm);
    setSynthNote(state.synthNote);

    audioEngine.setSynthPattern(state.synthPattern);
    state.drumPatterns.forEach((pattern, i) => {
      audioEngine.setDrumPattern(i, pattern);
    });
    audioEngine.setBpm(state.bpm);
    audioEngine.setSynthNote(state.synthNote);

    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  };

  // Pattern Generator handlers
  const handleApplyPattern = (pattern: GeneratedPattern) => {
    isInitialLoad.current = true;

    setSynthPattern(pattern.synthPattern);
    setDrumPatterns(pattern.drumPatterns);
    setBpm(pattern.bpm);

    audioEngine.setSynthPattern(pattern.synthPattern);
    pattern.drumPatterns.forEach((p, i) => {
      audioEngine.setDrumPattern(i, p);
    });
    audioEngine.setBpm(pattern.bpm);

    // Apply new advanced features
    if (pattern.synthNotes && pattern.synthNotes.length > 0) {
      audioEngine.setSynthNotes(pattern.synthNotes);
    }
    if (pattern.swing !== undefined) {
      audioEngine.setSwing(pattern.swing);
    }
    if (pattern.synthPreset) {
      audioEngine.applySynthPreset(pattern.synthPreset);
    }

    setTimeout(() => {
      isInitialLoad.current = false;
      historyManager.push(
        { ...getCurrentState(), synthPattern: pattern.synthPattern, drumPatterns: pattern.drumPatterns, bpm: pattern.bpm },
        `Apply ${pattern.name} pattern`
      );
    }, 100);
  };

  const handleApplySynthOnly = (pattern: boolean[]) => {
    handleSynthPatternChange(pattern);
  };

  const handleApplyDrumsOnly = (patterns: boolean[][]) => {
    isInitialLoad.current = true;

    setDrumPatterns(patterns);
    patterns.forEach((p, i) => {
      audioEngine.setDrumPattern(i, p);
    });

    setTimeout(() => {
      isInitialLoad.current = false;
      historyManager.push(
        { ...getCurrentState(), drumPatterns: patterns },
        'Apply drum patterns'
      );
    }, 100);
  };

  // Clear all patterns
  const handleClearAll = () => {
    const emptyPattern = new Array(patternLength).fill(false);
    const emptyDrums = drumPatterns.map(() => new Array(patternLength).fill(false));

    handleSynthPatternChange(emptyPattern);
    emptyDrums.forEach((p, i) => {
      handleDrumPatternChange(i, p);
    });
  };

  // Randomize
  const handleRandomize = () => {
    const pattern = generatePattern('random');
    handleApplyPattern(pattern);
  };

  // Pattern length change
  const handlePatternLengthChange = (newLength: number) => {
    setPatternLength(newLength);
    audioEngine.setPatternLength(newLength);

    // Extend patterns if needed
    if (synthPattern.length < newLength) {
      const extended = [...synthPattern, ...new Array(newLength - synthPattern.length).fill(false)];
      setSynthPattern(extended);
      audioEngine.setSynthPattern(extended);
    }

    const newDrumPatterns = drumPatterns.map(pattern => {
      if (pattern.length < newLength) {
        return [...pattern, ...new Array(newLength - pattern.length).fill(false)];
      }
      return pattern;
    });
    setDrumPatterns(newDrumPatterns);
    newDrumPatterns.forEach((p, i) => audioEngine.setDrumPattern(i, p));
  };

  // Bar selection
  const handleBarSelect = (barIndex: number, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedBars(prev =>
        prev.includes(barIndex)
          ? prev.filter(b => b !== barIndex)
          : [...prev, barIndex].sort((a, b) => a - b)
      );
    } else {
      setSelectedBars([barIndex]);
    }
  };

  // Insert bar after a position
  const handleInsertBar = (afterBar: number) => {
    if (patternLength >= 128) return;

    const insertAt = (afterBar + 1) * 16;
    const newLength = patternLength + 16;

    // Insert empty steps for synth
    const newSynth = [
      ...synthPattern.slice(0, insertAt),
      ...new Array(16).fill(false),
      ...synthPattern.slice(insertAt),
    ];

    // Insert empty steps for drums
    const newDrums = drumPatterns.map(pattern => [
      ...pattern.slice(0, insertAt),
      ...new Array(16).fill(false),
      ...pattern.slice(insertAt),
    ]);

    setPatternLength(newLength);
    setSynthPattern(newSynth);
    setDrumPatterns(newDrums);
    audioEngine.setPatternLength(newLength);
    audioEngine.setSynthPattern(newSynth);
    newDrums.forEach((p, i) => audioEngine.setDrumPattern(i, p));
  };

  // Delete selected bars
  const handleDeleteBars = (bars: number[]) => {
    if (patternLength <= 16 || bars.length === 0) return;

    const sortedBars = [...bars].sort((a, b) => b - a); // Delete from end first
    let newSynth = [...synthPattern];
    let newDrums = drumPatterns.map(p => [...p]);

    for (const barIndex of sortedBars) {
      const start = barIndex * 16;
      newSynth = [...newSynth.slice(0, start), ...newSynth.slice(start + 16)];
      newDrums = newDrums.map(p => [...p.slice(0, start), ...p.slice(start + 16)]);
    }

    const newLength = Math.max(16, patternLength - bars.length * 16);

    setPatternLength(newLength);
    setSynthPattern(newSynth);
    setDrumPatterns(newDrums);
    setSelectedBars([]);
    audioEngine.setPatternLength(newLength);
    audioEngine.setSynthPattern(newSynth);
    newDrums.forEach((p, i) => audioEngine.setDrumPattern(i, p));
  };

  // Copy selected bars
  const handleCopyBars = (bars: number[]) => {
    const sortedBars = [...bars].sort((a, b) => a - b);
    let copiedSynth: boolean[] = [];
    let copiedDrums: boolean[][] = drumPatterns.map(() => []);

    for (const barIndex of sortedBars) {
      const start = barIndex * 16;
      copiedSynth = [...copiedSynth, ...synthPattern.slice(start, start + 16)];
      drumPatterns.forEach((pattern, i) => {
        copiedDrums[i] = [...copiedDrums[i], ...pattern.slice(start, start + 16)];
      });
    }

    setCopiedBars({ synth: copiedSynth, drums: copiedDrums });
  };

  // Paste bars after a position
  const handlePasteBars = (afterBar: number) => {
    if (!copiedBars) return;

    const insertAt = (afterBar + 1) * 16;
    const barsToAdd = copiedBars.synth.length / 16;
    const newLength = Math.min(128, patternLength + barsToAdd * 16);

    if (newLength > 128) return;

    const newSynth = [
      ...synthPattern.slice(0, insertAt),
      ...copiedBars.synth,
      ...synthPattern.slice(insertAt),
    ].slice(0, newLength);

    const newDrums = drumPatterns.map((pattern, i) => [
      ...pattern.slice(0, insertAt),
      ...copiedBars.drums[i],
      ...pattern.slice(insertAt),
    ].slice(0, newLength));

    setPatternLength(newLength);
    setSynthPattern(newSynth);
    setDrumPatterns(newDrums);
    audioEngine.setPatternLength(newLength);
    audioEngine.setSynthPattern(newSynth);
    newDrums.forEach((p, i) => audioEngine.setDrumPattern(i, p));
  };

  // Clear selected bars
  const handleClearBars = (bars: number[]) => {
    let newSynth = [...synthPattern];
    let newDrums = drumPatterns.map(p => [...p]);

    for (const barIndex of bars) {
      const start = barIndex * 16;
      for (let i = 0; i < 16; i++) {
        newSynth[start + i] = false;
        newDrums.forEach(pattern => {
          pattern[start + i] = false;
        });
      }
    }

    setSynthPattern(newSynth);
    setDrumPatterns(newDrums);
    audioEngine.setSynthPattern(newSynth);
    newDrums.forEach((p, i) => audioEngine.setDrumPattern(i, p));
  };

  // Load saved pattern
  const handleLoadPattern = (pattern: SavedPattern) => {
    // Create default synthNotes array based on the saved synthNote
    const defaultSynthNotes = new Array(16).fill(pattern.synthNote);

    handleApplyPattern({
      name: pattern.name,
      synthPattern: pattern.synthPattern,
      drumPatterns: pattern.drumPatterns,
      synthNotes: defaultSynthNotes,
      bpm: pattern.bpm,
      description: 'Loaded from library',
      key: { root: pattern.synthNote % 12, scale: 'major' as const },
    });
    setSynthNote(pattern.synthNote);
    audioEngine.setSynthNote(pattern.synthNote);
  };

  // Play from section (placeholder for future implementation)
  const handlePlaySection = (sectionIndex: number) => {
    // In a full implementation, this would queue up sections
    console.log('Play from section:', sectionIndex);
    handlePlay();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Music Master</h1>
        <p className="app-subtitle">Synth Loop & Percussion Beats</p>
      </header>

      <main className="app-main">
        {/* Toolbar with Undo/Redo */}
        <section className="section toolbar-section">
          <Toolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClearAll={handleClearAll}
            onRandomize={handleRandomize}
            isPlaying={isPlaying}
          />
        </section>

        {/* Transport Controls */}
        <section className="section transport-section">
          <Transport
            isPlaying={isPlaying}
            bpm={bpm}
            onPlay={handlePlay}
            onStop={handleStop}
            onBpmChange={handleBpmChange}
          />
        </section>

        {/* Freestyle Mode - Live Auto-Generation */}
        <section className="section freestyle-section">
          <FreestyleMode
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={handleStop}
            onApplyPattern={handleApplyPattern}
            currentBpm={bpm}
          />
        </section>

        {/* Pattern Generator */}
        <section className="section generator-section">
          <PatternGenerator
            onApplyPattern={handleApplyPattern}
            onApplySynthOnly={handleApplySynthOnly}
            onApplyDrumsOnly={handleApplyDrumsOnly}
            currentDrumPatterns={drumPatterns}
          />
        </section>

        {/* Bar Overview & Sequencer Grid */}
        <section className="section sequencer-section">
          <h2 className="section-title">Sequencer</h2>
          <BarOverview
            patternLength={patternLength}
            currentStep={currentStep}
            selectedBars={selectedBars}
            onPatternLengthChange={handlePatternLengthChange}
            onBarSelect={handleBarSelect}
            onInsertBar={handleInsertBar}
            onDeleteBars={handleDeleteBars}
            onCopyBars={handleCopyBars}
            onPasteBars={handlePasteBars}
            onClearBars={handleClearBars}
            hasCopiedBars={copiedBars !== null}
          />
          <Sequencer
            synthPattern={synthPattern}
            drumPatterns={drumPatterns}
            currentStep={currentStep}
            drumSounds={audioEngine.getDrumSounds()}
            patternLength={patternLength}
            onSynthPatternChange={handleSynthPatternChange}
            onDrumPatternChange={handleDrumPatternChange}
          />
        </section>

        {/* Synth and Drum Controls Row */}
        <div className="controls-row">
          <section className="section synth-section">
            <h2 className="section-title">Synthesizer</h2>
            <SynthControls />
          </section>

          <section className="section drums-section">
            <h2 className="section-title">Drum Machine</h2>
            <DrumMachine
              drumPatterns={drumPatterns}
              currentStep={currentStep}
              drumSounds={audioEngine.getDrumSounds()}
              onDrumPatternChange={handleDrumPatternChange}
            />
          </section>
        </div>

        {/* Pattern Library & Arranger */}
        <section className="section arranger-section">
          <SectionArranger
            currentPattern={{
              synthPattern,
              drumPatterns,
              bpm,
              synthNote,
            }}
            onLoadPattern={handleLoadPattern}
            onPlaySection={handlePlaySection}
          />
        </section>

        {/* Mixer */}
        <section className="section mixer-section">
          <h2 className="section-title">Mixer</h2>
          <Mixer levels={levels} drumSounds={audioEngine.getDrumSounds()} />
        </section>
      </main>

      {/* Audio Init Overlay */}
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
