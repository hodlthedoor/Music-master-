import { useState, useEffect } from 'react';
import { audioEngine, DrumSound, ChannelState } from '../../audio/AudioEngine';
import ChannelStrip from './ChannelStrip';
import './Mixer.css';

interface MixerProps {
  levels: number[];
  drumSounds: DrumSound[];
}

function Mixer({ levels, drumSounds }: MixerProps) {
  const [channelStates, setChannelStates] = useState<ChannelState[]>([]);
  const [masterVolume, setMasterVolume] = useState(0.8);

  useEffect(() => {
    setChannelStates(audioEngine.getChannelStates());
    setMasterVolume(audioEngine.getMasterVolume());
  }, []);

  const channelNames = ['Synth', ...drumSounds.map(d => d.name)];

  const handleVolumeChange = (index: number, volume: number) => {
    audioEngine.setChannelVolume(index, volume);
    setChannelStates(audioEngine.getChannelStates());
  };

  const handlePanChange = (index: number, pan: number) => {
    audioEngine.setChannelPan(index, pan);
    setChannelStates(audioEngine.getChannelStates());
  };

  const handleMuteToggle = (index: number) => {
    const state = channelStates[index];
    audioEngine.setChannelMute(index, !state.mute);
    setChannelStates(audioEngine.getChannelStates());
  };

  const handleSoloToggle = (index: number) => {
    const state = channelStates[index];
    audioEngine.setChannelSolo(index, !state.solo);
    setChannelStates(audioEngine.getChannelStates());
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    audioEngine.setMasterVolume(volume);
  };

  return (
    <div className="mixer">
      <div className="mixer-channels">
        {channelNames.map((name, index) => (
          <ChannelStrip
            key={name}
            name={name}
            volume={channelStates[index]?.volume ?? 0.8}
            pan={channelStates[index]?.pan ?? 0}
            mute={channelStates[index]?.mute ?? false}
            solo={channelStates[index]?.solo ?? false}
            level={levels[index] ?? 0}
            onVolumeChange={(v) => handleVolumeChange(index, v)}
            onPanChange={(p) => handlePanChange(index, p)}
            onMuteToggle={() => handleMuteToggle(index)}
            onSoloToggle={() => handleSoloToggle(index)}
          />
        ))}

        <div className="mixer-divider" />

        <ChannelStrip
          name="Master"
          volume={masterVolume}
          pan={0}
          mute={false}
          solo={false}
          level={levels[levels.length - 1] ?? 0}
          onVolumeChange={handleMasterVolumeChange}
          onPanChange={() => {}}
          onMuteToggle={() => {}}
          onSoloToggle={() => {}}
          isMaster
        />
      </div>
    </div>
  );
}

export default Mixer;
