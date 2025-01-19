
export class Vector3D {
  type = 'vector';
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
