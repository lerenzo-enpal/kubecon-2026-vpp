import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), react()],
  server: {
    port: 3100,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        keynote: resolve(__dirname, 'index.html'),
        main: resolve(__dirname, 'main-talk.html'),
      },
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
