import { Component, Components } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";
import { endsWith } from "@rbxts/string-utils";
import type { RawActionEntry } from "@rbxts/gamejoy";

import type { OnDataUpdate } from "common/client/hooks";
import { PlayerGui } from "common/shared/utility/client";

import { InputInfluenced } from "common/client/base-components/input-influenced";
import type { TowerViewport } from "./tower-viewport";
import type { PlacementController } from "client/controllers/placement";
import { TOWER_STATS } from "common/shared/towers";
import { getTowerStats } from "shared/utility";
import { toSuffixedNumber } from "common/shared/utility/numbers";

@Component({
  tag: "TowerList",
  ancestorWhitelist: [PlayerGui]
})
export class TowerList extends InputInfluenced<{}, PlayerGui["Main"]["Main"]["Towers"]> implements OnDataUpdate {
  private readonly updateJanitor = new Janitor;
  private readonly buttons = this.instance.GetChildren()
    .filter((i): i is ImageButton & { Price: TextLabel; Viewport: ViewportFrame; } => i.IsA("ImageButton"));

  public constructor(
    private readonly components: Components,
    private readonly placement: PlacementController
  ) { super(); }

  public onDataUpdate(directory: string, equippedTowers: TowerName[]): void {
    if (!endsWith(directory, "equippedTowers")) return;

    for (const button of this.buttons) {
      const i = this.buttons.indexOf(button);
      const towerName = equippedTowers[i];
      const towerExists = towerName !== undefined;
      button.Price.Visible = towerExists;
      if (towerExists)
        button.Viewport.SetAttribute("TowerViewport_Tower", towerName);

      let towerViewport = this.components.getComponent<TowerViewport>(button.Viewport);
      if (!towerExists) {
        if (towerViewport === undefined) continue;
        towerViewport.unloadModel();
        continue;
      }

      const { price } = getTowerStats(towerName, [0, 0]);
      button.Price.Text = `$${toSuffixedNumber(price)}`;
      towerViewport ??= this.components.addComponent<TowerViewport>(button.Viewport);
      towerViewport.loadModel();

      const action = <RawActionEntry>button.Name;
      const enterPlacement = () => this.placement.enterPlacement(towerName);
      this.input.Bind(action, enterPlacement);
      this.updateJanitor.Add(() => this.input.Unbind(action));
      this.updateJanitor.Add(button.MouseButton1Click.Connect(enterPlacement));
    }
  }
}