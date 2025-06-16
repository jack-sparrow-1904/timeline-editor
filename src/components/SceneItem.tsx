// src/components/SceneItem.tsx
import React from 'react';
import type { Scene /*, Layer*/ } from '../types'; // Using 'type' for Layer as it's not used directly yet
// import { useDraggable } from '@dnd-kit/core'; // Will be added in a later step
// import { LayerItem } from './LayerItem'; // Will be added when LayerItem is created

export interface SceneItemProps {
  scene: Scene;
  // layersInScene: Layer[]; // To be used when rendering LayerItem
  timeToPixels: (time: number) => number;
  // pixelsToTime: (pixels: number) => number; // For resizing/interaction later
  // onLayerChange: (change: LayerChange) => void; // For layer interactions
  // isSelected?: boolean; // For selection styling later
  // onSelect?: (id: string) => void; // For selection handling later
}

export const SceneItem = ({ scene, timeToPixels }: SceneItemProps) => {
  // const {attributes, listeners, setNodeRef, transform} = useDraggable({
  //   id: `scene-${scene.id}`,
  //   data: {
  //     type: 'scene',
  //     originalElement: scene,
  //   },
  // });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: timeToPixels(scene.startTime),
    width: timeToPixels(scene.duration),
    height: '60px', // Default height, can be made configurable
    backgroundColor: scene.meta?.backgroundColor || 'rgba(173, 216, 230, 0.7)', // Lightblue with some transparency
    border: '1px solid #007bff', // A distinct blue border
    borderRadius: '4px',
    boxSizing: 'border-box',
    overflow: 'hidden', // To contain layers when they are added
    cursor: 'pointer', // Default cursor, will be 'grab' when draggable
    // transition: transform ? 'transform 0.25s ease' : 'none', // Smooth transform
    // transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: 1, // Default z-index
  };

  return (
    <div
      // ref={setNodeRef} // For dnd-kit
      style={style}
      // {...listeners} // For dnd-kit
      // {...attributes} // For dnd-kit
      className="rt-scene-item" // For custom styling
      title={scene.meta?.name || `Scene ${scene.id}`}
    >
      <div style={{ padding: '5px', fontWeight: 'bold' }}>
        {scene.meta?.name || scene.id}
      </div>
      {/* Layers will be rendered here */}
      {/* {layersInScene.map(layer => <LayerItem key={layer.id} ... />)} */}
    </div>
  );
};
