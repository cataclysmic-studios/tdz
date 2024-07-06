import { Service, type OnInit } from "@flamework/core";
import { RunService as Runtime } from "@rbxts/services";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";
import Object from "@rbxts/object-utils";
import Matter from "@rbxts/matter";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin } from "common/server/hooks";
import { CommonEvents } from "common/server/network";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { canPlaceTower, createSizePreview, createTowerModel, getTowerStats } from "shared/utility";
import { findLeadShot, getTimeToReach } from "shared/projectile-utility";
import { NotificationStyle } from "common/shared/structs/notifications";
import { TargetingType } from "shared/structs";
import { EnemyEntity, EnemyInfo, TowerEntity, TowerInfo } from "shared/entity-components";
import { TOWER_STATS, type UpgradeLevel, type UpgradePath } from "common/shared/towers";
import { GRAVITATIONAL_PROJECTILE_TYPES, PROJECTILE_SPEEDS } from "shared/constants";
import { SPEED_ACCURACY } from "shared/optimization-accuracies";
import type { TowerInfoPacket } from "shared/packet-structs";

import type { MatterService } from "./matter";
import type { MatchService } from "./match";
import type { EnemyService } from "./enemy";

@Service()
export class TowerService implements OnInit, OnPlayerJoin, LogStart {
  private readonly towers: TowerEntity[] = [];
  private readonly lastTowerStatsUpdate: Record<TowerEntity, number> = {};

  public constructor(
    private readonly matter: MatterService,
    private readonly match: MatchService,
    private readonly enemy: EnemyService
  ) { }

  public onInit(): void {
    for (const towerFolder of <TowerFolder[]>Assets.Towers.GetChildren())
      for (const part of towerFolder.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";

    Events.placeTower.connect((player, towerName, cframe, price) => this.spawn(player, towerName, cframe, price));
    Events.sellTower.connect((player, tower) => this.sell(player, <TowerEntity>tower));
    Functions.requestTowerUpgrade.setCallback((player, id, path, price) => this.requestUpgrade(player, <TowerEntity>id, path, price));
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
    const cframe = this.match.getPath().getCFrameAtDistance(enemyInfo.distance);
    const enemyPosition = cframe.Position;
    const enemyVelocity = cframe.LookVector.mul(enemyInfo.speed); // * Matter.useDeltaTime() (?)
    Events.towerAttacked.broadcast(new Vector3int16(tower, enemyInfo.distance, enemyInfo.speed * SPEED_ACCURACY));
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

  public requestUpgrade(player: Player, tower: TowerEntity, path: UpgradePath, price: number): void {
    const cash = this.match.getCash(player);
    if (cash < price) {
      Events.playSoundEffect(player, "Error");
      return CommonEvents.notifyFailedPurchase(player, math.max(price - cash, 0));
    }

    if (!this.matter.world.contains(tower)) return;
    const info = this.matter.world.get(tower, TowerInfo)!;
    if (info.ownerID !== player.UserId)
      return player.Kick("wtf r u even doing");

    const newUpgrades = table.clone<UpgradeLevel>(info.upgrades);
    const pathLevel = newUpgrades[path - 1];
    const pathLevelStats = TOWER_STATS[info.name][path][<number>pathLevel];
    if (pathLevelStats.price !== price)
      return player.Kick("you're not slick buddy");

    this.match.decrementCash(player, price);
    newUpgrades[path - 1]++;
    this.matter.world.insert(tower, info.patch({
      upgrades: newUpgrades,
      stats: getTowerStats(info.name, newUpgrades),
      worth: info.worth + price
    }));
  }

  private attackSystem(dt: number): void {
    for (const [tower, towerInfo] of this.matter.world.query(TowerInfo)) {
      const { reloadTime } = towerInfo.stats;
      this.matter.world.insert(tower, towerInfo.patch({
        timeSinceAttack: towerInfo.timeSinceAttack + dt
      }));

      const target = this.getTarget(tower);
      for (const [enemy] of this.matter.world.query(EnemyInfo))
        task.spawn(() => {
          if (enemy === target)
            if (towerInfo.timeSinceAttack >= reloadTime / this.match.timeScale)
              this.attack(tower, enemy);
        });
    }
  }

  private updateStatsSystem(): void {
    for (const [tower, record] of this.matter.world.queryChanged(TowerInfo)) {
      if (!this.matter.world.contains(tower)) continue;
      if (record.new === undefined) continue;

      const lastUpdate = this.lastTowerStatsUpdate[tower] ?? 0;
      const timeSinceUpdate = os.clock() - lastUpdate;
      this.lastTowerStatsUpdate[tower] = lastUpdate;
      if (timeSinceUpdate >= 0.1) {
        const serializer = createBinarySerializer<TowerInfoPacket>();
        const packet = serializer.serialize(record.new);
        Events.updateTowerStats.broadcast(tower, packet);
        this.lastTowerStatsUpdate[tower] = os.clock();
      }
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

    const enemies = this.enemy.enemies;
    const enemyInfos = enemies.filter(enemy => this.matter.world.contains(enemy))
      .map<[EnemyEntity, EnemyInfo]>(enemy => [enemy, this.matter.world.get(enemy, EnemyInfo)!]);

    const towerInfo = this.matter.world.get(tower, TowerInfo)!;
    switch (towerInfo.targeting) {
      case TargetingType.First:
        return this.findTargetableEnemy(towerInfo, this.sortEnemyInfosBy(enemyInfos, "distance", true));
      case TargetingType.Last:
        return this.findTargetableEnemy(towerInfo, this.sortEnemyInfosBy(enemyInfos, "distance", false));
      case TargetingType.Strong:
        return this.findTargetableEnemy(towerInfo, this.sortEnemyInfosBy(enemyInfos, "health", true));
      case TargetingType.Weak:
        return this.findTargetableEnemy(towerInfo, this.sortEnemyInfosBy(enemyInfos, "health", false));
      case TargetingType.Close: {
        return this.findTargetableEnemy(towerInfo, enemyInfos.sort(([_, infoA], [__, infoB]) => {
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

  private sortEnemyInfosBy(enemyInfos: [EnemyEntity, EnemyInfo][], infoKey: ExtractKeys<EnemyInfo, number>, greaterThan: boolean): [EnemyEntity, EnemyInfo][] {
    return enemyInfos.sort(([_, infoA], [__, infoB]) => {
      return greaterThan ?
        (infoA[infoKey] > infoB[infoKey])
        : (infoA[infoKey] < infoB[infoKey]);
    });
  }

  private findTargetableEnemy(towerInfo: TowerInfo, enemyInfos: [EnemyEntity, EnemyInfo][]): Maybe<EnemyEntity> {
    return enemyInfos.find(([_, enemyInfo]) => {
      const { range, minimumRange } = towerInfo.stats;
      const enemyPosition = this.match.getPath().getPositionAtDistance(enemyInfo.distance);
      const distanceFromTower = this.getDistance(towerInfo.cframe.Position, enemyPosition);
      return (distanceFromTower <= range && distanceFromTower >= (minimumRange ?? 0))
        && (enemyInfo.isStealth ? towerInfo.stats.canSeeStealth : true);
    })?.[0];
  }

  private sell(player: Player, tower: TowerEntity): void {
    if (!this.matter.world.contains(tower)) return;

    const info = this.matter.world.get(tower, TowerInfo)!;
    this.match.incrementCash(player, math.floor(info.worth / 2)); // sell for 50% of worth
    this.despawn(tower);
    // TODO: play sound
  }

  private despawn(tower: TowerEntity): void {
    this.towers.remove(this.towers.indexOf(tower));;
    this.matter.world.despawn(tower);
  }

  private spawn(player: Player, towerName: TowerName, cframe: CFrame, price: number): void {
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