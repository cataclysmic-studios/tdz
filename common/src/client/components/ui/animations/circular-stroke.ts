import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { tween } from "../../../../shared/utility/ui";
import ButtonTweenAnimation from "../../../base-components/button-tween-animation";

interface Attributes {
  CircularStrokeAnimation_Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "CircularStrokeAnimation",
  defaults: {
    CircularStrokeAnimation_Speed: 1.25
  }
})
export class CircularStrokeAnimation extends ButtonTweenAnimation<Attributes, GuiButton & { UIStroke: UIStroke & { UIGradient: UIGradient; }; }> implements OnStart {
  protected override readonly includeClick = false;

  private readonly gradient = this.instance.UIStroke.UIGradient;
  private readonly changedJanitor = new Janitor;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Linear)
    .SetTime(this.attributes.CircularStrokeAnimation_Speed)
    .SetRepeatCount(math.huge);

  public onStart(): void {
    super.onStart();
  }

  public active(): void {
    this.changedJanitor.Cleanup();
    this.instance.UIStroke.Enabled = true;
    this.gradient.Rotation = -180;
    this.changedJanitor.Add(tween(this.gradient, this.tweenInfo, { Rotation: 180 }), "Cancel");
  }

  public inactive(): void {
    this.instance.UIStroke.Enabled = false;
    this.gradient.Rotation = -180;
    this.changedJanitor.Cleanup();
  }
}