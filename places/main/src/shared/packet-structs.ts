import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { EnemyInfo, TowerInfo } from "./entity-components";

export type EnemyEntriesRecordPacket = [DataType.i16, Omit<EnemyInfo, "patch">][];
export type TowerInfoPacket = Omit<TowerInfo, "patch">;
export interface TowerAttackPacket {
  enemyDistance: DataType.u8;
  enemySpeed: DataType.u8;
}