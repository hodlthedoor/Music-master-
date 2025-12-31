import './ChannelStrip.css';

interface ChannelStripProps {
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  level: number;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  isMaster?: boolean;
}

function ChannelStrip({
  name,
  volume,
  pan,
  mute,
  solo,
  level,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  isMaster = false,
}: ChannelStripProps) {
  const meterHeight = `${level * 100}%`;
  const meterColor = level > 0.9 ? 'var(--color-meter-red)' : level > 0.7 ? 'var(--color-meter-yellow)' : 'var(--color-meter-green)';

  return (
    <div className={`channel-strip ${isMaster ? 'master' : ''}`}>
      <div className="channel-name">{name}</div>

      {!isMaster && (
        <>
          <div className="pan-control">
            <input
              type="range"
              className="pan-slider"
              value={pan}
              onChange={(e) => onPanChange(parseFloat(e.target.value))}
              min={-1}
              max={1}
              step={0.01}
              aria-label={`${name} pan`}
            />
            <span className="pan-value">
              {pan === 0 ? 'C' : pan < 0 ? `${Math.abs(Math.round(pan * 100))}L` : `${Math.round(pan * 100)}R`}
            </span>
          </div>

          <div className="mute-solo">
            <button
              className={`ms-btn mute-btn ${mute ? 'active' : ''}`}
              onClick={onMuteToggle}
              aria-label={`${name} mute`}
            >
              M
            </button>
            <button
              className={`ms-btn solo-btn ${solo ? 'active' : ''}`}
              onClick={onSoloToggle}
              aria-label={`${name} solo`}
            >
              S
            </button>
          </div>
        </>
      )}

      <div className="fader-meter-group">
        <div className="vu-meter">
          <div
            className="vu-meter-fill"
            style={{ height: meterHeight, background: meterColor }}
          />
        </div>

        <div className="fader-container">
          <input
            type="range"
            className="fader"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            min={0}
            max={1}
            step={0.01}
            aria-label={`${name} volume`}
          />
        </div>
      </div>

      <div className="volume-value">{Math.round(volume * 100)}%</div>
    </div>
  );
}

export default ChannelStrip;
