import React, { useEffect, useRef } from 'react';
import { BaseTemplateProps, Direction, StyleProps } from './types';
import { A4_HEIGHT_MM, A4_WIDTH_MM, MM_TO_PX } from './utils';

const getDirection = (lang: string): Direction => {
  return lang === 'he' ? 'rtl' : 'ltr';
};

const getTextAlign = (direction: Direction) => {
  return direction === 'rtl' ? 'right' : 'left';
};

const getFontFamily = (lang: string) => {
  return lang === 'he' ? 'Rubik, sans-serif' : 'Roboto, sans-serif';
};

const BaseTemplate: React.FC<BaseTemplateProps> = ({ children, lang, data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const adjustSize = () => {
      const container = containerRef.current;
      if (!container) return;

      container.style.transform = 'none';
      container.style.transformOrigin = 'initial';
      
      container.style.width = `${A4_WIDTH_MM}mm`;
      container.style.minHeight = `${A4_HEIGHT_MM}mm`;
      container.style.height = 'auto';
    };

    adjustSize();
    window.addEventListener('resize', adjustSize);
    return () => window.removeEventListener('resize', adjustSize);
  }, [data]);

  const direction = getDirection(lang);
  const textAlign = getTextAlign(direction);
  const fontFamily = getFontFamily(lang);

  const containerStyle: StyleProps = {
    direction,
    textAlign,
    fontFamily,
    maxWidth: `${A4_WIDTH_MM}mm`,
    minHeight: `${A4_HEIGHT_MM}mm`,
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div 
      ref={containerRef}
      style={containerStyle} 
      className="cv-container"
    >
      {children}
    </div>
  );
};

export default BaseTemplate; 