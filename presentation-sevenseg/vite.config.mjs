import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), react()],
  server: {
    port: 3200,
    fs: {
      // Allow importing shared components + data from ../presentation
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../presentation/src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          'vendor-spectacle': ['spectacle'],
          'vendor-deckgl': ['@deck.gl/core', '@deck.gl/react', '@deck.gl/layers', '@deck.gl/geo-layers'],
          'vendor-mapgl': ['react-map-gl/maplibre'],
        },
      },
    },
  },
});
