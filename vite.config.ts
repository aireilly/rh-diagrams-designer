import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    alias: {
      'konva': '/home/aireilly/rh-diagrams-designer/src/__mocks__/konva.ts',
      'react-konva': '/home/aireilly/rh-diagrams-designer/src/__mocks__/react-konva.tsx',
    },
  },
});
