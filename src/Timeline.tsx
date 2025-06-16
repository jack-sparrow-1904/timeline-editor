// src/Timeline.tsx
import React from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { TimelineProps, Scene, Layer } from './types';
import { useTimelineUtils } from './hooks/useTimelineUtils';
import { SceneItem } from './components/SceneItem';

// Placeholders will be replaced by actual components later
const TimelineRulerPlaceholder = (props: { duration: number, timeToPixels: (time: number) => number }) => (
  <div style={{ borderBottom: '1px solid #ccc', padding: '5px', backgroundColor: '#f0f0f0', boxSizing: 'border-box' }}>
    Ruler (Duration: {props.duration}ms)
  </div>
);

const PlayheadPlaceholder = (props: { currentTime: number, timeToPixels: (time: number) => number, containerHeight: number }) => (
  <div style={{
    position: 'absolute', left: props.timeToPixels(props.currentTime), top: 0,
    height: `${props.containerHeight}px`, width: '2px', backgroundColor: 'red', zIndex: 100
  }}></div>
);

export const TimelineComponent = (props: TimelineProps) => {
  const {
    scenes,
    // layers, // Still commented out as placeholder SceneItem doesn't use it
    currentTime, zoomLevel,
    onSceneChange, onLayerChange, /* onTimeChange, onZoomChange, onSelect, */
    pixelsPerSecondAtZoom1 = 100,
    className, style
  } = props;

  const { timeToPixels, pixelsToTime } = useTimelineUtils(zoomLevel, pixelsPerSecondAtZoom1);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta || !active.data.current) {
      console.warn('DragEndEvent missing delta or active.data.current');
      return;
    }

    const dragTimeDelta = pixelsToTime(delta.x);
    const activeData = active.data.current as { type?: string, originalElement?: Scene | Layer, id?: UniqueIdentifier };

    if (!activeData.originalElement || !activeData.type) {
      console.warn('DragEndEvent active.data.current.originalElement or type is missing');
      return;
    }
    const { type, originalElement } = activeData;

    if (type === 'scene' && onSceneChange) {
      const sceneElement = originalElement as Scene;
      onSceneChange({
        type: 'move',
        scene: { ...sceneElement, startTime: sceneElement.startTime + dragTimeDelta }
      });
    } else if (type === 'layer' && onLayerChange) {
      // This assumes 'originalElement' for a layer drag already has its properties correctly set up
      // Layer dragging logic might need to be more sophisticated in SceneItem/LayerItem
      const layerElement = originalElement as Layer;
      onLayerChange({
        type: 'move',
        layer: { ...layerElement, startTime: layerElement.startTime + dragTimeDelta }
      });
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
      <DndContext onDragEnd={handleDragEnd}>
        <TimelineRulerPlaceholder duration={totalDuration} timeToPixels={timeToPixels} />
        <div className="tracks-wrapper" style={{ position: 'relative', border: '1px solid green', padding: '10px 0', minHeight: '100px' }}>
          <div className="scene-track" style={{ position: 'relative', height: '80px' }}>
            {scenes.map(scene => (
              <SceneItem
                key={scene.id}
                scene={scene}
                timeToPixels={timeToPixels}
                // layersInScene={layers.filter(l => l.sceneId === scene.id)} // Keep commented for now
                // onLayerChange={onLayerChange} // Keep commented for now
              />
            ))}
          </div>
          {/* Global layers track can be added here */}
        </div>
        <PlayheadPlaceholder currentTime={currentTime} timeToPixels={timeToPixels} containerHeight={containerHeight} />
      </DndContext>
    </div>
  );
};
