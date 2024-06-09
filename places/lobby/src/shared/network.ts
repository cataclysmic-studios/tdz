import { Networking } from "@flamework/networking";

interface ServerEvents {
  leaveLobby(id: number): void;
}

interface ClientEvents {
  toggleLeaveButton(on: boolean, id: number): void;
}

interface ServerFunctions { }

interface ClientFunctions { }

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();