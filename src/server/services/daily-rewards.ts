import { Service, type OnInit } from "@flamework/core";

import type { LogStart } from "shared/hooks";
import { Events } from "server/network";

import type { DatabaseService } from "./third-party/database";

const ONE_DAY = 24 * 60 * 60;

@Service()
export class DailyRewardService implements OnInit, LogStart {
  public constructor(
    private readonly db: DatabaseService
  ) { }

  public onInit(): void {
    this.db.loaded.Connect(player => this.updateStreak(player));
    Events.data.updateLoginStreak.connect(player => this.updateStreak(player));
  }

  private updateStreak(player: Player): void {
    const lastLogin = this.db.get<number>(player, "lastLogin", 0);
    const timeSinceLastLogin = os.time() - lastLogin;

    if (timeSinceLastLogin >= ONE_DAY) {
      this.db.set(player, "lastLogin", os.time());
      this.db.set(player, "claimedDaily", false);
      if (timeSinceLastLogin < ONE_DAY * 2)
        this.db.increment(player, "loginStreak");
      else
        this.db.set(player, "loginStreak", 0);
    }
  }
}