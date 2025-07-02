import { Service, type OnInit } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import Object from "@rbxts/object-utils";

import type { LogStart } from "common/shared/hooks";
import { CommonEvents } from "common/server/network";
import { Events } from "server/network";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { toSeconds } from "common/shared/utility/time";
import { NotificationStyle } from "common/shared/structs/notifications";
import type { Difficulty } from "common/shared/structs/difficulty";
import WAVES from "shared/waves";

import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";

@Service()
export class WavesService implements OnInit, LogStart {
  private readonly waveTrash = new Trash;
  private skipVotes: Record<number, boolean> = {};
  private skipped = false;

  public constructor(
    private readonly match: MatchService,
    private readonly enemy: EnemyService
  ) { }

  public onInit(): void {
    Events.voteSkipWave.connect((player, votedToSkip) => {
      if (this.skipped) return;

      this.skipVotes[player.UserId] = votedToSkip;
      const skipVoteCount = this.getSkipVotes();
      const requiredVoteCount = math.ceil(this.match.getPlayerCount() / 2);
      Events.updateSkipWaveUI.broadcast(true, skipVoteCount, requiredVoteCount);
      this.skipped = skipVoteCount >= requiredVoteCount;
    });
    this.match.intermissionFinished.Once(difficulty => this.begin(difficulty));
  }

  public begin(difficulty: Difficulty): void {
    const waves = WAVES[difficulty];
    for (const wave of waves) {
      this.skipVotes = {};
      this.skipped = false;
      this.waveTrash.purge();
      const waveNumber = waves.indexOf(wave) + 1;
      Events.updateWaveUI.broadcast(waveNumber);

      let timerEnded = false;
      const waveTimer = this.match.startTimer(toSeconds(wave.length));
      this.waveTrash.add(waveTimer.ended.Once(() => timerEnded = true));
      const countConnection = this.waveTrash.add(waveTimer.counted.Connect(remainingTime => {
        if (remainingTime >= waveTimer.length - 15) return;
        countConnection.Disconnect();
        Events.updateSkipWaveUI.broadcast(true, 0, this.match.getPlayerCount());
      }));

      let summoning = true;
      task.spawn(() => {
        for (const summonInfo of wave.enemies) {
          this.enemy.summon(summonInfo);
          if (summonInfo.length === -1) continue;
          task.wait(summonInfo.length / this.match.timeScale);
        }
        summoning = false;
      });

      while (true) {
        if (this.skipped) break;
        if (!summoning && (timerEnded || !this.enemy.areEnemiesAlive())) break;
        task.wait(0.2);
      }
      if (waveTimer.isActive())
        this.match.destroyCurrentTimer();

      this.match.incrementAllCash(wave.completionReward);
      CommonEvents.sendNotification.broadcast(`+$${toSuffixedNumber(wave.completionReward)}`, NotificationStyle.GainedMoney);
      Events.updateSkipWaveUI.broadcast(false, 0, 0);
      // TODO: play sound

      const intermissionTimer = this.match.startTimer(4);
      this.waveTrash.add(intermissionTimer.counted.Connect(() => Sound.SoundEffects.Tick.Play()));
      while (this.match.hasActiveTimer()) task.wait(0.2);
    }

    this.match.complete(true);
  }

  private getSkipVotes(): number {
    return Object.values(this.skipVotes).filter(vote => vote).size();
  }
}