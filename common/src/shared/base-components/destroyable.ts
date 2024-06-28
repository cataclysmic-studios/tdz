import { BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

export default class DestroyableComponent<A extends {} = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
  protected readonly janitor = new Janitor;

  public constructor(
    private readonly multipleUses = false
  ) { super(); }

  public destroy(): void {
    if (this.janitor === undefined || !("Destroy" in this.janitor)) return;
    this.multipleUses ? this.janitor.Cleanup() : this.janitor.Destroy();
  }
}