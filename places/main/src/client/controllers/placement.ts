import { Controller, OnInit, OnRender, OnStart } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import { Events } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { doubleSidedLimit } from "common/shared/utility/numbers";
import { createRangePreview, createSizePreview, growIn } from "shared/utility";
import { PLACEMENT_STORAGE } from "shared/constants";
import type { TowerInfo } from "shared/structs";
import Spring from "common/shared/classes/spring";

import { InputInfluenced } from "common/client/classes/input-influenced";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "./character";
import type { CameraController } from "./camera";

// TODO: collision group, add 90 to yOrientation on R pressed
@Controller()
export class PlacementController extends InputInfluenced implements OnInit, OnStart, OnRender {
  private readonly janitor = new Janitor;
  private readonly swaySpring = new Spring;
  private readonly canPlaceColor = Color3.fromRGB(0, 170, 255);
  private readonly cannotPlaceColor = Color3.fromRGB(255, 65, 65);
  private placementModel?: TowerModel;
  private placementRangePreview?: MeshPart;
  private placementSizePreview?: typeof Assets.SizePreview;
  private lastMousePosition = new Vector2;
  private canPlace = true;
  private placing = false;
  private yOrientation = 0;

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly camera: CameraController
  ) { super(); }

  public onInit(): void {
    Events.replicateTower.connect((towerName, towerInfo) => this.place(towerName, towerInfo));
    Events.loadTowers.connect(allTowers => {
      for (const [towerName, towerInfos] of Object.entries(allTowers))
        for (const towerInfo of towerInfos)
          task.spawn(() => this.place(towerName, towerInfo));
    });
  }

  public onStart(): void {
    this.input
      .Bind("Q", () => this.exitPlacement())
      .Bind("MouseButton1", () => this.confirmPlacement());
  }

  public onRender(dt: number): void {
    if (this.placementModel === undefined) return;
    if (this.placementRangePreview === undefined) return;
    if (this.placementSizePreview === undefined) return;

    const delta = this.mouse.getPosition().sub(this.lastMousePosition);
    const cameraCFrame = this.camera.getCurrent().instance.CFrame;
    this.lastMousePosition = this.mouse.getPosition();

    const limitedDelta = new Vector3(doubleSidedLimit(delta.X, 4), 0, doubleSidedLimit(delta.Y, 4));
    this.swaySpring.shove(cameraCFrame.VectorToObjectSpace(limitedDelta));

    const sway = this.swaySpring.update(dt).div(100);
    const swayAngles = CFrame.Angles(-sway.Z * 2, math.rad(this.yOrientation), sway.X);
    const mouseFilter = [this.character.get()!, PLACEMENT_STORAGE];
    const towerCFrame = new CFrame(this.mouse.getWorldPosition(undefined, mouseFilter))
      .add(new Vector3(0, this.placementModel.GetScale() * 3, 0));

    this.placementModel.PivotTo(towerCFrame.mul(swayAngles));
    this.placementRangePreview.CFrame = towerCFrame.sub(new Vector3(0, 0.8, 0));
    this.placementSizePreview.CFrame = towerCFrame.sub(new Vector3(0, 1, 0));

    const isWaterTower = <boolean>this.placementModel.GetAttribute("Water") ?? false;
    const raycastParams = new RaycastParamsBuilder()
      .SetFilter(mouseFilter)
      .SetIgnoreWater(true)
      .Build();

    const groundBelow = World.Raycast(towerCFrame.Position, new Vector3(0, -1.2, 0), raycastParams);
    const groundInside = World.Raycast(towerCFrame.Position, new Vector3(0, -1.1, 0), raycastParams);
    const inPlacableLocation = this.mouse.getTarget(undefined, mouseFilter)?.HasTag(isWaterTower ? "PlacableWater" : "PlacableGround") ?? false;
    this.canPlace = inPlacableLocation && groundBelow?.Instance !== undefined && groundInside?.Instance === undefined;
    this.placementRangePreview.Color = this.canPlace ? this.canPlaceColor : this.cannotPlaceColor;
  }

  public place(towerName: TowerName, towerInfo: TowerInfo): void {
    const level = math.max(towerInfo.upgrades[0], towerInfo.upgrades[1]);
    const towerModel = <TowerModel>Assets.Towers[<TowerName>towerName].WaitForChild(`Level${level}`).Clone();
    towerModel.PivotTo(towerInfo.cframe);
    towerModel.Parent = PLACEMENT_STORAGE;
    this.animateTower(towerModel, "Idle", 0);
    growIn(towerModel);
  }

  public enterPlacement(towerName: string): void {
    if (this.placing)
      this.exitPlacement();

    this.placing = true;
    this.yOrientation = 0;
    this.placementModel = this.janitor.Add(Assets.Towers[<TowerName>towerName].Level0.Clone());
    this.placementModel.Name = towerName;
    this.placementModel.Parent = PLACEMENT_STORAGE;
    this.animateTower(this.placementModel, "Idle", 0);
    this.janitor.Add(growIn(this.placementModel), "cancel");

    const range = <number>this.placementModel.GetAttribute("Range");
    this.placementRangePreview = this.janitor.Add(createRangePreview(range));
    this.janitor.Add(growIn(this.placementRangePreview), "cancel");

    const size = <number>this.placementModel.GetAttribute("Size");
    this.placementSizePreview = this.janitor.Add(createSizePreview(size));
  }

  public exitPlacement(): void {
    this.janitor.Cleanup();
    this.placing = false;
    this.placementModel = undefined;
  }

  private animateTower(towerModel: TowerModel, animationName: ExtractKeys<TowerModel["Animations"], Animation>, fadeTime?: number): void {
    towerModel.Humanoid.Animator.LoadAnimation(towerModel.Animations[animationName]).Play(fadeTime);
  }

  private confirmPlacement(): void {
    if (!this.placing) return;
    if (!this.canPlace) return;
    if (this.placementModel === undefined) return;

    const towerName = <TowerName>this.placementModel.Name;
    const cframe = this.placementModel.GetPivot();
    Events.placeTower(towerName, cframe);
    this.exitPlacement();
  }
}