import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";
import Signal from "@rbxts/signal";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
import { tween } from "common/shared/utility/ui";
import { setSizePreviewColor } from "shared/utility";
import { PLACEMENT_STORAGE } from "shared/constants";
import type { TowerStats } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { TimeScaleController } from "client/controllers/time-scale";

interface Attributes {
  readonly ID: number;
  readonly Size: number;
}

@Component({ tag: "Tower" })
export class Tower extends DestroyableComponent<Attributes, TowerModel> implements OnStart {
  public readonly name = this.instance.Name;
  public readonly infoUpdated = new Signal<(newInfo: TowerInfo) => void>;

  private readonly highlight = this.janitor.Add(new Instance("Highlight", this.instance));
  private readonly sizePreviewTweenInfo = new TweenInfoBuilder().SetTime(0.08);
  private readonly defaultSizePreviewHeight = Assets.SizePreview.Beam1.Width0;
  private readonly defaultLeftAttachmentPosition = Assets.SizePreview.Left.Position;
  private readonly defaultRightAttachmentPosition = Assets.SizePreview.Right.Position;
  private readonly selectionFillTransparency = 0.75;
  private info!: Omit<TowerInfo, "patch">;

  public constructor(
    private readonly timeScale: TimeScaleController
  ) { super(); }

  public async onStart(): Promise<void> {
    this.info = await Functions.getTowerInfo(this.attributes.ID);
    this.highlight.Enabled = false;
    this.highlight.Adornee = this.instance;
    this.highlight.FillColor = new Color3(1, 1, 1);
    this.highlight.OutlineColor = new Color3(1, 1, 1);

    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.timeScale.changed.Connect(() => this.adjustAnimationSpeeds()));
    this.janitor.Add(Events.towerUpgraded.connect((id, newInfo) => {
      if (id !== this.attributes.ID) return;
      this.info = newInfo;
    }));
    this.janitor.Add(Events.towerAttacked.connect((id, enemyPosition) => {
      if (id !== this.attributes.ID) return;

      // TODO: create vfx
      const towerPosition = this.instance.GetPivot().Position;
      this.instance.PivotTo(CFrame.lookAt(towerPosition, new Vector3(enemyPosition.X, towerPosition.Y, enemyPosition.Z)));
    }));
  }

  public isHighlightEnabled(): boolean {
    return this.highlight.Enabled;
  }

  public toggleHoverHighlight(on: boolean): void {
    if (this.highlight.FillTransparency === this.selectionFillTransparency) return; // if selection highlight is enabled dont turn off
    this.highlight.Enabled = on;
    this.highlight.FillTransparency = on ? 1 : 0;
  }

  public toggleSelectionHighlight(on: boolean): void {
    if (this.highlight.FillTransparency === 1) return; // if hover highlight is enabled dont turn off
    this.highlight.Enabled = on;
    this.highlight.FillTransparency = on ? this.selectionFillTransparency : 0;
  }

  public getSizePreview(): typeof Assets.SizePreview {
    return PLACEMENT_STORAGE.GetChildren().find((i): i is typeof Assets.SizePreview => i.IsA("MeshPart") && i.Name === "SizePreview" && i.GetAttribute("TowerID") === this.attributes.ID)!;
  }

  public resetSizePreviewHeight(): Janitor {
    return this.setSizePreviewHeight(this.defaultSizePreviewHeight);
  }

  /**
   * @param height Height to set the size preview to
   * @returns Janitor containing all tweens
   */
  public setSizePreviewHeight(height: number): Janitor {
    const tweenJanitor = new Janitor;
    const sizePreview = this.getSizePreview();
    const difference = height - this.defaultSizePreviewHeight;

    tweenJanitor.Add(tween(sizePreview.Beam1, this.sizePreviewTweenInfo, {
      Width0: height, Width1: height
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Beam2, this.sizePreviewTweenInfo, {
      Width0: height, Width1: height
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Left, this.sizePreviewTweenInfo, {
      Position: this.defaultLeftAttachmentPosition.add(new Vector3(0, difference / 2, 0))
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Right, this.sizePreviewTweenInfo, {
      Position: this.defaultRightAttachmentPosition.add(new Vector3(0, difference / 2, 0))
    }), "Cancel");

    return tweenJanitor;
  }

  public setSizePreviewColor(color: Color3): void {
    setSizePreviewColor(this.getSizePreview(), color);
  }

  public getInfo(): Omit<TowerInfo, "patch"> {
    return this.info;
  }

  public getStats(): TowerStats {
    return this.info.stats;
  }

  public isMine(): boolean {
    return this.getInfo().ownerID === Player.UserId;
  }

  private adjustAnimationSpeeds(): void {
    for (const track of this.instance.Humanoid.Animator.GetPlayingAnimationTracks())
      track.AdjustSpeed(this.timeScale.get());
  }
}