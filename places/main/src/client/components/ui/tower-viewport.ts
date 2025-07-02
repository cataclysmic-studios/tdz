import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "common/shared/utility/client";
import { Assets } from "common/shared/utility/instances";

import DestroyableComponent from "common/shared/base-components/destroyable";

interface Attributes {
  TowerViewport_Tower: string;
}

const CAMERA = new Instance("Camera", World);
CAMERA.FieldOfView = 40;
CAMERA.CFrame = CFrame.lookAt(new Vector3(0, 4, -8), new Vector3(0, 2.6, 0));

@Component({
  tag: $nameof<TowerViewport>(),
  ancestorWhitelist: [PlayerGui]
})
export class TowerViewport extends DestroyableComponent<Attributes, ViewportFrame> implements OnStart {
  private readonly worldModel = new Instance("WorldModel", this.instance);
  private readonly towerTrash = new Trash;

  public onStart(): void {
    this.trash.linkToInstance(this.instance, { allowMultiple: true });
    this.trash.add(this.towerTrash);
    this.trash.add(this.onAttributeChanged("TowerViewport_Tower", () => this.loadModel()));

    this.instance.CurrentCamera = CAMERA;
    this.loadModel();
  }

  public loadModel(): void {
    this.unloadModel();

    const towerName = <TowerName>this.attributes.TowerViewport_Tower;
    const towerModel = this.towerTrash.add(Assets.Towers[towerName].Level0.Clone());
    towerModel.Parent = this.worldModel;
    towerModel.ScaleTo(1);
    towerModel.PivotTo(new CFrame(-0.55, 3, 0).mul(CFrame.Angles(0, math.rad(-20), 0)));

    this.towerTrash.add(towerModel.Humanoid.Animator.LoadAnimation(towerModel.Animations.Idle)).Play(0);
  }

  public unloadModel(): void {
    this.towerTrash.purge();
  }
}