const { sqrt } = math;

export default class CircularRegion {
  public constructor(
    public center: Vector3,
    public radius: number
  ) { }

  public containsPoint(point: Vector3): boolean {
    return this.getDistance(point) <= this.radius;
  }

  public containsRegion(other: CircularRegion): boolean {
    return this.getDistance(other.center) + other.radius <= this.radius;
  }

  public overlapsRegion(other: CircularRegion): boolean {
    return this.getDistance(other.center) <= this.radius + other.radius;
  }

  private getDistance(point: Vector3): number {
    return sqrt((point.X - this.center.X) ** 2 + (point.Z - this.center.Z) ** 2);
  }
}