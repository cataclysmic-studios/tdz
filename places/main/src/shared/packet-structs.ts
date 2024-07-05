import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { EnemyInfo, TowerInfo } from "./entity-components";

export type EnemyEntriesRecordPacket = [DataType.u16, DataType.Packed<Omit<EnemyInfo, "patch">>][];

export interface TowerInfoPacket extends DataType.Packed<{
  id: DataType.i32;
  towerInfo: Omit<TowerInfo, "patch">;
}> { }