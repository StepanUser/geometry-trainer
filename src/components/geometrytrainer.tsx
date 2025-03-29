import React, { useCallback, useRef, useState } from "react";
import * as THREE from "three"; 
import * as AllTypes from "../types";
import styles from "../styles/geometrytrainer.module.css";
import { Visualizer } from "../types/visualizer";
import { Viewport3D } from "./viewport";
import { CodeEditor } from "./codeeditor";
import { Resizer } from "./resizer";


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
  const VisualizerRef = useRef<Visualizer | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const previousCodeRef = useRef<string>();

  const geometryTypes: GeometryTypes = Object.entries(AllTypes).reduce(
    (acc, [name, type]) => {
      if (typeof type === "function") {
        acc[name] = type as unknown as GeometryObject;
      }
      return acc;
    },
    {} as GeometryTypes
  );

  const generateInitialCode = () => {
    return `
// Create a point
const point: Point3D = Point.byCoordinates(1, 1, 1);

// Create a line
const line = Line.byStartEnd(
  Point.byCoordinates(0, 0, 0), 
  Point.byCoordinates(5, 5, 1));

// Visualize objects
visualizer.show(point);
visualizer.show(line);`;
};

  const initialCode = generateInitialCode();

  const handleSceneReady = useCallback((scene: THREE.Scene) => {
    sceneRef.current = scene;
    VisualizerRef.current = new Visualizer(scene);
  }, []);

  const handleRunCode = useCallback((code: string) => {
    if (!sceneRef.current || !VisualizerRef.current) return;

    const scene = sceneRef.current;

    while (scene.children.length > 2) {
       scene.remove(scene.children[2]);
    }

    try {
      const evalContext = {
        ...geometryTypes,
        scene,
        THREE,
        visualizer: VisualizerRef.current
      };

      new Function(...Object.keys(evalContext), code)(
        ...Object.values(evalContext)
      );
    
      previousCodeRef.current = code;

    } catch (error) {
      console.log("Code execution error:", error);
      
      if(previousCodeRef.current){

        while (scene.children.length > 2) {
          scene.remove(scene.children[2]);
       }

        const evalContext = {
          
          ...geometryTypes,
          scene,
          THREE,
          visualizer: VisualizerRef.current
        };

          new Function(...Object.keys(evalContext), previousCodeRef.current)(
            ...Object.values(evalContext)
          )
      }
    }
  }, []);

  const handleResize = useCallback((movementX: number) => {
    setLeftPanelWidth((prev) => {
      const containerWidth =
        document.querySelector(`.${styles.container}`)?.clientWidth || 0;
      const deltaPercentage = (movementX / containerWidth) * 100;
      const newWidth = Math.min(Math.max(20, prev + deltaPercentage), 80);
      return newWidth;
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.panel} style={{ width: `${leftPanelWidth}%` }}>
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
