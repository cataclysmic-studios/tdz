import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { PlayerGui } from "common/shared/utility/client";
import { Assets } from "common/shared/utility/instances";

interface Attributes {
  readonly TowerViewport_Tower: ExtractKeys<typeof Assets.Towers, CharacterModel>;
}

const CAMERA = new Instance("Camera", World);
CAMERA.FieldOfView = 40;
CAMERA.CFrame = CFrame.lookAt(new Vector3(0, 4, -8), new Vector3(0, 2.6, 0));

@Component({
  tag: "TowerViewport",
  ancestorWhitelist: [PlayerGui]
})
export class TowerViewport extends BaseComponent<Attributes, ViewportFrame> implements OnStart {
  private readonly wm = new Instance("WorldModel", this.instance);

  public onStart(): void {
    this.instance.CurrentCamera = CAMERA;

    const towerModel = Assets.Towers[this.attributes.TowerViewport_Tower];
    towerModel.Humanoid.Animator.LoadAnimation(towerModel.Idle).Play();
    towerModel.Parent = this.wm;
    towerModel.PivotTo(
      new CFrame(-0.55, 0, 0).mul(CFrame.Angles(0, math.rad(-20), 0))
    );
  }
}