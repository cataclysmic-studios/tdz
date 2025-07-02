import { Controller, type OnStart, type OnRender } from "@flamework/core";
import { UserInputService as UIS, Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { AxisActionBuilder, StandardActionBuilder } from "@rbxts/mechanism";
import Signal from "@rbxts/lemon-signal";

import { Player } from "../../shared/utility/client";
import { INPUT_MANAGER } from "../../shared/constants";

const { abs } = math;

const MOUSE_RAY_DISTANCE = 1000;

@Controller()
export class MouseController implements OnStart, OnRender {
  public readonly lmbUp = new Signal;
  public readonly rmbUp = new Signal;
  public readonly mmbUp = new Signal;
  public readonly lmbDown = new Signal;
  public readonly rmbDown = new Signal;
  public readonly mmbDown = new Signal;
  public readonly moved = new Signal<(position: Vector2, delta: Vector2) => void>;
  public readonly scrolled = new Signal<(delta: number) => void>;

  public isLmbDown = false;
  public isRmbDown = false;
  public isMmbDown = false;
  public behavior: Enum.MouseBehavior = Enum.MouseBehavior.Default;

  private readonly playerMouse = Player.GetMouse();

  public onStart(): void {
    // Mouse controls

    const clickAction = new StandardActionBuilder("MouseButton1", "Touch");
    const rightClickAction = new StandardActionBuilder("MouseButton2");
    const middleClickAction = new StandardActionBuilder("MouseButton3");
    const moveAction = new AxisActionBuilder("MouseMovement");
    const scrollAction = new AxisActionBuilder("MouseWheel");
    clickAction.activated.Connect(() => {
      this.isLmbDown = true;
      this.lmbDown.Fire();
    });
    clickAction.deactivated.Connect(() =>
      this.isLmbDown = false
    );
    rightClickAction.activated.Connect(() => {
      this.isRmbDown = true;
      this.rmbDown.Fire();
    });
    rightClickAction.deactivated.Connect(() =>
      this.isRmbDown = false
    );
    middleClickAction.activated.Connect(() => {
      this.isMmbDown = true;
      this.mmbDown.Fire();
    });
    middleClickAction.deactivated.Connect(() =>
      this.isMmbDown = false
    );
    scrollAction.updated.Connect(() => this.scrolled.Fire(-scrollAction.position.Z));
    moveAction.updated.Connect(() => this.moved.Fire(this.getPosition(), this.getDelta()));

    INPUT_MANAGER
      .bind(clickAction)
      .bind(rightClickAction)
      .bind(middleClickAction)
      .bind(scrollAction)
      .bind(moveAction);

    // Touch controls
    UIS.TouchPinch.Connect((_, scale) => this.scrolled.Fire((scale < 1 ? 1 : -1) * abs(scale - 2)));
    UIS.TouchStarted.Connect(() => this.isLmbDown = true);
    UIS.TouchEnded.Connect(() => this.isLmbDown = false);
  }

  public onRender(): void {
    if (this.behavior === Enum.MouseBehavior.Default) return;

    UIS.MouseBehavior = this.behavior;
  }

  public getPosition(): Vector2 {
    return UIS.GetMouseLocation();
  }

  public getWorldPosition(distance = MOUSE_RAY_DISTANCE, filter?: Instance[]): Vector3 {
    const { X, Y } = UIS.GetMouseLocation();
    const { Origin, Direction } = World.CurrentCamera!.ViewportPointToRay(X, Y);
    const raycastResult = this.createRay(distance, filter);
    return raycastResult !== undefined ? raycastResult.Position : Origin.add(Direction.mul(distance));
  }

  public getTarget(distance = MOUSE_RAY_DISTANCE, filter?: Instance[]): Maybe<BasePart> {
    return this.createRay(distance, filter)?.Instance;
  }

  public getDelta(): Vector2 {
    return UIS.GetMouseDelta();
  }

  public setTargetFilter(filterInstance: Instance): void {
    this.playerMouse.TargetFilter = filterInstance;
  }

  public setIcon(icon: string): void {
    UIS.MouseIcon = icon;
  }

  private createRay(distance: number, filter: Instance[] = []): Maybe<RaycastResult> {
    const { X, Y } = UIS.GetMouseLocation();
    const ray = World.CurrentCamera!.ViewportPointToRay(X, Y);

    const raycastParams = new RaycastParamsBuilder()
      .SetIgnoreWater(true)
      .AddToFilter(...filter)
      .Build();

    return World.Raycast(ray.Origin, ray.Direction.mul(distance), raycastParams);
  }
}