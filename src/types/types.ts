export type XYZ = Point3D | Vector3D;

export type Curve3D = Line3D | Arc3D;

export type Point3D = {
  type: "point";
  x: number;
  y: number;
  z: number;
};

export type Vector3D = {
  type: "vector";
  x: number;
  y: number;
  z: number;
};

export type Plane3D = {
  type: "plane";
  normal: Vector3D;
  origin: Point3D;
};

export type Line3D = {
  type: "line";
  start: Point3D;
  end: Point3D;
};

export type Arc3D = {
  type: "arc";
  center: Point3D;
  radius: number;
  startAngle: number;
  sweepAngle: number;
  normal: Vector3D;
};

export type BoundingBox3D = {
  type: "boundingBox";
  min: Point3D;
  max: Point3D;
};

export type CoordinateSystem3D = {
  type: "coordinateSystem";
  xAxis: Vector3D;
  yAxis: Vector3D;
  zAxis: Vector3D;
  origin: Point3D;
};

export type Matrix3x4 = {
  type: "matrix";
  xAxis: Vector3D;
  yAxis: Vector3D;
  zAxis: Vector3D;
  translation: Vector3D;
  components: number[];
  m11: number;
  m12: number;
  m13: number;
  m21: number;
  m22: number;
  m23: number;
  m31: number;
  m32: number;
  m33: number;
  tx: number;
  ty: number;
  tz: number;
};
