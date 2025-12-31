import { useState, useEffect } from 'react';
import { audioEngine, WaveformType, SynthParams } from '../../audio/AudioEngine';
import './SynthControls.css';

const WAVEFORMS: WaveformType[] = ['sine', 'triangle', 'sawtooth', 'square'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

function SynthControls() {
  const [params, setParams] = useState<SynthParams>({
    waveform: 'sawtooth',
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
    filterCutoff: 2000,
    filterResonance: 1,
  });
  const [note, setNote] = useState(55); // A1 in MIDI

  useEffect(() => {
    setParams(audioEngine.getSynthParams());
    // Convert frequency to MIDI note
    const freq = audioEngine.getSynthNote();
    const midi = Math.round(12 * Math.log2(freq / 440) + 69);
    setNote(midi);
  }, []);

  const updateParam = <K extends keyof SynthParams>(key: K, value: SynthParams[K]) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    audioEngine.setSynthParams({ [key]: value });
  };

  const updateNote = (midi: number) => {
    setNote(midi);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    audioEngine.setSynthNote(freq);
  };

  const handleTestNote = () => {
    audioEngine.triggerSynth();
  };

  return (
    <div className="synth-controls">
      <div className="control-group">
        <label className="control-label">Waveform</label>
        <div className="waveform-buttons">
          {WAVEFORMS.map((wf) => (
            <button
              key={wf}
              className={`waveform-btn ${params.waveform === wf ? 'active' : ''}`}
              onClick={() => updateParam('waveform', wf)}
            >
              <WaveformIcon type={wf} />
              <span>{wf}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">Note</label>
        <div className="note-control">
          <button className="note-btn" onClick={() => updateNote(note - 1)}>-</button>
          <span className="note-display">{midiToNoteName(note)}</span>
          <button className="note-btn" onClick={() => updateNote(note + 1)}>+</button>
          <button className="test-btn" onClick={handleTestNote}>Test</button>
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">Envelope (ADSR)</label>
        <div className="adsr-controls">
          <div className="adsr-knob">
            <input
              type="range"
              value={params.attack}
              onChange={(e) => updateParam('attack', parseFloat(e.target.value))}
              min={0.001}
              max={1}
              step={0.001}
            />
            <span className="knob-label">A</span>
            <span className="knob-value">{params.attack.toFixed(2)}</span>
          </div>
          <div className="adsr-knob">
            <input
              type="range"
              value={params.decay}
              onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
              min={0.01}
              max={1}
              step={0.01}
            />
            <span className="knob-label">D</span>
            <span className="knob-value">{params.decay.toFixed(2)}</span>
          </div>
          <div className="adsr-knob">
            <input
              type="range"
              value={params.sustain}
              onChange={(e) => updateParam('sustain', parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.01}
            />
            <span className="knob-label">S</span>
            <span className="knob-value">{params.sustain.toFixed(2)}</span>
          </div>
          <div className="adsr-knob">
            <input
              type="range"
              value={params.release}
              onChange={(e) => updateParam('release', parseFloat(e.target.value))}
              min={0.01}
              max={2}
              step={0.01}
            />
            <span className="knob-label">R</span>
            <span className="knob-value">{params.release.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">Filter</label>
        <div className="filter-controls">
          <div className="filter-knob">
            <input
              type="range"
              value={params.filterCutoff}
              onChange={(e) => updateParam('filterCutoff', parseFloat(e.target.value))}
              min={100}
              max={10000}
              step={10}
            />
            <span className="knob-label">Cutoff</span>
            <span className="knob-value">{Math.round(params.filterCutoff)}Hz</span>
          </div>
          <div className="filter-knob">
            <input
              type="range"
              value={params.filterResonance}
              onChange={(e) => updateParam('filterResonance', parseFloat(e.target.value))}
              min={0.1}
              max={20}
              step={0.1}
            />
            <span className="knob-label">Res</span>
            <span className="knob-value">{params.filterResonance.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaveformIcon({ type }: { type: WaveformType }) {
  return (
    <svg viewBox="0 0 32 16" className="waveform-icon">
      {type === 'sine' && (
        <path d="M0 8 Q8 0, 16 8 Q24 16, 32 8" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      {type === 'triangle' && (
        <path d="M0 8 L8 2 L24 14 L32 8" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      {type === 'sawtooth' && (
        <path d="M0 14 L16 2 L16 14 L32 2" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      {type === 'square' && (
        <path d="M0 14 L0 2 L16 2 L16 14 L32 14 L32 2" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

export default SynthControls;
