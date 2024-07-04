import { Dependency } from "@flamework/core";
import type { CommandContext } from "@rbxts/cmdr";

import type { EnemyService } from "server/services/enemy";

export = function (context: CommandContext): void {
  const enemy = Dependency<EnemyService>();
  try {
    enemy.killAll();
    context.Reply(`Successfully killed all enemies!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}