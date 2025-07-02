import { BaseComponent, Component, Components } from "@flamework/components";
import { Trash } from "@rbxts/trash";
import { endsWith } from "@rbxts/string-utils";
import { $nameof } from "rbxts-transform-debug";

import type { OnDataUpdate } from "common/client/hooks";
import { PlayerGui } from "common/shared/utility/client";
import { getTowerStats } from "shared/utility";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { ActionID, INPUT_MANAGER } from "common/shared/constants";

import type { TowerViewport } from "./tower-viewport";
import type { PlacementController } from "client/controllers/placement";
import { RawInput, StandardActionBuilder } from "@rbxts/mechanism";

@Component({
  tag: $nameof<TowerList>(),
  ancestorWhitelist: [PlayerGui]
})
export class TowerList extends BaseComponent<{}, PlayerGui["Main"]["Main"]["Towers"]> implements OnDataUpdate {
  private readonly updateTrash = new Trash;
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
      button.Price.Text = "$" + toSuffixedNumber(price);
      towerViewport ??= this.components.addComponent<TowerViewport>(button.Viewport);
      towerViewport.loadModel();

      const action = new StandardActionBuilder(button.Name as RawInput).setID("towerbutton_" + button.Name);
      const enterPlacement = () => this.placement.enterPlacement(towerName);
      action.activated.Connect(enterPlacement);

      INPUT_MANAGER.bind(action);
      this.updateTrash.add(() => INPUT_MANAGER.unbind(action));
      this.updateTrash.add(button.MouseButton1Click.Connect(enterPlacement));
    }
  }
}