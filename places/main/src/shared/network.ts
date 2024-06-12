import { Networking } from "@flamework/networking";

import type { TowerInfo } from "./structs";

interface ServerEvents {
  placeTower(towerName: TowerName, cframe: CFrame): void;
}

interface ClientEvents {
  replicateTower(towerName: TowerName, towerInfo: TowerInfo): void;
  loadTowers(allTowers: Partial<Record<TowerName, TowerInfo[]>>): void;
}

interface ServerFunctions { }

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();