import { Controller, type OnInit, type OnTick } from "@flamework/core";
import { Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import type { LogStart } from "common/shared/hooks";
import { Assets } from "common/shared/utility/instances";
import { PlayerGui } from "common/shared/utility/client";
import { tween } from "common/shared/utility/ui";
import { createRangePreview } from "shared/utility";
import { RANGE_PREVIEW_COLORS, SIZE_PREVIEW_COLORS } from "shared/constants";

import type { Tower } from "client/components/tower";
import type { Upgrades } from "client/components/ui/upgrades";
import type { MouseController } from "./mouse";

@Controller()
export class SelectionController implements OnInit, OnTick, LogStart {
  private readonly selectedSizePreviewHeight = 0.75;
  private readonly selectionJanitor = new Janitor;
  private selectedTower?: Tower;
  private lastTowerHovered?: Tower;

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController
  ) { }

  public onInit(): void {
    this.mouse.lmbDown.Connect(() => {
      const tower = this.getHoveredTower();
      if (tower === undefined)
        return this.deselect();

      this.select(tower);
      tower.setSizePreviewColor(SIZE_PREVIEW_COLORS.Selected);
    });
  }

  public onTick(dt: number): void {
    const tower = this.getHoveredTower();
    if (this.lastTowerHovered !== undefined && this.lastTowerHovered !== tower) {
      this.lastTowerHovered.toggleHoverHighlight(false);
      this.lastTowerHovered = undefined;
    }

    tower?.toggleHoverHighlight(true);
    this.lastTowerHovered = tower;
  }

  public select(tower: Tower): void {
    if (tower === this.selectedTower) return;
    this.deselect();
    this.selectedTower = tower;
    tower.toggleHoverHighlight(false);
    tower.toggleSelectionHighlight(true);
    this.selectionJanitor.Add(tower.setSizePreviewHeight(this.selectedSizePreviewHeight));

    const rangePreview = this.selectionJanitor.Add(createRangePreview(tower.getStats().range));
    rangePreview.Color = RANGE_PREVIEW_COLORS.CanPlace;
    rangePreview.CFrame = tower.instance.GetPivot().sub(new Vector3(0, 0.8, 0));

    const upgradesUI = PlayerGui.Main.Main.TowerUpgrades;
    upgradesUI.Viewport.Title.Text = tower.name;
    upgradesUI.Viewport.SetAttribute("TowerViewport_Tower", tower.name);
    if (!upgradesUI.Viewport.HasTag("TowerViewport"))
      upgradesUI.Viewport.AddTag("TowerViewport");

    const [upgrades] = this.components.getAllComponents<Upgrades>();
    upgrades.updateInfo(tower.getInfo());
    this.selectionJanitor.Add(tower.infoUpdated.Connect(info => upgrades.updateInfo(info)));
    upgradesUI.Visible = true;
  }

  public deselect(): void {
    if (this.selectedTower === undefined) return;
    this.selectionJanitor.Cleanup();

    this.selectedTower.toggleHoverHighlight(false);
    this.selectedTower.toggleSelectionHighlight(false);
    this.selectedTower.setSizePreviewColor(SIZE_PREVIEW_COLORS[this.selectedTower.isMine() ? "MyTowers" : "NotMyTowers"]);
    this.selectedTower.resetSizePreviewHeight();
    this.selectedTower = undefined;

    PlayerGui.Main.Main.TowerUpgrades.Visible = false;
  }

  private getHoveredTower(): Maybe<Tower> {
    const target = this.mouse.getTarget();
    const model = target?.FindFirstAncestorOfClass("Model");
    if (model === undefined || !model.HasTag("Tower")) return;

    return this.components.getComponent<Tower>(model);
  }
}