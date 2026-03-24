import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    watch: { ignored: ['**/public/tiles/**'] },
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
