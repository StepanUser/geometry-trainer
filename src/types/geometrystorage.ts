import { Point3D } from "./point3d";

export class GeometryStorage {
  static getAll(): any[] {
    const geometryData = localStorage.getItem("geometry");
    if (!geometryData) {
      return [];
    }
    const parsedData: string = JSON.parse(geometryData);
    const pointsArray = JSON.parse(parsedData);

    return pointsArray || [];
  }

  static getAllPoints(): Point3D[] {
    const importGeometry = GeometryStorage.getAll();

    return importGeometry.map(
      (obj: { x: number; y: number; z: number }) =>
        new Point3D(obj.x, obj.y, obj.z)
    );
  }
}
