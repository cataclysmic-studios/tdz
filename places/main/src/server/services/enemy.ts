import { Service, type OnInit, type OnStart, type OnTick } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import type { Entity } from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { flatten, removeDuplicates } from "common/shared/utility/array";
import { didEnemyCompletePath, getEnemyBaseTraits } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { DamageType } from "common/shared/towers";
import { type EnemySummonInfo, type EnemyTrait, EnemyTraitType } from "shared/structs";
import Log from "common/shared/logger";

import type { MatterService } from "server/services/matter";
import type { MatchService } from "./match";

type EnemyEntity = Entity<[EnemyInfo]>;

const CLIENT_UPDATE_INTERVAL = 0.1;

@Service()
export class EnemyService implements OnInit, OnStart, OnTick, LogStart {
  public readonly enemies: EnemyEntity[] = [];

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService
  ) { }

  public onInit(): void {
    Functions.getEnemyInfo.setCallback((_, id) => this.matter.world.get(<EnemyEntity>id, EnemyInfo)!);
  }

  public onStart(): void {
    task.spawn(() => {
      while (!this.match.isComplete()) {
        const enemyEntries = this.enemies
          .map<[EnemyEntity, EnemyInfo]>(enemy => [enemy, this.matter.world.get(enemy, EnemyInfo)!])
          .filter(([enemy]) => this.matter.world.contains(enemy));

        if (enemyEntries.size() === 0) {
          Events.updateEnemies.broadcast(enemyEntries);
          task.wait(CLIENT_UPDATE_INTERVAL * 5);
          continue;
        }

        Events.updateEnemies.broadcast(enemyEntries);
        task.wait(CLIENT_UPDATE_INTERVAL);
      }
    });
  }

  public onTick(dt: number): void {
    const map = this.match.getMap();
    for (const [enemy, info] of this.matter.world.query(EnemyInfo)) {
      const speed = info.speed * info.scale * this.match.timeScale;
      this.matter.world.insert(enemy, info.patch({ distance: info.distance + speed * dt }));

      if (info.health <= 0)
        return this.despawn(enemy);

      const position = this.match.getPath().getPositionAtDistance(info.distance);
      if (didEnemyCompletePath(position, map.EndPoint.Position)) {
        this.despawn(enemy);
        this.match.decrementHealth(info.health);
        Sound.SoundEffects.Damaged.Play();
      }
    }
  }

  public areEnemiesAlive(): boolean {
    return this.enemies.size() > 0;
  }

  public summon({ enemyName, amount, interval, traits }: EnemySummonInfo): void {
    for (let i = 0; i < amount; i++) {
      this.spawn(enemyName, traits);
      task.wait(interval / this.match.timeScale);
    }
  }

  public killAll(): void {
    for (const enemy of this.enemies)
      task.spawn(() => {
        if (!this.matter.world.contains(enemy)) return;
        const info = this.matter.world.get(enemy, EnemyInfo)!;
        this.damage(enemy, info.health, DamageType.God);
      });
  }

  public damage(enemy: EnemyEntity, amount: number, damageType: DamageType): number {
    if (!this.matter.world.contains(enemy)) return 0;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    const healthBeforeDamage = info.health;
    const newHealth = math.clamp(info.health - amount, 0, info.maxHealth);
    this.matter.world.insert(enemy, info.patch({ health: newHealth }));

    let damageDealt = math.clamp(healthBeforeDamage - newHealth, 0, info.maxHealth);
    damageDealt = this.applyResistance(enemy, damageType, damageDealt, EnemyTraitType.BulletResistance, DamageType.Bullet);
    damageDealt = this.applyResistance(enemy, damageType, damageDealt, EnemyTraitType.LaserResistance, DamageType.Laser);

    if (!this.hasTrait(enemy, EnemyTraitType.NoCash))
      this.match.incrementAllCash(damageDealt);

    return damageDealt;
  }

  private applyResistance(enemy: EnemyEntity, damageType: DamageType, damageDealt: number, resistanceTrait: EnemyTraitType, resistedDamageType: DamageType): number {
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    if (this.hasTrait(enemy, resistanceTrait) && damageType === resistedDamageType) {
      const effectiveness = this.getTraitEffectiveness(enemy, resistanceTrait);
      if (effectiveness === undefined)
        throw Log.fatal(`${info.name} was spawned with ${resistanceTrait} trait with no effectiveness`);

      const resistance = 1 - (effectiveness === 0 ? 0 : effectiveness / 100);
      resistance === 0 ? damageDealt = 0 : damageDealt /= resistance;
    }
    return damageDealt;
  }

  private heal(enemy: EnemyEntity, amount: number): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    this.matter.world.insert(enemy, info.patch({ health: math.clamp(info.health + amount, 0, info.maxHealth) }));
  }

  private hasTrait(enemy: EnemyEntity, traitType: EnemyTraitType): boolean {
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    return info.traits.map(trait => trait.type).includes(traitType);
  }

  private getTraitEffectiveness(enemy: EnemyEntity, traitType: EnemyTraitType): Maybe<number> {
    if (!this.hasTrait(enemy, traitType)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    return info.traits.find(trait => trait.type === traitType)?.effectiveness;
  }

  private spawn(enemyName: EnemyName, traits: EnemyTrait[] = []): void {
    const enemyModel = Assets.Enemies[enemyName];
    const finalTraits = removeDuplicates(flatten([getEnemyBaseTraits(enemyModel), traits]))
      .filter(traits => "type" in traits);

    const maxHealth = <number>enemyModel.GetAttribute("MaxHealth");
    const enemy = this.matter.world.spawn(
      EnemyInfo({
        traits: finalTraits,
        distance: 0,
        isStealth: <boolean>enemyModel.GetAttribute("Stealth") ?? false,
        health: maxHealth,
        maxHealth,
        speed: <number>enemyModel.GetAttribute("Speed"),
        scale: <number>enemyModel.GetAttribute("DefaultScale"),
        height: enemyModel.GetBoundingBox()[0].Y,
        name: <EnemyName>enemyModel.Name
      })
    );

    this.enemies.push(enemy);
  }

  private despawn(enemy: EnemyEntity): void {
    if (!this.matter.world.contains(enemy)) return;
    this.enemies.remove(this.enemies.indexOf(enemy));
    this.matter.world.despawn(enemy);
    Events.enemyDied.broadcast(enemy);
  }
}