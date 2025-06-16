// src/hooks/useTimelineUtils.ts
import { useMemo } from 'react';

export const useTimelineUtils = (zoomLevel: number, pixelsPerSecondAtZoom1: number) => {
  return useMemo(() => {
    const timeToPixels = (time: number): number => {
      const timeInSeconds = time / 1000;
      return timeInSeconds * pixelsPerSecondAtZoom1 * zoomLevel;
    };

    const pixelsToTime = (pixels: number): number => {
      const seconds = pixels / (pixelsPerSecondAtZoom1 * zoomLevel);
      return Math.round(seconds * 1000); // Return as ms
    };

    return { timeToPixels, pixelsToTime };
  }, [zoomLevel, pixelsPerSecondAtZoom1]);
};
