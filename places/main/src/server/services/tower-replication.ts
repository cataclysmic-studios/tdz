import { Service, type OnInit } from "@flamework/core";

import type { OnPlayerJoin } from "../hooks";
import { Events } from "server/network";
import type { TowerInfo } from "shared/structs";

@Service()
export class TowerReplicationService implements OnInit, OnPlayerJoin {
  private readonly towers = <Record<TowerName, TowerInfo[]>>{};
  private cumulativeID = 1;

  public onInit(): void {
    Events.placeTower.connect((player, towerName, cframe) => {
      const info: TowerInfo = {
        id: this.cumulativeID++,
        cframe,
        ownerID: player.UserId,
        upgrades: [0, 0]
      };

      const infoList = this.towers[towerName];
      if (infoList === undefined)
        this.towers[towerName] = [];

      this.towers[towerName].push(info);
      Events.replicateTower.broadcast(towerName, info);
    });
  }

  public onPlayerJoin(player: Player): void {
    Events.loadTowers(player, this.towers);
  }
}