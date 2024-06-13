import { Controller, type OnInit } from "@flamework/core";
import { Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";

import { Assets } from "common/shared/utility/instances";
import { SIZE_PREVIEW_COLORS } from "shared/constants";
import { tween } from "common/shared/utility/ui";

import type { Tower } from "client/components/tower";
import type { MouseController } from "./mouse";

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
      const target = this.mouse.getTarget();
      const model = target?.FindFirstAncestorOfClass("Model");
      if (model === undefined || !model.HasTag("Tower"))
        return this.deselect();

      const tower = this.components.getComponent<Tower>(model)!;
      this.select(tower);
      tower.setSizePreviewColor(SIZE_PREVIEW_COLORS.Selected);
    });
  }

  public select(tower: Tower): void {
    if (tower === this.selectedTower) return;
    this.deselect();
    this.selectedTower = tower;

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

    this.selectedTower.setSizePreviewColor(SIZE_PREVIEW_COLORS[this.selectedTower.isMine() ? "MyTowers" : "NotMyTowers"]);
    const sizePreview = this.selectedTower.getSizePreview();
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
}