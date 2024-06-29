import { Service, type OnInit, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Entity } from "@rbxts/matter";
import Object from "@rbxts/object-utils";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin } from "common/server/hooks";
import { Events, Functions } from "server/network";
import { Assets } from "common/shared/utility/instances";
import { getTowerStats } from "shared/utility";
import { EnemyInfo, TowerInfo } from "shared/entity-components";
import type { UpgradeLevel, UpgradePath } from "common/shared/towers";

import type { MatterService } from "./matter";
import Log from "common/shared/logger";

type TowerEntity = Entity<[TowerInfo]>;

@Service()
export class TowerService implements OnInit, OnTick, OnPlayerJoin, LogStart {
  private readonly towers: TowerEntity[] = [];

  public constructor(
    private readonly matter: MatterService
  ) { }

  public onInit(): void {
    for (const towerFolder of <TowerFolder[]>Assets.Towers.GetChildren())
      for (const part of towerFolder.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CollisionGroup = "plrs";

    Events.placeTower.connect((player, towerName, cframe, price) => {
      const towerInfo = TowerInfo({
        name: towerName,
        ownerID: player.UserId,
        cframe,
        worth: price,
        totalDamage: 0,
        upgrades: [0, 0],
        stats: getTowerStats(towerName, [0, 0]),
      });

      const tower = this.matter.world.spawn(towerInfo);
      this.towers.push(tower);
      Events.replicateTower.broadcast(tower, towerInfo);
    });
    Functions.getTowerInfo.setCallback((_, id) => this.matter.world.get(<TowerEntity>id, TowerInfo)!); // such a hack lol
  }

  public onTick(dt: number): void {
    for (const [tower, towerInfo] of this.matter.world.query(TowerInfo)) {
      let { range, minimumRange } = towerInfo.stats;
      minimumRange ??= 0;

      const towerPosition = towerInfo.cframe.Position;
      for (const [enemy, enemyInfo] of this.matter.world.query(EnemyInfo)) {
        const enemyPosition = enemyInfo.model.GetPivot().Position;
        const distanceFromTower = towerPosition.sub(enemyPosition).Magnitude * 2;

        if (distanceFromTower <= range && distanceFromTower >= minimumRange) {
          Log.info(enemyInfo.model.Name, "with ID", enemy, "is in range of", towerInfo.name, "with ID", tower);
        }
      }
    }
  }


  public onPlayerJoin(player: Player): void {
    Events.loadTowers(player, Object.fromEntries(this.towers.map(tower => [tower, this.matter.world.get(tower, TowerInfo)!]))); // such a hack lol
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
}