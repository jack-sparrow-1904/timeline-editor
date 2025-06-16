// src/Timeline.tsx
import React from 'react'; // Keep React for useRef, useState, useLayoutEffect
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'; // UniqueIdentifier removed
import type { TimelineProps, Scene, Layer } from './types';
import { useTimelineUtils } from './hooks/useTimelineUtils';
import { SceneItem } from './components/SceneItem';
import { Playhead } from './components/Playhead';
import { TimelineRuler } from './components/TimelineRuler';
import './styles/default.css';

const SNAP_THRESHOLD_PX = 8; // Define snap threshold here

export const TimelineComponent = (props: TimelineProps) => {
  const {
    scenes, layers, currentTime, zoomLevel,
    onSceneChange, onLayerChange, onTimeChange,
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

      let deltaXAdjusted = delta.x; // This will be adjusted by snapping logic for 'scene' and 'layer' types

      // Snapping for scene dragging
      if (activeData.type === 'scene' && scenes) {
        const activeScene = activeData.originalElement as Scene;
        const activeSceneOriginalLeft = timeToPixels(activeScene.startTime);
        const activeSceneWidth = timeToPixels(activeScene.duration);
        const projectedLeft = activeSceneOriginalLeft + delta.x;
        const projectedRight = projectedLeft + activeSceneWidth;

        for (const otherScene of scenes) {
          if (otherScene.id === activeScene.id) continue;
          const otherSceneLeft = timeToPixels(otherScene.startTime);
          const otherSceneRight = otherSceneLeft + timeToPixels(otherScene.duration);

          if (Math.abs(projectedLeft - otherSceneRight) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherSceneRight - activeSceneOriginalLeft; break;
          }
          if (Math.abs(projectedRight - otherSceneLeft) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherSceneLeft - activeSceneWidth - activeSceneOriginalLeft; break;
          }
          if (Math.abs(projectedLeft - otherSceneLeft) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherSceneLeft - activeSceneOriginalLeft; break;
          }
          if (Math.abs(projectedRight - otherSceneRight) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherSceneRight - activeSceneWidth - activeSceneOriginalLeft; break;
          }
        }
      }
      // Snapping for layer dragging (within the same scene)
      else if (activeData.type === 'layer' && layers) {
        const activeLayer = activeData.originalElement as Layer;
        const layersInSameScene = layers.filter(l => l.sceneId === activeLayer.sceneId);
        const activeLayerOriginalLeft = timeToPixels(activeLayer.startTime);
        const activeLayerWidth = timeToPixels(activeLayer.duration);
        const projectedLeft = activeLayerOriginalLeft + delta.x;
        const projectedRight = projectedLeft + activeLayerWidth;

        for (const otherLayer of layersInSameScene) {
          if (otherLayer.id === activeLayer.id) continue;
          const otherLayerLeft = timeToPixels(otherLayer.startTime);
          const otherLayerRight = otherLayerLeft + timeToPixels(otherLayer.duration);

          if (Math.abs(projectedLeft - otherLayerRight) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherLayerRight - activeLayerOriginalLeft; break;
          }
          if (Math.abs(projectedRight - otherLayerLeft) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherLayerLeft - activeLayerWidth - activeLayerOriginalLeft; break;
          }
          if (Math.abs(projectedLeft - otherLayerLeft) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherLayerLeft - activeLayerOriginalLeft; break;
          }
          if (Math.abs(projectedRight - otherLayerRight) <= SNAP_THRESHOLD_PX) {
            deltaXAdjusted = otherLayerRight - activeLayerWidth - activeLayerOriginalLeft; break;
          }
        }
      }

      const deltaXTimeToUse = pixelsToTime(deltaXAdjusted); // Use potentially adjusted delta for time conversion for move
      const originalDeltaXTime = pixelsToTime(delta.x); // Original delta for resize, which doesn't snap this way

      if ((activeData.type === 'scene-resize-left' || activeData.type === 'scene-resize-right') && onSceneChange) {
        const sceneElement = activeData.originalElement as Scene;
        const dragStartSceneState = activeData.dragStartSceneState as {startTime: number, duration: number} | undefined;
        if (!sceneElement || !dragStartSceneState) return;

        let newStartTime = dragStartSceneState.startTime;
        let newDuration = dragStartSceneState.duration;

        if (activeData.type === 'scene-resize-left') {
            newStartTime = dragStartSceneState.startTime + originalDeltaXTime; // Resize uses original delta
            newDuration = dragStartSceneState.duration - originalDeltaXTime;
            if (newDuration < 100) {
                newDuration = 100;
                newStartTime = dragStartSceneState.startTime + dragStartSceneState.duration - newDuration;
            }
        } else { // scene-resize-right
            newDuration = dragStartSceneState.duration + originalDeltaXTime; // Resize uses original delta
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
            newStartTime = dragStartLayerState.startTime + originalDeltaXTime; // Resize uses original delta
            newDuration = dragStartLayerState.duration - originalDeltaXTime;
            if (newDuration < 50) {
                newDuration = 50;
                newStartTime = dragStartLayerState.startTime + dragStartLayerState.duration - newDuration;
            }
        } else { // layer-resize-right
            newDuration = dragStartLayerState.duration + originalDeltaXTime; // Resize uses original delta
            if (newDuration < 50) {
                newDuration = 50;
            }
        }
        onLayerChange({ type: 'resize', layer: { ...layerElement, startTime: newStartTime, duration: newDuration } });
      }
      // Apply snapping for item move
      else if (activeData.type === 'scene' && onSceneChange) {
        const sceneElement = activeData.originalElement as Scene;
        // For move, we adjust startTime based on the (potentially) snapped delta
        onSceneChange({ type: 'move', scene: { ...sceneElement, startTime: sceneElement.startTime + deltaXTimeToUse } });
      } else if (activeData.type === 'layer' && onLayerChange) {
        const layerElement = activeData.originalElement as Layer;
        onLayerChange({ type: 'move', layer: { ...layerElement, startTime: layerElement.startTime + deltaXTimeToUse } });
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
      // For move operations, use the potentially snapped delta from onDragMove's logic
      // For resize operations, onDragEnd recalculates based on original delta to finalize.
      let dragTimeDelta = pixelsToTime(delta.x);

      if ((type === 'scene-resize-left' || type === 'scene-resize-right') && onSceneChange) {
          const sceneElement = activeData.originalElement as Scene;
          const dragStartSceneState = activeData.dragStartSceneState as {startTime: number, duration: number} | undefined;
          if (!dragStartSceneState) return;

          let newStartTime = dragStartSceneState.startTime;
          let newDuration = dragStartSceneState.duration;
          const finalResizeDeltaXTime = pixelsToTime(delta.x); // Use raw delta for final calculation for resize

          if (type === 'scene-resize-left') {
              newStartTime = dragStartSceneState.startTime + finalResizeDeltaXTime;
              newDuration = dragStartSceneState.duration - finalResizeDeltaXTime;
              if (newDuration < 100) {
                  newDuration = 100;
                  newStartTime = dragStartSceneState.startTime + dragStartSceneState.duration - newDuration;
              }
          } else { // scene-resize-right
              newDuration = dragStartSceneState.duration + finalResizeDeltaXTime;
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
          // For 'move', the delta might have been adjusted by snapping in onDragMove.
          // Re-evaluate final snapped position based on total delta.
          // Or, trust the last onDragMove's snapped position if it directly updated state (which it doesn't here, it calls onSceneChange).
          // For simplicity, we recalculate snap here for final position for 'move'.
          let finalDeltaX = delta.x;
          const activeScene = originalElement as Scene;
          const activeSceneOriginalLeft = timeToPixels(activeScene.startTime);
          const activeSceneWidth = timeToPixels(activeScene.duration);
          const projectedLeft = activeSceneOriginalLeft + delta.x;
          const projectedRight = projectedLeft + activeSceneWidth;

          for (const otherScene of scenes) {
            if (otherScene.id === activeScene.id) continue;
            const otherSceneLeft = timeToPixels(otherScene.startTime);
            const otherSceneRight = otherSceneLeft + timeToPixels(otherScene.duration);
            if (Math.abs(projectedLeft - otherSceneRight) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherSceneRight - activeSceneOriginalLeft; break;
            }
            if (Math.abs(projectedRight - otherSceneLeft) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherSceneLeft - activeSceneWidth - activeSceneOriginalLeft; break;
            }
            if (Math.abs(projectedLeft - otherSceneLeft) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherSceneLeft - activeSceneOriginalLeft; break;
            }
            if (Math.abs(projectedRight - otherSceneRight) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherSceneRight - activeSceneWidth - activeSceneOriginalLeft; break;
            }
          }
          dragTimeDelta = pixelsToTime(finalDeltaX); // Use the snapped delta for time calculation
          onSceneChange({
              type: 'move',
              scene: { ...activeScene, startTime: activeScene.startTime + dragTimeDelta }
          });

      } else if (type === 'layer' && onLayerChange) {
          let finalDeltaX = delta.x;
          const activeLayer = originalElement as Layer;
          const layersInSameScene = layers.filter(l => l.sceneId === activeLayer.sceneId);
          const activeLayerOriginalLeft = timeToPixels(activeLayer.startTime);
          const activeLayerWidth = timeToPixels(activeLayer.duration);
          const projectedLeft = activeLayerOriginalLeft + delta.x;
          const projectedRight = projectedLeft + activeLayerWidth;

          for (const otherLayer of layersInSameScene) {
            if (otherLayer.id === activeLayer.id) continue;
            const otherLayerLeft = timeToPixels(otherLayer.startTime);
            const otherLayerRight = otherLayerLeft + timeToPixels(otherLayer.duration);
            if (Math.abs(projectedLeft - otherLayerRight) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherLayerRight - activeLayerOriginalLeft; break;
            }
            if (Math.abs(projectedRight - otherLayerLeft) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherLayerLeft - activeLayerWidth - activeLayerOriginalLeft; break;
            }
            if (Math.abs(projectedLeft - otherLayerLeft) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherLayerLeft - activeLayerOriginalLeft; break;
            }
            if (Math.abs(projectedRight - otherLayerRight) <= SNAP_THRESHOLD_PX) {
                finalDeltaX = otherLayerRight - activeLayerWidth - activeLayerOriginalLeft; break;
            }
          }
          dragTimeDelta = pixelsToTime(finalDeltaX);
          onLayerChange({
              type: 'move',
              layer: { ...activeLayer, startTime: activeLayer.startTime + dragTimeDelta }
          });

      } else if ((type === 'layer-resize-left' || type === 'layer-resize-right') && onLayerChange) {
          const layerElement = activeData.originalElement as Layer;
          const dragStartLayerState = activeData.dragStartLayerState as {startTime: number, duration: number} | undefined;
          if (!dragStartLayerState) return;

          let newStartTime = dragStartLayerState.startTime;
          let newDuration = dragStartLayerState.duration;
          const finalResizeDeltaXTime = pixelsToTime(delta.x); // Use raw delta for final calculation

          if (type === 'layer-resize-left') {
              newStartTime = dragStartLayerState.startTime + finalResizeDeltaXTime;
              newDuration = dragStartLayerState.duration - finalResizeDeltaXTime;
              if (newDuration < 50) {
                  newDuration = 50;
                  newStartTime = dragStartLayerState.startTime + dragStartLayerState.duration - newDuration;
              }
          } else { // layer-resize-right
              newDuration = dragStartLayerState.duration + finalResizeDeltaXTime;
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
    <div ref={timelineWrapperRef} className={`rt-timeline-container ${className || ''}`} style={{ position: 'relative', ...style }}>
      <DndContext
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
      >
        <TimelineRuler
          duration={totalDuration}
          timeToPixels={timeToPixels}
          pixelsToTime={pixelsToTime}
          // pixelsPerSecondAtZoom1={pixelsPerSecondAtZoom1} // Removed
          // zoomLevel={zoomLevel} // Removed
          onTimeChange={onTimeChange}
        />
        <div className="tracks-wrapper" style={{ position: 'relative', border: '1px solid green', padding: '10px 0', minHeight: '100px' }}>
          <div className="scene-track" style={{ position: 'relative', height: '80px' }}>
            {scenes.map(scene => (
              <SceneItem
                key={scene.id}
                scene={scene}
                // allScenes={scenes} // No longer needed by SceneItem
                layersInScene={layers.filter(l => l.sceneId === scene.id)}
                timeToPixels={timeToPixels}
                // pixelsToTime={pixelsToTime} // No longer needed by SceneItem
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
