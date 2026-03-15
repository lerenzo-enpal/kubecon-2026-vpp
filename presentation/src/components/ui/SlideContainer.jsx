import React from 'react';
import { slideStyle } from '../../theme';
import GridBackground from '../GridBackground';

export default function SlideContainer({ children, style = {}, noGrid = false }) {
  return (
    <div
      className="relative w-full h-full flex flex-col bg-cover"
      style={{
        backgroundColor: slideStyle.backgroundColor,
        padding: slideStyle.padding,
        justifyContent: slideStyle.justifyContent,
        ...style,
      }}
    >
      {!noGrid && <GridBackground opacity={0.04} />}
      <div
        className="relative z-[1] w-full h-full flex flex-col"
        style={{ justifyContent: style.justifyContent || 'center' }}
      >
        {children}
      </div>
    </div>
  );
}
