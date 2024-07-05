import { Networking } from "@flamework/networking";

import type { TeleportData } from "./structs";
import type { UpgradePath } from "./towers";
import type { TowerInfo } from "./entity-components";

interface ServerEvents {
  sellTower(id: number): void;
  placeTower(towerName: TowerName, cframe: CFrame, price: number): void;
  loadTeleportData(teleportData: TeleportData): void;
  toggleDoubleSpeed(on: boolean): void;
  skipWave(): void;
}

interface ClientEvents {
  updateTimerUI: Networking.Unreliable<(remainingTime: number) => void>;
  updateTowerStats: Networking.Unreliable<(id: number, towerInfoPacket: SerializedData) => void>;
  towerAttacked: Networking.Unreliable<(idDistanceAndSpeed: Vector3int16) => void>; // TODO: use Vector3int16 and include id too, also use bitpacking on ID (11 bits)
  towerSold(id: number): void;
  enemyDied(id: number): void;
  updateEnemies(enemyRecordEntries: SerializedData): void;
  updateHealthUI(health: number, maxHealth: number): void; // TODO: use Vector2int16
  updateWaveUI(wave: number): void;
  timeScaleUpdated(timeScale: number): void;
  replicateTower(id: number, towerInfo: Omit<TowerInfo, "patch">): void;
  loadTowers(allTowers: Record<number, TowerInfo>): void;
  mapLoaded(mapName: MapName): void;
  playSoundEffect(name: ExtractKeys<SoundService["SoundEffects"], Sound>): void;
}

interface ServerFunctions {
  requestTowerUpgrade(id: number, path: UpgradePath, price: number): void;
  getTimeScale(): number;
  spendCash(price: number): [boolean, number];
  getTowerInfo(id: number): Omit<TowerInfo, "patch">;
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();