import { Dependency } from "@flamework/core";
import type { CommandContext } from "@rbxts/cmdr";

import { toSuffixedNumber } from "common/shared/utility/numbers";

import type { MatchService } from "server/services/match";

export = function (context: CommandContext, amount: number): void {
  const match = Dependency<MatchService>();
  try {
    match.incrementCash(context.Executor, amount);
    context.Reply(`Successfully gave ${context.Executor} $${toSuffixedNumber(amount)}!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}