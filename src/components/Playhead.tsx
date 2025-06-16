// src/components/Playhead.tsx
import React from 'react';

export interface PlayheadProps {
  currentTime: number;
  timeToPixels: (time: number) => number;
  containerHeight: number; // To make the playhead span the timeline height
  // onClick?: (time: number) => void; // For future click-to-seek functionality on playhead itself
}

export const Playhead = ({ currentTime, timeToPixels, containerHeight }: PlayheadProps) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${timeToPixels(currentTime)}px`,
    top: 0,
    bottom: 0, // Ensures it spans the height of its relative container if containerHeight is not used
    height: `${containerHeight}px`, // Explicit height
    width: '2px',
    backgroundColor: 'red',
    zIndex: 100, // Ensure it's above other elements like scenes and layers
    pointerEvents: 'none', // Typically, playhead doesn't intercept clicks unless for seeking
  };

  return (
    <div
      className="rt-playhead" // For custom styling
      style={style}
      title={`Current time: ${currentTime}ms`}
    />
  );
};
