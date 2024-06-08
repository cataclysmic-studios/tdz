import { Networking } from "@flamework/networking";
import type { GitHubInfo } from "./structs/github";

interface ServerEvents {
  data: {
    initialize(): void;
    set(directory: string, value: unknown): void;
    increment(directory: string, amount?: number): void;
    decrement(directory: string, amount?: number): void;
    addToArray(directory: string, value: defined): void;
    deleteFromArray(directory: string, value: defined): void;
    updateLoginStreak(): void;
  };
}

interface ClientEvents {
  data: {
    updated(directory: string, value: unknown): void;
  };
}

interface ServerFunctions {
  data: {
    get(directory?: string, defaultValue?: unknown): unknown;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface ClientFunctions { }

export const CommonGlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const CommonGlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();