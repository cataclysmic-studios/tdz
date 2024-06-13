import { OnInit, Service } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Signal from "@rbxts/signal";

import type { OnPlayerJoin, OnPlayerLeave } from "common/server/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { DIFFICULTY_INFO } from "shared/constants";
import type { TeleportData } from "shared/structs";

@Service()
export class MatchService implements OnInit, OnPlayerJoin, OnPlayerLeave {
  private readonly playerCash: Record<number, number> = {};
  private readonly playerJanitors: Partial<Record<number, Janitor>> = {};
  private readonly cashChanged = new Signal<(player: Player, newCash: number) => void>;
  private teleportData!: TeleportData;

  public onInit(): void {
    Events.loadTeleportData.connect((_, teleportData) => {
      this.teleportData = teleportData;
      const mapModel = Assets.Maps[teleportData.map].Clone();
      mapModel.Parent = World;
    });
    Functions.makePurchase.setCallback((player, price) => {
      if (this.getCash(player) < price) return false;
      this.decrementCash(player, price);
      return true;
    });
  }

  public onPlayerJoin(player: Player): void {
    const janitor = new Janitor;
    this.playerJanitors[player.UserId] = janitor;

    do task.wait(0.2); while (this.teleportData === undefined);
    janitor.Add(this.cashChanged.Connect((p, cash) => {
      if (p !== player) return;
      Events.updateCashUI(player, cash);
    }));

    this.setCash(player, this.getCash(player) ?? DIFFICULTY_INFO[this.teleportData.difficulty].startingCash)
  }

  public onPlayerLeave(player: Player): void {
    this.playerJanitors[player.UserId]?.Destroy();
    this.playerJanitors[player.UserId] = undefined;
  }

  private decrementCash(player: Player, amount: number): void {
    this.incrementCash(player, -amount);
  }

  private incrementCash(player: Player, amount: number): void {
    this.setCash(player, math.max(this.getCash(player) + amount, 0));
  }

  private setCash(player: Player, cash: number): void {
    this.playerCash[player.UserId] = cash;
    this.cashChanged.Fire(player, cash);
  }

  private getCash(player: Player): number {
    return this.playerCash[player.UserId];
  }
}