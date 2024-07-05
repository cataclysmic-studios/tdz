import type { DataType } from "@rbxts/flamework-binary-serializer";

import type { EnemyInfo, TowerInfo } from "./entity-components";

export type EnemyEntriesRecordPacket = [DataType.u16, DataType.Packed<Omit<EnemyInfo, "patch">>][];

export interface TowerInfoPacket {
  id: DataType.u16;
  towerInfo: Omit<TowerInfo, "patch">;
}