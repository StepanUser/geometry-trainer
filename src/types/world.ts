import * as THREE from "three";
import { Point3D } from "./point3d";
import { Line3D } from "./line3d";

export class World {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  show(object: any): void {
    switch (object.type) {
      case "point":
        this.visualizePoint(object as Point3D);
        break;
      case "line":
        this.visualizeLine(object as Line3D);
        break;
      default:
        console.warn("Unsupported object type:", object.type);
    }
  }

  private visualizePoint(point: Point3D, color: number = 0x2563eb, size: number = 0.1): void {
    const geometry = new THREE.SphereGeometry(size);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    this.scene.add(sphere);
  }

  private visualizeLine(line: Line3D, color: number = 0x2563eb): void {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      line.start.x, line.start.y, line.start.z,
      line.end.x, line.end.y, line.end.z,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color });
    const lineObject = new THREE.Line(geometry, material);
    this.scene.add(lineObject);
  }
}
