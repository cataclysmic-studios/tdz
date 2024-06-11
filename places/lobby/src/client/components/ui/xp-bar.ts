import { Component, BaseComponent } from "@flamework/components";
import { endsWith } from "@rbxts/string-utils";

import type { OnDataUpdate } from "common/client/hooks";
import { CommonFunctions } from "common/client/network";
import { PlayerGui } from "common/shared/utility/client";
import { commaFormat } from "common/shared/utility/numbers";
import { getXPUntilNextLevel } from "shared/utility";

@Component({
  tag: "XpBar",
  ancestorWhitelist: [PlayerGui]
})
export class XpBar extends BaseComponent<{}, PlayerGui["Main"]["Main"]["XP"]> implements OnDataUpdate {
  public async onDataUpdate(directory: string, value: number): Promise<void> {
    if (endsWith(directory, "level"))
      this.instance.Level.Text = `LEVEL ${commaFormat(value)}`;
    else if (endsWith(directory, "xp")) {
      const xpUntilNext = getXPUntilNextLevel(<number>await CommonFunctions.data.get("level"));
      this.instance.Count.Text = `${commaFormat(value)} / ${commaFormat(xpUntilNext)}`;
      this.instance.Bar.Size = UDim2.fromScale(value / xpUntilNext, 1);
    }
  }
}