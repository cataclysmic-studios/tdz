const { min } = math;

export default class SmoothVector3 {
  public value = new Vector3;

  public constructor(
    private speed = 1,
    private target = new Vector3
  ) { }

  public zeroize(): void {
    this.setTarget(new Vector3);
  }

  public incrementTarget(amount: Vector3): void {
    this.target = this.target.add(amount);
  }

  public decrementTarget(amount: Vector3): void {
    this.target = this.target.sub(amount);
  }

  public setTarget(target: Vector3): void {
    this.target = target;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getTarget(): Vector3 {
    return this.target;
  }

  public update(dt: number) {
    const alpha = min(dt * this.speed, 1);
    this.value = this.value.Lerp(this.target, alpha);
    return this.value;
  }
}