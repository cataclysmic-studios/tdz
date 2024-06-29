const BEZIER_COEFFICIENT = 3;

/** Represents a Bezier curve */
export class Bezier {
  public constructor(
    public point0: Vector3,
    public point1: Vector3,
    public point2: Vector3,
    public point3: Vector3,
    public coeffiecient2 = 0.6
  ) { }

  public getPoint(t: number): Vector3 {
    const oneMinusT = 1 - t;
    const tSquared = t * t;
    const oneMinusTSquared = oneMinusT * oneMinusT;
    const oneMinusTCubed = oneMinusTSquared * oneMinusT;
    const tCubed = tSquared * t;

    return this.point0.mul(oneMinusTCubed) // first term
      .add(this.point1.mul(BEZIER_COEFFICIENT * oneMinusTSquared * t)) // second, etc.
      .add(this.point2.mul(BEZIER_COEFFICIENT * oneMinusT * tSquared))
      .add(this.point3.mul(tCubed));
  }

  public getTangent(t: number): Vector3 {
    const oneMinusT = 1 - t;
    const tSquared = t * t;
    const oneMinusTSquared = oneMinusT * oneMinusT;

    return this.point0.mul(-BEZIER_COEFFICIENT * oneMinusTSquared) // first term
      .add(this.point1.mul(BEZIER_COEFFICIENT * oneMinusTSquared - this.coeffiecient2 * oneMinusT * t)) // second, etc.
      .add(this.point2.mul(this.coeffiecient2 * t * oneMinusT - BEZIER_COEFFICIENT * tSquared))
      .add(this.point3.mul(BEZIER_COEFFICIENT * tSquared))
      .Unit;
  }
}