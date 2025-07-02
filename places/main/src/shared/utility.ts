import { RunService as Runtime, Workspace as World, Players } from "@rbxts/services";
import { RaycastParamsBuilder, TweenInfoBuilder } from "@rbxts/builders";
import { Trash } from "@rbxts/trash";
import { startsWith } from "@rbxts/string-utils";
import Object from "@rbxts/object-utils";

import { Assets } from "common/shared/utility/instances";
import { tween } from "common/shared/utility/ui";
import { flatten } from "common/shared/utility/array";
import { removeVectorY } from "common/shared/utility/3D";
import { TOWER_STATS } from "common/shared/towers";
import { MAX_PATH_LEVEL, PLACEMENT_STORAGE } from "./constants";
import { type EnemyTrait, EnemyTraitType } from "./structs";
import type { TowerInfo } from "./entity-components";
import type { TowerStats, PathStats, UpgradeLevel, UpgradePath } from "./towers";
import CircularRegion from "./classes/circular-region";
import Log from "./logger";

const DEFAULT_SIZE_PREVIEW_TWEEN_INFO = new TweenInfo(0.08);

export function canUpgrade(info: Omit<TowerInfo, "patch">, path: UpgradePath): boolean {
  const pathLevel = info.upgrades[path - 1];
  return pathLevel !== MAX_PATH_LEVEL && !isLocked(info, path);
}

export function isLocked(info: Omit<TowerInfo, "patch">, path: UpgradePath): boolean {
  const [path1Level, path2Level] = info.upgrades;
  const pathLevel = path === 1 ? path1Level : path2Level;
  const otherPathLevel = path === 1 ? path2Level : path1Level;
  return otherPathLevel >= 3 && pathLevel === 2;
}

export function getRecordDifference<K extends string | number | symbol, V>(record1: Record<K, V>, record2: Record<K, V>): Partial<Record<K, V>> {
  const difference: Partial<Record<K, V>> = {};

  for (const key of <K[]>Object.keys(record2))
    if (key in record2)
      if (!(key in record1))
        difference[key] = record2[key];

  return difference;
}

export function getRecordChanges<K extends string | number | symbol, V>(record1: Record<K, V>, record2: Record<K, V>): Partial<Record<K, { oldValue?: V, newValue?: V }>> {
  const difference: Partial<Record<K, { oldValue?: V, newValue?: V }>> = {};

  for (const key of <K[]>Object.keys(record1))
    if (key in record1 && key in record2)
      if (record1[key] !== record2[key])
        difference[key] = {
          oldValue: record1[key],
          newValue: record2[key]
        };
      else if (key in record1 && !(key in record2))
        difference[key] = {
          oldValue: record1[key],
          newValue: undefined
        };

  for (const key of <K[]>Object.keys(record2))
    if (key in record2 && !(key in record1))
      difference[key] = {
        oldValue: undefined,
        newValue: record2[key]
      };

  return difference;
}

export function didEnemyCompletePath(position: Vector3, endPointPosition: Vector3): boolean {
  return removeVectorY(position).FuzzyEq(removeVectorY(endPointPosition));
}

export function getEnemyBaseTraits(enemyModel: EnemyModel): EnemyTrait[] {
  const traits: EnemyTrait[] = [];
  for (const tag of enemyModel.GetTags().filter(tag => startsWith(tag, "Trait."))) {
    const [_, traitName] = tag.split("Trait.");
    const effectiveness = <number>enemyModel.GetAttribute(traitName);
    traits.push({
      type: EnemyTraitType[<keyof typeof EnemyTraitType>traitName],
      effectiveness: effectiveness !== undefined && typeOf(effectiveness) === "number" ? effectiveness : undefined
    });
  }
  return traits;
}

function getAllSounds(): Sound[] {
  return flatten([Assets.GetDescendants(), World.GetDescendants()])
    .filter((i): i is Sound => i.IsA("Sound"))
    .filter(sound => {
      const model = sound.FindFirstAncestorOfClass("Model");
      if (model === undefined) return true;

      const player = Players.GetPlayerFromCharacter(model);
      return player === undefined; // filter out character sounds like footsteps
    });
}

export function initializeDefaultSoundSpeeds(): void {
  task.spawn(() => {
    for (const sound of getAllSounds()) {
      if (sound.GetAttribute("DefaultSpeed") !== undefined) continue;
      sound.SetAttribute("DefaultSpeed", sound.PlaybackSpeed)
    }
  });
}

export function adjustAllSoundSpeeds(timeScale: number): void {
  task.spawn(() => {
    for (const sound of getAllSounds())
      task.spawn(() => sound.PlaybackSpeed = <number>sound.GetAttribute("DefaultSpeed") * timeScale);
  });
}

export function teleportPlayers(cframe: CFrame, ...players: Player[]): void {
  for (const player of players) {
    if (player.Character === undefined) continue;
    (<CharacterModel>player.Character).HumanoidRootPart.CFrame = cframe.add(new Vector3(0, 3, 0));
  }
}

export function canPlaceTower(towerModel: TowerModel, sizePreview: typeof Assets.SizePreview, raycastFilter: Instance[]): boolean {
  const raycastParams = new RaycastParamsBuilder()
    .SetFilter(raycastFilter)
    .SetIgnoreWater(true)
    .Build();

  const towerScale = <number>towerModel.GetAttribute("DefaultScale");
  const towerCFrame = towerModel.GetPivot();
  const groundBelow = World.Raycast(towerCFrame.Position, new Vector3(0, -3.1 * towerScale, 0), raycastParams);
  const groundInside = World.Raycast(towerCFrame.Position, new Vector3(0, -1.1, 0), raycastParams);
  const hitboxObstructions = sizePreview.GetTouchingParts()
    .filter(part => {
      const model = part.FindFirstAncestorOfClass("Model");
      return model !== towerModel
        && part !== groundBelow?.Instance
        && model?.Name !== "RangePreview"
        && part.Name !== "SizePreview";
    });

  const isWaterTower = <boolean>towerModel.GetAttribute("Water") ?? false;
  const inPlacableLocation = groundBelow?.Instance.HasTag(isWaterTower ? "PlacableWater" : "PlacableGround") ?? false;
  return inPlacableLocation
    && groundInside?.Instance === undefined
    && !isSizePreviewOverlapping(sizePreview)
    && hitboxObstructions.isEmpty();
}

export function getTowerStats(towerName: TowerName, upgrades: UpgradeLevel): TowerStats {
  const [path1Level, path2Level] = upgrades;
  const allStats = TOWER_STATS[towerName];
  const [baseStats, path1Stats, path2Stats] = allStats;
  if (path1Level === 0 && path2Level === 0)
    return table.clone(baseStats);

  const upgradedStats = table.clone(baseStats);
  applyUpgradePathStats(upgradedStats, path1Level, <PathStats><unknown>path1Stats);
  applyUpgradePathStats(upgradedStats, path2Level, <PathStats><unknown>path2Stats);
  return upgradedStats;
}

function applyUpgradePathStats(baseStats: Writable<TowerStats>, pathLevel: number, pathStats: PathStats): void {
  for (let i = 0; i < pathLevel; i++) {
    const statsAddition = pathStats[i];
    for (const [name, value] of Object.entries(statsAddition))
      if (typeOf(value) === "number" && name !== "price")
        baseStats[<NonNullable<ExtractKeys<TowerStats, Maybe<number>>>>name] += <number>value;
      else
        baseStats[name] = <never>value;
  }
}

export function upgradeTowerModel(towerName: TowerName, towerModel: TowerModel, level: UpgradeLevel, cframe: CFrame): void {
  const contentsFilter = (i: Instance): boolean => !i.IsA("Humanoid") && !i.IsA("Highlight");
  const previousContents = towerModel.GetChildren().filter(contentsFilter);
  const newModelName = getTowerModelName(level);
  towerModel.SetAttribute("CurrentModelName", newModelName);

  const newModel = <TowerModel>Assets.Towers[<TowerName>towerName].FindFirstChild(newModelName)?.Clone();
  if (newModel === undefined)
    return Log.warning(`Failed to find tower model for ${towerName} at level ${level[0]}-${level[1]} (model name: ${newModelName})`)

  newModel.ScaleTo(<number>newModel.GetAttribute("DefaultScale"));
  newModel.PivotTo(cframe);
  const newModelContents = newModel.GetChildren().filter(contentsFilter);
  const changeableAttributes = ["ProjectileType"];
  for (const [name, value] of newModel.GetAttributes()) {
    if (!changeableAttributes.includes(name)) continue;
    towerModel.SetAttribute(name, value);
  }

  for (const content of newModelContents)
    content.Parent = towerModel;

  for (const content of previousContents)
    content.Destroy();

  newModel.Destroy();
}

export function createTowerModel(towerName: TowerName, modelName: TowerModelName, cframe: CFrame = new CFrame, animateIdle = true, grow = true): TowerModel {
  const towerModel = <TowerModel>Assets.Towers[<TowerName>towerName].WaitForChild(modelName).Clone();
  towerModel.Name = towerName;
  towerModel.PivotTo(cframe);
  towerModel.Parent = PLACEMENT_STORAGE;

  if (animateIdle)
    animateTowerIdle(towerModel);
  if (grow)
    growIn(towerModel);

  return towerModel;
}

export function getTowerModelName(level: UpgradeLevel): TowerModelName {
  const [path1Level, path2Level] = level;
  const baseAppearanceLevel = math.max(path1Level, path2Level);
  const pathIdent = (path1Level < 3 && path2Level < 3) ? ("") : (path1Level >= 3 ? "A" : "B");
  return <TowerModelName>`Level${baseAppearanceLevel}${pathIdent}`;
}

export function animateTowerIdle(towerModel: TowerModel): void {
  const idle = towerModel.Humanoid.Animator.LoadAnimation(towerModel.Animations.Idle);
  idle.Priority = Enum.AnimationPriority.Idle;
  idle.Play(0);
}

export function fadeOutParts(model: Model | Folder): void {
  const parts = model.GetDescendants()
    .filter((i): i is BasePart | Highlight | Decal => {
      return ((i.IsA("BasePart") || i.IsA("Decal")) && i.Transparency !== 1)
        || (i.IsA("Highlight") && (i.FillTransparency !== 1 || i.OutlineTransparency !== 1));
    });

  for (const part of parts)
    task.spawn(() => {
      const goal = part.IsA("BasePart") || part.IsA("Decal") ? { Transparency: 1 } : {
        FillTransparency: 1,
        OutlineTransparency: 1
      };

      tween(part, new TweenInfoBuilder().SetTime(0.1), <never>goal); // hack lol
    });
}

export function createRangePreview(range: number): typeof Assets.RangePreview {
  const rangePreview = Assets.RangePreview.Clone();
  const referenceRange = rangePreview.Circle.Size.X;
  rangePreview.SetAttribute("DefaultScale", range / referenceRange)
  rangePreview.Parent = PLACEMENT_STORAGE;

  growIn(rangePreview);
  return rangePreview;
}

const sizePreviews: typeof Assets.SizePreview[] = [];
export function isSizePreviewOverlapping(sizePreview: typeof Assets.SizePreview): boolean {
  const sizeRegion = new CircularRegion(sizePreview.Position, sizePreview.Size.X);
  return Object.values(sizePreviews)
    .filter(otherPreview => otherPreview !== sizePreview)
    .map(otherPreview => new CircularRegion(otherPreview.Position, otherPreview.Size.X))
    .some(region => sizeRegion.overlapsRegion(region));
}

export function createSizePreview(size: number, towerID?: number, cframe = new CFrame, grow = true): typeof Assets.SizePreview {
  const sizePreview = Assets.SizePreview.Clone();
  const defaultTowerSize = sizePreview.Size.X;
  const sizeScale = size / defaultTowerSize;
  sizePreview.CFrame = cframe;
  sizePreview.Size = new Vector3(size, sizePreview.Size.Y, size);
  sizePreview.Beam1.CurveSize0 *= sizeScale;
  sizePreview.Beam1.CurveSize1 *= sizeScale;
  sizePreview.Beam2.CurveSize0 *= sizeScale;
  sizePreview.Beam2.CurveSize1 *= sizeScale;
  sizePreview.Left.Position = new Vector3(0, 0, sizePreview.Size.X / 2);
  sizePreview.Right.Position = new Vector3(0, 0, -sizePreview.Size.X / 2);
  sizePreview.SetAttribute("TowerID", towerID);
  sizePreview.Parent = PLACEMENT_STORAGE;
  if (grow)
    growIn(sizePreview);

  sizePreviews.push(sizePreview);
  sizePreview.Destroying.Once(() => sizePreviews.remove(sizePreviews.indexOf(sizePreview)));
  return sizePreview;
}

const defaultSizePreviewHeight = Assets.SizePreview.Beam1.Width0;
const defaultLeftAttachmentPosition = Assets.SizePreview.Left.Position;
const defaultRightAttachmentPosition = Assets.SizePreview.Right.Position;
export function resetSizePreviewHeight(sizePreview: typeof Assets.SizePreview, tweenInfo = DEFAULT_SIZE_PREVIEW_TWEEN_INFO): Trash {
  return setSizePreviewHeight(sizePreview, defaultSizePreviewHeight, tweenInfo);
}

export function setSizePreviewHeight(sizePreview: typeof Assets.SizePreview, height: number, tweenInfo = DEFAULT_SIZE_PREVIEW_TWEEN_INFO): Trash {
  const tweenTrash = new Trash;
  const difference = height - defaultSizePreviewHeight;

  tweenTrash.add(tween(sizePreview.Beam1, tweenInfo, {
    Width0: height, Width1: height
  }));
  tweenTrash.add(tween(sizePreview.Beam2, tweenInfo, {
    Width0: height, Width1: height
  }));
  tweenTrash.add(tween(sizePreview.Left, tweenInfo, {
    Position: defaultLeftAttachmentPosition.add(new Vector3(0, difference / 2, 0))
  }));
  tweenTrash.add(tween(sizePreview.Right, tweenInfo, {
    Position: defaultRightAttachmentPosition.add(new Vector3(0, difference / 2, 0))
  }));

  return tweenTrash;
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

/**
 * Smoothly scale a model/part to its original size from nothing
 * @param model Model or part to scale
 * @param point The point of the model to scale from
 */
export async function shrinkOut(model: Model | BasePart, speed = 0.1): Promise<void> {
  const scaleValue = new Instance("NumberValue");
  scaleValue.Value = <number>model.GetAttribute("DefaultScale") ?? 1;

  const defaultSize = model.IsA("BasePart") ? model.Size : undefined;
  const t = tween(scaleValue, new TweenInfoBuilder().SetTime(speed), { Value: 0.01 });
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

    model.Destroy()
    scaleValue.Destroy();
    resolve();
  });
}

/**
 * Smoothly scale a model/part to its original size from nothing
 * @param model Model or part to scale
 * @param point The point of the model to scale from
 */
export async function growIn(model: Model | BasePart, speed = 0.1): Promise<void> {
  const scaleValue = new Instance("NumberValue");
  scaleValue.Value = 0.01;

  const defaultSize = model.IsA("BasePart") ? model.Size : undefined;
  const t = tween(scaleValue, new TweenInfoBuilder().SetTime(speed), { Value: <number>model.GetAttribute("DefaultScale") ?? 1 });
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