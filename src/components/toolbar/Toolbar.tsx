import { useEffect, useState, useCallback } from 'react';
import { historyManager } from '../../state/HistoryManager';
import './Toolbar.css';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onRandomize: () => void;
  isPlaying: boolean;
}

function Toolbar({
  onUndo,
  onRedo,
  onClearAll,
  onRandomize,
  isPlaying,
}: ToolbarProps) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const unsubscribe = historyManager.subscribe((undo, redo) => {
      setCanUndo(undo);
      setCanRedo(redo);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcuts
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo) onUndo();
    } else if (cmdOrCtrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      if (canRedo) onRedo();
    } else if (cmdOrCtrl && e.key === 'y') {
      e.preventDefault();
      if (canRedo) onRedo();
    } else if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      setShowShortcuts(prev => !prev);
    }
  }, [canUndo, canRedo, onUndo, onRedo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const shortcuts = [
    { key: 'Space', action: 'Play/Stop' },
    { key: 'Ctrl/Cmd + Z', action: 'Undo' },
    { key: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
    { key: '1-4 / Q-R', action: 'Trigger Drums' },
    { key: 'T', action: 'Trigger Synth' },
    { key: '?', action: 'Show Shortcuts' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${!canUndo ? 'disabled' : ''}`}
          onClick={onUndo}
          disabled={!canUndo}
          title={`Undo${canUndo ? `: ${historyManager.getUndoDescription()}` : ''} (Ctrl+Z)`}
        >
          <span className="btn-icon">↶</span>
          <span className="btn-label">Undo</span>
        </button>
        <button
          className={`toolbar-btn ${!canRedo ? 'disabled' : ''}`}
          onClick={onRedo}
          disabled={!canRedo}
          title={`Redo${canRedo ? `: ${historyManager.getRedoDescription()}` : ''} (Ctrl+Shift+Z)`}
        >
          <span className="btn-icon">↷</span>
          <span className="btn-label">Redo</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onClearAll}
          title="Clear all patterns"
        >
          <span className="btn-icon">⌫</span>
          <span className="btn-label">Clear</span>
        </button>
        <button
          className="toolbar-btn accent"
          onClick={onRandomize}
          title="Generate random pattern"
        >
          <span className="btn-icon">🎲</span>
          <span className="btn-label">Random</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn info ${showShortcuts ? 'active' : ''}`}
          onClick={() => setShowShortcuts(!showShortcuts)}
          title="Keyboard shortcuts (?)"
        >
          <span className="btn-icon">⌨</span>
          <span className="btn-label">Keys</span>
        </button>
      </div>

      {showShortcuts && (
        <div className="shortcuts-panel">
          <div className="shortcuts-header">
            <span>Keyboard Shortcuts</span>
            <button
              className="close-btn"
              onClick={() => setShowShortcuts(false)}
            >
              ×
            </button>
          </div>
          <div className="shortcuts-list">
            {shortcuts.map(({ key, action }) => (
              <div key={key} className="shortcut-item">
                <kbd className="shortcut-key">{key}</kbd>
                <span className="shortcut-action">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="playing-indicator">
          <span className="pulse" />
          <span>Playing</span>
        </div>
      )}
    </div>
  );
}

export default Toolbar;
