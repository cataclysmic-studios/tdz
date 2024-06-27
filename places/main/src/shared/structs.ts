import type { Difficulty } from "common/shared/structs/difficulty";
import type { Assets } from "common/shared/utility/instances";
import type { TowerStats } from "common/shared/towers";

export type UpgradePath = 1 | 2;
export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];
export type PathStats = readonly [Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>];

export interface WaveData {
  readonly length: string;
  readonly enemies: EnemySummonInfo[];
}

export interface EnemySummonInfo<Name extends EnemyName = EnemyName> {
  readonly enemyName: Name;
  readonly amount: number;
  readonly interval: number;
}

export const enum EnemyTraitType {
  BulletResistance = "Bullet Resistance",
  NoCash = "No Cash",
}

export interface EnemyTrait<T extends EnemyTraitType = EnemyTraitType> {
  readonly type: T;
  readonly effectiveness?: number;
}

export interface TowerInfo {
  readonly name: TowerName;
  readonly worth: number;
  readonly totalDamage: number;
  readonly cframe: CFrame;
  readonly ownerID: number;
  readonly upgrades: UpgradeLevel;
  readonly stats: TowerStats;
}

export interface DifficultyInfo {
  readonly waveCount: number;
  readonly startingCash: number;
  readonly startingHealth: number;
}

export interface TeleportData {
  readonly difficulty: Difficulty;
  readonly map: ExtractKeys<typeof Assets.Maps, MapModel>;
}