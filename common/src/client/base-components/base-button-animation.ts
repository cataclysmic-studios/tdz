import type { OnStart } from "@flamework/core";
import { BaseComponent } from "@flamework/components";
import { Trash } from "@rbxts/trash";

export default abstract class BaseButtonAnimation<A extends {} = {}, I extends GuiButton = GuiButton> extends BaseComponent<A, I> implements OnStart {
  protected readonly includeClick: boolean = true;
  protected readonly trash = new Trash;
  protected hovered = false;

  protected abstract active?(): void;
  protected abstract inactive?(): void;

  public onStart(): void {
    this.trash.add(this.instance.MouseEnter.Connect(() => {
      this.hovered = true;
      this.active?.();
    }));
    this.trash.add(this.instance.MouseLeave.Connect(() => {
      this.hovered = false;
      this.inactive?.();
    }));
    if (this.includeClick) {
      this.trash.add(this.instance.MouseButton1Down.Connect(() => {
        this.hovered = false;
        this.inactive?.();
      }));
      this.trash.add(this.instance.MouseButton1Up.Connect(() => {
        this.hovered = true;
        this.active?.();
      }));
    }
  }
}