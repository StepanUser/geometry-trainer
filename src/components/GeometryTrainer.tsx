import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { CodeEditor } from './CodeEditor';
import { Viewport3D } from './Viewport';
import styles from '../styles/geometryTrainer.module.css';
import { Resizer } from './Resizer';
import * as AllTypes from '../types';

interface GeometryObject {
  new (...args: any[]): {
    visualize: (scene: THREE.Scene, ...args: any[]) => void;
  };
}


interface GeometryTypes {
  [key: string]: GeometryObject;
}

const GeometryTrainer3D: React.FC = () => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  
  const geometryTypes: GeometryTypes = Object.entries(AllTypes).reduce((acc, [name, type]) => {
    if (typeof type === 'function') {
      acc[name] = type as unknown as GeometryObject;
    }
    return acc;
  }, {} as GeometryTypes);

  const generateInitialCode = () => {
    let code = '';
    let visualizationCode = '';
    
    Object.entries(geometryTypes).forEach(([typeName], index) => {
      const x = (Math.random() * 4 - 2).toFixed(1);
      const y = (Math.random() * 4 - 2).toFixed(1);
      const z = (Math.random() * 4 - 2).toFixed(1);
      
      code += `const ${typeName.toLowerCase()}${index}: ${typeName} = new ${typeName}(${x}, ${y}, ${z});\n`;
      visualizationCode += `${typeName.toLowerCase()}${index}.visualize(scene);\n`;
    });

    return `${code}\n${visualizationCode}`;
  };

  const initialCode = generateInitialCode();

  const handleSceneReady = useCallback((scene: THREE.Scene) => {
    sceneRef.current = scene;
  }, []);

  const handleRunCode = useCallback((code: string) => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    
    while (scene.children.length > 2) {
      scene.remove(scene.children[2]);
    }
    
    try {
      const evalContext = { 
        ...geometryTypes, 
        scene, 
        THREE 
      };
      new Function(...Object.keys(evalContext), code)(...Object.values(evalContext));
    } catch (error) {
      console.error('Code execution error:', error);
    }
  }, []);

  const handleResize = useCallback((movementX: number) => {
    setLeftPanelWidth(prev => {
      const containerWidth = document.querySelector(`.${styles.container}`)?.clientWidth || 0;
      const deltaPercentage = (movementX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(20, prev + deltaPercentage), 80);
      return newWidth;
    });
  }, []);


  return (
    <div className={styles.container}>
      <div 
        className={styles.panel}
        style={{ width: `${leftPanelWidth}%` }}
      >
        <CodeEditor initialCode={initialCode} onRunCode={handleRunCode} />
      </div>
      <Resizer onResize={handleResize} />
      <div 
        className={styles.panel}
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <Viewport3D onSceneReady={handleSceneReady} />
      </div>
    </div>
  );
};

export default GeometryTrainer3D;