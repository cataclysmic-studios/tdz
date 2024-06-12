import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { TeleportService, Players } from "@rbxts/services";

import { Events } from "server/network";
import { Assets, getInstancePath } from "common/shared/utility/instances";
import Log from "common/shared/logger";

interface GameLobbyModel extends Model {
  Entrance: Part;
}

interface Attributes {
  readonly GameLobby_Size: number;
}

let lobbyID = 1;

@Component({
  tag: "GameLobby",
  defaults: {
    GameLobby_Size: 4
  }
})
export class GameLobby extends BaseComponent<Attributes, GameLobbyModel> implements OnStart {
  private readonly players: Player[] = [];
  private readonly id = lobbyID++;
  private ui!: typeof Assets.UI.GameLobbyUI;

  public onStart(): void {
    this.ui = Assets.UI.GameLobbyUI.Clone();
    this.ui.Parent = this.instance.Entrance;

    Events.leaveLobby.connect((player, id) => {
      if (this.id !== id) return;
      this.leave(player);
    });
    Events.startGame.connect((_, id) => {
      if (this.id !== id) return;
      this.start();
    });

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

      this.join(player, humanoid, seat);
    });
  }

  public start(): void {
    this.toggleButtons(this.players, false);
    for (const player of this.players)
      TeleportService.Teleport(17811035844, player, undefined, Assets.UI.TeleportScreen);
  }

  private join(player: Player, humanoid: Humanoid, seat: Seat): void {
    this.players.push(player);
    humanoid.JumpPower = 0;
    seat.Sit(humanoid);
    this.toggleButtons(player, true);
    this.updatePlayerCount();
  }

  private leave(player: Player): void {
    this.players.remove(this.players.indexOf(player));

    const character = player.Character;
    const root = <Maybe<BasePart>>character?.FindFirstChild("HumanoidRootPart")
    const humanoid = character?.FindFirstChildOfClass("Humanoid");
    if (humanoid === undefined || root === undefined) return;

    humanoid.JumpPower = 50;
    humanoid.Jump = true;
    do task.wait(0.1); while (humanoid.Jump); // wait until jump is finished otherwise seat teleports lol

    root.CFrame = this.instance.Entrance.CFrame.add(this.instance.Entrance.CFrame.LookVector.mul(8)).sub(new Vector3(0, 4, 0));
    this.toggleButtons(player, false);
    this.updatePlayerCount();
  }

  private updatePlayerCount(): void {
    this.ui.PlayerCount.Text = `${this.players.size()}/${this.attributes.GameLobby_Size}`;
  }

  private toggleButtons(players: Player | Player[], on: boolean): void {
    Events.toggleInLobbyButtons(players, on, players === this.players[0], this.id);
  }
}