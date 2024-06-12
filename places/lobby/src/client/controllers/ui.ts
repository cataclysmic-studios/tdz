import { Controller, type OnInit } from "@flamework/core";
import { Events } from "client/network";
import { PlayerGui } from "common/shared/utility/client";

@Controller()
export class UIController implements OnInit {
  public onInit(): void {
    Events.toggleInLobbyButtons.connect(on => PlayerGui.Main.LobbyButtons.Visible = on);
  }
}