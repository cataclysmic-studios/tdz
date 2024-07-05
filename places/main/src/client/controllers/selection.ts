import { Controller, OnStart, type OnInit, type OnTick } from "@flamework/core";
import { Components } from "@flamework/components";
import { Janitor } from "@rbxts/janitor";

import type { LogStart } from "common/shared/hooks";
import { PlayerGui } from "common/shared/utility/client";
import { SIZE_PREVIEW_COLORS } from "shared/constants";

import type { Tower } from "client/components/tower";
import type { Upgrades } from "client/components/ui/upgrades";
import type { MouseController } from "./mouse";
import type { CharacterController } from "./character";

@Controller()
export class SelectionController implements OnInit, OnStart, OnTick, LogStart {
  private readonly selectedSizePreviewHeight = 0.75;
  private readonly selectionJanitor = new Janitor;
  private upgrades!: Upgrades;
  private selectedTower?: Tower;
  private lastTowerHovered?: Tower;

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController,
    private readonly character: CharacterController
  ) { }

  public onStart(): void {
    this.upgrades = this.components.getAllComponents<Upgrades>()[0];
  }

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
    tower.toggleSelectionHighlight(true);
    this.selectionJanitor.Add(tower.setSizePreviewHeight(this.selectedSizePreviewHeight));
    this.selectionJanitor.Add(tower.createRangePreview());

    const upgradesUI = PlayerGui.Main.Main.TowerUpgrades;
    upgradesUI.Viewport.Title.Text = tower.name;
    upgradesUI.Viewport.SetAttribute("TowerViewport_Tower", tower.name);
    if (!upgradesUI.Viewport.HasTag("TowerViewport"))
      upgradesUI.Viewport.AddTag("TowerViewport");

    this.selectionJanitor.Add(tower.infoUpdated.Connect(() => this.upgrades.updateInfo(tower)));
    this.upgrades.updateInfo(tower);
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

  public getSelectedTower(): Maybe<Tower> {
    return this.selectedTower;
  }

  public isSelected(tower?: Tower): boolean {
    return tower === undefined ? this.selectedTower !== undefined : this.selectedTower === tower;
  }

  private getHoveredTower(): Maybe<Tower> {
    const target = this.mouse.getTarget(undefined, [this.character.get()!]);
    const model = target?.FindFirstAncestorOfClass("Model");
    if (model === undefined || !model.HasTag("Tower")) return;

    return this.components.getComponent<Tower>(model);
  }
}