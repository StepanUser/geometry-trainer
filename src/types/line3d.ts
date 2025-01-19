import { Point3D } from "./point3d";

export class Line3D {
    type = "line";
    start: Point3D;
    end: Point3D;

    constructor(
        start: Point3D,
        end: Point3D
    ) {
        this.start = start;
        this.end = end;
    }
}