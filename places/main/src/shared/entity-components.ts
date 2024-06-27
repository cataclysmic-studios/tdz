import { component } from "@rbxts/matter";

export type EnemyInfo = ReturnType<typeof EnemyInfo>;
export const EnemyInfo = component<{
  distance: number;
  health: number;
  model: EnemyModel;
}>("EnemyInfo");