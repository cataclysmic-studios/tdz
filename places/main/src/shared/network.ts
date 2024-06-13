import { Networking } from "@flamework/networking";

import type { TeleportData } from "./structs";
import type { TowerInfo } from "./structs";

interface ServerEvents {
  placeTower(towerName: TowerName, cframe: CFrame): void;
  loadTeleportData(teleportData: TeleportData): void;
}

interface ClientEvents {
  updateCashUI(cash: number): void;
  replicateTower(towerName: TowerName, towerInfo: TowerInfo): void;
  loadTowers(allTowers: Partial<Record<TowerName, TowerInfo[]>>): void;
}

interface ServerFunctions {
  makePurchase(price: number): boolean;
  getTowerInfo(towerModel: TowerModel): TowerInfo;
}

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();