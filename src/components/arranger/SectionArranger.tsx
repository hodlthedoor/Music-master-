import { useState, useCallback } from 'react';
import { patternStorage, SavedPattern, Section, Song } from '../../state/PatternStorage';
import './SectionArranger.css';

interface SectionArrangerProps {
  currentPattern: {
    synthPattern: boolean[];
    drumPatterns: boolean[][];
    bpm: number;
    synthNote: number;
  };
  onLoadPattern: (pattern: SavedPattern) => void;
  onPlaySection: (sectionIndex: number) => void;
}

function SectionArranger({
  currentPattern,
  onLoadPattern,
  onPlaySection,
}: SectionArrangerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [patterns, setPatterns] = useState<SavedPattern[]>(() => patternStorage.getAllPatterns());
  const [songs, setSongs] = useState<Song[]>(() => patternStorage.getAllSongs());
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [newPatternName, setNewPatternName] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [newSongName, setNewSongName] = useState('');
  const [editingSection] = useState<number | null>(null);

  const refreshData = useCallback(() => {
    setPatterns(patternStorage.getAllPatterns());
    setSongs(patternStorage.getAllSongs());
  }, []);

  const handleSavePattern = () => {
    const name = newPatternName.trim() || `Pattern ${patterns.length + 1}`;
    patternStorage.savePattern({
      name,
      synthPattern: currentPattern.synthPattern,
      drumPatterns: currentPattern.drumPatterns,
      bpm: currentPattern.bpm,
      synthNote: currentPattern.synthNote,
    });
    setNewPatternName('');
    refreshData();
  };

  const handleDeletePattern = (id: string) => {
    if (confirm('Delete this pattern?')) {
      patternStorage.deletePattern(id);
      refreshData();
    }
  };

  const handleLoadPattern = (pattern: SavedPattern) => {
    onLoadPattern(pattern);
    setSelectedPatternId(pattern.id);
  };

  const handleCreateSong = () => {
    const name = newSongName.trim() || `Song ${songs.length + 1}`;
    const song = patternStorage.saveSong({
      name,
      sections: [],
    });
    setCurrentSong(song);
    setNewSongName('');
    refreshData();
  };

  const handleDeleteSong = (id: string) => {
    if (confirm('Delete this song?')) {
      patternStorage.deleteSong(id);
      if (currentSong?.id === id) {
        setCurrentSong(null);
      }
      refreshData();
    }
  };

  const handleAddSection = (patternId: string) => {
    if (!currentSong) return;

    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;

    const newSection: Section = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: pattern.name,
      patternId: patternId,
      bars: 1,
    };

    const updatedSong = patternStorage.updateSong(currentSong.id, {
      sections: [...currentSong.sections, newSection],
    });

    if (updatedSong) {
      setCurrentSong(updatedSong);
      refreshData();
    }
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (!currentSong) return;

    const newSections = currentSong.sections.filter((_, i) => i !== sectionIndex);
    const updatedSong = patternStorage.updateSong(currentSong.id, {
      sections: newSections,
    });

    if (updatedSong) {
      setCurrentSong(updatedSong);
      refreshData();
    }
  };

  const handleUpdateSectionBars = (sectionIndex: number, bars: number) => {
    if (!currentSong) return;

    const newSections = [...currentSong.sections];
    newSections[sectionIndex] = { ...newSections[sectionIndex], bars };

    const updatedSong = patternStorage.updateSong(currentSong.id, {
      sections: newSections,
    });

    if (updatedSong) {
      setCurrentSong(updatedSong);
      refreshData();
    }
  };

  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    if (!currentSong || fromIndex === toIndex) return;

    const newSections = [...currentSong.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    const updatedSong = patternStorage.updateSong(currentSong.id, {
      sections: newSections,
    });

    if (updatedSong) {
      setCurrentSong(updatedSong);
      refreshData();
    }
  };

  const handleDuplicateSection = (sectionIndex: number) => {
    if (!currentSong) return;

    const section = currentSong.sections[sectionIndex];
    const newSection: Section = {
      ...section,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const newSections = [...currentSong.sections];
    newSections.splice(sectionIndex + 1, 0, newSection);

    const updatedSong = patternStorage.updateSong(currentSong.id, {
      sections: newSections,
    });

    if (updatedSong) {
      setCurrentSong(updatedSong);
      refreshData();
    }
  };

  const getPatternColor = (index: number) => {
    const colors = ['#00d4ff', '#ff6b35', '#00ff88', '#ff4757', '#f7931e', '#9b59b6'];
    return colors[index % colors.length];
  };

  const getTotalBars = () => {
    if (!currentSong) return 0;
    return currentSong.sections.reduce((sum, s) => sum + s.bars, 0);
  };

  return (
    <div className="section-arranger">
      <button
        className="arranger-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="toggle-text">Pattern Library & Arranger</span>
        <span className="toggle-stats">
          {patterns.length} patterns • {songs.length} songs
        </span>
      </button>

      {isExpanded && (
        <div className="arranger-content">
          {/* Save Current Pattern */}
          <div className="save-section">
            <h4 className="section-heading">Save Current Pattern</h4>
            <div className="save-row">
              <input
                type="text"
                className="pattern-name-input"
                placeholder="Pattern name..."
                value={newPatternName}
                onChange={(e) => setNewPatternName(e.target.value)}
              />
              <button className="save-btn" onClick={handleSavePattern}>
                Save
              </button>
            </div>
          </div>

          {/* Pattern Library */}
          <div className="library-section">
            <h4 className="section-heading">Pattern Library</h4>
            {patterns.length === 0 ? (
              <p className="empty-message">No saved patterns yet</p>
            ) : (
              <div className="pattern-list">
                {patterns.map((pattern, index) => (
                  <div
                    key={pattern.id}
                    className={`pattern-item ${selectedPatternId === pattern.id ? 'selected' : ''}`}
                    style={{ '--pattern-color': getPatternColor(index) } as React.CSSProperties}
                  >
                    <button
                      className="pattern-info"
                      onClick={() => handleLoadPattern(pattern)}
                    >
                      <span className="pattern-name">{pattern.name}</span>
                      <span className="pattern-meta">{pattern.bpm} BPM</span>
                    </button>
                    <div className="pattern-actions">
                      {currentSong && (
                        <button
                          className="action-btn add"
                          onClick={() => handleAddSection(pattern.id)}
                          title="Add to song"
                        >
                          +
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeletePattern(pattern.id)}
                        title="Delete pattern"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Song Arrangement */}
          <div className="arrangement-section">
            <h4 className="section-heading">Song Arrangement</h4>

            {/* Song Selection */}
            <div className="song-selector">
              {songs.length > 0 && (
                <select
                  className="song-select"
                  value={currentSong?.id || ''}
                  onChange={(e) => {
                    const song = songs.find(s => s.id === e.target.value);
                    setCurrentSong(song || null);
                  }}
                >
                  <option value="">Select a song...</option>
                  {songs.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.name} ({song.sections.length} sections)
                    </option>
                  ))}
                </select>
              )}
              <div className="song-create">
                <input
                  type="text"
                  className="song-name-input"
                  placeholder="New song..."
                  value={newSongName}
                  onChange={(e) => setNewSongName(e.target.value)}
                />
                <button className="create-btn" onClick={handleCreateSong}>
                  New
                </button>
              </div>
            </div>

            {/* Current Song Sections */}
            {currentSong && (
              <div className="current-song">
                <div className="song-header">
                  <span className="song-name">{currentSong.name}</span>
                  <span className="song-info">
                    {currentSong.sections.length} sections • {getTotalBars()} bars
                  </span>
                  <button
                    className="delete-song-btn"
                    onClick={() => handleDeleteSong(currentSong.id)}
                  >
                    Delete Song
                  </button>
                </div>

                {currentSong.sections.length === 0 ? (
                  <p className="empty-message">
                    Add patterns from the library above
                  </p>
                ) : (
                  <div className="sections-timeline">
                    {currentSong.sections.map((section, index) => {
                      const patternIndex = patterns.findIndex(p => p.id === section.patternId);
                      return (
                        <div
                          key={section.id}
                          className={`section-block ${editingSection === index ? 'editing' : ''}`}
                          style={{
                            '--section-color': getPatternColor(patternIndex),
                            flex: section.bars,
                          } as React.CSSProperties}
                        >
                          <div className="section-header">
                            <span className="section-name">{section.name}</span>
                            <span className="section-bars">×{section.bars}</span>
                          </div>
                          <div className="section-controls">
                            <button
                              className="section-btn"
                              onClick={() => {
                                const pattern = patterns.find(p => p.id === section.patternId);
                                if (pattern) handleLoadPattern(pattern);
                              }}
                              title="Load pattern"
                            >
                              ↓
                            </button>
                            <button
                              className="section-btn"
                              onClick={() => onPlaySection(index)}
                              title="Play from here"
                            >
                              ▶
                            </button>
                            <button
                              className="section-btn"
                              onClick={() => handleDuplicateSection(index)}
                              title="Duplicate"
                            >
                              ⧉
                            </button>
                            {index > 0 && (
                              <button
                                className="section-btn"
                                onClick={() => handleMoveSection(index, index - 1)}
                                title="Move left"
                              >
                                ←
                              </button>
                            )}
                            {index < currentSong.sections.length - 1 && (
                              <button
                                className="section-btn"
                                onClick={() => handleMoveSection(index, index + 1)}
                                title="Move right"
                              >
                                →
                              </button>
                            )}
                            <input
                              type="number"
                              className="bars-input"
                              value={section.bars}
                              min={1}
                              max={16}
                              onChange={(e) => handleUpdateSectionBars(index, parseInt(e.target.value) || 1)}
                            />
                            <button
                              className="section-btn delete"
                              onClick={() => handleRemoveSection(index)}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionArranger;
