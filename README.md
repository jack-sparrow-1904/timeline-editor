# React Timeline Library (Headless)

A flexible, headless, and scene-based React timeline library for building interactive timeline UIs.
This library provides the core logic and structure, allowing you to bring your own styling and integrate with any state management.

## Features (Current)

*   Scene and Layer rendering based on time and duration.
*   Draggable Scenes and Layers.
*   Resizable Scenes and Layers (from edges).
*   Playhead display.
*   Timeline Ruler with dynamic tick marks.
*   Playhead scrubbing via the ruler.
*   Snapping of scenes and layers during drag (to edges of other items of the same type).
*   Controlled component: all data and changes are managed via props and callbacks.

## Installation

```bash
npm install react-timeline-library # Replace with actual package name if different
# or
yarn add react-timeline-library
```

## Basic Usage

```jsx
import React, { useState, useCallback } from 'react';
import { Timeline, Scene, Layer, SceneChange, LayerChange, GlobalLayer } from 'react-timeline-library';
import 'react-timeline-library/dist/style.css'; // Import default styles

const App = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 'scene1', startTime: 0, duration: 10000, meta: { name: 'Scene 1' } },
    { id: 'scene2', startTime: 12000, duration: 8000, meta: { name: 'Scene 2' } },
  ]);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer1a', sceneId: 'scene1', track: 1, startTime: 500, duration: 3000, meta: { type: 'text' } },
    { id: 'layer1b', sceneId: 'scene1', track: 2, startTime: 4000, duration: 5000, meta: { type: 'image' } },
    { id: 'layer2a', sceneId: 'scene2', track: 1, startTime: 1000, duration: 6000, meta: { type: 'shape' } },
  ]);
  // const [globalLayers, setGlobalLayers] = useState<GlobalLayer[]>([]);

  const zoomLevel = 1; // Example zoom level

  const handleSceneChange = useCallback((change: SceneChange) => {
    console.log('Scene Change:', change);
    setScenes(prevScenes =>
      prevScenes.map(s => (s.id === change.scene.id ? change.scene : s))
    );
  }, []);

  const handleLayerChange = useCallback((change: LayerChange) => {
    console.log('Layer Change:', change);
    setLayers(prevLayers =>
      prevLayers.map(l => (l.id === change.layer.id ? change.layer : l))
    );
  }, []);

  const handleTimeChange = useCallback((newTime: number) => {
    console.log('Time Change:', newTime);
    setCurrentTime(newTime);
  }, []);

  // const handleZoomChange = useCallback((newZoom: number) => { /* ... */ }, []);
  // const handleSelect = useCallback((selection) => { /* ... */ }, []);


  return (
    <div style={{ margin: '20px' }}>
      <Timeline
        scenes={scenes}
        layers={layers}
        // globalLayers={globalLayers}
        currentTime={currentTime}
        zoomLevel={zoomLevel}
        onSceneChange={handleSceneChange}
        onLayerChange={handleLayerChange}
        onTimeChange={handleTimeChange}
        // onZoomChange={handleZoomChange}
        // onSelect={handleSelect}
        // pixelsPerSecondAtZoom1={100} // Optional: Default is 100
      />
      <p>Current Time: {currentTime / 1000}s</p>
    </div>
  );
};

export default App;
```

## API Reference: `TimelineProps`

The main `<Timeline />` component accepts the following props:

### Data Props

*   `scenes: Scene[]` (Required): An array of `Scene` objects.
    *   `Scene`: `{ id: string; startTime: number; duration: number; meta?: { name?: string; backgroundColor?: string; /* ...other */ } }`
*   `layers: Layer[]` (Required): An array of `Layer` objects.
    *   `Layer`: `{ id: string; sceneId: string; track: number; startTime: number; duration: number; meta?: { type: 'text' | 'image' | 'shape'; /* ...other */ } }` (startTime is relative to parent scene)
*   `globalLayers?: GlobalLayer[]`: An array of `GlobalLayer` objects, not tied to a scene.
    *   `GlobalLayer`: `{ id: string; track: string | number; startTime: number; duration: number; meta?: { /* ...other */ } }`
*   `currentTime: number` (Required): The current time of the playhead in milliseconds.
*   `zoomLevel: number` (Required): A multiplier for the timeline's zoom. E.g., `1` = 100px per second (default), `2` = 200px per second.

### Callback Props (Events)

*   `onSceneChange: (change: SceneChange) => void` (Required): Called when a scene is moved or resized.
    *   `SceneChange`: `{ type: 'move' | 'resize' | 'resize-start' | 'resize-end'; scene: Scene }`
*   `onLayerChange: (change: LayerChange) => void` (Required): Called when a layer is moved or resized.
    *   `LayerChange`: `{ type: 'move' | 'resize' | 'resize-start' | 'resize-end'; layer: Layer }`
*   `onTimeChange: (newTime: number) => void` (Required): Called when the `currentTime` should change (e.g., by playhead scrubbing). Passes time in milliseconds.
*   `onZoomChange: (newZoom: number) => void` (Required, but not fully implemented in UI yet): Called when the zoom level should change.
*   `onSelect?: (selection: { type: 'scene' | 'layer' | 'globalLayer'; id: string } | null) => void`: Called when an item is selected (selection UI not yet implemented).

### Configuration & Styling

*   `pixelsPerSecondAtZoom1?: number`: Defaults to `100`. Defines how many pixels represent one second at `zoomLevel = 1`.
*   `style?: React.CSSProperties`: Custom CSS styles for the main timeline container.
*   `className?: string`: Custom CSS class for the main timeline container.

## Styling

The library ships with default styles that are imported via `react-timeline-library/dist/style.css`.
You can override these styles by targeting the CSS classes used by the components.

Key CSS classes:
*   `.rt-timeline-container`: The main container.
*   `.rt-timeline-ruler`: The ruler area.
*   `.rt-ruler-tick`, `.rt-ruler-tick-minor`, `.rt-ruler-tick-major`, `.rt-ruler-label`: Elements within the ruler.
*   `.tracks-wrapper`: Container for scene and global tracks.
*   `.scene-track`: Specific container for scenes.
*   `.rt-scene-item`: Individual scene items.
*   `.rt-layer-item`: Individual layer items.
*   `.rt-playhead`: The playhead line.

Resize handles are currently styled inline but can be targeted if specific classes are added or via their parent item.

## Development

*   Clone the repository.
*   Install dependencies: `npm install`
*   Start the dev server: `npm run dev` (if example app is set up in Vite)
*   Build the library: `npm run build`

---
*This README is a work in progress and will be updated as the library evolves.*
