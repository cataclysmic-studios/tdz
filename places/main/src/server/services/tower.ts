import { Service, type OnInit } from "@flamework/core";
import { RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Matter from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin } from "common/server/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { getTowerStats } from "shared/utility";
import { TargettingType } from "shared/structs";
import { EnemyEntity, EnemyInfo, TowerEntity, TowerInfo } from "shared/entity-components";
import type { UpgradeLevel, UpgradePath } from "common/shared/towers";

import type { MatterService } from "./matter";
import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";

@Service()
export class TowerService implements OnInit, OnPlayerJoin, LogStart {
  private readonly towers: TowerEntity[] = [];

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService,
    private readonly enemy: EnemyService
  ) { }

  public onInit(): void {
    for (const towerFolder of <TowerFolder[]>Assets.Towers.GetChildren())
      for (const part of towerFolder.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";

    Events.placeTower.connect((player, towerName, cframe, price) => this.spawnTower(player, towerName, cframe, price));
    Functions.getTowerInfo.setCallback((_, id) => this.matter.world.get(<TowerEntity>id, TowerInfo)!); // such a hack lol

    const loop = new Matter.Loop(this.matter.world);
    loop.scheduleSystems([
      {
        system: () => this.updateStatsSystem(),
        priority: math.huge
      }, {
        system: () => this.attackSystem(Matter.useDeltaTime()),
        priority: math.huge
      }
    ]);
    loop.begin({
      default: Runtime.Heartbeat
    });
  }

  private attackSystem(dt: number): void {
    for (const [tower, towerInfo] of this.matter.world.query(TowerInfo)) {
      const { reloadTime } = towerInfo.stats;
      this.matter.world.insert(tower, towerInfo.patch({
        timeSinceAttack: towerInfo.timeSinceAttack + dt
      }));

      const target = this.getTarget(tower);
      for (const [enemy] of this.matter.world.query(EnemyInfo)) {
        if (enemy === target) {
          // TODO: check for traits like stealth
          if (towerInfo.timeSinceAttack >= reloadTime / this.match.timeScale)
            this.attack(tower, enemy);
        }
      }
    }
  }

  private updateStatsSystem(): void {
    for (const [tower, record] of this.matter.world.queryChanged(TowerInfo)) {
      if (!this.matter.world.contains(tower)) continue;
      if (record.new === undefined) continue;
      Events.updateTowerStats.broadcast(tower, record.new);
    }
  }

  private getDistance(towerPosition: Vector3, enemyPosition: Vector3): number {
    return math.sqrt(
      math.pow(towerPosition.X - enemyPosition.X, 2) +
      math.pow(towerPosition.Y - enemyPosition.Y, 2) +
      math.pow(towerPosition.Z - enemyPosition.Z, 2)
    ) * 2;
  }

  public onPlayerJoin(player: Player): void {
    Events.loadTowers(player, Object.fromEntries(this.towers.map(tower => [tower, this.matter.world.get(tower, TowerInfo)!]))); // such a hack lol
  }

  public attack(tower: TowerEntity, enemy: EnemyEntity): void {
    if (!this.matter.world.contains(tower)) return;
    if (!this.matter.world.contains(enemy)) return;

    // TODO: handle damage types, splash damage, etc.
    const towerInfo = this.matter.world.get(tower, TowerInfo)!;
    const enemyInfo = this.matter.world.get(enemy, EnemyInfo)!;
    const damageDealt = this.enemy.damage(enemy, towerInfo.stats.damage);
    this.matter.world.insert(tower, towerInfo.patch({
      totalDamage: towerInfo.totalDamage + damageDealt,
      timeSinceAttack: 0
    }));

    Events.towerAttacked.broadcast(tower, enemyInfo.model.GetPivot().Position);
  }

  public upgrade(tower: TowerEntity, path: UpgradePath): void {
    if (!this.matter.world.contains(tower)) return;
    const info = this.matter.world.get(tower, TowerInfo)!;
    const newUpgrades = table.clone<UpgradeLevel>(info.upgrades);
    newUpgrades[path - 1]++;

    this.matter.world.insert(tower, info.patch({
      upgrades: newUpgrades,
      stats: getTowerStats(info.name, newUpgrades)
    }));

    Events.towerUpgraded.broadcast(tower, info);
  }

  private getTarget(tower: TowerEntity): Maybe<EnemyEntity> {
    if (!this.matter.world.contains(tower)) return undefined;

    const enemies: EnemyEntity[] = [];
    for (const [enemy] of this.matter.world.query(EnemyInfo))
      enemies.push(enemy);

    const towerInfo = this.matter.world.get(tower, TowerInfo)!;
    switch (towerInfo.targetting) {
      case TargettingType.First: {
        return this.findEnemyInRange(towerInfo, enemies.sort((a, b) => {
          if (!this.matter.world.contains(a)) return false;
          if (!this.matter.world.contains(b)) return false;
          const infoA = this.matter.world.get(a, EnemyInfo)!;
          const infoB = this.matter.world.get(b, EnemyInfo)!;
          return infoA.distance > infoB.distance;
        }));
      }
      case TargettingType.Last: {
        return this.findEnemyInRange(towerInfo, enemies.sort((a, b) => {
          if (!this.matter.world.contains(a)) return false;
          if (!this.matter.world.contains(b)) return false;
          const infoA = this.matter.world.get(a, EnemyInfo)!;
          const infoB = this.matter.world.get(b, EnemyInfo)!;
          return infoA.distance < infoB.distance;
        }));
      }
      case TargettingType.Strong: {
        return this.findEnemyInRange(towerInfo, enemies.sort((a, b) => {
          if (!this.matter.world.contains(a)) return false;
          if (!this.matter.world.contains(b)) return false;
          const infoA = this.matter.world.get(a, EnemyInfo)!;
          const infoB = this.matter.world.get(b, EnemyInfo)!;
          return infoA.health < infoB.health;
        }));
      }
      case TargettingType.Weak: {
        return this.findEnemyInRange(towerInfo, enemies.sort((a, b) => {
          if (!this.matter.world.contains(a)) return false;
          if (!this.matter.world.contains(b)) return false;
          const infoA = this.matter.world.get(a, EnemyInfo)!;
          const infoB = this.matter.world.get(b, EnemyInfo)!;
          return infoA.health > infoB.health;
        }));
      }
      case TargettingType.Close: {
        return this.findEnemyInRange(towerInfo, enemies.sort((a, b) => {
          if (!this.matter.world.contains(a)) return false;
          if (!this.matter.world.contains(b)) return false;
          const infoA = this.matter.world.get(a, EnemyInfo)!;
          const infoB = this.matter.world.get(b, EnemyInfo)!;
          const pointA = this.match.getPath().getPositionAtDistance(infoA.distance);
          const pointB = this.match.getPath().getPositionAtDistance(infoB.distance);
          const towerPosition = towerInfo.cframe.Position;
          return towerPosition.sub(pointA).Magnitude > towerPosition.sub(pointB).Magnitude;
        }));
      }
      case TargettingType.Random:
        return enemies[math.random(0, enemies.size() - 1)];
    }
  }

  private findEnemyInRange(towerInfo: TowerInfo, enemies: EnemyEntity[]): Maybe<EnemyEntity> {
    return enemies.find(enemy => {
      if (!this.matter.world.contains(enemy)) return false;
      const { range, minimumRange } = towerInfo.stats;
      const enemyInfo = this.matter.world.get(enemy, EnemyInfo)!;
      const enemyPosition = enemyInfo.model.GetPivot().Position;
      const distanceFromTower = this.getDistance(towerInfo.cframe.Position, enemyPosition);
      return distanceFromTower <= range && distanceFromTower >= (minimumRange ?? 0);
    });
  }

  private spawnTower(player: Player, towerName: TowerName, cframe: CFrame, price: number): void {
    const stats = getTowerStats(towerName, [0, 0]);
    const towerInfo = TowerInfo({
      name: towerName,
      ownerID: player.UserId,
      cframe, stats,
      worth: price,
      timeSinceAttack: stats.reloadTime,
      targetting: TargettingType.First,
      totalDamage: 0,
      upgrades: [0, 0],
    });

    const tower = this.matter.world.spawn(towerInfo);
    this.towers.push(tower);
    Events.replicateTower.broadcast(tower, towerInfo);
  }
}