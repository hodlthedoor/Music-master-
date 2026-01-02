import { useState } from 'react';
import './BarOverview.css';

interface BarOverviewProps {
  patternLength: number;
  currentStep: number;
  selectedBars: number[];
  onPatternLengthChange: (length: number) => void;
  onBarSelect: (barIndex: number, multiSelect: boolean) => void;
  onInsertBar: (afterBar: number) => void;
  onDeleteBars: (bars: number[]) => void;
  onCopyBars: (bars: number[]) => void;
  onPasteBars: (afterBar: number) => void;
  onClearBars: (bars: number[]) => void;
  hasCopiedBars: boolean;
}

function BarOverview({
  patternLength,
  currentStep,
  selectedBars,
  onPatternLengthChange,
  onBarSelect,
  onInsertBar,
  onDeleteBars,
  onCopyBars,
  onPasteBars,
  onClearBars,
  hasCopiedBars,
}: BarOverviewProps) {
  const [showLengthMenu, setShowLengthMenu] = useState(false);

  const numBars = patternLength / 16;
  const currentBar = Math.floor(currentStep / 16);

  const lengthOptions = [
    { value: 16, label: '1 Bar (16 steps)' },
    { value: 32, label: '2 Bars (32 steps)' },
    { value: 64, label: '4 Bars (64 steps)' },
    { value: 128, label: '8 Bars (128 steps)' },
  ];

  const handleBarClick = (barIndex: number, e: React.MouseEvent) => {
    onBarSelect(barIndex, e.shiftKey || e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (barIndex: number) => {
    // Clear bar on double-click
    onClearBars([barIndex]);
  };

  const lastSelectedBar = selectedBars.length > 0 ? Math.max(...selectedBars) : numBars - 1;

  return (
    <div className="bar-overview">
      <div className="bar-controls">
        {/* Pattern Length Selector */}
        <div className="length-selector">
          <button
            className="length-btn"
            onClick={() => setShowLengthMenu(!showLengthMenu)}
          >
            <span className="length-icon">◫</span>
            <span className="length-text">{numBars} Bar{numBars > 1 ? 's' : ''}</span>
            <span className="dropdown-arrow">▾</span>
          </button>
          {showLengthMenu && (
            <div className="length-menu">
              {lengthOptions.map(({ value, label }) => (
                <button
                  key={value}
                  className={`length-option ${patternLength === value ? 'active' : ''}`}
                  onClick={() => {
                    onPatternLengthChange(value);
                    setShowLengthMenu(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bar Actions */}
        <div className="bar-actions">
          <button
            className="bar-action-btn"
            onClick={() => onInsertBar(lastSelectedBar)}
            disabled={patternLength >= 128}
            title="Add bar after selection"
          >
            <span className="action-icon">+</span>
            <span className="action-label">Add Bar</span>
          </button>
          <button
            className="bar-action-btn"
            onClick={() => selectedBars.length > 0 && onCopyBars(selectedBars)}
            disabled={selectedBars.length === 0}
            title="Copy selected bars"
          >
            <span className="action-icon">⧉</span>
            <span className="action-label">Copy</span>
          </button>
          <button
            className="bar-action-btn"
            onClick={() => onPasteBars(lastSelectedBar)}
            disabled={!hasCopiedBars}
            title="Paste after selection"
          >
            <span className="action-icon">⎗</span>
            <span className="action-label">Paste</span>
          </button>
          <button
            className="bar-action-btn danger"
            onClick={() => selectedBars.length > 0 && onClearBars(selectedBars)}
            disabled={selectedBars.length === 0}
            title="Clear selected bars"
          >
            <span className="action-icon">⌫</span>
            <span className="action-label">Clear</span>
          </button>
          <button
            className="bar-action-btn danger"
            onClick={() => selectedBars.length > 0 && onDeleteBars(selectedBars)}
            disabled={selectedBars.length === 0 || patternLength <= 16}
            title="Delete selected bars"
          >
            <span className="action-icon">✕</span>
            <span className="action-label">Delete</span>
          </button>
        </div>
      </div>

      {/* Bar Indicators */}
      <div className="bar-indicators">
        {Array.from({ length: numBars }, (_, i) => (
          <div
            key={i}
            className={`bar-indicator ${selectedBars.includes(i) ? 'selected' : ''} ${currentBar === i ? 'playing' : ''}`}
            onClick={(e) => handleBarClick(i, e)}
            onDoubleClick={() => handleDoubleClick(i)}
            title={`Bar ${i + 1} - Click to select, Shift+Click for multi-select, Double-click to clear`}
          >
            <span className="bar-number">{i + 1}</span>
            <div className="bar-progress">
              {currentBar === i && currentStep >= 0 && (
                <div
                  className="progress-fill"
                  style={{ width: `${((currentStep % 16) / 16) * 100}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bar-hint">
        <span>Click bars to select • Shift/Ctrl+click for multi-select • Double-click to clear</span>
      </div>
    </div>
  );
}

export default BarOverview;
