import { DrumSound } from '../../audio/AudioEngine';
import './Sequencer.css';

interface SequencerProps {
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  currentStep: number;
  drumSounds: DrumSound[];
  onSynthPatternChange: (pattern: boolean[]) => void;
  onDrumPatternChange: (drumIndex: number, pattern: boolean[]) => void;
}

function Sequencer({
  synthPattern,
  drumPatterns,
  currentStep,
  drumSounds,
  onSynthPatternChange,
  onDrumPatternChange,
}: SequencerProps) {
  const toggleSynthStep = (step: number) => {
    const newPattern = [...synthPattern];
    newPattern[step] = !newPattern[step];
    onSynthPatternChange(newPattern);
  };

  const toggleDrumStep = (drumIndex: number, step: number) => {
    const newPattern = [...(drumPatterns[drumIndex] || new Array(16).fill(false))];
    newPattern[step] = !newPattern[step];
    onDrumPatternChange(drumIndex, newPattern);
  };

  return (
    <div className="sequencer">
      <div className="sequencer-grid">
        {/* Step numbers */}
        <div className="sequencer-row header-row">
          <div className="row-label"></div>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`step-number ${currentStep === i ? 'current' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Synth row */}
        <div className="sequencer-row synth-row">
          <div className="row-label">Synth</div>
          {synthPattern.map((active, i) => (
            <button
              key={i}
              className={`step ${active ? 'active' : ''} ${currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''}`}
              onClick={() => toggleSynthStep(i)}
              aria-label={`Synth step ${i + 1} ${active ? 'on' : 'off'}`}
            />
          ))}
        </div>

        {/* Drum rows */}
        {drumSounds.map((drum, drumIndex) => (
          <div key={drum.name} className="sequencer-row drum-row">
            <div className="row-label">{drum.name}</div>
            {(drumPatterns[drumIndex] || new Array(16).fill(false)).map((active, i) => (
              <button
                key={i}
                className={`step ${active ? 'active' : ''} ${currentStep === i ? 'current' : ''} ${i % 4 === 0 ? 'beat-start' : ''}`}
                onClick={() => toggleDrumStep(drumIndex, i)}
                aria-label={`${drum.name} step ${i + 1} ${active ? 'on' : 'off'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sequencer;
