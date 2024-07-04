import { Dependency } from "@flamework/core";
import type { CommandContext } from "@rbxts/cmdr";

import type { MatchService } from "server/services/match";
import { MAX_TIME_SCALE, MIN_TIME_SCALE } from "shared/constants";

export = function (context: CommandContext, timeScale: number): void {
  const match = Dependency<MatchService>();
  try {
    const clampedTimeScale = math.clamp(timeScale, MIN_TIME_SCALE, MAX_TIME_SCALE);
    match.setTimeScale(clampedTimeScale);
    context.Reply(`Successfully set time scale to ${clampedTimeScale}x!`, Color3.fromRGB(0, 255, 0));
  } catch (err) {
    context.Reply(`Error: ${err}`, Color3.fromRGB(255, 0, 0));
  }
}