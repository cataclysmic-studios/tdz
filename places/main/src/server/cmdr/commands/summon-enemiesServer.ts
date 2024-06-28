import { Dependency } from "@flamework/core";
import type { CommandContext } from "@rbxts/cmdr";

import { Assets } from "common/shared/utility/instances";

import type { EnemyService } from "server/services/enemy";

export = function (context: CommandContext, name: EnemyName, amount: number, interval: number): void {
  const enemy = Dependency<EnemyService>();
  try {
    if (Assets.Enemies[name] === undefined)
      return context.Reply(`Error: "${name}:" is not a valid enemy name.`, Color3.fromRGB(255, 0, 0));

    task.spawn(() => {
      enemy.summon({
        enemyName: name,
        amount, interval
      });
    });
    context.Reply(`Successfully spawned ${amount} ${name}(s)!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}