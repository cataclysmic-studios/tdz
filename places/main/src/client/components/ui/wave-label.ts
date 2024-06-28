import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";
import { commaFormat } from "common/shared/utility/numbers";

@Component({
  tag: "WaveLabel",
  ancestorWhitelist: [PlayerGui]
})
export class WaveLabel extends BaseComponent<{}, TextLabel> implements OnStart {
  public onStart(): void {
    Events.updateWaveUI.connect(wave => this.instance.Text = `WAVE ${commaFormat(wave)}`);
  }
}