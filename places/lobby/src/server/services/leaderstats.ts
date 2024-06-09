import { Service } from "@flamework/core";
import { endsWith } from "@rbxts/string-utils";

import type { LogStart } from "common/shared/hooks";
import type { OnPlayerJoin } from "common/server/hooks";

import type { DatabaseService } from "./third-party/database";

@Service()
export class LeaderstatsService implements OnPlayerJoin, LogStart {
  public constructor(
    private readonly db: DatabaseService
  ) { }

  public onPlayerJoin(player: Player): void {
    const leaderstats = new Instance("Folder");
    leaderstats.Name = "leaderstats";
    leaderstats.Parent = player;

    const levelStat = new Instance("IntValue");
    levelStat.Name = "Level";
    levelStat.Value = 0;
    levelStat.Parent = leaderstats;

    const coinsStat = new Instance("IntValue");
    coinsStat.Name = "Coins";
    coinsStat.Value = 0;
    coinsStat.Parent = leaderstats;

    this.db.updated.Connect((p, directory, value) => {
      if (player !== p) return;
      let stat: Maybe<IntValue>;

      if (endsWith(directory, "coins"))
        stat = coinsStat;
      else if (endsWith(directory, "level"))
        stat = levelStat;

      if (stat === undefined) return;
      stat.Value = <number>value;
    });
  }

  public getValue<T>(player: Player, statName: string): T {
    const leaderstats = player.WaitForChild("leaderstats");
    return <T>(<ValueBase>leaderstats.WaitForChild(statName)).Value;
  }
}