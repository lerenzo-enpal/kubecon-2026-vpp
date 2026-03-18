import React from 'react';

// HUD corner bracket decoration — used on map overlay panels
function Corner({ pos, color, size = 12 }) {
  const base = { position: 'absolute', width: size, height: size };
  const borders = {
    tl: { top: -1, left: -1, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    tr: { top: -1, right: -1, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    bl: { bottom: -1, left: -1, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    br: { bottom: -1, right: -1, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  };
  return <div style={{ ...base, ...borders[pos] }} />;
}

export default function Corners({ color, size = 12 }) {
  return <>
    <Corner pos="tl" color={color} size={size} />
    <Corner pos="tr" color={color} size={size} />
    <Corner pos="bl" color={color} size={size} />
    <Corner pos="br" color={color} size={size} />
  </>;
}
