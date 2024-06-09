import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "../../../../shared/utility/ui";
import ButtonTweenAnimation from "../../../base-components/button-tween-animation";

interface Attributes {
  ColorAnimation_Goal: Color3;
  ColorAnimation_Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "ColorAnimation",
  defaults: {
    ColorAnimation_Speed: 0.1
  }
})
export class ColorAnimation extends ButtonTweenAnimation<Attributes, GuiButton> implements OnStart {
  private readonly defaultColor = this.instance.BackgroundColor3;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Quad)
    .SetTime(this.attributes.ColorAnimation_Speed);

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundColor3: this.attributes.ColorAnimation_Goal
    });
  }

  public inactive(): void {
    tween(this.instance, this.tweenInfo, {
      BackgroundColor3: this.defaultColor
    });
  }
}