// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

const isProd = process.env.NODE_ENV === 'production' || process.env.CI === 'true';

// https://astro.build/config
export default defineConfig({
  site: isProd ? 'https://lerenzo-enpal.github.io' : undefined,
  base: isProd ? '/kubecon-2026-vpp' : '/',
  integrations: [react(), mdx()],

  server: {
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()]
  }
});