import { component } from "@rbxts/matter";

import type { TowerStats, UpgradeLevel } from "./towers";

export type EnemyInfo = ReturnType<typeof EnemyInfo>;
export const EnemyInfo = component<{
  distance: number;
  health: number;
  readonly model: EnemyModel;
}>("EnemyInfo");

export type TowerInfo = ReturnType<typeof TowerInfo>;
export const TowerInfo = component<{
  worth: number;
  totalDamage: number;
  cframe: CFrame;
  upgrades: UpgradeLevel;
  stats: TowerStats;
  readonly name: TowerName;
  readonly ownerID: number;
}>("TowerInfo");