// src/types.ts

// --- Data Structures ---

export interface TimelineElement {
  id: string;
  startTime: number; // In milliseconds
  duration: number; // In milliseconds
}

export interface Scene extends TimelineElement {
  // Add any scene-specific metadata here
  meta?: {
    name?: string;
    backgroundColor?: string;
  };
}

export interface Layer extends TimelineElement {
  // Layers have a startTime RELATIVE to their parent scene
  sceneId: string;
  // Use a track number to handle vertical stacking within a scene
  track: number;
  // Add any layer-specific metadata here
  meta?: {
    type: 'text' | 'image' | 'shape';
    // ... other properties
  };
}

// Global layers are not tied to a scene
export interface GlobalLayer extends TimelineElement {
  track: string | number; // e.g., 'audio-1', 'watermarks'
  // ... metadata
}

// --- Callback Payloads ---

export type SceneChange = { type: 'move' | 'resize' | 'resize-start' | 'resize-end'; scene: Scene };
export type LayerChange = { type: 'move' | 'resize' | 'resize-start' | 'resize-end'; layer: Layer };

// --- Main Component Props ---

export interface TimelineProps {
  // Data Props
  scenes: Scene[];
  layers: Layer[];
  globalLayers?: GlobalLayer[];
  currentTime: number;
  zoomLevel: number; // A multiplier, e.g., 1 = 100px per second

  // Callback Props (The "Events")
  onSceneChange: (change: SceneChange) => void;
  onLayerChange: (change: LayerChange) => void;
  onTimeChange: (newTime: number) => void;
  onZoomChange: (newZoom: number) => void;
  onSelect?: (selection: { type: 'scene' | 'layer' | 'globalLayer'; id: string } | null) => void;

  // Configuration & Styling
  pixelsPerSecondAtZoom1?: number; // Default to 100
  style?: React.CSSProperties;
  className?: string;
}
