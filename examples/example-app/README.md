# React Timeline Library - Example Application

This application serves as a demonstration of the `react-timeline-library`.
It showcases how to integrate and use the `Timeline` component, interact with its features,
and control its state using React hooks and callbacks. This example uses Shadcn/ui for
some of its surrounding UI elements.

## Prerequisites

Ensure you have Node.js and npm installed.

## Running the Example

1.  **Navigate to the example application directory:**
    If you are in the root of the `react-timeline-library` project, run:
    ```bash
    cd examples/example-app
    ```

2.  **Install dependencies for the example app:**
    If you haven't already, or if there are new dependencies:
    ```bash
    npm install
    ```
    This will install dependencies listed in `examples/example-app/package.json`, including React, Vite, Shadcn/ui components, and any other utilities used by this specific example. The `react-timeline-library` itself is typically linked from the parent directory's `src` folder via Vite/TypeScript path aliases for development.

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, usually on `http://localhost:5173` (or the next available port). Open this URL in your browser to see the example application.

## Features Demonstrated

*   Rendering a timeline with scenes and layers.
*   Dynamic state management for timeline data (`scenes`, `layers`, `currentTime`, `zoomLevel`).
*   Responding to callbacks from the timeline (`onSceneChange`, `onLayerChange`, `onTimeChange`, `onZoomChange`, `onSelect`).
*   Dragging and resizing scenes and layers.
*   Playhead scrubbing.
*   Snapping of scenes and layers during drag operations.
*   Basic UI controls built with Shadcn/ui to interact with the timeline's props (e.g., sliders for time/zoom, buttons to add data).
*   Display of selected item's details.

## Project Structure (for this example app)

*   `public/`: Static assets for the example.
*   `src/`: Source files for the example application.
    *   `App.tsx`: The main component that sets up and renders the timeline demo.
    *   `main.tsx`: Entry point for the React application.
    *   `index.css`: Global styles, including Tailwind CSS and Shadcn/ui base styles.
    *   `components/ui/`: Shadcn/ui components added to this example.
    *   `lib/utils.ts`: Utility functions, typically including `cn()` from Shadcn/ui.
    *   `App.css`: Additional custom styles for the example application itself, demonstrating overrides or specific example styling.
*   `vite.config.ts`: Vite configuration, including aliases for the main library.
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `components.json`: Shadcn/ui configuration.

This example is configured to use the local development version of `react-timeline-library` from the parent `src` directory. Custom styles applied in `App.css` (like different layer type appearances) demonstrate how to target library classes.
