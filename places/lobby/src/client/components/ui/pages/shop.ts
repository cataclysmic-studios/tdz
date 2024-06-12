import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { endsWith } from "@rbxts/string-utils";

import type { OnDataUpdate } from "common/client/hooks";
import { CommonFunctions } from "common/client/network";
import { PlayerGui } from "common/shared/utility/client";
import { Assets } from "common/shared/utility/instances";
import Log from "common/shared/logger";

const DEFAULT_PAGE = "Towers";
let s = false

@Component({
  tag: "ShopPage",
  ancestorWhitelist: [PlayerGui]
})
export class ShopPage extends BaseComponent<{}, PlayerGui["Main"]["Shop"]> implements OnStart, OnDataUpdate {
  private readonly towerButtons: (typeof Assets.UI.ShopButton)[] = [];
  private readonly crateButtons: (typeof Assets.UI.ShopButton)[] = [];
  private readonly emoteButtons: (typeof Assets.UI.ShopButton)[] = [];
  private readonly categoryButtons = this.instance.Buttons.GetChildren()
    .filter((i): i is ImageButton => i.IsA("ImageButton"));
  private readonly categoryFrames = this.instance.GetChildren()
    .filter((i): i is ScrollingFrame => i.IsA("ScrollingFrame"));

  public onStart(): void {
    for (const tower of Assets.Towers.GetChildren()) {
      const button = Assets.UI.ShopButton.Clone();
      const price = <Maybe<number>>tower.GetAttribute("Price");
      if (price === undefined) {
        Log.warning(`Tower "${tower.Name}" does not have a "Price" attribute; could not add shop button`);
        continue;
      }

      button.Name = tower.Name;
      button.Price.Text = price === 0 ? "FREE" : `$${price}`;
      button.Parent = this.instance.Towers;
      button.Viewport.SetAttribute("TowerViewport_Tower", tower.Name);
      button.Viewport.AddTag("TowerViewport")
      this.towerButtons.push(button);
    }

    this.setPage(DEFAULT_PAGE);
    for (const categoryButton of this.categoryButtons)
      categoryButton.MouseButton1Click.Connect(() => this.setPage(categoryButton.Name));
  }

  public async onDataUpdate(directory: string, ownedTowers: string[]): Promise<void> {
    if (endsWith(directory, "ownedTowers") || endsWith(directory, "equippedTowers")) {
      const equippedTowers = <string[]>await CommonFunctions.data.get("equippedTowers");
      for (const button of this.towerButtons) {
        if (!ownedTowers.includes(button.Name)) continue;
        button.Price.Text = equippedTowers.includes(button.Name) ? "EQUIPPED" : "OWNED";
      }
    }
  }

  private setPage(name: string): void {
    for (const frame of this.categoryFrames)
      frame.Visible = frame.Name === name;
  }
}