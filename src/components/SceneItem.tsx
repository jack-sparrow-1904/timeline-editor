// src/components/SceneItem.tsx
import React from 'react';
import type { Scene, Layer } from '../types';
import { LayerItem } from './LayerItem';
import { useDraggable } from '@dnd-kit/core'; // Modifier removed

// Re-using a similar Handle component structure as in LayerItem for consistency
// This could be refactored into a shared component later if desired.
const ResizeHandle = (props: {
    id: string;
    scene: Scene;
    type: 'scene-resize-left' | 'scene-resize-right';
    children?: React.ReactNode;
}) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: props.id,
    data: {
      type: props.type,
      originalElement: props.scene,
      sceneId: props.scene.id,
    },
  });

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '10px', // Slightly wider for scenes
    cursor: props.type === 'scene-resize-left' ? 'ew-resize' : 'ew-resize',
    zIndex: 15, // Above scene item, but below fully dragging item
    backgroundColor: isDragging ? 'rgba(0,100,255,0.3)' : 'rgba(0,100,255,0.1)',
  };
  if (props.type === 'scene-resize-left') {
    handleStyle.left = '-5px';
  } else {
    handleStyle.right = '-5px';
  }

  return (
    <div ref={setNodeRef} style={handleStyle} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
};


export interface SceneItemProps {
  scene: Scene;
  // allScenes: Scene[]; // No longer needed here, snapping is in Timeline.tsx
  layersInScene: Layer[];
  timeToPixels: (time: number) => number;
  // pixelsToTime: (pixels: number) => number; // No longer needed here
}

export const SceneItem = ({ scene, layersInScene, timeToPixels }: SceneItemProps) => { // Removed allScenes, pixelsToTime
  // Snapping logic will be moved to Timeline.tsx's onDragMove for main item drag

  const {attributes, listeners, setNodeRef, isDragging: isSceneDragging} = useDraggable({
    id: `scene-${scene.id}`,
    data: { type: 'scene', originalElement: scene },
    // modifiers: [snapToSceneEdgesModifier] // MODIFIER REMOVED FROM HERE
  });

  const sceneStyle: React.CSSProperties = {
    position: 'absolute',
    left: timeToPixels(scene.startTime),
    width: timeToPixels(scene.duration),
    height: '60px',
    backgroundColor: scene.meta?.backgroundColor || 'rgba(173, 216, 230, 0.7)',
    border: '1px solid #007bff',
    borderRadius: '4px',
    boxSizing: 'border-box',
    overflow: 'visible', // Important for handles to show
    cursor: isSceneDragging ? 'grabbing' : 'grab',
    opacity: isSceneDragging ? 0.75 : 1,
    zIndex: isSceneDragging ? 20 : 1, // Ensure dragging scene is on top
  };

  return (
    <div
      ref={setNodeRef}
      style={sceneStyle}
      {...listeners}
      {...attributes}
      className="rt-scene-item"
      title={scene.meta?.name || `Scene ${scene.id}`}
    >
      <div style={{ padding: '5px', fontWeight: 'bold', pointerEvents: 'none'}}>
        {scene.meta?.name || scene.id}
      </div>

      <div className="rt-scene-item-layers-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {layersInScene.map(layer => (
          <LayerItem
            key={layer.id}
            layer={layer}
            // allLayersInScene={layersInScene} // No longer needed by LayerItem
            timeToPixels={timeToPixels}
            // pixelsToTime={pixelsToTime} // No longer needed by LayerItem
          />
        ))}
      </div>

      {/* Scene Resize Handles */}
      <ResizeHandle id={`scene-${scene.id}-resize-left`} scene={scene} type="scene-resize-left" />
      <ResizeHandle id={`scene-${scene.id}-resize-right`} scene={scene} type="scene-resize-right" />
    </div>
  );
};
