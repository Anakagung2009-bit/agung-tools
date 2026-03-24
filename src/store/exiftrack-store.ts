import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "dashboard" | "upload" | "batch" | "history" | "tools" | "settings";

export interface GPSLocation {
  latitude: number;
  longitude: number;
}

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileFormat: string;
  width?: number;
  height?: number;
  resolution?: string;
  bitDepth?: number;
  colorSpace?: string;
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    serialNumber?: string;
  };
  exposure?: {
    iso?: number;
    aperture?: number;
    shutterSpeed?: string;
    focalLength?: string;
    exposureMode?: string;
    meteringMode?: string;
    flash?: string;
    whiteBalance?: string;
  };
  gps?: GPSLocation;
  dateTime?: {
    original?: string;
    modified?: string;
    digitized?: string;
  };
  author?: string;
  copyright?: string;
  software?: string;
  rawExif?: Record<string, unknown>;
  thumbnail?: string;
  preview?: string;
  addedAt: number;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  analyzedAt: number;
  hasGps: boolean;
  camera?: string;
}

interface AppState {
  // Navigation
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Current file being analyzed
  currentFile: FileMetadata | null;
  setCurrentFile: (file: FileMetadata | null) => void;

  // Batch files
  batchFiles: FileMetadata[];
  addBatchFile: (file: FileMetadata) => void;
  removeBatchFile: (id: string) => void;
  clearBatchFiles: () => void;

  // History
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;

  // Settings
  darkMode: boolean;
  toggleDarkMode: () => void;
  showRawView: boolean;
  toggleRawView: () => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;

  // Privacy
  privacyModeEnabled: boolean;
  setPrivacyModeEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: "dashboard",
      setCurrentView: (view) => set({ currentView: view }),

      // Current file
      currentFile: null,
      setCurrentFile: (file) => set({ currentFile: file }),

      // Batch files
      batchFiles: [],
      addBatchFile: (file) =>
        set((state) => ({ batchFiles: [...state.batchFiles, file] })),
      removeBatchFile: (id) =>
        set((state) => ({
          batchFiles: state.batchFiles.filter((f) => f.id !== id),
        })),
      clearBatchFiles: () => set({ batchFiles: [] }),

      // History
      history: [],
      addToHistory: (item) =>
        set((state) => {
          const newHistory = [item, ...state.history].slice(0, 50);
          return { history: newHistory };
        }),
      clearHistory: () => set({ history: [] }),

      // Settings
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", newDarkMode);
          }
          return { darkMode: newDarkMode };
        }),
      showRawView: false,
      toggleRawView: () =>
        set((state) => ({ showRawView: !state.showRawView })),
      privacyMode: true,
      togglePrivacyMode: () =>
        set((state) => ({ privacyMode: !state.privacyMode })),

      privacyModeEnabled: true,
      setPrivacyModeEnabled: (enabled) => set({ privacyModeEnabled: enabled }),
    }),
    {
      name: "exiftrack-storage",
      partialize: (state) => ({
        history: state.history,
        darkMode: state.darkMode,
        showRawView: state.showRawView,
        privacyMode: state.privacyMode,
        privacyModeEnabled: state.privacyModeEnabled,
      }),
    }
  )
);
