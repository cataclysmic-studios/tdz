import { lerp } from "../utility/numbers";

const { min } = math;

export default class SmoothValue {
  public constructor(
    public value = 0,
    private speed = 1,
    private target = 0
  ) { }

  public zeroize(): void {
    this.setTarget(0);
  }

  public incrementTarget(amount = 1): void {
    this.target += amount;
  }

  public decrementTarget(amount = 1): void {
    this.target -= amount;
  }

  public getTarget(): number {
    return this.target;
  }

  public setTarget(target: number): void {
    this.target = target;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public update(dt: number) {
    const alpha = min(dt * this.speed, 1);
    this.value = lerp(this.value, this.target, alpha);
    return this.value;
  }
}