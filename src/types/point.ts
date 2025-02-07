import { Point3D } from "./point3d";

export class Point {
    static byCoordinates(x: number, y: number, z: number = 0): Point3D {
        return new Point3D(x, y, z);
    }
};