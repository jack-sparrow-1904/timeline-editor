// src/components/LayerItem.tsx
import React from 'react';
import type { Layer } from '../types';
import { useDraggable } from '@dnd-kit/core';

export interface LayerItemProps {
  layer: Layer;
  timeToPixels: (time: number) => number;
  // pixelsToTime: (pixels: number) => number; // Will be needed by Timeline.tsx for calculations
}

const Handle = ({ id, layer, type, children, ...props }: any) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: id,
    data: {
      type: type, // 'layer-resize-left' or 'layer-resize-right'
      originalElement: layer,
      layerId: layer.id,
    },
  });

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '8px', // Width of the handle
    cursor: type.includes('left') ? 'ew-resize' : 'ew-resize', // Or 'w-resize', 'e-resize'
    zIndex: 35, // Above the layer item but below a fully dragging item
    backgroundColor: isDragging ? 'rgba(0,0,255,0.3)' : 'rgba(0,0,255,0.1)', // Visual feedback
  };
  if (type.includes('left')) {
    handleStyle.left = '-4px'; // Half outside
  } else {
    handleStyle.right = '-4px'; // Half outside
  }

  return (
    <div ref={setNodeRef} style={handleStyle} {...listeners} {...attributes} {...props}>
      {children}
    </div>
  );
};

export const LayerItem = ({ layer, timeToPixels }: LayerItemProps) => {
  const {attributes, listeners, setNodeRef, isDragging: isLayerDragging} = useDraggable({
    id: `layer-${layer.id}`,
    data: {
      type: 'layer',
      originalElement: layer,
      sceneId: layer.sceneId,
    },
  });

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    left: timeToPixels(layer.startTime), // startTime is relative to the scene
    width: timeToPixels(layer.duration),
    top: `${layer.track * 25}px`,
    height: '20px',
    backgroundColor: layer.meta?.type === 'text' ? 'rgba(144, 238, 144, 0.7)' : 'rgba(255, 165, 0, 0.7)',
    border: '1px solid #888',
    borderRadius: '3px',
    boxSizing: 'border-box',
    overflow: 'visible', // Changed from 'hidden' to allow handles to peek out
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: '0 5px',
    fontSize: '12px',
    lineHeight: '20px',
    cursor: isLayerDragging ? 'grabbing' : 'grab',
    opacity: isLayerDragging ? 0.75 : 1,
    zIndex: isLayerDragging ? 30 : 2,
  };

  return (
    <div
      ref={setNodeRef}
      style={layerStyle}
      {...listeners}
      {...attributes}
      className="rt-layer-item"
      title={`Layer: ${layer.id} (Track ${layer.track})`}
    >
      {/* Content of the layer */}
      <div style={{pointerEvents: 'none'}}> {/* Make text non-interactive for dragging layer itself */}
         {layer.meta?.type ? `${layer.meta.type}: ` : ''}{layer.id}
      </div>

      {/* Resize Handles */}
      <Handle id={`layer-${layer.id}-resize-left`} layer={layer} type="layer-resize-left" />
      <Handle id={`layer-${layer.id}-resize-right`} layer={layer} type="layer-resize-right" />
    </div>
  );
};
