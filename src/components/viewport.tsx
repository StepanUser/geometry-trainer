import React, { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import * as THREE from "three";
import styles from "../styles/viewport3d.module.css";

interface Viewport3DProps {
  onSceneReady: (scene: THREE.Scene) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  const updateRendererSize = () => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current)
      return;

    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height, true);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.up.set(0, 0, 1);
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setClearColor(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(15, -15, 15);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    updateRendererSize();

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      const rect = container.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !cameraRef.current) return;

      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const deltaX = currentX - mousePositionRef.current.x;
      const deltaY = currentY - mousePositionRef.current.y;

      const camera = cameraRef.current;
      const rotationSpeed = 0.01;

      const radius = camera.position.length();
      const theta = Math.atan2(camera.position.x, camera.position.y);
      const phi = Math.acos(camera.position.z / radius);

      const newTheta = theta + deltaX * rotationSpeed;

      const newPhi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, phi - deltaY * rotationSpeed)
      );

      camera.position.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
      camera.position.y = radius * Math.sin(newPhi) * Math.cos(newTheta);
      camera.position.z = radius * Math.cos(newPhi);

      camera.lookAt(0, 0, 0);
      camera.up.set(0, 0, 1);

      mousePositionRef.current = { x: currentX, y: currentY };
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;

      const camera = cameraRef.current;
      const zoomSpeed = 1;
      const minZoom = 5;
      const maxZoom = 100;

      const direction = camera.position
        .clone()
        .sub(new THREE.Vector3(0, 0, 0))
        .normalize();
      const delta = e.deltaY > 0 ? 1 : -1;

      const newPosition = camera.position
        .clone()
        .add(direction.multiplyScalar(delta * zoomSpeed));

      const distance = newPosition.length();
      if (distance >= minZoom && distance <= maxZoom) {
        camera.position.copy(newPosition);
      }
    };

    scene.background = new THREE.Color("#2e3440");
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.set(0, 0, 0.01);
    scene.add(axesHelper);

    const gridSize = 30;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      "#576075",
      "#576075"
    );
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    onSceneReady(scene);

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      updateRendererSize();
      renderer.render(scene, camera);
    });

    resizeObserver.observe(container);

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSceneReady]);

  const clearScene = () => {
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 2) {
        sceneRef.current.remove(sceneRef.current.children[2]);
      }
    }
  };

  return (
    <div className={styles.viewportPanel}>
      <div className={styles.viewportHeader}>
        <h2 className="text-lg font-semibold"></h2>
        <button
          onClick={clearScene}
          className={styles.button}
        >
          <RotateCcw size={12} className={styles.buttonIcon} />
          Clear
        </button>
      </div>
      <div ref={containerRef} className={styles.viewportContainer} />
    </div>
  );
};