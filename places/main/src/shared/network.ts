import { Networking } from "@flamework/networking";

import type { TeleportData } from "./structs";
import type { TowerInfo } from "./structs";

interface ServerEvents {
  placeTower(towerName: TowerName, cframe: CFrame, price: number): void;
  loadTeleportData(teleportData: TeleportData): void;
}

interface ClientEvents {
  towerUpgraded(id: number, newInfo: TowerInfo): void;
  updateCashUI(cash: number): void;
  updateHealthUI(health: number, maxHealth: number): void;
  replicateTower(id: number, towerInfo: TowerInfo): void;
  loadTowers(allTowers: Record<number, TowerInfo>): void;
}

interface ServerFunctions {
  makePurchase(price: number): boolean;
  getTowerInfo(id: number): TowerInfo;
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();