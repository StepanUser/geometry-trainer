import { Line3D } from "./line3d";
import { Point3D } from "./point3d";

export class Line {

    static byStartEnd(start: Point3D, end: Point3D): Line3D {
        return new Line3D(start, end);
    }
}