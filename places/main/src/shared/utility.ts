import { RunService as Runtime } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import Object from "@rbxts/object-utils";

import { Assets } from "common/shared/utility/instances";
import { tween } from "common/shared/utility/ui";
import { PLACEMENT_STORAGE } from "./constants";
import { TOWER_STATS, type TowerStats } from "./towers";
import type { PathStats, UpgradeLevel } from "./structs";

export function teleportPlayers(cframe: CFrame, ...players: Player[]): void {
  for (const player of players) {
    if (player.Character === undefined) continue;
    (<CharacterModel>player.Character).HumanoidRootPart.CFrame = (cframe.add(new Vector3(0, 3, 0)));
  }
}

export function getTowerStats(towerName: TowerName, upgrades: UpgradeLevel): TowerStats {
  const [path1Level, path2Level] = upgrades;
  const allStats = TOWER_STATS[towerName];
  const [baseStats, path1Stats, path2Stats] = allStats;
  if (path1Level === 0 && path2Level === 0)
    return table.clone(baseStats);

  const upradedStats = table.clone(baseStats);
  applyUpgradePathStats(upradedStats, path1Level, <PathStats><unknown>path1Stats);
  applyUpgradePathStats(upradedStats, path2Level, <PathStats><unknown>path2Stats);
  return upradedStats;
}

function applyUpgradePathStats(baseStats: TowerStats, pathLevel: number, pathStats: PathStats): void {
  for (let i = 0; i < pathLevel; i++) {
    const statsAddition = pathStats[i];
    for (const [name, value] of Object.entries(statsAddition))
      if (typeOf(value) === "number" && name !== "price")
        (<ExtractMembers<TowerStats, Maybe<number>>>baseStats)[name] += value;
      else
        baseStats[name] = value;
  }
}

export function createTowerModel(towerName: TowerName, modelName: string, cframe: CFrame = new CFrame): TowerModel {
  const towerModel = <TowerModel>Assets.Towers[<TowerName>towerName].WaitForChild(modelName).Clone();
  towerModel.Name = towerName;
  towerModel.PivotTo(cframe);
  towerModel.Parent = PLACEMENT_STORAGE;

  animateTower(towerModel, "Idle", 0);
  growIn(towerModel);
  return towerModel;
}

export function animateTower(towerModel: TowerModel, animationName: ExtractKeys<TowerModel["Animations"], Animation>, fadeTime?: number): void {
  towerModel.Humanoid.Animator.LoadAnimation(towerModel.Animations[animationName]).Play(fadeTime);
}

export function createRangePreview(range: number): MeshPart {
  const rangePreview = Assets.RangePreview.Clone();
  rangePreview.Size = new Vector3(range, rangePreview.Size.Y, range);
  rangePreview.Parent = PLACEMENT_STORAGE;
  growIn(rangePreview)
  return rangePreview;
}

export function createSizePreview(size: number, towerID?: number): typeof Assets.SizePreview {
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
  sizePreview.SetAttribute("TowerID", towerID);
  sizePreview.Parent = PLACEMENT_STORAGE;
  growIn(sizePreview);
  return sizePreview;
}

export function setSizePreviewColor(sizePreview: typeof Assets.SizePreview, color: Color3): typeof Assets.SizePreview {
  sizePreview.Beam1.Color = new ColorSequence(color);
  sizePreview.Beam2.Color = new ColorSequence(color);
  return sizePreview
}

export function createWeld(part0: BasePart, part1: BasePart): WeldConstraint {
  const weld = new Instance("WeldConstraint", part0);
  weld.Part0 = part0;
  weld.Part1 = part1;
  return weld;
}

// TODO: fade out model function

const growInTweenInfo = new TweenInfoBuilder().SetTime(0.1);
/**
 * Smoothly scale a model/part to its original size from nothing
 * @param model Model or part to scale
 * @param point The point of the model to scale from
 */
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

      Runtime.Stepped.Wait();
    }

    if (model.IsA("Model"))
      model.ScaleTo(scaleValue.Value);
    else
      model.Size = defaultSize!.mul(scaleValue.Value);

    scaleValue.Destroy();
    resolve();
  });
}