import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { CommonFunctions } from "common/client/network";
import { Difficulty, DIFFICULTY_MEDAL_COLORS } from "common/shared/structs/difficulty";

interface Attributes {
  LobbyMedals_Map?: string;
}

@Component({ tag: "LobbyMedals" })
export class LobbyMedals extends BaseComponent<Attributes, ReplicatedFirst["Assets"]["UI"]["GameLobbyUI"]["Medals"]> implements OnStart {
  public onStart(): void {
    this.onAttributeChanged("LobbyMedals_Map", () => this.update());
  }

  private async update(): Promise<void> {
    if (this.attributes.LobbyMedals_Map === undefined) return;
    const allDifficultiesWon = <Record<string, Difficulty[]>>await CommonFunctions.data.get("difficultiesWon");
    const difficultiesWon = allDifficultiesWon[this.attributes.LobbyMedals_Map] ?? [];
    for (const difficulty of difficultiesWon)
      this.instance[difficulty].ImageColor3 = DIFFICULTY_MEDAL_COLORS[difficulty];
  }
}