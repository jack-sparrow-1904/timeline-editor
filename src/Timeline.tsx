// src/Timeline.tsx
import React from 'react'; // Keep React for useRef, useState, useLayoutEffect
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'; // UniqueIdentifier removed
import type { TimelineProps, Scene, Layer } from './types';
import { useTimelineUtils } from './hooks/useTimelineUtils';
import { SceneItem } from './components/SceneItem';
import { Playhead } from './components/Playhead';
import { TimelineRuler } from './components/TimelineRuler';

export const TimelineComponent = (props: TimelineProps) => {
  const {
    scenes, layers, currentTime, zoomLevel,
    onSceneChange, onLayerChange, /* onTimeChange, onZoomChange, onSelect, */ // onTimeChange is not used by these handlers but is a prop
    pixelsPerSecondAtZoom1 = 100,
    className, style
  } = props;

  const { timeToPixels, pixelsToTime } = useTimelineUtils(zoomLevel, pixelsPerSecondAtZoom1);

  const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current as any;

      if (activeData?.type === 'scene-resize-left' || activeData?.type === 'scene-resize-right') {
          const sceneElement = activeData.originalElement as Scene;
          activeData.dragStartSceneState = { // Store initial scene state
              startTime: sceneElement.startTime,
              duration: sceneElement.duration
          };
          if (onSceneChange) {
              onSceneChange({ type: 'resize-start', scene: sceneElement });
          }
      } else if (activeData?.type === 'layer-resize-left' || activeData?.type === 'layer-resize-right') {
          const layerElement = activeData.originalElement as Layer;
          activeData.dragStartLayerState = {
              startTime: layerElement.startTime,
              duration: layerElement.duration
          };
          if (onLayerChange) {
              onLayerChange({ type: 'resize-start', layer: layerElement });
          }
      }
  };

  const handleDragMove = (event: DragMoveEvent) => {
      const { active, delta } = event;
      const activeData = active.data.current as any;

      if (!activeData) return;

      const deltaXTime = pixelsToTime(delta.x);

      if ((activeData.type === 'scene-resize-left' || activeData.type === 'scene-resize-right') && onSceneChange) {
        const sceneElement = activeData.originalElement as Scene;
        const dragStartSceneState = activeData.dragStartSceneState as {startTime: number, duration: number} | undefined;
        if (!sceneElement || !dragStartSceneState) return;

        let newStartTime = dragStartSceneState.startTime;
        let newDuration = dragStartSceneState.duration;

        if (activeData.type === 'scene-resize-left') {
            newStartTime = dragStartSceneState.startTime + deltaXTime;
            newDuration = dragStartSceneState.duration - deltaXTime;
            if (newDuration < 100) { // Min scene duration 100ms
                newDuration = 100;
                newStartTime = dragStartSceneState.startTime + dragStartSceneState.duration - newDuration;
            }
        } else { // scene-resize-right
            newDuration = dragStartSceneState.duration + deltaXTime;
            if (newDuration < 100) {
                newDuration = 100;
            }
        }
        onSceneChange({ type: 'resize', scene: { ...sceneElement, startTime: newStartTime, duration: newDuration } });

      } else if ((activeData.type === 'layer-resize-left' || activeData.type === 'layer-resize-right') && onLayerChange) {
        const layerElement = activeData.originalElement as Layer;
        const dragStartLayerState = activeData.dragStartLayerState as {startTime: number, duration: number} | undefined;
        if (!layerElement || !dragStartLayerState) return;

        let newStartTime = dragStartLayerState.startTime;
        let newDuration = dragStartLayerState.duration;

        if (activeData.type === 'layer-resize-left') {
            newStartTime = dragStartLayerState.startTime + deltaXTime;
            newDuration = dragStartLayerState.duration - deltaXTime;
            if (newDuration < 50) {
                newDuration = 50;
                newStartTime = dragStartLayerState.startTime + dragStartLayerState.duration - newDuration;
            }
        } else { // layer-resize-right
            newDuration = dragStartLayerState.duration + deltaXTime;
            if (newDuration < 50) {
                newDuration = 50;
            }
        }
        // In handleDragMove for layer resize, ensure startTime is part of the payload for consistency,
        // even if only duration changes for 'layer-resize-right'.
        onLayerChange({ type: 'resize', layer: { ...layerElement, startTime: newStartTime, duration: newDuration } });
      }
  };

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, delta } = event;
      const activeData = active.data.current as any;

      if (!delta || !activeData?.originalElement) {
          // Handle cancellation or no-movement drag for scene resize
          if (activeData?.dragStartSceneState && onSceneChange && activeData?.originalElement) {
              const sceneElement = activeData.originalElement as Scene;
              onSceneChange({
                  type: 'resize-end',
                  scene: { ...sceneElement, startTime: activeData.dragStartSceneState.startTime, duration: activeData.dragStartSceneState.duration }
              });
          }
          if (activeData?.dragStartSceneState) {
              delete activeData.dragStartSceneState;
          }

          // Handle cancellation or no-movement drag for layer resize (existing logic)
          if (activeData?.dragStartLayerState && onLayerChange && activeData?.originalElement) {
              const layerElement = activeData.originalElement as Layer;
              onLayerChange({
                  type: 'resize-end',
                  layer: { ...layerElement, startTime: activeData.dragStartLayerState.startTime, duration: activeData.dragStartLayerState.duration }
              });
          }
          if (activeData?.dragStartLayerState) {
              delete activeData.dragStartLayerState;
          }
          return;
      }

      const { type, originalElement } = activeData;
      const dragTimeDelta = pixelsToTime(delta.x);

      if ((type === 'scene-resize-left' || type === 'scene-resize-right') && onSceneChange) {
          const sceneElement = activeData.originalElement as Scene;
          const dragStartSceneState = activeData.dragStartSceneState as {startTime: number, duration: number} | undefined;
          if (!dragStartSceneState) return;

          let newStartTime = dragStartSceneState.startTime;
          let newDuration = dragStartSceneState.duration;

          if (type === 'scene-resize-left') {
              newStartTime = dragStartSceneState.startTime + dragTimeDelta;
              newDuration = dragStartSceneState.duration - dragTimeDelta;
              if (newDuration < 100) {
                  newDuration = 100;
                  newStartTime = dragStartSceneState.startTime + dragStartSceneState.duration - newDuration;
              }
          } else { // scene-resize-right
              newDuration = dragStartSceneState.duration + dragTimeDelta;
              if (newDuration < 100) {
                  newDuration = 100;
              }
          }
          onSceneChange({
              type: 'resize-end',
              scene: { ...sceneElement, startTime: newStartTime, duration: newDuration }
          });
          if (activeData.dragStartSceneState) {
              delete activeData.dragStartSceneState;
          }
      } else if (type === 'scene' && onSceneChange) {
          const sceneElement = originalElement as Scene;
          onSceneChange({
              type: 'move',
              scene: { ...sceneElement, startTime: sceneElement.startTime + dragTimeDelta }
          });
      } else if (type === 'layer' && onLayerChange) {
          const layerElement = originalElement as Layer;
          onLayerChange({
              type: 'move',
              layer: { ...layerElement, startTime: layerElement.startTime + dragTimeDelta }
          });
      } else if ((type === 'layer-resize-left' || type === 'layer-resize-right') && onLayerChange) {
          const layerElement = activeData.originalElement as Layer;
          const dragStartLayerState = activeData.dragStartLayerState as {startTime: number, duration: number} | undefined;
          if (!dragStartLayerState) return;

          let newStartTime = dragStartLayerState.startTime;
          let newDuration = dragStartLayerState.duration;

          if (type === 'layer-resize-left') {
              newStartTime = dragStartLayerState.startTime + dragTimeDelta;
              newDuration = dragStartLayerState.duration - dragTimeDelta;
              if (newDuration < 50) {
                  newDuration = 50;
                  newStartTime = dragStartLayerState.startTime + dragStartLayerState.duration - newDuration;
              }
          } else { // layer-resize-right
              newDuration = dragStartLayerState.duration + dragTimeDelta;
              if (newDuration < 50) {
                  newDuration = 50;
              }
          }
          onLayerChange({
              type: 'resize-end',
              layer: { ...layerElement, startTime: newStartTime, duration: newDuration }
          });
          if (activeData.dragStartLayerState) {
              delete activeData.dragStartLayerState;
          }
      }
  };

  const totalDuration = scenes.length > 0 ? Math.max(0, ...scenes.map(s => s.startTime + s.duration)) : 10000;
  const timelineWrapperRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(200);

  React.useLayoutEffect(() => {
    if (timelineWrapperRef.current) setContainerHeight(timelineWrapperRef.current.offsetHeight);
  }, [scenes]);

  return (
    <div ref={timelineWrapperRef} className={`timeline-container ${className || ''}`} style={{ position: 'relative', ...style }}>
      <DndContext
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
      >
        <TimelineRuler
          duration={totalDuration}
          timeToPixels={timeToPixels}
          pixelsPerSecondAtZoom1={pixelsPerSecondAtZoom1}
          zoomLevel={zoomLevel}
        />
        <div className="tracks-wrapper" style={{ position: 'relative', border: '1px solid green', padding: '10px 0', minHeight: '100px' }}>
          <div className="scene-track" style={{ position: 'relative', height: '80px' }}>
            {scenes.map(scene => (
              <SceneItem
                key={scene.id}
                scene={scene}
                layersInScene={layers.filter(l => l.sceneId === scene.id)}
                timeToPixels={timeToPixels}
              />
            ))}
          </div>
        </div>
        <Playhead
          currentTime={currentTime}
          timeToPixels={timeToPixels}
          containerHeight={containerHeight}
        />
      </DndContext>
    </div>
  );
};
