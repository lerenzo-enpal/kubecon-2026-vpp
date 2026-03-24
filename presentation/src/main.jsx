import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './index.css';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import Presentation from './Presentation';
import NavigationHint from './components/NavigationHint';

// Register PMTiles protocol — enables local tile files when downloaded via npm run download:assets
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile.bind(pmtilesProtocol));
import StyleGuideReview from './StyleGuideReview';

const isStyleGuide = new URLSearchParams(window.location.search).has('styleguide');
createRoot(document.getElementById('root')).render(
  isStyleGuide ? <StyleGuideReview /> : <>
    <NavigationHint />
    <Presentation />
  </>
);
