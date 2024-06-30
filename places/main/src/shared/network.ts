import { Networking } from "@flamework/networking";

import type { TeleportData } from "./structs";
import type { TowerInfo } from "./entity-components";

interface ServerEvents {
  placeTower(towerName: TowerName, cframe: CFrame, price: number): void;
  loadTeleportData(teleportData: TeleportData): void;
  toggleDoubleSpeed(on: boolean): void;
  skipWave(): void;
  admin: {
    killAllEnemies(): void;
  }
}

interface ClientEvents {
  updateTimerUI: Networking.Unreliable<(remainingTime: number) => void>;
  towerAttacked: Networking.Unreliable<(id: number, enemyPosition: Vector3) => void>;
  updateHealthUI(health: number, maxHealth: number): void;
  updateWaveUI(wave: number): void;
  timeScaleUpdated(timeScale: number): void;
  towerUpgraded(id: number, newInfo: Omit<TowerInfo, "patch">): void;
  replicateTower(id: number, towerInfo: Omit<TowerInfo, "patch">): void;
  loadTowers(allTowers: Record<number, TowerInfo>): void;
}

interface ServerFunctions {
  getTimeScale(): number;
  spendCash(price: number): boolean;
  getTowerInfo(id: number): Omit<TowerInfo, "patch">;
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();