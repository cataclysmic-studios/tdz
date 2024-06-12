import { RunService as Runtime } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "./utility/ui";

export function createWeld(part0: BasePart, part1: BasePart): WeldConstraint {
  const weld = new Instance("WeldConstraint", part0);
  weld.Part0 = part0;
  weld.Part1 = part1;
  return weld;
}

const growInTweenInfo = new TweenInfoBuilder().SetTime(0.15);
export async function growIn(model: Model | BasePart): Promise<void> {
  const scaleValue = new Instance("NumberValue");
  scaleValue.Value = 0.01;

  const defaultSize = model.IsA("BasePart") ? model.Size : undefined;
  const t = tween(scaleValue, growInTweenInfo, { Value: <number>model.GetAttribute("DefaultScale") ?? 1 });
  return new Promise(resolve => {
    while (t.PlaybackState === Enum.PlaybackState.Playing) {
      if (model.IsA("Model"))
        model.ScaleTo(scaleValue.Value);
      else
        model.Size = defaultSize!.mul(scaleValue.Value);

      Runtime.RenderStepped.Wait();
    }

    scaleValue.Destroy();
    resolve();
  });
}