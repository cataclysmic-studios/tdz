import { OnInit, OnTick, Service } from "@flamework/core";
import { SoundService as Sound } from "@rbxts/services";
import type { Entity } from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import { Events } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { getEnemyBaseTraits, growIn } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { DamageType } from "common/shared/towers";
import { ENEMY_STORAGE } from "shared/constants";
import { type EnemySummonInfo, type EnemyTrait, EnemyTraitType } from "shared/structs";

import type { MatterService } from "server/services/matter";
import type { MatchService } from "./match";
import { DEVELOPERS } from "common/shared/constants";
import { flatten, removeDuplicates } from "common/shared/utility/array";
import Log from "common/shared/logger";

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
        return player.Kick("wtf r u doing brah, it's not even fun to do that");

      for (const enemy of this.enemies)
        task.spawn(() => this.kill(enemy, DamageType.God));
    });

    for (const enemyModel of <EnemyModel[]>Assets.Enemies.GetChildren())
      for (const part of enemyModel.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";
  }

  public onTick(dt: number): void {
    const map = this.match.getMap();
    for (const [enemy, info] of this.matter.world.query(EnemyInfo)) {
      const root = info.model.HumanoidRootPart;
      const speed = <number>info.model.GetAttribute("Speed") * <number>info.model.GetAttribute("DefaultScale") * this.match.timeScale;
      this.matter.world.insert(enemy, info.patch({ distance: info.distance + speed * dt }));
      info.model.SetAttribute("Health", info.health);

      const path = this.match.getPath();
      const cframe = path.getCFrameAtDistance(info.distance);
      root.CFrame = root.CFrame.Lerp(cframe, 0.2);

      if (info.health === 0)
        return this.despawn(enemy);

      if (cframe.Position.FuzzyEq(map.EndPoint.Position)) {
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

  public kill(enemy: EnemyEntity, damageType: DamageType): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    this.damage(enemy, info.health, damageType);
  }

  public damage(enemy: EnemyEntity, amount: number, damageType: DamageType): number {
    if (!this.matter.world.contains(enemy)) return 0;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    const maxHealth = <number>info.model.GetAttribute("MaxHealth");
    const healthBeforeDamage = info.health;
    const newHealth = math.clamp(info.health - amount, 0, maxHealth);
    this.matter.world.insert(enemy, info.patch({ health: newHealth }));

    let damageDealt = math.clamp(healthBeforeDamage - newHealth, 0, maxHealth);
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
        throw Log.fatal(`${info.model.Name} was spawned with ${resistanceTrait} trait with no effectiveness`);

      const resistance = 1 - (effectiveness === 0 ? 0 : effectiveness / 100);
      resistance === 0 ? damageDealt = 0 : damageDealt /= resistance;
    }
    return damageDealt;
  }

  private heal(enemy: EnemyEntity, amount: number): void {
    if (!this.matter.world.contains(enemy)) return;
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    const maxHealth = <number>info.model.GetAttribute("MaxHealth");
    this.matter.world.insert(enemy, info.patch({ health: math.clamp(info.health + amount, 0, maxHealth) }));
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
    const map = this.match.getMap();
    const enemyModel = Assets.Enemies[enemyName].Clone();
    const [_, size] = enemyModel.GetBoundingBox();
    const spawnCFrame = map.StartPoint.CFrame.add(new Vector3(0, (size.Y / 2) - (map.StartPoint.Size.Y / 2), 0));
    enemyModel.HumanoidRootPart.CFrame = spawnCFrame;
    enemyModel.Parent = ENEMY_STORAGE;
    growIn(enemyModel);

    enemyModel.AddTag("Enemy");
    this.enemies.push(this.matter.world.spawn(
      EnemyInfo({
        traits: removeDuplicates(flatten([getEnemyBaseTraits(enemyModel), traits])),
        distance: 0,
        isStealth: <boolean>enemyModel.GetAttribute("Stealth"),
        health: <number>enemyModel.GetAttribute("MaxHealth"),
        model: enemyModel
      })
    ));
  }

  private despawn(enemy: EnemyEntity): void {
    if (!this.matter.world.contains(enemy)) return;
    this.enemies.remove(this.enemies.indexOf(enemy));
    const info = this.matter.world.get(enemy, EnemyInfo)!;
    this.matter.world.despawn(enemy);
    info.model.Destroy();
  }
}