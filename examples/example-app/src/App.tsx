// examples/example-app/src/App.tsx
import React, { useState, useCallback, useMemo } from 'react';
import './App.css'; // Example app's own global styles
import {
  Timeline,
  type Scene,
  type Layer,
  type SceneChange,
  type LayerChange,
  type TimelineProps
} from 'react-timeline-library';

import '../../../src/styles/default.css';

// Shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardDescription
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Richer Sample Data
const initialScenes: Scene[] = [
  { id: 's1', startTime: 0, duration: 25000, meta: { name: 'Project Kickoff', backgroundColor: 'rgba(100, 149, 237, 0.6)' } }, // Cornflower blue
  { id: 's2', startTime: 28000, duration: 30000, meta: { name: 'Development Phase 1', backgroundColor: 'rgba(255, 160, 122, 0.6)' } }, // Light salmon
  { id: 's3', startTime: 32000, duration: 20000, meta: { name: 'Client Review Loop (Overlap with Dev1)', backgroundColor: 'rgba(218, 112, 214, 0.5)' } }, // Orchid, demonstrates overlap if not handled
  { id: 's4', startTime: 60000, duration: 22000, meta: { name: 'Development Phase 2', backgroundColor: 'rgba(60, 179, 113, 0.6)' } }, // Medium sea green
  { id: 's5', startTime: 85000, duration: 15000, meta: { name: 'Pre-Launch Activities', backgroundColor: 'rgba(255, 215, 0, 0.6)' } }, // Gold
  { id: 's6', startTime: 102000, duration: 10000, meta: { name: 'Launch Event' } }, // Default color
];

const initialLayers: Layer[] = [
  // Layers for Scene 1 (Project Kickoff)
  { id: 'l1a', sceneId: 's1', track: 1, startTime: 1000, duration: 8000, meta: { type: 'text', text: 'Initial Planning Meeting' } },
  { id: 'l1b', sceneId: 's1', track: 2, startTime: 2000, duration: 10000, meta: { type: 'image', src: 'kickoff_slide.jpg' } },
  { id: 'l1c', sceneId: 's1', track: 1, startTime: 10000, duration: 12000, meta: { type: 'shape', shape: 'milestone_diamond' } },
  { id: 'l1d', sceneId: 's1', track: 3, startTime: 5000, duration: 15000, meta: { type: 'text', text: 'Resource Allocation' } },

  // Layers for Scene 2 (Development Phase 1)
  { id: 'l2a', sceneId: 's2', track: 1, startTime: 0, duration: 15000, meta: { type: 'text', text: 'Frontend Development Sprints' } },
  { id: 'l2b', sceneId: 's2', track: 2, startTime: 2000, duration: 12000, meta: { type: 'shape', shape: 'progress_bar' } },
  { id: 'l2c', sceneId: 's2', track: 1, startTime: 16000, duration: 10000, meta: { type: 'image', src: 'ui_mockups.png' } },
  { id: 'l2d', sceneId: 's2', track: 2, startTime: 18000, duration: 8000, meta: { type: 'text', text: 'Backend API Work' } },

  // Layers for Scene 3 (Client Review Loop) - note scene itself overlaps with s2 if not handled by user
  { id: 'l3a', sceneId: 's3', track: 1, startTime: 1000, duration: 5000, meta: { type: 'text', text: 'Feedback Session 1' } },
  { id: 'l3b', sceneId: 's3', track: 2, startTime: 6000, duration: 8000, meta: { type: 'image', src: 'client_feedback.png'} },
  { id: 'l3c', sceneId: 's3', track: 1, startTime: 15000, duration: 4000, meta: { type: 'text', text: 'Revisions' } },

  // Layers for Scene 4 (Development Phase 2)
  { id: 'l4a', sceneId: 's4', track: 1, startTime: 1000, duration: 20000, meta: { type: 'text', text: 'Integration & Testing' } },
  { id: 'l4b', sceneId: 's4', track: 2, startTime: 5000, duration: 15000, meta: { type: 'shape', shape: 'testing_cycle' } },

  // Layers for Scene 5 (Pre-Launch Activities)
  { id: 'l5a', sceneId: 's5', track: 1, startTime: 0, duration: 7000, meta: { type: 'text', text: 'Marketing Campaign Prep' } },
  { id: 'l5b', sceneId: 's5', track: 2, startTime: 8000, duration: 6000, meta: { type: 'image', src: 'ad_banner.jpg' } },

  // Layers for Scene 6 (Launch Event)
  { id: 'l6a', sceneId: 's6', track: 1, startTime: 1000, duration: 8000, meta: { type: 'text', text: 'Keynote Presentation' } },
];

function App() {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes); // Using new constant name
  const [layers, setLayers] = useState<Layer[]>(initialLayers); // Using new constant name
  // const [globalLayers, setGlobalLayers] = useState<GlobalLayer[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pixelsPerSecondAtZoom1] = useState<number>(100);
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null);

  const handleSceneChange = useCallback((change: SceneChange) => {
    console.log('App: Scene Change:', change);
    setScenes(prevScenes => prevScenes.map(s => (s.id === change.scene.id ? change.scene : s)));
  }, []);

  const handleLayerChange = useCallback((change: LayerChange) => {
    console.log('App: Layer Change:', change);
    setLayers(prevLayers => prevLayers.map(l => (l.id === change.layer.id ? change.layer : l)));
  }, []);

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    console.log('App: Zoom Change:', newZoom);
    setZoomLevel(newZoom);
  }, []);

  const handleSelect = useCallback((selection: { type: string; id: string } | null) => {
    console.log('App: Selection Change:', selection);
    setSelectedItem(selection);
  }, []);

  const timelineProps: TimelineProps = {
    scenes,
    layers,
    // globalLayers,
    currentTime,
    zoomLevel,
    pixelsPerSecondAtZoom1,
    onSceneChange: handleSceneChange,
    onLayerChange: handleLayerChange,
    onTimeChange: handleTimeChange,
    onZoomChange: handleZoomChange,
    onSelect: handleSelect,
    className: "my-custom-timeline-instance",
    style: { height: '100%', border: '2px solid #3b82f6' }
  };

  const handleAddScene = () => {
    const newSceneId = `s${scenes.length + 1}_${Date.now()}`;
    const lastScene = scenes.length > 0 ? scenes[scenes.length - 1] : null;
    const newStartTime = lastScene ? lastScene.startTime + lastScene.duration + 5000 : 0;
    setScenes(prev => [
      ...prev,
      { id: newSceneId, startTime: newStartTime, duration: 10000, meta: { name: `New Scene ${scenes.length + 1}` } }
    ]);
  };

  const handleAddLayerToSelectedScene = () => {
    if (selectedItem?.type === 'scene' && selectedItem.id) {
      const sceneId = selectedItem.id;
      const existingLayersInScene = layers.filter(l => l.sceneId === sceneId);
      const newLayerId = `l${sceneId}_${existingLayersInScene.length + 1}_${Date.now()}`;
      const newTrack = (existingLayersInScene.reduce((maxTrack, l) => Math.max(maxTrack, l.track), 0) % 2) + 1;

      setLayers(prev => [
        ...prev,
        { id: newLayerId, sceneId, track: newTrack, startTime: 0, duration: 5000, meta: { type: 'text' } }
      ]);
    } else {
      alert("Please select a scene first to add a layer to it.");
    }
  };

  const handleResetData = () => {
    setScenes(initialScenes); // Uses new constant name
    setLayers(initialLayers); // Uses new constant name
    setCurrentTime(0);
    setZoomLevel(1);
    setSelectedItem(null);
  };

  const selectedElementDetails = useMemo(() => {
    if (!selectedItem) return null;
    if (selectedItem.type === 'scene') {
      return scenes.find(s => s.id === selectedItem.id);
    }
    if (selectedItem.type === 'layer') {
      return layers.find(l => l.id === selectedItem.id);
    }
    return null;
  }, [selectedItem, scenes, layers]);

  return (
    <div className="p-4 flex flex-col h-screen dark:bg-slate-900 dark:text-white">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">React Timeline Library - Example</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentTime">Current Time (s): {(currentTime / 1000).toFixed(2)}</Label>
              <Slider
                id="currentTime"
                min={0}
                max={Math.max(60000, ...scenes.map(s => s.startTime + s.duration), currentTime)}
                step={100}
                value={[currentTime]}
                onValueChange={(value) => handleTimeChange(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="zoomLevel">Zoom Level: {zoomLevel.toFixed(2)}x</Label>
              <Slider
                id="zoomLevel"
                min={0.1}
                max={5}
                step={0.1}
                value={[zoomLevel]}
                onValueChange={(value) => handleZoomChange(value[0])}
              />
            </div>
            <div className="flex space-x-2 pt-2">
                <Button onClick={handleAddScene}>Add Scene</Button>
                <Button onClick={handleAddLayerToSelectedScene} disabled={selectedItem?.type !== 'scene'}>Add Layer</Button>
            </div>
             <Button onClick={handleResetData} variant="outline" className="w-full">Reset Data</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Selected Item Details</CardTitle></CardHeader>
          <CardContent className="text-xs overflow-auto max-h-60">
            {selectedElementDetails ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(selectedElementDetails, null, 2)}
              </pre>
            ) : (
              <p>Click on a scene or layer in the timeline to see details.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Event Log</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Interaction logs (scene/layer changes, selections) will appear in the browser console.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="timeline-container-wrapper flex-grow min-h-[300px] bg-white dark:bg-black rounded-md shadow-lg overflow-hidden">
        <Timeline {...timelineProps} />
      </div>
    </div>
  );
}

export default App;
