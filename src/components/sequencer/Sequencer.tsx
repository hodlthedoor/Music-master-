import { useRef, useEffect } from 'react';
import { DrumSound } from '../../audio/AudioEngine';
import './Sequencer.css';

interface SequencerProps {
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  currentStep: number;
  drumSounds: DrumSound[];
  patternLength: number;
  onSynthPatternChange: (pattern: boolean[]) => void;
  onDrumPatternChange: (drumIndex: number, pattern: boolean[]) => void;
}

function Sequencer({
  synthPattern,
  drumPatterns,
  currentStep,
  drumSounds,
  patternLength,
  onSynthPatternChange,
  onDrumPatternChange,
}: SequencerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to follow the current step
  useEffect(() => {
    if (currentStep >= 0 && scrollContainerRef.current) {
      const stepWidth = 32; // Approximate step width
      const container = scrollContainerRef.current;
      const scrollPosition = currentStep * stepWidth;
      const containerWidth = container.clientWidth;

      // Only scroll if step is near the edge
      if (scrollPosition > container.scrollLeft + containerWidth - 100) {
        container.scrollTo({
          left: scrollPosition - 100,
          behavior: 'smooth',
        });
      } else if (scrollPosition < container.scrollLeft + 50) {
        container.scrollTo({
          left: Math.max(0, scrollPosition - 50),
          behavior: 'smooth',
        });
      }
    }
  }, [currentStep]);

  const toggleSynthStep = (step: number) => {
    const newPattern = [...synthPattern];
    // Ensure pattern is long enough
    while (newPattern.length < patternLength) {
      newPattern.push(false);
    }
    newPattern[step] = !newPattern[step];
    onSynthPatternChange(newPattern);
  };

  const toggleDrumStep = (drumIndex: number, step: number) => {
    const currentPattern = drumPatterns[drumIndex] || [];
    const newPattern = [...currentPattern];
    // Ensure pattern is long enough
    while (newPattern.length < patternLength) {
      newPattern.push(false);
    }
    newPattern[step] = !newPattern[step];
    onDrumPatternChange(drumIndex, newPattern);
  };

  // Ensure we have enough steps in patterns
  const getSynthStep = (index: number) => synthPattern[index] || false;
  const getDrumStep = (drumIndex: number, stepIndex: number) =>
    (drumPatterns[drumIndex] || [])[stepIndex] || false;

  return (
    <div className="sequencer">
      <div className="sequencer-scroll-container" ref={scrollContainerRef}>
        <div className="sequencer-grid" style={{ minWidth: patternLength > 16 ? `${patternLength * 32}px` : undefined }}>
          {/* Step numbers */}
          <div className="sequencer-row header-row">
            <div className="row-label sticky-label"></div>
            {Array.from({ length: patternLength }, (_, i) => (
              <div
                key={i}
                className={`step-number ${currentStep === i ? 'current' : ''} ${i % 16 === 0 ? 'bar-start' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Synth row */}
          <div className="sequencer-row synth-row">
            <div className="row-label sticky-label">Synth</div>
            {Array.from({ length: patternLength }, (_, i) => (
              <button
                key={i}
                className={`step ${getSynthStep(i) ? 'active' : ''} ${currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''} ${i % 16 === 0 ? 'bar-start' : ''}`}
                onClick={() => toggleSynthStep(i)}
                aria-label={`Synth step ${i + 1} ${getSynthStep(i) ? 'on' : 'off'}`}
              />
            ))}
          </div>

          {/* Drum rows */}
          {drumSounds.map((drum, drumIndex) => (
            <div key={drum.name} className="sequencer-row drum-row">
              <div className="row-label sticky-label">{drum.name}</div>
              {Array.from({ length: patternLength }, (_, i) => (
                <button
                  key={i}
                  className={`step ${getDrumStep(drumIndex, i) ? 'active' : ''} ${currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''} ${i % 16 === 0 ? 'bar-start' : ''}`}
                  onClick={() => toggleDrumStep(drumIndex, i)}
                  aria-label={`${drum.name} step ${i + 1} ${getDrumStep(drumIndex, i) ? 'on' : 'off'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator for longer patterns */}
      {patternLength > 16 && (
        <div className="scroll-hint">
          <span>← Scroll horizontally to see all {patternLength} steps →</span>
        </div>
      )}
    </div>
  );
}

export default Sequencer;
