import { Controller, OnRender, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import type { LogStart } from "../../shared/hooks";
import { DefaultCamera } from "../components/cameras/default";
import { FirstPersonCamera } from "../components/cameras/first-person";
import { FixedCamera } from "../components/cameras/fixed";
import { FlyOnTheWallCamera } from "../components/cameras/fly-on-the-wall";

import type { CameraControllerComponent } from "../base-components/camera-controller-component";

// add new camera components here
interface Cameras {
  readonly Default: DefaultCamera;
  readonly FirstPerson: FirstPersonCamera;
  readonly Fixed: FixedCamera;
  readonly FlyOnTheWall: FlyOnTheWallCamera;
}

@Controller()
export class CameraController implements OnInit, OnRender, LogStart {
  public readonly cameraStorage = new Instance("Actor", World);
  public cameras!: Cameras;
  public currentName!: keyof typeof this.cameras;

  public onInit(): void {
    this.cameraStorage.Name = "Cameras";
    this.cameras = {
      Default: DefaultCamera.create(this),
      FirstPerson: FirstPersonCamera.create(this),
      Fixed: FixedCamera.create(this),
      FlyOnTheWall: FlyOnTheWallCamera.create(this)
    };
  }

  public onRender(dt: number): void {
    const camera = this.getCurrent();
    if (camera !== undefined && "onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(camera: CameraControllerComponent, dt: number) => void>camera.onRender;
      update(camera, dt);
    }
  }

  public set(cameraName: keyof typeof this.cameras): void {
    this.currentName = cameraName;
    for (const [otherCameraName] of pairs(this.cameras))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  public getCurrent<T extends CameraControllerComponent>(): T {
    return this.get(this.currentName);
  }

  public get<T extends CameraControllerComponent>(cameraName: keyof typeof this.cameras): T {
    return <T>this.cameras[cameraName];
  }
}