import { BaseComponent } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

export default class DestroyableComponent<A extends {} = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
  protected readonly janitor = new Janitor;

  public constructor(
    private readonly multipleUses = false
  ) { super(); }

  public destroy(): void {
    this.multipleUses ? this.janitor.Cleanup() : this.janitor.Destroy();
  }
}