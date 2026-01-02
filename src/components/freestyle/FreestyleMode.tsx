import { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateTrancePattern,
  evolvePattern,
  createDrop,
  createBreakdown,
  getTranceStyles,
  TranceStyle,
} from '../../utils/TranceGenerator';
import { GeneratedPattern } from '../../utils/PatternGenerator';
import './FreestyleMode.css';

interface FreestyleModeProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onApplyPattern: (pattern: GeneratedPattern) => void;
  currentBpm: number;
}

type FreestylePhase = 'idle' | 'playing' | 'buildup' | 'drop' | 'breakdown';

function FreestyleMode({
  isPlaying,
  onPlay,
  onStop,
  onApplyPattern,
  currentBpm,
}: FreestyleModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [style, setStyle] = useState<TranceStyle>('hypnotic');
  const [intensity, setIntensity] = useState(0.3);
  const [autoEvolve, setAutoEvolve] = useState(true);
  const [evolutionBars, setEvolutionBars] = useState(4);
  const [phase, setPhase] = useState<FreestylePhase>('idle');
  const [barCount, setBarCount] = useState(0);
  const [currentPattern, setCurrentPattern] = useState<GeneratedPattern | null>(null);

  const evolutionTimerRef = useRef<number | null>(null);
  const barCounterRef = useRef<number | null>(null);

  // Use refs to avoid stale closures in intervals
  const currentPatternRef = useRef<GeneratedPattern | null>(null);
  const intensityRef = useRef(intensity);
  const phaseRef = useRef<FreestylePhase>('idle');
  const styleRef = useRef<TranceStyle>(style);

  // Keep refs in sync
  useEffect(() => { currentPatternRef.current = currentPattern; }, [currentPattern]);
  useEffect(() => { intensityRef.current = intensity; }, [intensity]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { styleRef.current = style; }, [style]);

  const styles = getTranceStyles();

  // Calculate bar duration in ms
  const getBarDuration = useCallback(() => {
    return (60 / currentBpm) * 4 * 1000; // 4 beats per bar
  }, [currentBpm]);

  // Generate initial pattern
  const generateNewPattern = useCallback(() => {
    const pattern = generateTrancePattern(style);
    setCurrentPattern(pattern);
    onApplyPattern(pattern);
    return pattern;
  }, [style, onApplyPattern]);

  // Evolve the current pattern - uses refs to avoid stale closures
  const evolveCurrentPattern = useCallback(() => {
    const pattern = currentPatternRef.current;
    if (!pattern) return;

    let evolved: GeneratedPattern;
    const currentPhase = phaseRef.current;
    const currentIntensity = intensityRef.current;
    const currentStyle = styleRef.current;

    // Occasionally do special transitions
    const rand = Math.random();
    if (rand < 0.1 && currentPhase === 'playing') {
      // 10% chance of breakdown
      evolved = createBreakdown(pattern);
      setPhase('breakdown');
    } else if (rand < 0.15 && currentPhase === 'breakdown') {
      // After breakdown, go to drop
      evolved = createDrop(currentStyle);
      setPhase('drop');
    } else if (currentPhase === 'drop') {
      // After drop, back to normal
      evolved = evolvePattern(pattern, currentIntensity);
      setPhase('playing');
    } else {
      // Normal evolution
      evolved = evolvePattern(pattern, currentIntensity);
      if (currentPhase === 'breakdown') setPhase('playing');
    }

    setCurrentPattern(evolved);
    onApplyPattern(evolved);
  }, [onApplyPattern]);

  // Start freestyle mode
  const startFreestyle = useCallback(() => {
    setIsActive(true);
    setPhase('playing');
    setBarCount(0);

    // Generate and apply initial pattern
    generateNewPattern();

    // Start playing if not already
    if (!isPlaying) {
      onPlay();
    }
  }, [generateNewPattern, isPlaying, onPlay]);

  // Stop freestyle mode
  const stopFreestyle = useCallback(() => {
    setIsActive(false);
    setPhase('idle');

    if (evolutionTimerRef.current) {
      clearInterval(evolutionTimerRef.current);
      evolutionTimerRef.current = null;
    }
    if (barCounterRef.current) {
      clearInterval(barCounterRef.current);
      barCounterRef.current = null;
    }

    // Stop the audio playback
    onStop();
  }, [onStop]);

  // Handle auto-evolution
  useEffect(() => {
    if (!isActive || !autoEvolve) {
      if (evolutionTimerRef.current) {
        clearInterval(evolutionTimerRef.current);
        evolutionTimerRef.current = null;
      }
      return;
    }

    const barDuration = getBarDuration();
    const evolutionInterval = barDuration * evolutionBars;

    evolutionTimerRef.current = window.setInterval(() => {
      evolveCurrentPattern();
    }, evolutionInterval);

    return () => {
      if (evolutionTimerRef.current) {
        clearInterval(evolutionTimerRef.current);
      }
    };
  }, [isActive, autoEvolve, evolutionBars, getBarDuration, evolveCurrentPattern]);

  // Bar counter for display
  useEffect(() => {
    if (!isActive) return;

    const barDuration = getBarDuration();

    barCounterRef.current = window.setInterval(() => {
      setBarCount(prev => prev + 1);
    }, barDuration);

    return () => {
      if (barCounterRef.current) {
        clearInterval(barCounterRef.current);
      }
    };
  }, [isActive, getBarDuration]);

  // Stop freestyle when playback stops
  useEffect(() => {
    if (!isPlaying && isActive) {
      stopFreestyle();
    }
  }, [isPlaying, isActive, stopFreestyle]);

  // Manual triggers
  const triggerDrop = () => {
    if (!isActive) return;
    const drop = createDrop(style);
    setCurrentPattern(drop);
    onApplyPattern(drop);
    setPhase('drop');
  };

  const triggerBreakdown = () => {
    if (!isActive || !currentPattern) return;
    const breakdown = createBreakdown(currentPattern);
    setCurrentPattern(breakdown);
    onApplyPattern(breakdown);
    setPhase('breakdown');
  };

  const triggerEvolve = () => {
    if (!isActive) return;
    evolveCurrentPattern();
  };

  const triggerNewPattern = () => {
    generateNewPattern();
    setPhase('playing');
  };

  return (
    <div className={`freestyle-mode ${isActive ? 'active' : ''}`}>
      <div className="freestyle-header">
        <h3 className="freestyle-title">
          <span className="title-icon">∞</span>
          Freestyle Mode
        </h3>
        <span className="freestyle-hint">Auto-generate hypnotic beats</span>
      </div>

      <div className="freestyle-controls">
        {/* Style Selector */}
        <div className="control-group">
          <label className="control-label">Style</label>
          <div className="style-buttons">
            {styles.map(s => (
              <button
                key={s.value}
                className={`style-button ${style === s.value ? 'active' : ''}`}
                onClick={() => setStyle(s.value)}
                disabled={isActive}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="control-group">
          <label className="control-label">
            Evolution Intensity: {Math.round(intensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity * 100}
            onChange={(e) => setIntensity(Number(e.target.value) / 100)}
            className="intensity-slider"
          />
        </div>

        {/* Auto Evolution */}
        <div className="control-group horizontal">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoEvolve}
              onChange={(e) => setAutoEvolve(e.target.checked)}
            />
            Auto-evolve every
          </label>
          <select
            value={evolutionBars}
            onChange={(e) => setEvolutionBars(Number(e.target.value))}
            className="bars-select"
          >
            <option value={2}>2 bars</option>
            <option value={4}>4 bars</option>
            <option value={8}>8 bars</option>
            <option value={16}>16 bars</option>
          </select>
        </div>
      </div>

      {/* Main Action Button */}
      <button
        className={`freestyle-button ${isActive ? 'stop' : 'start'}`}
        onClick={isActive ? stopFreestyle : startFreestyle}
      >
        {isActive ? (
          <>
            <span className="button-icon">■</span>
            <span className="button-text">Stop Freestyle</span>
          </>
        ) : (
          <>
            <span className="button-icon pulse">▶</span>
            <span className="button-text">Start Freestyle</span>
          </>
        )}
      </button>

      {/* Active Mode Controls */}
      {isActive && (
        <div className="live-controls">
          <div className="status-bar">
            <span className={`phase-indicator ${phase}`}>
              {phase.toUpperCase()}
            </span>
            <span className="bar-counter">Bar {barCount + 1}</span>
            {currentPattern && (
              <span className="pattern-name">{currentPattern.name}</span>
            )}
          </div>

          <div className="trigger-buttons">
            <button className="trigger-btn evolve" onClick={triggerEvolve}>
              <span className="btn-icon">↻</span>
              Evolve
            </button>
            <button className="trigger-btn new" onClick={triggerNewPattern}>
              <span className="btn-icon">✦</span>
              New
            </button>
            <button className="trigger-btn breakdown" onClick={triggerBreakdown}>
              <span className="btn-icon">◇</span>
              Breakdown
            </button>
            <button className="trigger-btn drop" onClick={triggerDrop}>
              <span className="btn-icon">⚡</span>
              DROP!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreestyleMode;
