// src/components/TimelineRuler.tsx
import React from 'react';

export interface TimelineRulerProps {
  duration: number; // Total duration of the timeline in ms
  timeToPixels: (time: number) => number;
  pixelsPerSecondAtZoom1: number; // To help determine appropriate tick density
  zoomLevel: number;
  // onScrub?: (time: number) => void; // For playhead scrubbing later
}

const MIN_PX_PER_MAJOR_TICK = 80; // Minimum pixels between major ticks
const MIN_PX_PER_MINOR_TICK = 8;  // Minimum pixels between minor ticks

export const TimelineRuler = ({ duration, timeToPixels, pixelsPerSecondAtZoom1, zoomLevel }: TimelineRulerProps) => {
  const rulerWidth = timeToPixels(duration);

  const getTickIntervals = () => {
    // Determine a suitable time interval for major ticks (e.g., 1s, 5s, 10s, 30s, 60s)
    // Aim for major ticks to be roughly MIN_PX_PER_MAJOR_TICK pixels apart
    const secondsPerMajorTickOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    let majorTickTimeInterval = 1000; // Default to 1 second

    for (const secs of secondsPerMajorTickOptions) {
      if (timeToPixels(secs * 1000) >= MIN_PX_PER_MAJOR_TICK) {
        majorTickTimeInterval = secs * 1000;
        break;
      }
    }

    // Minor ticks: try to have 5 or 10 minor ticks per major tick
    let minorTickTimeInterval = majorTickTimeInterval / 10;
    if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK && majorTickTimeInterval / 5 >= MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval / 5;
    } else if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval / 2; // Fallback
    }
     if (timeToPixels(minorTickTimeInterval) < MIN_PX_PER_MINOR_TICK) {
        minorTickTimeInterval = majorTickTimeInterval; // Fallback further
    }


    return { majorTickTimeInterval, minorTickTimeInterval };
  };

  const { majorTickTimeInterval, minorTickTimeInterval } = getTickIntervals();
  const ticks = [];

  // Generate minor ticks
  for (let time = 0; time <= duration; time += minorTickTimeInterval) {
    if (time > duration && duration > 0 && time - minorTickTimeInterval < duration) { // Ensure last tick isn't too far past, but include if close
         ticks.push({ time: duration, type: 'minor' });
    } else if (time <= duration) {
        ticks.push({ time, type: 'minor' });
    }
  }

  // Generate major ticks (these will overwrite minor ones at the same position if drawn separately, or style differently)
  // For simplicity here, we are not explicitly removing minor ticks that coincide with major ones,
  // but relying on the major tick styling to be more prominent.
  for (let time = 0; time <= duration; time += majorTickTimeInterval) {
     if (time > duration && duration > 0 && time - majorTickTimeInterval < duration) {
        ticks.push({ time: duration, type: 'major', label: `${(duration / 1000).toFixed(1)}s` });
    } else if (time <= duration) {
        ticks.push({ time, type: 'major', label: `${(time / 1000).toFixed(time < 1000 && time !== 0 ? 1 : 0)}s` });
    }
  }

  // Add a final tick at the very end of the duration if not already covered
  if (duration > 0 && !ticks.find(t => t.time === duration && t.type ==='major')) {
      const lastMajorMultiple = Math.floor(duration / majorTickTimeInterval) * majorTickTimeInterval;
      if(duration - lastMajorMultiple > minorTickTimeInterval) { // Only add if significantly past the last major/minor
        ticks.push({ time: duration, type: 'major', label: `${(duration / 1000).toFixed(1)}s` });
      }
  }


  const uniqueTicks = Array.from(new Map(ticks.map(tick => [tick.time + tick.type, tick])).values())
    .sort((a,b) => a.time - b.time);


  const rulerStyle: React.CSSProperties = {
    position: 'relative',
    width: `${rulerWidth}px`,
    minWidth: '100%', // Ensure it stretches if duration is short
    height: '30px', // Standard height for the ruler
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    boxSizing: 'border-box',
    overflow: 'hidden', // Don't let ticks overflow the designated ruler area
  };

  return (
    <div className="rt-timeline-ruler" style={rulerStyle}>
      {uniqueTicks.map(({ time, type, label }) => {
        const isMajor = type === 'major';
        const tickStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${timeToPixels(time)}px`,
          bottom: 0,
          width: '1px',
          height: isMajor ? '15px' : '8px', // Major ticks are taller
          backgroundColor: '#888',
        };
        const labelStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${timeToPixels(time) + 2}px`,
          bottom: '12px', // Position label above the major tick
          fontSize: '10px',
          color: '#333',
          userSelect: 'none',
        };
        return (
          <React.Fragment key={`${type}-${time}`}>
            <div className={`rt-ruler-tick rt-ruler-tick-${type}`} style={tickStyle} />
            {isMajor && label && (
              <div className="rt-ruler-label" style={labelStyle}>
                {label}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
