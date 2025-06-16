// examples/example-app/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-timeline-library': path.resolve(__dirname, '../../src/index.ts'),
      '@': path.resolve(__dirname, './src'), // Add @/* alias
    },
    dedupe: [
      'react',
      'react-dom',
      '@dnd-kit/core',
      '@dnd-kit/modifiers',
      '@dnd-kit/utilities',
    ],
  },
});
