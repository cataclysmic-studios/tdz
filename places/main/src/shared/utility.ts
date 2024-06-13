import { RunService as Runtime } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";

import { Assets } from "common/shared/utility/instances";
import { tween } from "common/shared/utility/ui";
import { PLACEMENT_STORAGE } from "./constants";

export function createRangePreview(range: number): MeshPart {
  const rangePreview = Assets.RangePreview.Clone();
  rangePreview.Size = new Vector3(range, rangePreview.Size.Y, range);
  rangePreview.Parent = PLACEMENT_STORAGE;
  return rangePreview;
}

export function createSizePreview(size: number): typeof Assets.SizePreview {
  const sizePreview = Assets.SizePreview.Clone();
  const defaultTowerSize = sizePreview.Size.X;
  const sizeScale = size / defaultTowerSize;
  sizePreview.Size = new Vector3(size, sizePreview.Size.Y, size);
  sizePreview.Beam1.CurveSize0 *= sizeScale;
  sizePreview.Beam1.CurveSize1 *= sizeScale;
  sizePreview.Beam2.CurveSize0 *= sizeScale;
  sizePreview.Beam2.CurveSize1 *= sizeScale;
  sizePreview.Left.Position = new Vector3(0, 0, sizePreview.Size.X / 2);
  sizePreview.Right.Position = new Vector3(0, 0, -sizePreview.Size.X / 2);
  sizePreview.Parent = PLACEMENT_STORAGE;
  return sizePreview;
}

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