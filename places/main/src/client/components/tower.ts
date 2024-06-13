import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
import { setSizePreviewColor } from "shared/utility";
import { PLACEMENT_STORAGE } from "shared/constants";
import type { TowerInfo } from "shared/structs";
import type { TowerStats } from "common/shared/towers";

interface Attributes {
  ID: number;
  Size: number;
}

@Component({ tag: "Tower" })
export class Tower extends BaseComponent<Attributes, TowerModel> implements OnStart {
  private info!: TowerInfo;

  public async onStart(): Promise<void> {
    this.info = await Functions.getTowerInfo(this.attributes.ID);
    Events.towerUpgraded.connect((id, newInfo) => {
      if (id !== this.attributes.ID) return;
      this.info = newInfo;
    });
  }

  public isMine(): boolean {
    return this.getInfo().ownerID === Player.UserId
  }

  public getInfo(): TowerInfo {
    return this.info;
  }

  public getStats(): TowerStats {
    return this.info.stats;
  }

  public getSizePreview(): typeof Assets.SizePreview {
    return PLACEMENT_STORAGE.GetChildren().find((i): i is typeof Assets.SizePreview => i.IsA("MeshPart") && i.Name === "SizePreview" && i.GetAttribute("TowerID") === this.attributes.ID)!;
  }

  public setSizePreviewColor(color: Color3): void {
    setSizePreviewColor(this.getSizePreview(), color);
  }
}