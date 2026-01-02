// Pattern Storage - Save/Load patterns to localStorage

export interface SavedPattern {
  id: string;
  name: string;
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  bpm: number;
  synthNote: number;
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  name: string;
  patternId: string;
  bars: number; // How many times to repeat
}

export interface Song {
  id: string;
  name: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

const PATTERNS_KEY = 'music-master-patterns';
const SONGS_KEY = 'music-master-songs';
const CURRENT_PATTERN_KEY = 'music-master-current';

class PatternStorage {
  // Pattern Management
  savePattern(pattern: Omit<SavedPattern, 'id' | 'createdAt' | 'updatedAt'>): SavedPattern {
    const patterns = this.getAllPatterns();
    const now = Date.now();

    const newPattern: SavedPattern = {
      ...pattern,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    patterns.push(newPattern);
    this.setPatterns(patterns);
    return newPattern;
  }

  updatePattern(id: string, updates: Partial<Omit<SavedPattern, 'id' | 'createdAt'>>): SavedPattern | null {
    const patterns = this.getAllPatterns();
    const index = patterns.findIndex(p => p.id === id);

    if (index === -1) return null;

    patterns[index] = {
      ...patterns[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.setPatterns(patterns);
    return patterns[index];
  }

  deletePattern(id: string): boolean {
    const patterns = this.getAllPatterns();
    const filtered = patterns.filter(p => p.id !== id);

    if (filtered.length === patterns.length) return false;

    this.setPatterns(filtered);
    return true;
  }

  getPattern(id: string): SavedPattern | null {
    const patterns = this.getAllPatterns();
    return patterns.find(p => p.id === id) || null;
  }

  getAllPatterns(): SavedPattern[] {
    try {
      const data = localStorage.getItem(PATTERNS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setPatterns(patterns: SavedPattern[]): void {
    localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns));
  }

  // Song Management (for arranging sections)
  saveSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Song {
    const songs = this.getAllSongs();
    const now = Date.now();

    const newSong: Song = {
      ...song,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    songs.push(newSong);
    this.setSongs(songs);
    return newSong;
  }

  updateSong(id: string, updates: Partial<Omit<Song, 'id' | 'createdAt'>>): Song | null {
    const songs = this.getAllSongs();
    const index = songs.findIndex(s => s.id === id);

    if (index === -1) return null;

    songs[index] = {
      ...songs[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.setSongs(songs);
    return songs[index];
  }

  deleteSong(id: string): boolean {
    const songs = this.getAllSongs();
    const filtered = songs.filter(s => s.id !== id);

    if (filtered.length === songs.length) return false;

    this.setSongs(filtered);
    return true;
  }

  getSong(id: string): Song | null {
    const songs = this.getAllSongs();
    return songs.find(s => s.id === id) || null;
  }

  getAllSongs(): Song[] {
    try {
      const data = localStorage.getItem(SONGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setSongs(songs: Song[]): void {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  }

  // Current Session
  saveCurrentPattern(pattern: {
    synthPattern: boolean[];
    drumPatterns: boolean[][];
    bpm: number;
    synthNote: number;
  }): void {
    localStorage.setItem(CURRENT_PATTERN_KEY, JSON.stringify(pattern));
  }

  loadCurrentPattern(): {
    synthPattern: boolean[];
    drumPatterns: boolean[][];
    bpm: number;
    synthNote: number;
  } | null {
    try {
      const data = localStorage.getItem(CURRENT_PATTERN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearCurrentPattern(): void {
    localStorage.removeItem(CURRENT_PATTERN_KEY);
  }

  // Utility
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export/Import
  exportAllData(): string {
    const data = {
      patterns: this.getAllPatterns(),
      songs: this.getAllSongs(),
      exportedAt: Date.now(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): { patterns: number; songs: number } {
    try {
      const data = JSON.parse(jsonString);

      if (data.patterns && Array.isArray(data.patterns)) {
        const existingPatterns = this.getAllPatterns();
        const newPatterns = data.patterns.filter(
          (p: SavedPattern) => !existingPatterns.some(ep => ep.id === p.id)
        );
        this.setPatterns([...existingPatterns, ...newPatterns]);
      }

      if (data.songs && Array.isArray(data.songs)) {
        const existingSongs = this.getAllSongs();
        const newSongs = data.songs.filter(
          (s: Song) => !existingSongs.some(es => es.id === s.id)
        );
        this.setSongs([...existingSongs, ...newSongs]);
      }

      return {
        patterns: data.patterns?.length || 0,
        songs: data.songs?.length || 0,
      };
    } catch {
      throw new Error('Invalid import data format');
    }
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(PATTERNS_KEY);
    localStorage.removeItem(SONGS_KEY);
    localStorage.removeItem(CURRENT_PATTERN_KEY);
  }
}

export const patternStorage = new PatternStorage();
