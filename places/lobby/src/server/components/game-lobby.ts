import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Players } from "@rbxts/services";

import { getInstancePath } from "common/shared/utility/instances";
import Log from "common/shared/logger";

interface GameLobbyModel extends Model {
  Entrance: Part;
}

interface Attributes {
  readonly GameLobby_Size: number;
}

let lobbyID = 0;

@Component({
  tag: "GameLobby",
  defaults: {
    GameLobby_Size: 4
  }
})
export class GameLobby extends BaseComponent<Attributes, GameLobbyModel> implements OnStart {
  private readonly players: Player[] = [];

  public onStart(): void {
    lobbyID++;
    this.instance.Entrance.Touched.Connect(hit => {
      const character = hit.FindFirstAncestorOfClass("Model");
      const humanoid = character?.FindFirstChildOfClass("Humanoid");
      if (character === undefined || humanoid === undefined) return;

      const player = Players.GetPlayerFromCharacter(character);
      if (player === undefined) return;

      const seatNumber = this.players.size() + 1;
      if (seatNumber > this.attributes.GameLobby_Size) return;
      if (character.GetAttribute(`${lobbyID}Debounce`)) return;
      character.SetAttribute(`${lobbyID}Debounce`, true);
      task.delay(0.5, () => character.SetAttribute(`${lobbyID}Debounce`, false));

      const seatName = `Seat${seatNumber}`;
      const seat = <Seat>this.instance.FindFirstChild(seatName);
      if (seat === undefined)
        return Log.warning(`Attempted to seat player in ${seatName} (${getInstancePath(this.instance)})`);

      this.players.push(player);
      humanoid.JumpHeight = 0;
      seat.Sit(humanoid);
    });
  }

  public leave(player: Player): void {

  }
}