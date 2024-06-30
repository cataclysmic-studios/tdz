import { Service } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import type { OnPlayerJoin, OnPlayerLeave } from "common/server/hooks";

import type { MatchService } from "./match";

@Service({ loadOrder: 0 })
export class LeaderstatsService implements OnPlayerJoin, OnPlayerLeave {
  private readonly playerJanitors: Partial<Record<number, Janitor>> = {};

  public constructor(
    private readonly match: MatchService
  ) { }

  public onPlayerJoin(player: Player): void {
    const janitor = new Janitor;
    this.playerJanitors[player.UserId] = janitor;

    janitor.Add(this.match.cashChanged.Connect((p, cash) => {
      if (p !== player) return;
      const leaderstats = this.get(player);
      leaderstats.Cash.Value = cash;
    }));
  }

  public onPlayerLeave(player: Player): void {
    this.playerJanitors[player.UserId]?.Destroy();
    this.playerJanitors[player.UserId] = undefined;
  }

  private get(player: Player): Leaderstats {
    const leaderstats = <Leaderstats>player.FindFirstChild("leaderstats") ?? new Instance("Folder", player);
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