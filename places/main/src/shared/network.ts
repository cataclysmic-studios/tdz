import { Networking } from "@flamework/networking";

interface ServerEvents {
  placeTower(towerName: TowerName, cframe: CFrame): void;
}

interface ClientEvents { }

interface ServerFunctions { }

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();