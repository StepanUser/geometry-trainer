
export class Point3D {
        type = "point";
        x: number;
        y: number;
        z: number;
    
        constructor(x: number, y: number, z: number = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        add(point: Point3D) {
            return new Point3D(this.x + point.x, this.y + point.y, this.z + point.z);
        }
}
    