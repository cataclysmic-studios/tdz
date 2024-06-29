import { Service, type OnInit } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import { Events } from "server/network";
import { toSeconds } from "common/shared/utility/time";
import type { Difficulty } from "common/shared/structs/difficulty";
import WAVES from "shared/waves";
import Log from "common/shared/logger";

import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";

@Service()
export class WavesService implements OnInit {
  private readonly waveJanitor = new Janitor;

  public constructor(
    private readonly match: MatchService,
    private readonly enemy: EnemyService
  ) { }

  public onInit(): void {
    this.match.intermissionFinished.Once(difficulty => this.begin(difficulty));
  }

  public begin(difficulty: Difficulty): void {
    const waves = WAVES[difficulty];
    for (const wave of waves) {
      print("cleaning up wave...")
      this.waveJanitor.Cleanup();
      const waveNumber = waves.indexOf(wave) + 1;
      Events.updateWaveUI.broadcast(waveNumber);

      let timerEnded = false;
      const waveTimer = this.match.startTimer(toSeconds(wave.length));
      this.waveJanitor.Add(waveTimer.ended.Once(() => timerEnded = true));
      // print(this.match.)

      for (const summonInfo of wave.enemies)
        this.enemy.summon(summonInfo);

      while (!timerEnded && this.enemy.areEnemiesAlive()) task.wait(0.2);
      if (waveTimer.isActive())
        this.match.destroyCurrentTimer();

      const intermissionTimer = this.match.startTimer(4);
      // TODO: add tick sound on intermissionTimer countdown
      while (this.match.hasActiveTimer()) task.wait(0.2);
    }

    // TODO: win rewards, win UI, music, etc.
    Log.info("You won!!!");
  }
}