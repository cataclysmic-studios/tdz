import { Service, type OnInit } from "@flamework/core";
import { Workspace as World, RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Matter from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin } from "common/server/hooks";
import { CommonEvents } from "common/server/network";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { canPlaceTower, createSizePreview, createTowerModel, getTowerStats } from "shared/utility";
import { TargetingType } from "shared/structs";
import { EnemyEntity, EnemyInfo, TowerEntity, TowerInfo } from "shared/entity-components";
import { TOWER_STATS, type UpgradeLevel, type UpgradePath } from "common/shared/towers";

import type { MatterService } from "./matter";
import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";
import { findLeadShot, getTimeToReach } from "shared/projectile-utility";
import { GRAVITATIONAL_PROJECTILE_TYPES, PROJECTILE_SPEEDS } from "shared/constants";
import { NotificationStyle } from "common/shared/structs/notifications";

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
    Events.upgradeTower.connect((player, id, path, price) => this.upgrade(player, <TowerEntity>id, path, price));
    Functions.getTowerInfo.setCallback((_, id) => this.matter.world.get(<TowerEntity>id, TowerInfo)!);

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

  public onPlayerJoin(player: Player): void {
    Events.loadTowers(player, Object.fromEntries(this.towers.map(tower => [tower, this.matter.world.get(tower, TowerInfo)!]))); // such a hack lol
  }

  public attack(tower: TowerEntity, enemy: EnemyEntity): void {
    if (!this.matter.world.contains(tower)) return;
    if (!this.matter.world.contains(enemy)) return;

    // TODO: handle damage types, splash damage, etc.
    const towerInfo = this.matter.world.get(tower, TowerInfo)!;
    const enemyInfo = this.matter.world.get(enemy, EnemyInfo)!;
    const enemyPosition = enemyInfo.model.GetPivot().Position;
    const enemyVelocity = enemyInfo.model.HumanoidRootPart.AssemblyLinearVelocity;
    Events.towerAttacked.broadcast(tower, enemyPosition, enemyVelocity);
    this.matter.world.insert(tower, towerInfo.patch({ timeSinceAttack: 0 }));

    const projectileType = towerInfo.stats.projectileType;
    const speed = PROJECTILE_SPEEDS[projectileType];
    const towerPosition = towerInfo.cframe.Position;
    const gravity = GRAVITATIONAL_PROJECTILE_TYPES.includes(projectileType) ? 196.2 : 0;
    const projectileArrivalDelay = getTimeToReach(towerPosition, findLeadShot(towerPosition, enemyPosition, enemyVelocity, speed, gravity), speed, gravity) / this.match.timeScale;
    task.delay(projectileArrivalDelay, () => {
      const damageDealt = this.enemy.damage(enemy, towerInfo.stats.damage, towerInfo.stats.damageType);
      this.matter.world.insert(tower, towerInfo.patch({
        totalDamage: towerInfo.totalDamage + damageDealt,
        timeSinceAttack: 0
      }));
    });
  }

  public upgrade(player: Player, tower: TowerEntity, path: UpgradePath, price: number): void {
    if (!this.matter.world.contains(tower)) return;
    const info = this.matter.world.get(tower, TowerInfo)!;
    if (info.ownerID !== player.UserId)
      return player.Kick("wtf r u even doing");

    const newUpgrades = table.clone<UpgradeLevel>(info.upgrades);
    const pathLevel = newUpgrades[path - 1];
    const pathLevelStats = TOWER_STATS[info.name][path][<number>pathLevel];
    if (pathLevelStats.price !== price)
      return player.Kick("you're not slick buddy");

    newUpgrades[path - 1]++;
    this.matter.world.insert(tower, info.patch({
      upgrades: newUpgrades,
      stats: getTowerStats(info.name, newUpgrades)
    }));
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

  private getTarget(tower: TowerEntity): Maybe<EnemyEntity> {
    if (!this.matter.world.contains(tower)) return undefined;

    const enemies: EnemyEntity[] = [];
    for (const [enemy] of this.matter.world.query(EnemyInfo))
      enemies.push(enemy);

    const towerInfo = this.matter.world.get(tower, TowerInfo)!;
    switch (towerInfo.targeting) {
      case TargetingType.First: {
        return this.findTargetableEnemy(towerInfo, this.sortEnemiesBy(enemies, "distance", true));
      }
      case TargetingType.Last: {
        return this.findTargetableEnemy(towerInfo, this.sortEnemiesBy(enemies, "distance", false));
      }
      case TargetingType.Strong: {
        return this.findTargetableEnemy(towerInfo, this.sortEnemiesBy(enemies, "health", true));
      }
      case TargetingType.Weak: {
        return this.findTargetableEnemy(towerInfo, this.sortEnemiesBy(enemies, "health", false));
      }
      case TargetingType.Close: {
        return this.findTargetableEnemy(towerInfo, enemies.sort((a, b) => {
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
      case TargetingType.Random:
        return enemies[math.random(0, enemies.size() - 1)];
    }
  }

  private sortEnemiesBy(enemies: EnemyEntity[], infoKey: ExtractKeys<EnemyInfo, number>, greaterThan: boolean): EnemyEntity[] {
    return enemies.sort((a, b) => {
      if (!this.matter.world.contains(a)) return false;
      if (!this.matter.world.contains(b)) return false;

      const infoA = this.matter.world.get(a, EnemyInfo)!;
      const infoB = this.matter.world.get(b, EnemyInfo)!;
      return greaterThan ?
        (infoA[infoKey] > infoB[infoKey])
        : (infoA[infoKey] < infoB[infoKey]);
    })
  }

  private findTargetableEnemy(towerInfo: TowerInfo, enemies: EnemyEntity[]): Maybe<EnemyEntity> {
    return enemies.find(enemy => {
      if (!this.matter.world.contains(enemy)) return false;
      const { range, minimumRange } = towerInfo.stats;
      const enemyInfo = this.matter.world.get(enemy, EnemyInfo)!; this.sortEnemiesBy(enemies, "distance", true)
      const enemyPosition = enemyInfo.model.GetPivot().Position;
      const distanceFromTower = this.getDistance(towerInfo.cframe.Position, enemyPosition);
      return (distanceFromTower <= range && distanceFromTower >= (minimumRange ?? 0))
        && (enemyInfo.isStealth ? towerInfo.stats.canSeeStealth : true);
    });
  }

  private spawnTower(player: Player, towerName: TowerName, cframe: CFrame, price: number): void {
    const map = this.match.getMap();
    const validationTower = createTowerModel(towerName, "Level0", cframe, false);
    const [validationHitbox] = createSizePreview(<number>validationTower.GetAttribute("Size"), undefined, cframe.sub(new Vector3(0, 1, 0)), false);

    const cleanupValidation = () => {
      validationTower.Destroy();
      validationHitbox.Destroy();
    };

    const raycastFilter = [player.Character!, validationTower, validationHitbox, map.PathNodes, map.StartPoint, map.EndPoint];
    if (!canPlaceTower(validationTower, validationHitbox, raycastFilter)) {
      CommonEvents.sendNotification(player, "Tower placement validation failed!", NotificationStyle.Error);
      return cleanupValidation();
    }

    cleanupValidation();
    const stats = getTowerStats(towerName, [0, 0]);
    if (stats.price !== price)
      return player.Kick("yep you can stop doing that now");

    const towerInfo = TowerInfo({
      name: towerName,
      ownerID: player.UserId,
      cframe, stats,
      worth: price,
      timeSinceAttack: stats.reloadTime,
      targeting: TargetingType.First,
      totalDamage: 0,
      upgrades: [0, 0],
    });

    const tower = this.matter.world.spawn(towerInfo);
    this.towers.push(tower);
    Events.replicateTower.broadcast(tower, towerInfo);
  }
}