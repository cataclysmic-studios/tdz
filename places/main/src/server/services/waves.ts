import { Service, type OnInit } from "@flamework/core";

import { Events } from "server/network";
import { toSeconds } from "common/shared/utility/time";
import type { Difficulty } from "common/shared/structs/difficulty";
import WAVES from "shared/waves";

import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";

@Service()
export class WavesService implements OnInit {
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
      const waveNumber = waves.indexOf(wave) + 1;
      Events.updateWaveUI.broadcast(waveNumber);

      for (const summonInfo of wave.enemies) {
        this.enemy.summon(summonInfo);
        task.wait(toSeconds(wave.length)); // TODO: implement timer with toSeconds(wave.length), end when all enemies are dead
        while (this.enemy.areEnemiesAlive()) task.wait(0.2);
      }
    }
  }
}