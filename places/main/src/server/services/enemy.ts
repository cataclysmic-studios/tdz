import { OnInit, OnTick, Service } from "@flamework/core";
import type { Entity } from "@rbxts/matter";

import { Assets } from "common/shared/utility/instances";
import { toSeconds } from "common/shared/utility/time";
import { growIn } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { Path } from "shared/path";
import { ENEMY_STORAGE } from "shared/constants";
import type { EnemySummonInfo, WaveData } from "shared/structs";
import WAVES from "shared/waves";

import type { MatterService } from "server/services/matter";
import type { MatchService } from "./match";

type EnemyEntity = Entity<[EnemyInfo]>;

@Service()
export class EnemyService implements OnInit, OnTick {
  private readonly enemies: EnemyEntity[] = [];
  private path!: Path

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService
  ) { }

  public onInit(): void {
    this.match.intermissionFinished.Once(difficulty => {
      this.path = new Path(this.match.getMap());
      task.spawn(() => this.startWaves(WAVES[difficulty]));
    });

    for (const enemyModel of <EnemyModel[]>Assets.Enemies.GetChildren())
      for (const part of enemyModel.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";
  }

  public onTick(dt: number): void {
    // TODO: check if mouse.getTarget() is any enemy model

    const map = this.match.getMap();
    for (const [enemy, info] of this.matter.world.query(EnemyInfo)) {
      const root = info.model.HumanoidRootPart;
      const humanoid = info.model.Humanoid;
      const speed = humanoid.WalkSpeed * this.match.timeScale;
      this.matter.world.insert(enemy, info.patch({ distance: info.distance + speed * dt }));

      const cframe = this.path.getCFrameAtDistance(info.distance);
      info.model.PivotTo(cframe);

      if (cframe.Position.FuzzyEq(map.EndPoint.Position)) {
        // TODO: inflict damage
        info.model.Destroy();
        this.matter.world.despawn(enemy);
      }
    }
  }

  public summon({ enemyName, amount, interval }: EnemySummonInfo): void {
    const map = this.match.getMap();
    for (let i = 0; i < amount; i++) {
      task.spawn(() => {
        const enemyModel = Assets.Enemies[enemyName].Clone();
        const [_, size] = enemyModel.GetBoundingBox();
        const spawnCFrame = map.StartPoint.CFrame.add(new Vector3(0, (size.Y / 2) - (map.StartPoint.Size.Y / 2), 0));
        enemyModel.HumanoidRootPart.CFrame = spawnCFrame;
        enemyModel.Parent = ENEMY_STORAGE;
        growIn(enemyModel) // TODO: set animation speed
        // .then(() => enemyModel.Humanoid.Animator.LoadAnimation(enemyModel.Animations.Walk).Play()); // fucking bugged rn

        const enemy = this.matter.world.spawn(
          EnemyInfo({
            distance: 0,
            health: <number>enemyModel.GetAttribute("Health"),
            model: enemyModel,
          })
        );

        this.enemies.push(enemy);
      });
      task.wait(interval / this.match.timeScale);
    }
  }

  private startWaves(waves: WaveData[]): void {
    for (const wave of waves)
      for (const summonInfo of wave.enemies) {
        this.summon(summonInfo);
        task.wait(toSeconds(wave.length) / this.match.timeScale); // TODO: implement timer, end when all enemies are dead
      }
  }
}