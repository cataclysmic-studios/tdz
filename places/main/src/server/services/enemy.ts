import { OnInit, OnTick, Service } from "@flamework/core";
import type { Entity } from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import { Assets } from "common/shared/utility/instances";
import { growIn } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { ENEMY_STORAGE } from "shared/constants";
import type { EnemySummonInfo, WaveData } from "shared/structs";

import type { MatterService } from "server/services/matter";
import type { MatchService } from "./match";

type EnemyEntity = Entity<[EnemyInfo]>;

@Service()
export class EnemyService implements OnInit, OnTick, LogStart {
  private readonly enemies: EnemyEntity[] = [];

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService
  ) { }

  public onInit(): void {
    for (const enemyModel of <EnemyModel[]>Assets.Enemies.GetChildren())
      for (const part of enemyModel.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";
  }

  public onTick(dt: number): void {
    // TODO: check if mouse.getTarget() is any enemy model (ON CLIENT, NOT IN THIS SERVICE)

    const map = this.match.getMap();
    for (const [enemy, info] of this.matter.world.query(EnemyInfo)) {
      const root = info.model.HumanoidRootPart;
      const speed = <number>info.model.GetAttribute("Speed") * <number>info.model.GetAttribute("DefaultScale") * this.match.timeScale;
      this.matter.world.insert(enemy, info.patch({ distance: info.distance + speed * dt }));

      const path = this.match.getPath();
      const cframe = path.getCFrameAtDistance(info.distance);
      root.CFrame = root.CFrame.Lerp(cframe, 0.2);

      if (cframe.Position.FuzzyEq(map.EndPoint.Position)) {
        this.matter.world.despawn(enemy);
        this.match.decrementHealth(info.health);
        info.model.Destroy();
      }
    }
  }

  public areEnemiesAlive(): boolean {
    return this.enemies.size() > 0;
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
        growIn(enemyModel);

        enemyModel.AddTag("Enemy");
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

  }
}