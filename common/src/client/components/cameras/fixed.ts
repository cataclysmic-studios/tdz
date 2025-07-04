import { Dependency } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "../../../shared/utility/client";

import { CameraControllerComponent } from "../../base-components/camera-controller-component";
import type { CameraController } from "../../controllers/camera";

@Component({ tag: "FixedCamera" })
export class FixedCamera extends CameraControllerComponent {
  public static create(controller: CameraController): FixedCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.Name = "FixedCamera";
    camera.VRTiltAndRollEnabled = true;
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}