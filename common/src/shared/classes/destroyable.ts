import { Janitor } from "@rbxts/janitor";

export default class Destroyable {
  protected readonly janitor = new Janitor;

  public constructor(
    private readonly multipleUses = false
  ) { }

  public destroy(): void {
    if (this.janitor === undefined || !("Destroy" in this.janitor)) return;
    this.multipleUses ? this.janitor.Cleanup() : this.janitor.Destroy();
  }
}