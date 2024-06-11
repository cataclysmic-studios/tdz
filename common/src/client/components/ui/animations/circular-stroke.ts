import { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { tween } from "../../../../shared/utility/ui";
import ButtonTweenAnimation from "../../../base-components/button-tween-animation";

interface Attributes {
  CircularStrokeAnimation_PrimaryColor: Color3;
  CircularStrokeAnimation_SecondaryColor: Color3;
  CircularStrokeAnimation_Thickness: number;
  CircularStrokeAnimation_Transparency: number;
  CircularStrokeAnimation_Speed: number;
}

const { EasingStyle } = Enum;

@Component({
  tag: "CircularStrokeAnimation",
  defaults: {
    CircularStrokeAnimation_PrimaryColor: Color3.fromHex("#41b098"),
    CircularStrokeAnimation_SecondaryColor: Color3.fromHex("#5effdc"),
    CircularStrokeAnimation_Thickness: 2.6,
    CircularStrokeAnimation_Transparency: 0.1,
    CircularStrokeAnimation_Speed: 1.25
  }
})
export class CircularStrokeAnimation extends ButtonTweenAnimation<Attributes> implements OnStart {
  protected override readonly includeClick = false;

  private readonly defaultStrokes = this.instance.GetChildren().filter((i): i is UIStroke => i.IsA("UIStroke"));
  private readonly defaultStrokeParents = this.defaultStrokes.map(stroke => stroke.Parent!);
  private readonly circularStroke = new Instance("UIStroke");
  private readonly gradient = new Instance("UIGradient", this.circularStroke);
  private readonly changedJanitor = new Janitor;

  protected readonly tweenInfo = new TweenInfoBuilder()
    .SetEasingStyle(EasingStyle.Linear)
    .SetTime(this.attributes.CircularStrokeAnimation_Speed)
    .SetRepeatCount(math.huge);

  public onStart(): void {
    super.onStart();

    this.circularStroke.Name = "CircularStroke";
    this.circularStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
    this.circularStroke.Transparency = 0;
    this.circularStroke.Color = new Color3(1, 1, 1);
    this.circularStroke.Transparency = this.attributes.CircularStrokeAnimation_Transparency;
    this.gradient.Transparency = new NumberSequence(0);
    this.gradient.Color = new ColorSequence([
      new ColorSequenceKeypoint(0, this.attributes.CircularStrokeAnimation_PrimaryColor),
      new ColorSequenceKeypoint(0.5, this.attributes.CircularStrokeAnimation_SecondaryColor),
      new ColorSequenceKeypoint(1, this.attributes.CircularStrokeAnimation_PrimaryColor)
    ]);
  }

  public active(): void {
    this.changedJanitor.Cleanup();
    for (const stroke of this.defaultStrokes)
      stroke.Parent = undefined;

    this.gradient.Rotation = -180;
    this.circularStroke.Parent = this.instance;
    this.circularStroke.Thickness = this.attributes.CircularStrokeAnimation_Thickness;
    this.changedJanitor.Add(tween(this.gradient, this.tweenInfo, { Rotation: 180 }), "Cancel");
  }

  public inactive(): void {
    this.changedJanitor.Cleanup();
    this.circularStroke.Parent = undefined;
    this.defaultStrokes.forEach((stroke, i) => stroke.Parent = this.defaultStrokeParents[i]);
    this.gradient.Rotation = -180;
  }
}