import { Service } from "@flamework/core";
import { Trash } from "@rbxts/trash";

import type { OnPlayerJoin, OnPlayerLeave } from "common/server/hooks";

import type { MatchService } from "./match";

@Service({ loadOrder: 0 })
export class LeaderstatsService implements OnPlayerJoin, OnPlayerLeave {
  private readonly playerJanitors: Partial<Record<number, Trash>> = {};

  public constructor(
    private readonly match: MatchService
  ) { }

  public onPlayerJoin(player: Player): void {
    const trash = new Trash;
    this.playerJanitors[player.UserId] = trash;

    trash.add(this.match.cashChanged.Connect((p, cash) => {
      if (p !== player) return;
      const leaderstats = this.get(player);
      leaderstats.Cash.Value = cash;
    }));
  }

  public onPlayerLeave(player: Player): void {
    const id = player.UserId;
    this.playerJanitors[id]?.destroy();
    this.playerJanitors[id] = undefined;
  }

  private get(player: Player): Leaderstats {
    const leaderstats = (player.FindFirstChild("leaderstats") ?? new Instance("Folder", player)) as Leaderstats;
    leaderstats.Name = "leaderstats";

    if (leaderstats.FindFirstChild("Cash") === undefined) {
      const cash = new Instance("IntValue");
      cash.Name = "Cash";
      cash.Parent = leaderstats;
      cash.Value = this.match.getCash(player);
    }

    return leaderstats;
  }
}