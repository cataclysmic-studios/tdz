import { Networking } from "@flamework/networking";

import type { GitHubInfo } from "./structs/github";
import type { NotificationStyle } from "./structs/notifications";

interface CommonServerEvents {
  data: {
    initialize(): void;
    set(directory: string, value: unknown): void;
    increment(directory: string, amount?: number): void;
    decrement(directory: string, amount?: number): void;
    addToArray(directory: string, value: defined): void;
    deleteFromArray(directory: string, value: defined): void;
  };
}

interface CommonClientEvents {
  sendNotification(message: string, style: NotificationStyle, lifetime?: number, fadeTime?: number): void;
  notifyFailedPurchase(cashNeeded: number): void;
  data: {
    updated(directory: string, value: unknown): void;
  };
}

interface CommonServerFunctions {
  data: {
    get(directory?: string, defaultValue?: unknown): unknown;
  };
  github: {
    getInfo(): GitHubInfo;
  };
}

interface CommonClientFunctions { }

export const CommonGlobalEvents = Networking.createEvent<CommonServerEvents, CommonClientEvents>();
export const CommonGlobalFunctions = Networking.createFunction<CommonServerFunctions, CommonClientFunctions>();