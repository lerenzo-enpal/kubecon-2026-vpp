// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://whatisavpp.com',
  base: '/',
  integrations: [react(), mdx()],

  server: {
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()]
  }
});