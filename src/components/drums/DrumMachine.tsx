import { useState, useCallback, useEffect } from 'react';
import { audioEngine, DrumSound } from '../../audio/AudioEngine';
import './DrumMachine.css';

interface DrumMachineProps {
  drumPatterns: boolean[][];
  currentStep: number;
  drumSounds: DrumSound[];
  onDrumPatternChange: (drumIndex: number, pattern: boolean[]) => void;
}

function DrumMachine({
  drumPatterns,
  currentStep,
  drumSounds,
  onDrumPatternChange,
}: DrumMachineProps) {
  const [selectedDrum, setSelectedDrum] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(false);

  const handlePadClick = (index: number) => {
    audioEngine.triggerDrum(index);
    setSelectedDrum(index);
  };

  const handlePadTouch = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    audioEngine.triggerDrum(index);
    setSelectedDrum(index);
  };

  const toggleStep = useCallback((drumIndex: number, step: number, forceValue?: boolean) => {
    const pattern = [...(drumPatterns[drumIndex] || new Array(16).fill(false))];
    pattern[step] = forceValue !== undefined ? forceValue : !pattern[step];
    onDrumPatternChange(drumIndex, pattern);
  }, [drumPatterns, onDrumPatternChange]);

  const handleStepMouseDown = (drumIndex: number, step: number) => {
    setIsDragging(true);
    const currentValue = drumPatterns[drumIndex]?.[step] || false;
    setDragValue(!currentValue);
    toggleStep(drumIndex, step);
    // Play sound preview
    audioEngine.triggerDrum(drumIndex);
  };

  const handleStepMouseEnter = (drumIndex: number, step: number) => {
    if (isDragging) {
      toggleStep(drumIndex, step, dragValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const clearPattern = (drumIndex: number) => {
    onDrumPatternChange(drumIndex, new Array(16).fill(false));
  };

  const fillPattern = (drumIndex: number, density: 'sparse' | 'medium' | 'full') => {
    const pattern = new Array(16).fill(false);
    const densityMap = { sparse: 4, medium: 2, full: 1 };
    const step = densityMap[density];

    for (let i = 0; i < 16; i += step) {
      pattern[i] = true;
    }
    onDrumPatternChange(drumIndex, pattern);
    audioEngine.triggerDrum(drumIndex);
  };

  // Copy pattern function - available for future copy/paste feature
  const _copyPattern = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex && drumPatterns[fromIndex]) {
      onDrumPatternChange(toIndex, [...drumPatterns[fromIndex]]);
    }
  };
  void _copyPattern; // Silence unused warning

  // Keyboard shortcuts for drum pads
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-4 trigger drums
      const keyMap: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        'q': 0, 'w': 1, 'e': 2, 'r': 3,
      };

      if (keyMap[e.key.toLowerCase()] !== undefined && !e.repeat) {
        const drumIndex = keyMap[e.key.toLowerCase()];
        audioEngine.triggerDrum(drumIndex);
        setSelectedDrum(drumIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDrumColor = (index: number) => {
    const colors = ['#ff6b35', '#f7931e', '#ffcc00', '#ff4757'];
    return colors[index % colors.length];
  };

  return (
    <div className="drum-machine">
      {/* Drum Pads Section */}
      <div className="drum-pads-section">
        <div className="drum-pads-grid">
          {drumSounds.map((drum, index) => (
            <button
              key={drum.name}
              className={`drum-pad-large ${selectedDrum === index ? 'selected' : ''}`}
              style={{ '--drum-color': getDrumColor(index) } as React.CSSProperties}
              onClick={() => handlePadClick(index)}
              onTouchStart={(e) => handlePadTouch(index, e)}
            >
              <span className="pad-icon">{['🥁', '🪘', '🎵', '👏'][index]}</span>
              <span className="pad-name-large">{drum.name}</span>
              <span className="pad-key-large">{['Q/1', 'W/2', 'E/3', 'R/4'][index]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Drum Sequencers */}
      <div className="drum-sequencers">
        {drumSounds.map((drum, drumIndex) => (
          <div
            key={drum.name}
            className={`drum-lane ${selectedDrum === drumIndex ? 'selected' : ''}`}
            style={{ '--drum-color': getDrumColor(drumIndex) } as React.CSSProperties}
          >
            <div className="drum-lane-header">
              <button
                className="drum-lane-label"
                onClick={() => {
                  audioEngine.triggerDrum(drumIndex);
                  setSelectedDrum(drumIndex);
                }}
              >
                <span className="drum-lane-icon">{['🥁', '🪘', '🎵', '👏'][drumIndex]}</span>
                <span>{drum.name}</span>
              </button>
              <div className="drum-lane-actions">
                <button
                  className="lane-action-btn"
                  onClick={() => clearPattern(drumIndex)}
                  title="Clear pattern"
                >
                  ✕
                </button>
                <button
                  className="lane-action-btn"
                  onClick={() => fillPattern(drumIndex, 'sparse')}
                  title="Quarter notes"
                >
                  ¼
                </button>
                <button
                  className="lane-action-btn"
                  onClick={() => fillPattern(drumIndex, 'medium')}
                  title="8th notes"
                >
                  ⅛
                </button>
                <button
                  className="lane-action-btn"
                  onClick={() => fillPattern(drumIndex, 'full')}
                  title="16th notes"
                >
                  1⁄16
                </button>
              </div>
            </div>

            <div className="drum-lane-steps">
              {/* Beat markers */}
              <div className="beat-markers">
                {[1, 2, 3, 4].map(beat => (
                  <div key={beat} className="beat-marker">{beat}</div>
                ))}
              </div>

              <div className="drum-steps-row">
                {(drumPatterns[drumIndex] || new Array(16).fill(false)).map((active, step) => (
                  <button
                    key={step}
                    className={`drum-step ${active ? 'active' : ''} ${currentStep === step ? 'current' : ''} ${step % 4 === 0 ? 'beat-start' : ''}`}
                    onMouseDown={() => handleStepMouseDown(drumIndex, step)}
                    onMouseEnter={() => handleStepMouseEnter(drumIndex, step)}
                    aria-label={`${drum.name} step ${step + 1} ${active ? 'on' : 'off'}`}
                  >
                    {active && <span className="step-fill" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="drum-quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => {
            drumSounds.forEach((_, i) => clearPattern(i));
          }}
        >
          Clear All
        </button>
        <button
          className="quick-action-btn"
          onClick={() => {
            // Swap kick and snare patterns
            if (drumPatterns[0] && drumPatterns[1]) {
              const kickPattern = [...drumPatterns[0]];
              const snarePattern = [...drumPatterns[1]];
              onDrumPatternChange(0, snarePattern);
              onDrumPatternChange(1, kickPattern);
            }
          }}
        >
          Swap K↔S
        </button>
        <button
          className="quick-action-btn"
          onClick={() => {
            // Shift all patterns by 1 step
            drumSounds.forEach((_, i) => {
              if (drumPatterns[i]) {
                const pattern = drumPatterns[i];
                const shifted = [...pattern.slice(1), pattern[0]];
                onDrumPatternChange(i, shifted);
              }
            });
          }}
        >
          Shift →
        </button>
        <button
          className="quick-action-btn"
          onClick={() => {
            // Reverse all patterns
            drumSounds.forEach((_, i) => {
              if (drumPatterns[i]) {
                onDrumPatternChange(i, [...drumPatterns[i]].reverse());
              }
            });
          }}
        >
          Reverse
        </button>
      </div>
    </div>
  );
}

export default DrumMachine;
