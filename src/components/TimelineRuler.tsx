// src/components/TimelineRuler.tsx
import React, { useRef, useCallback } from 'react'; // Add useRef, useCallback

export interface TimelineRulerProps {
  duration: number; // Total duration of the timeline in ms
  timeToPixels: (time: number) => number;
  pixelsToTime: (pixels: number) => number; // ADD THIS
  pixelsPerSecondAtZoom1: number; // To help determine appropriate tick density
  zoomLevel: number;
  onTimeChange?: (newTime: number) => void; // ADD THIS
}

const MIN_PX_PER_MAJOR_TICK = 80; // Minimum pixels between major ticks
const MIN_PX_PER_MINOR_TICK = 8;  // Minimum pixels between minor ticks

export const TimelineRuler = ({
    duration,
    timeToPixels,
    pixelsToTime, // Destructure
    pixelsPerSecondAtZoom1,
    zoomLevel,
    onTimeChange  // Destructure
}: TimelineRulerProps) => {
  const rulerRef = useRef<HTMLDivElement>(null); // Ref for the ruler div
  const rulerWidth = timeToPixels(duration);

  // ... (getTickIntervals and tick generation logic remains the same) ...
  const getTickIntervals = () => {
    const secondsPerMajorTickOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    let majorTickTimeInterval = 1000;
    for (const secs of secondsPerMajorTickOptions) {
      if (timeToPixels(secs * 1000) >= MIN_PX_PER_MAJOR_TICK) {
        majorTickTimeInterval = secs * 1000;
        break;
      }
    }
    let minorTickTimeInterval = majorTickTimeInterval / 10;
    if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK && majorTickTimeInterval / 5 >= MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval / 5;
    } else if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval / 2;
    }
     if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval;
    }
    return { majorTickTimeInterval, minorTickTimeInterval };
  };

  const { majorTickTimeInterval, minorTickTimeInterval } = getTickIntervals();
  const ticks = [];
  for (let time = 0; time <= duration; time += minorTickTimeInterval) {
    if (time > duration && duration > 0 && time - minorTickTimeInterval < duration) {
         ticks.push({ time: duration, type: 'minor' });
    } else if (time <= duration) {
        ticks.push({ time, type: 'minor' });
    }
  }
  for (let time = 0; time <= duration; time += majorTickTimeInterval) {
     if (time > duration && duration > 0 && time - majorTickTimeInterval < duration) {
        ticks.push({ time: duration, type: 'major', label: `${(duration / 1000).toFixed(1)}s` });
    } else if (time <= duration) {
        ticks.push({ time, type: 'major', label: `${(time / 1000).toFixed(time < 1000 && time !== 0 ? 1 : 0)}s` });
    }
  }
  if (duration > 0 && !ticks.find(t => t.time === duration && t.type ==='major')) {
      const lastMajorMultiple = Math.floor(duration / majorTickTimeInterval) * majorTickTimeInterval;
      if(duration - lastMajorMultiple > minorTickTimeInterval) {
        ticks.push({ time: duration, type: 'major', label: `${(duration / 1000).toFixed(1)}s` });
      }
  }
  const uniqueTicks = Array.from(new Map(ticks.map(tick => [tick.time + tick.type, tick])).values())
    .sort((a,b) => a.time - b.time);
  // End of tick generation logic


  const calculateTimeFromMouseEvent = (event: MouseEvent) => {
    if (!rulerRef.current) return 0;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    let newTime = pixelsToTime(x);
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    return newTime;
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const newTime = calculateTimeFromMouseEvent(event);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  }, [pixelsToTime, duration, onTimeChange]); // Include all dependencies

  const handleMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return; // Only main button
    const newTime = calculateTimeFromMouseEvent(event.nativeEvent);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const rulerStyle: React.CSSProperties = {
    position: 'relative',
    width: `${rulerWidth}px`,
    minWidth: '100%',
    height: '30px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'pointer', // Indicate it's clickable
  };

  return (
    <div
      ref={rulerRef}
      className="rt-timeline-ruler"
      style={rulerStyle}
      onMouseDown={handleMouseDown} // Attach mousedown listener
    >
      {/* ... (tick rendering logic remains the same) ... */}
      {uniqueTicks.map(({ time, type, label }) => {
        const isMajor = type === 'major';
        const tickStyle: React.CSSProperties = {
          position: 'absolute', left: `${timeToPixels(time)}px`, bottom: 0,
          width: '1px', height: isMajor ? '15px' : '8px', backgroundColor: '#888',
        };
        const labelStyle: React.CSSProperties = {
          position: 'absolute', left: `${timeToPixels(time) + 2}px`, bottom: '12px',
          fontSize: '10px', color: '#333', userSelect: 'none',
        };
        return (
          <React.Fragment key={`${type}-${time}`}>
            <div className={`rt-ruler-tick rt-ruler-tick-${type}`} style={tickStyle} />
            {isMajor && label && ( <div className="rt-ruler-label" style={labelStyle}>{label}</div>)}
          </React.Fragment>
        );
      })}
    </div>
  );
};
