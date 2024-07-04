import { component, type Entity } from "@rbxts/matter";

import type { TowerStats, UpgradeLevel } from "./towers";
import type { EnemyTrait, TargetingType } from "./structs";

export type EnemyEntity = Entity<[EnemyInfo]>;
export type EnemyInfo = ReturnType<typeof EnemyInfo>;
export const EnemyInfo = component<{
  distance: number;
  health: number;
  isStealth: boolean;
  readonly traits: EnemyTrait[];
  readonly model: EnemyModel;
}>("EnemyInfo");

export type TowerEntity = Entity<[TowerInfo]>;
export type TowerInfo = ReturnType<typeof TowerInfo>;
export const TowerInfo = component<{
  worth: number;
  totalDamage: number;
  upgrades: UpgradeLevel;
  stats: TowerStats;
  timeSinceAttack: number;
  targeting: TargetingType,
  readonly cframe: CFrame;
  readonly name: TowerName;
  readonly ownerID: number;
}>("TowerInfo");