import type { Difficulty } from "common/shared/structs/difficulty";
import type { Assets } from "common/shared/utility/instances";

export const enum TargettingType {
  First,
  Last,
  Close,
  Strong,
  Weak,
  Random
}

export interface WaveData {
  readonly length: string;
  readonly completionReward: number;
  readonly enemies: EnemySummonInfo[];
}

export interface EnemySummonInfo<Name extends EnemyName = EnemyName> {
  readonly enemyName: Name;
  readonly amount: number;
  readonly interval: number;
  readonly length: number;
}

export const enum EnemyTraitType {
  BulletResistance = "Bullet Resistance",
  NoCash = "No Cash",
}

export interface EnemyTrait<T extends EnemyTraitType = EnemyTraitType> {
  readonly type: T;
  readonly effectiveness?: number;
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