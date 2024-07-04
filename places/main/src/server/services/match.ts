import { Service, type OnInit, type OnStart } from "@flamework/core";
import { Workspace as World, SoundService as Sound, Players } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Signal from "@rbxts/signal";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin, OnPlayerLeave } from "common/server/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { adjustAllSoundSpeeds, initializeDefaultSoundSpeeds, teleportPlayers } from "shared/utility";
import { Path } from "shared/classes/path";
import { Timer } from "server/timer";
import { DIFFICULTY_INFO } from "shared/constants";
import type { TeleportData } from "shared/structs";
import type { Difficulty } from "common/shared/structs/difficulty";
import Object from "@rbxts/object-utils";
import Log from "common/shared/logger";

const { max, clamp } = math;

const INTERMISSION_LENGTH = 8;

@Service({ loadOrder: 1 })
export class MatchService implements OnInit, OnStart, OnPlayerJoin, OnPlayerLeave, LogStart {
  public readonly cashChanged = new Signal<(player: Player, newCash: number) => void>;
  public readonly timeScaleChanged = new Signal<(timeScale: number) => void>;
  public readonly intermissionFinished = new Signal<(difficulty: Difficulty) => void>;
  public timeScale = 1;

  private readonly playerCash: Record<number, number> = {};
  private readonly playerJanitors: Partial<Record<number, Janitor>> = {};
  private teleportData!: TeleportData;
  private mapModel!: MapModel;
  private path!: Path;
  private currentTimer?: Timer;
  private timerJanitor = new Janitor;
  private maxHealth = 0;
  private health = 0;
  private completed = false;

  public onInit(): void {
    Events.loadTeleportData.connect((_, teleportData) => {
      if (this.teleportData !== undefined) return;
      this.teleportData = teleportData;
      this.mapModel = Assets.Maps[teleportData.map].Clone();
      this.mapModel.Parent = World;
      this.mapModel.AddTag("Map");
      this.path = new Path(this.mapModel);
      this.initialize(teleportData.difficulty);
    });
    Events.toggleDoubleSpeed.connect((_, on) => {
      if (Players.GetPlayers().size() > 1) return; // TODO: vote for 2x
      this.setTimeScale(on ? 2 : 1);
    });

    Functions.getTimeScale.setCallback(() => this.timeScale);
    Functions.spendCash.setCallback((player, price) => {
      if (price < 0) { // attempting to add cash
        player.Kick("stop it asshole");
        return [false, 0];
      }

      const cash = this.getCash(player);
      if (cash < price) return [false, max(price - cash, 0)];
      this.decrementCash(player, price);
      return [true, 0];
    });
  }

  public onStart(): void {
    initializeDefaultSoundSpeeds();
  }

  public onPlayerJoin(player: Player): void {
    const janitor = new Janitor;
    this.playerJanitors[player.UserId] = janitor;

    do task.wait(0.2); while (this.teleportData === undefined);
    const spawnPoint = this.mapModel.FindFirstChildOfClass("SpawnLocation")?.CFrame ?? this.mapModel.GetPivot().add(new Vector3(0, 10, 0));
    if (player.Character === undefined)
      player.CharacterAdded.Once(() => teleportPlayers(spawnPoint, player));
    else
      teleportPlayers(spawnPoint, player)

    const difficultyInfo = DIFFICULTY_INFO[this.teleportData.difficulty];
    this.setCash(player, this.getCash(player) ?? difficultyInfo.startingCash); // ?? in case they join back
    Events.mapLoaded.broadcast(<MapName>this.mapModel.Name);
  }

  public onPlayerLeave(player: Player): void {
    this.playerJanitors[player.UserId]?.Destroy();
    this.playerJanitors[player.UserId] = undefined;
  }

  public isComplete(): boolean {
    return this.completed;
  }

  public complete(won: boolean): void {
    this.completed = true;
    Log.info(won ? "You won!" : "You lost...");
    // TODO: rewards, win/lose UI, music, etc.
  }

  public setTimeScale(timeScale: number): void {
    this.timeScale = timeScale;
    this.timeScaleChanged.Fire(timeScale);
    Events.timeScaleUpdated.broadcast(timeScale);
    adjustAllSoundSpeeds(timeScale);
  }

  public getPath(): Path {
    return this.path;
  }

  public getMap(): MapModel {
    return this.mapModel;
  }

  public decrementHealth(amount: number): void {
    this.incrementHealth(-amount);
  }

  public incrementAllCash(amount: number): void {
    for (const [id, cash] of Object.entries(this.playerCash))
      this.playerCash[id] = max(cash + amount, 0);

    this.broadcastCashChange();
  }

  public incrementCash(player: Player, amount: number): void {
    this.setCash(player, max(this.getCash(player) + amount, 0));
  }

  public getCash(player: Player): number {
    return this.playerCash[player.UserId];
  }

  public startTimer(length: number): Timer {
    this.currentTimer = this.timerJanitor.Add(new Timer(this, length), "destroy");
    this.timerJanitor.Add(this.currentTimer.counted.Connect(remainingTime => Events.updateTimerUI.broadcast(remainingTime)));
    this.timerJanitor.Add(this.currentTimer.ended.Once(() => this.destroyCurrentTimer()));
    return this.currentTimer;
  }

  public destroyCurrentTimer(): void {
    this.timerJanitor.Cleanup();
    this.currentTimer = undefined;
  }

  public hasActiveTimer(): boolean {
    return this.currentTimer !== undefined;
  }

  private incrementHealth(amount: number): void {
    this.setHealth(this.getHealth() + amount);
  }

  private setHealth(health: number): void {
    this.maxHealth = health > this.maxHealth ? health : this.maxHealth;
    this.health = clamp(health, 0, this.maxHealth);
    Events.updateHealthUI.broadcast(health, this.maxHealth);

    if (health === 0)
      this.complete(false);
  }

  private getHealth(): number {
    return this.health;
  }

  private decrementCash(player: Player, amount: number): void {
    this.incrementCash(player, -amount);
  }

  private setCash(player: Player, cash: number): void {
    this.playerCash[player.UserId] = cash;
    this.cashChanged.Fire(player, cash);
  }

  private broadcastCashChange(): void {
    for (const player of Players.GetPlayers())
      task.spawn(() => this.cashChanged.Fire(player, this.getCash(player)));
  }

  private initialize(difficulty: Difficulty): void {
    task.spawn(() => {
      const { startingHealth } = DIFFICULTY_INFO[difficulty];
      this.setHealth(startingHealth);
      const timer = this.startTimer(INTERMISSION_LENGTH);
      timer.counted.Connect(() => Sound.SoundEffects.Tick.Play());
      timer.ended.Once(() => this.intermissionFinished.Fire(difficulty));
    });
  }
}