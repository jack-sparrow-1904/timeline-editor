import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json' // Point to the root tsconfig
    }),
  ],
  publicDir: false, // Prevent copying files from public directory
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactTimelineLibrary',
      fileName: (format) => `react-timeline-library.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/utilities'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@dnd-kit/core': 'DndKitCore',
        },
      },
    },
  },
});
