import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";

interface Attributes {
  StartGameButton_ID?: number;
}

@Component({
  tag: "StartGameButton",
  ancestorWhitelist: [PlayerGui]
})
export class StartGameButton extends BaseComponent<Attributes, ImageButton> implements OnStart {
  public onStart(): void {
    this.instance.MouseButton1Click.Connect(() => Events.startGame(this.attributes.StartGameButton_ID!));
    Events.toggleInLobbyButtons.connect((on, lobbyLeader, id) => {
      if (!lobbyLeader) return;
      this.attributes.StartGameButton_ID = id;
      this.instance.Visible = on;
    });
  }
}