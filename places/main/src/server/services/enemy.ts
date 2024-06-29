import { OnInit, OnTick, Service } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import type { Entity } from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import { Events } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { growIn } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { ENEMY_STORAGE } from "shared/constants";
import type { EnemySummonInfo } from "shared/structs";

import type { MatterService } from "server/services/matter";
import type { MatchService } from "./match";
import { DEVELOPERS } from "common/shared/constants";

type EnemyEntity = Entity<[EnemyInfo]>;

@Service()
export class EnemyService implements OnInit, OnTick, LogStart {
  private readonly enemies: EnemyEntity[] = [];

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService
  ) { }

  public onInit(): void {
    Events.admin.killAllEnemies.connect(player => {
      if (!DEVELOPERS.includes(player.UserId))
        return player.Kick("wtf r u doing bruh, not even fun to do that");

      for (const enemy of this.enemies)
        task.spawn(() => this.kill(player, enemy));
    });

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

      if (info.health === 0)
        return this.despawn(enemy);

      if (cframe.Position.FuzzyEq(map.EndPoint.Position)) {
        this.despawn(enemy);
        this.match.decrementHealth(info.health);
        Sound.SoundEffects.Damaged.Play();
        return;
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
        this.enemies.push(this.matter.world.spawn(
          EnemyInfo({
            distance: 0,
            health: <number>enemyModel.GetAttribute("Health"),
            model: enemyModel,
          })
        ));
      });
      task.wait(interval / this.match.timeScale);
    }
  }

  public kill(attacker: Player, enemy: EnemyEntity): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    this.damage(attacker, enemy, info.health);
  }

  public damage(attacker: Player, enemy: EnemyEntity, amount: number): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    const maxHealth = <number>info.model.GetAttribute("Health");
    const healthBeforeDamage = info.health;
    const newHealth = math.clamp(info.health - amount, 0, maxHealth);
    this.matter.world.insert(enemy, info.patch({ health: newHealth }));

    const damageDealt = healthBeforeDamage - newHealth;
    if (damageDealt > 0) {
      // TODO: check for things like "no cash" traits, maybe some gamemodes earn less cash per damage, etc.
      this.match.incrementCash(attacker, damageDealt);
    }
  }

  private heal(enemy: EnemyEntity, amount: number): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    const maxHealth = <number>info.model.GetAttribute("Health");
    this.matter.world.insert(enemy, info.patch({ health: math.clamp(info.health + amount, 0, maxHealth) }));
  }

  private despawn(enemy: EnemyEntity): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    this.matter.world.despawn(enemy);
    info.model.Destroy();
  }
}