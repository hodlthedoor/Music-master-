// History Manager - Undo/Redo functionality

export interface AppState {
  synthPattern: boolean[];
  drumPatterns: boolean[][];
  bpm: number;
  synthNote: number;
}

interface HistoryEntry {
  state: AppState;
  description: string;
  timestamp: number;
}

class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;
  private listeners: ((canUndo: boolean, canRedo: boolean) => void)[] = [];

  initialize(initialState: AppState): void {
    this.history = [{
      state: this.cloneState(initialState),
      description: 'Initial state',
      timestamp: Date.now()
    }];
    this.currentIndex = 0;
    this.notifyListeners();
  }

  private cloneState(state: AppState): AppState {
    return {
      synthPattern: [...state.synthPattern],
      drumPatterns: state.drumPatterns.map(p => [...p]),
      bpm: state.bpm,
      synthNote: state.synthNote
    };
  }

  push(state: AppState, description: string): void {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      state: this.cloneState(state),
      description,
      timestamp: Date.now()
    });

    // Trim history if it exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }

    this.notifyListeners();
  }

  undo(): AppState | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    this.notifyListeners();
    return this.cloneState(this.history[this.currentIndex].state);
  }

  redo(): AppState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    this.notifyListeners();
    return this.cloneState(this.history[this.currentIndex].state);
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getCurrentDescription(): string {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].description;
    }
    return '';
  }

  getUndoDescription(): string {
    if (this.canUndo()) {
      return this.history[this.currentIndex].description;
    }
    return '';
  }

  getRedoDescription(): string {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description;
    }
    return '';
  }

  subscribe(callback: (canUndo: boolean, canRedo: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.canUndo(), this.canRedo());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.canUndo(), this.canRedo());
    }
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners();
  }

  getHistoryLength(): number {
    return this.history.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

export const historyManager = new HistoryManager();
