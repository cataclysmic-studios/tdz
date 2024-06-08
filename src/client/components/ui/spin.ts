import type { OnRender } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { PlayerGui } from "shared/utility/client";
import { lerp } from "shared/utility/numbers";

const { min } = math;

interface Attributes {
  Spin_DegreesPerSecond: number;
}

@Component({
  tag: "Spin",
  ancestorWhitelist: [PlayerGui],
  defaults: {
    Spin_DegreesPerSecond: 5
  }
})
export class Spin extends BaseComponent<Attributes, GuiObject> implements OnRender {
  public onRender(dt: number): void {
    dt = min(dt, 1);
    this.instance.Rotation = lerp(this.instance.Rotation, this.instance.Rotation + this.attributes.Spin_DegreesPerSecond * dt * 60, 0.5);
  }
}