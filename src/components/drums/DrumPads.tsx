import { audioEngine, DrumSound } from '../../audio/AudioEngine';
import './DrumPads.css';

interface DrumPadsProps {
  drumSounds: DrumSound[];
}

function DrumPads({ drumSounds }: DrumPadsProps) {
  const handlePadClick = (index: number) => {
    audioEngine.triggerDrum(index);
  };

  const handlePadTouch = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    audioEngine.triggerDrum(index);
  };

  return (
    <div className="drum-pads">
      {drumSounds.map((drum, index) => (
        <button
          key={drum.name}
          className="drum-pad"
          onClick={() => handlePadClick(index)}
          onTouchStart={(e) => handlePadTouch(index, e)}
        >
          <span className="pad-name">{drum.name}</span>
          <span className="pad-key">{index + 1}</span>
        </button>
      ))}
    </div>
  );
}

export default DrumPads;
