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
import SevenSegStyleGuide from './slides/SevenSegStyleGuide.jsx';
import CanvasParityCheck from './slides/CanvasParityCheck.jsx';
import MapCheck from './slides/MapCheck.jsx';
import PresentationSevenSeg from './PresentationSevenSeg.jsx';

const params = new URLSearchParams(window.location.search);

createRoot(document.getElementById('root')).render(
  params.has('parity') ? <CanvasParityCheck />
    : params.has('styleguide') ? <SevenSegStyleGuide />
    : params.has('maps') ? <MapCheck />
    : <PresentationSevenSeg />
);
