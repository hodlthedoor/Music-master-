import './Transport.css';

interface TransportProps {
  isPlaying: boolean;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
}

function Transport({ isPlaying, bpm, onPlay, onStop, onBpmChange }: TransportProps) {
  return (
    <div className="transport">
      <div className="transport-controls">
        <button
          className={`transport-btn play-btn ${isPlaying ? 'active' : ''}`}
          onClick={isPlaying ? onStop : onPlay}
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="bpm-control">
        <label className="bpm-label">BPM</label>
        <div className="bpm-input-group">
          <button
            className="bpm-btn"
            onClick={() => onBpmChange(bpm - 1)}
            aria-label="Decrease BPM"
          >
            -
          </button>
          <input
            type="number"
            className="bpm-input"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
            min={60}
            max={200}
          />
          <button
            className="bpm-btn"
            onClick={() => onBpmChange(bpm + 1)}
            aria-label="Increase BPM"
          >
            +
          </button>
        </div>
        <input
          type="range"
          className="bpm-slider"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value))}
          min={60}
          max={200}
        />
      </div>
    </div>
  );
}

export default Transport;
