import type { Difficulty } from "common/shared/structs/difficulty";
import type { Assets } from "common/shared/utility/instances";

export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];

export interface TowerInfo {
  readonly cframe: CFrame;
  readonly ownerID: number;
  readonly upgrades: UpgradeLevel;
}

export interface DifficultyInfo {
  readonly waves: number;
  readonly startingCash: number;
}

export interface TeleportData {
  readonly difficulty: Difficulty;
  readonly map: ExtractKeys<typeof Assets.Maps, MapModel>;
}