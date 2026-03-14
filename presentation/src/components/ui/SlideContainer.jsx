import React from 'react';
import { slideStyle } from '../../theme';
import GridBackground from '../GridBackground';

export default function SlideContainer({ children, style = {}, noGrid = false }) {
  return (
    <div style={{ ...slideStyle, position: 'relative', width: '100%', height: '100%', ...style }}>
      {!noGrid && <GridBackground opacity={0.04} />}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: style.justifyContent || 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
