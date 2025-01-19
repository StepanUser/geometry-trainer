import React from 'react';
import styles from '../styles/Resizer.module.css';

interface ResizerProps {
  onResize: (movementX: number) => void;
}

export const Resizer: React.FC<ResizerProps> = ({ onResize }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      onResize(moveEvent.movementX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={styles.resizer} 
      onMouseDown={handleMouseDown}
    />
  );
};