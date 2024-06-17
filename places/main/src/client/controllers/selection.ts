import { Controller, type OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { Assets } from "common/shared/utility/instances";
import { SIZE_PREVIEW_COLORS } from "shared/constants";
import { tween } from "common/shared/utility/ui";

import type { Tower } from "client/components/tower";
import type { MouseController } from "./mouse";
import { PlayerGui } from "common/shared/utility/client";
import { Upgrades } from "client/components/ui/upgrades";

@Controller()
export class SelectionController implements OnInit {
  private readonly defaultSizePreviewHeight = Assets.SizePreview.Beam1.Width0;
  private readonly selectedSizePreviewHeight = 0.75;
  private readonly defaultLeftAttachmentPosition = Assets.SizePreview.Left.Position;
  private readonly defaultRightAttachmentPosition = Assets.SizePreview.Right.Position;
  private readonly sizePreviewTweenInfo = new TweenInfoBuilder().SetTime(0.08);
  private readonly selectionJanitor = new Janitor;
  private selectedTower?: Tower;

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

    let lastTowerHovered: Maybe<Tower>;
    this.mouse.moved.Connect(() => {
      const tower = this.getHoveredTower();
      if (tower === undefined) {
        lastTowerHovered?.toggleHoverHighlight(false);
        lastTowerHovered = undefined;
        return;
      }

      tower.toggleHoverHighlight(true);
      lastTowerHovered = tower;
    });
  }

  public select(tower: Tower): void {
    if (tower === this.selectedTower) return;
    this.deselect();
    this.selectedTower = tower;
    this.selectedTower.toggleHoverHighlight(false);
    this.selectedTower.toggleSelectionHighlight(true);

    const upgradesUI = PlayerGui.Main.Main.TowerUpgrades;
    upgradesUI.Viewport.Title.Text = tower.name;
    upgradesUI.Viewport.SetAttribute("TowerViewport_Tower", tower.name);
    if (!upgradesUI.Viewport.HasTag("TowerViewport"))
      upgradesUI.Viewport.AddTag("TowerViewport");

    const [upgrades] = this.components.getAllComponents<Upgrades>();
    upgrades.updateInfo(tower.getInfo());
    this.selectionJanitor.Add(tower.infoUpdated.Connect(info => upgrades.updateInfo(info)));
    upgradesUI.Visible = true;

    const sizePreview = tower.getSizePreview();
    const difference = this.selectedSizePreviewHeight - this.defaultSizePreviewHeight;
    this.selectionJanitor.Add(tween(sizePreview.Beam1, this.sizePreviewTweenInfo, {
      Width0: this.selectedSizePreviewHeight,
      Width1: this.selectedSizePreviewHeight
    }));
    this.selectionJanitor.Add(tween(sizePreview.Beam2, this.sizePreviewTweenInfo, {
      Width0: this.selectedSizePreviewHeight,
      Width1: this.selectedSizePreviewHeight
    }));
    this.selectionJanitor.Add(tween(sizePreview.Left, this.sizePreviewTweenInfo, {
      Position: sizePreview.Left.Position.add(new Vector3(0, difference / 2, 0))
    }));
    this.selectionJanitor.Add(tween(sizePreview.Right, this.sizePreviewTweenInfo, {
      Position: sizePreview.Right.Position.add(new Vector3(0, difference / 2, 0))
    }));
  }

  public deselect(): void {
    if (this.selectedTower === undefined) return;
    this.selectionJanitor.Cleanup();
    this.selectedTower.toggleHoverHighlight(false);
    this.selectedTower.toggleSelectionHighlight(false);
    PlayerGui.Main.Main.TowerUpgrades.Visible = false;

    const sizePreview = this.selectedTower.getSizePreview();
    this.selectedTower.setSizePreviewColor(SIZE_PREVIEW_COLORS[this.selectedTower.isMine() ? "MyTowers" : "NotMyTowers"]);
    this.selectionJanitor.Add(tween(sizePreview.Beam1, this.sizePreviewTweenInfo, {
      Width0: this.defaultSizePreviewHeight,
      Width1: this.defaultSizePreviewHeight
    }));
    this.selectionJanitor.Add(tween(sizePreview.Beam2, this.sizePreviewTweenInfo, {
      Width0: this.defaultSizePreviewHeight,
      Width1: this.defaultSizePreviewHeight
    }));
    this.selectionJanitor.Add(tween(sizePreview.Left, this.sizePreviewTweenInfo, { Position: this.defaultLeftAttachmentPosition }));
    this.selectionJanitor.Add(tween(sizePreview.Right, this.sizePreviewTweenInfo, { Position: this.defaultRightAttachmentPosition }));

    this.selectedTower = undefined;
  }

  private getHoveredTower(): Maybe<Tower> {
    const target = this.mouse.getTarget();
    const model = target?.FindFirstAncestorOfClass("Model");
    if (model === undefined || !model.HasTag("Tower")) return;

    return this.components.getComponent<Tower>(model);
  }
}