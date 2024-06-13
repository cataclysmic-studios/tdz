import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";

@Component({
  tag: "CashLabel",
  ancestorWhitelist: [PlayerGui]
})
export class CashLabel extends BaseComponent<{}, TextLabel> implements OnStart {
  public onStart(): void {
    Events.updateCashUI.connect(cash => this.instance.Text = `$${toSuffixedNumber(cash)}`);
  }
}