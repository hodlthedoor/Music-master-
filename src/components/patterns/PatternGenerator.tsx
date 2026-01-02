import { useState } from 'react';
import {
  generatePattern,
  getAvailableStyles,
  PatternStyle,
  GeneratedPattern,
  mutatePattern,
  createFill,
} from '../../utils/PatternGenerator';
import { NOTE_NAMES } from '../../utils/MusicTheory';
import { SYNTH_PRESETS } from '../../audio/SynthPresets';
import './PatternGenerator.css';

interface PatternGeneratorProps {
  onApplyPattern: (pattern: GeneratedPattern) => void;
  onApplySynthOnly: (pattern: boolean[]) => void;
  onApplyDrumsOnly: (patterns: boolean[][]) => void;
  currentDrumPatterns: boolean[][];
}

function PatternGenerator({
  onApplyPattern,
  onApplySynthOnly,
  onApplyDrumsOnly,
  currentDrumPatterns,
}: PatternGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<PatternStyle>('rock');
  const [previewPattern, setPreviewPattern] = useState<GeneratedPattern | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = getAvailableStyles();

  const handleGenerate = () => {
    const pattern = generatePattern(selectedStyle);
    setPreviewPattern(pattern);
  };

  const handleApplyAll = () => {
    if (previewPattern) {
      onApplyPattern(previewPattern);
      setPreviewPattern(null);
    }
  };

  const handleApplySynth = () => {
    if (previewPattern) {
      onApplySynthOnly(previewPattern.synthPattern);
    }
  };

  const handleApplyDrums = () => {
    if (previewPattern) {
      onApplyDrumsOnly(previewPattern.drumPatterns);
    }
  };

  const handleMutate = () => {
    if (previewPattern) {
      setPreviewPattern({
        ...previewPattern,
        synthPattern: mutatePattern(previewPattern.synthPattern, 0.2),
        drumPatterns: previewPattern.drumPatterns.map(p => mutatePattern(p, 0.15)),
        name: `${previewPattern.name} (Mutated)`,
      });
    }
  };

  const handleCreateFill = () => {
    const fill = createFill(currentDrumPatterns);
    onApplyDrumsOnly(fill);
  };

  const handleQuickGenerate = (style: PatternStyle) => {
    const pattern = generatePattern(style);
    onApplyPattern(pattern);
  };

  const renderPatternPreview = (pattern: boolean[], label: string, color: string) => (
    <div className="pattern-preview-row">
      <span className="preview-label">{label}</span>
      <div className="preview-steps">
        {pattern.map((active, i) => (
          <div
            key={i}
            className={`preview-step ${active ? 'active' : ''} ${i % 4 === 0 ? 'beat' : ''}`}
            style={{ '--step-color': color } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pattern-generator">
      <button
        className="generator-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="toggle-text">Beat Generator</span>
        <span className="toggle-hint">Auto-generate patterns</span>
      </button>

      {isExpanded && (
        <div className="generator-content">
          {/* Quick Presets */}
          <div className="quick-presets">
            <span className="presets-label">Quick:</span>
            <div className="preset-buttons">
              {styles.slice(0, 4).map(style => (
                <button
                  key={style.value}
                  className="preset-btn"
                  onClick={() => handleQuickGenerate(style.value)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div className="style-selector">
            <label className="selector-label">Style:</label>
            <div className="style-grid">
              {styles.map(style => (
                <button
                  key={style.value}
                  className={`style-btn ${selectedStyle === style.value ? 'selected' : ''}`}
                  onClick={() => setSelectedStyle(style.value)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="generate-actions">
            <button className="generate-btn primary" onClick={handleGenerate}>
              Generate Preview
            </button>
            <button className="generate-btn secondary" onClick={handleCreateFill}>
              Create Fill
            </button>
          </div>

          {/* Preview Panel */}
          {previewPattern && (
            <div className="preview-panel">
              <div className="preview-header">
                <span className="preview-name">{previewPattern.name}</span>
                <span className="preview-bpm">{previewPattern.bpm} BPM</span>
              </div>

              <p className="preview-description">{previewPattern.description}</p>

              {/* Musical Info */}
              <div className="pattern-info">
                {previewPattern.key && (
                  <span className="info-tag key">
                    Key: {NOTE_NAMES[previewPattern.key.root]} {previewPattern.key.scale}
                  </span>
                )}
                {previewPattern.synthPreset && SYNTH_PRESETS[previewPattern.synthPreset] && (
                  <span className="info-tag preset">
                    Sound: {SYNTH_PRESETS[previewPattern.synthPreset].name}
                  </span>
                )}
                {previewPattern.swing !== undefined && previewPattern.swing > 0 && (
                  <span className="info-tag swing">
                    Swing: {Math.round(previewPattern.swing * 100)}%
                  </span>
                )}
              </div>

              <div className="preview-patterns">
                {renderPatternPreview(previewPattern.synthPattern, 'Synth', '#00d4ff')}
                {renderPatternPreview(previewPattern.drumPatterns[0], 'Kick', '#ff6b35')}
                {renderPatternPreview(previewPattern.drumPatterns[1], 'Snare', '#f7931e')}
                {renderPatternPreview(previewPattern.drumPatterns[2], 'HiHat', '#ffcc00')}
                {renderPatternPreview(previewPattern.drumPatterns[3], 'Clap', '#ff4757')}
              </div>

              <div className="preview-actions">
                <button className="apply-btn all" onClick={handleApplyAll}>
                  Apply All
                </button>
                <button className="apply-btn synth" onClick={handleApplySynth}>
                  Synth Only
                </button>
                <button className="apply-btn drums" onClick={handleApplyDrums}>
                  Drums Only
                </button>
                <button className="apply-btn mutate" onClick={handleMutate}>
                  Mutate
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatternGenerator;
