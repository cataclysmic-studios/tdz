import { Component, BaseComponent, Components } from "@flamework/components";
import { endsWith } from "@rbxts/string-utils";

import type { OnDataUpdate } from "common/client/hooks";
import { PlayerGui } from "common/shared/utility/client";

import type { TowerViewport } from "./tower-viewport";

@Component({
  tag: "TowerList",
  ancestorWhitelist: [PlayerGui]
})
export class TowerList extends BaseComponent<{}, PlayerGui["Main"]["Main"]["Towers"]> implements OnDataUpdate {
  private readonly buttons = this.instance.GetChildren()
    .filter((i): i is ImageButton & { Viewport: ViewportFrame; } => i.IsA("ImageButton"));

  public constructor(
    private readonly components: Components
  ) { super(); }

  public onDataUpdate(directory: string, equippedTowers: string[]): void {
    if (!endsWith(directory, "equippedTowers")) return;

    for (const button of this.buttons) {
      const i = this.buttons.indexOf(button);
      const towerName = equippedTowers[i];
      const noTower = towerName === undefined;
      if (!noTower)
        button.Viewport.SetAttribute("TowerViewport_Tower", towerName);

      let towerViewport = this.components.getComponent<TowerViewport>(button.Viewport);
      if (noTower) {
        if (towerViewport === undefined) return;
        towerViewport.unloadModel();
      } else {
        towerViewport ??= this.components.addComponent<TowerViewport>(button.Viewport);
        towerViewport.loadModel();
      }
    }
  }
}