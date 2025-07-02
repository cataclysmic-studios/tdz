import { BaseComponent } from "@flamework/components";
import { Trash } from "@rbxts/trash";

export default class DestroyableComponent<A extends {} = {}, I extends Instance = Instance> extends BaseComponent<A, I> {
  protected readonly trash = new Trash;

  public constructor(
    private readonly multipleUses = false
  ) { super(); }

  public destroy(): void {
    if (this.trash === undefined || !("destroy" in this.trash)) return;
    this.multipleUses ? this.trash.purge() : Trash.tryDestroy(this.trash);
  }
}