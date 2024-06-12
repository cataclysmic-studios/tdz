import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import { endsWith } from "@rbxts/string-utils";
import type { RawActionEntry } from "@rbxts/gamejoy";

import type { OnDataUpdate } from "common/client/hooks";
import { PlayerGui } from "common/shared/utility/client";

import { InputInfluenced } from "common/client/base-components/input-influenced";
import type { TowerViewport } from "./tower-viewport";
import type { PlacementController } from "client/controllers/placement";

@Component({
  tag: "TowerList",
  ancestorWhitelist: [PlayerGui]
})
export class TowerList extends InputInfluenced<{}, PlayerGui["Main"]["Main"]["Towers"]> implements OnStart, OnDataUpdate {
  private readonly buttons = this.instance.GetChildren()
    .filter((i): i is ImageButton & { Viewport: ViewportFrame; } => i.IsA("ImageButton"));

  public constructor(
    private readonly components: Components,
    private readonly placement: PlacementController
  ) { super(); }

  public onStart(): void {
    for (const button of this.buttons) {
      const enterPlacement = () => this.placement.enterPlacement(button.Name);
      this.input.Bind(<RawActionEntry>button.Name, enterPlacement);
      button.MouseButton1Click.Connect(enterPlacement);
    }
  }

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