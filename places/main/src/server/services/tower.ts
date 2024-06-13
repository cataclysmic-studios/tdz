import { Service, type OnInit } from "@flamework/core";

import type { OnPlayerJoin } from "../hooks";
import { Events, Functions } from "server/network";
import { TOWER_STATS, TowerStats } from "common/shared/towers";
import type { Path, TowerInfo } from "shared/structs";

@Service()
export class TowerService implements OnInit, OnPlayerJoin {
  private readonly towers: Record<number, TowerInfo> = {};
  private cumulativeID = 1;

  public onInit(): void {
    Events.placeTower.connect((player, towerName, cframe) => {
      const id = this.cumulativeID++;
      const info: TowerInfo = {
        name: towerName,
        cframe,
        ownerID: player.UserId,
        upgrades: [0, 0],
        stats: TOWER_STATS[towerName][0]
      };

      this.towers[id] = info;
      Events.replicateTower.broadcast(id, info);
    });
    Functions.getTowerInfo.setCallback((_, id) => this.towers[id]);
  }

  public onPlayerJoin(player: Player): void {
    Events.loadTowers(player, this.towers);
  }

  public upgrade(id: number, path: Path): void {
    const towerName = this.towers[id].name;
    const upgradeStats = TOWER_STATS[towerName][path];
    this.towers[id].upgrades[path - 1]++;
    this.towers[id] = {
      ...this.towers[id],
      stats: (<readonly TowerStats[]>upgradeStats)[this.towers[id].upgrades[path - 1]]
    };

    Events.towerUpgraded.broadcast(id, this.towers[id]);
  }
}