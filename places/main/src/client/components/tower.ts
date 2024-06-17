import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import Signal from "@rbxts/signal";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
import { setSizePreviewColor } from "shared/utility";
import { PLACEMENT_STORAGE } from "shared/constants";
import type { TowerStats } from "common/shared/towers";
import type { TowerInfo } from "shared/structs";

import DestroyableComponent from "common/shared/base-components/destroyable";

interface Attributes {
  ID: number;
  Size: number;
}

@Component({ tag: "Tower" })
export class Tower extends DestroyableComponent<Attributes, TowerModel> implements OnStart {
  public readonly name = this.instance.Name;
  public readonly infoUpdated = new Signal<(newInfo: TowerInfo) => void>;

  private readonly highlight = this.janitor.Add(new Instance("Highlight", this.instance));
  private readonly selectionFillTransparency = 0.75;
  private info!: TowerInfo;

  public async onStart(): Promise<void> {
    this.info = await Functions.getTowerInfo(this.attributes.ID);
    this.highlight.Enabled = false;
    this.highlight.Adornee = this.instance;
    this.highlight.FillColor = new Color3(1, 1, 1);
    this.highlight.OutlineColor = new Color3(1, 1, 1);

    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(Events.towerUpgraded.connect((id, newInfo) => {
      if (id !== this.attributes.ID) return;
      this.info = newInfo;
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

  public setSizePreviewColor(color: Color3): void {
    setSizePreviewColor(this.getSizePreview(), color);
  }

  public getInfo(): TowerInfo {
    return this.info;
  }

  public getStats(): TowerStats {
    return this.info.stats;
  }

  public isMine(): boolean {
    return this.getInfo().ownerID === Player.UserId;
  }
}