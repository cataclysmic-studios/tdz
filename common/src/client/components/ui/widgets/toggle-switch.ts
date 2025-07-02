import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { $nameof } from "rbxts-transform-debug";
import Signal from "@rbxts/lemon-signal";

import { PlayerGui } from "../../../../shared/utility/client";
import { tween } from "../../../../shared/utility/ui";

import DestroyableComponent from "../../../../shared/base-components/destroyable";

interface Attributes {
  ToggleSwitch_InitialState: boolean;
  ToggleSwitch_EnabledColor: Color3;
  ToggleSwitch_DisabledColor: Color3;
}

const TWEEN_INFO = new TweenInfoBuilder()
  .SetTime(0.2)
  .SetEasingStyle(Enum.EasingStyle.Cubic)
  .SetEasingDirection(Enum.EasingDirection.Out);

@Component({
  tag: $nameof<ToggleSwitch>(),
  ancestorWhitelist: [PlayerGui],
  defaults: {
    ToggleSwitch_InitialState: false,
    ToggleSwitch_EnabledColor: Color3.fromRGB(70, 224, 120),
    ToggleSwitch_DisabledColor: Color3.fromRGB(200, 200, 200)
  }
})
export class ToggleSwitch extends DestroyableComponent<Attributes, ToggleSwitchFrame> implements OnStart {
  public readonly toggled = new Signal<(on: boolean) => void>;

  private on = this.attributes.ToggleSwitch_InitialState;

  public onStart(): void {
    this.toggle(this.on);
    this.trash.add(this.instance.MouseButton1Click.Connect(() => this.toggle(!this.on)));
  }

  public toggle(on: boolean): void {
    this.on = on;
    this.toggled.Fire(this.on);

    const color = this.on ? this.attributes.ToggleSwitch_EnabledColor : this.attributes.ToggleSwitch_DisabledColor;
    tween(this.instance, TWEEN_INFO, { BackgroundColor3: color });
    tween(this.instance.Node, TWEEN_INFO, {
      AnchorPoint: new Vector2(on ? 1 : 0, 0.5),
      Position: UDim2.fromScale(on ? 1 : 0, 0.5)
    });
  }
}