import { Dependency } from "@flamework/core";
import type { CommandContext } from "@rbxts/cmdr";

import type { DatabaseService } from "common/server/services/third-party/database";

export = function (context: CommandContext, directory: string, value: unknown): void {
  const db = Dependency<DatabaseService>();
  try {
    db.set(context.Executor, directory, value);
    context.Reply(`Successfully set data at "${directory}" to "${value}"!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}