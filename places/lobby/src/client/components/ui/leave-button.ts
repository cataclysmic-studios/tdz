import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";

interface Attributes {
  LeaveButton_ID?: number;
}

@Component({
  tag: "LeaveButton",
  ancestorWhitelist: [PlayerGui]
})
export class LeaveButton extends BaseComponent<Attributes, ImageButton> implements OnStart {
  public onStart(): void {
    this.instance.MouseButton1Click.Connect(() => Events.leaveLobby(this.attributes.LeaveButton_ID!));
    Events.toggleInLobbyButtons.connect((on, _, id) => {
      this.attributes.LeaveButton_ID = id;
      this.instance.Visible = on;
    });
  }
}