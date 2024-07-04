import type { Registry } from "@rbxts/cmdr";

import { isNaN } from "common/shared/utility/numbers";
import { MIN_TIME_SCALE, MAX_TIME_SCALE } from "shared/constants";

export = function (registry: Registry): void {
  registry.RegisterType("timeScale", {
    Parse: value => {
      if (tonumber(value) !== undefined && !isNaN(tonumber(value)!))
        return math.clamp(tonumber(value)!, MIN_TIME_SCALE, MAX_TIME_SCALE);
    }
  })
}