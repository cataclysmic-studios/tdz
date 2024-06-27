import { OnInit, Service } from "@flamework/core";
import { Workspace as World, Players } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Signal from "@rbxts/signal";

import type { OnPlayerJoin, OnPlayerLeave } from "common/server/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { teleportPlayers } from "shared/utility";
import { DIFFICULTY_INFO } from "shared/constants";
import type { TeleportData } from "shared/structs";
import type { Difficulty } from "common/shared/structs/difficulty";

// TODO: handle timers here

@Service()
export class MatchService implements OnInit, OnPlayerJoin, OnPlayerLeave {
  public readonly intermissionFinished = new Signal<(difficulty: Difficulty) => void>;
  public timeScale = 1;

  private readonly cashChanged = new Signal<(player: Player, newCash: number) => void>;
  private readonly playerCash: Record<number, number> = {};
  private readonly playerJanitors: Partial<Record<number, Janitor>> = {};
  private maxHealth = 0;
  private health = 0;
  private teleportData!: TeleportData;
  private mapModel!: MapModel;

  public onInit(): void {
    Events.loadTeleportData.connect((_, teleportData) => {
      this.teleportData = teleportData;
      this.mapModel = Assets.Maps[teleportData.map].Clone();
      this.mapModel.Parent = World;
      this.initialize(teleportData.difficulty);
    });
    Events.toggleDoubleSpeed.connect((_, on) => {
      if (Players.GetPlayers().size() > 1) return; // TODO: vote for 2x
      this.timeScale = on ? 2 : 1;
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
    const spawnPoint = this.mapModel.FindFirstChildOfClass("SpawnLocation")?.CFrame ?? this.mapModel.GetPivot();
    teleportPlayers(spawnPoint, player);

    janitor.Add(this.cashChanged.Connect((p, cash) => {
      if (p !== player) return;
      Events.updateCashUI(player, cash);
    }));

    const difficultyInfo = DIFFICULTY_INFO[this.teleportData.difficulty];
    this.setCash(player, this.getCash(player) ?? difficultyInfo.startingCash); // ?? in case they join back
  }

  public onPlayerLeave(player: Player): void {
    this.playerJanitors[player.UserId]?.Destroy();
    this.playerJanitors[player.UserId] = undefined;
  }

  public getMap(): MapModel {
    return this.mapModel;
  }

  public decrementHealth(amount: number): void {
    this.incrementHealth(-amount);
  }

  private incrementHealth(amount: number): void {
    this.setHealth(math.max(this.getHealth() + amount, 0));
  }

  private setHealth(health: number): void {
    this.maxHealth = health > this.maxHealth ? health : this.maxHealth;
    this.health = health;
    Events.updateHealthUI.broadcast(health, this.maxHealth);
  }

  private getHealth(): number {
    return this.health;
  }

  private decrementCash(player: Player, amount: number): void {
    this.incrementCash(player, -amount);
  }

  private incrementCash(player: Player, amount: number): void {
    this.setCash(player, math.max(this.getCash(player) + amount, 0));
  }

  private setCash(player: Player, cash: number): void {
    this.playerCash[player.UserId] = cash;
    this.cashChanged.Fire(player, cash); // TODO: debounce
  }

  private getCash(player: Player): number {
    return this.playerCash[player.UserId];
  }

  private initialize(difficulty: Difficulty) {
    task.spawn(() => {
      const { startingHealth } = DIFFICULTY_INFO[difficulty];
      this.setHealth(startingHealth);
      task.wait(8 / this.timeScale); // TODO: implement timer
      this.intermissionFinished.Fire(difficulty);
    });
  }
}