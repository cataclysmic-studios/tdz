import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";

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
  tag: "TowerViewport",
  ancestorWhitelist: [PlayerGui]
})
export class TowerViewport extends DestroyableComponent<Attributes, ViewportFrame> implements OnStart {
  private readonly wm = new Instance("WorldModel", this.instance);
  private readonly towerJanitor = new Janitor;

  public onStart(): void {
    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.towerJanitor);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.onAttributeChanged("TowerViewport_Tower", () => this.loadModel()));

    this.instance.CurrentCamera = CAMERA;
    this.loadModel();
  }

  public loadModel(): void {
    this.unloadModel();

    const towerName = <TowerName>this.attributes.TowerViewport_Tower;
    const towerModel = this.towerJanitor.Add(Assets.Towers[towerName].Level0.Clone());
    towerModel.Parent = this.wm;
    towerModel.ScaleTo(1);
    towerModel.PivotTo(new CFrame(-0.55, 3, 0).mul(CFrame.Angles(0, math.rad(-20), 0)));

    this.towerJanitor.Add(towerModel.Humanoid.Animator.LoadAnimation(towerModel.Animations.Idle)).Play(0);
  }

  public unloadModel(): void {
    this.towerJanitor.Cleanup();
  }
}