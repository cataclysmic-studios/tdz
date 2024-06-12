import { Controller, OnRender, OnStart } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";

import { Assets } from "common/shared/utility/instances";
import { doubleSidedLimit } from "common/shared/utility/numbers";
import Spring from "common/shared/classes/spring";

import { InputInfluenced } from "common/client/classes/input-influenced";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "./character";
import { CameraController } from "./camera";
import { growIn } from "shared/utility";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Events } from "client/network";

const PLACEMENT_STORAGE = new Instance("Folder");
PLACEMENT_STORAGE.Name = "PlacementStorage";
PLACEMENT_STORAGE.Parent = World;

// TODO: range preview, size preview, add 90 to yOrientation on R pressed
@Controller()
export class PlacementController extends InputInfluenced implements OnStart, OnRender {
  private readonly janitor = new Janitor;
  private readonly swaySpring = new Spring;
  private readonly canPlaceColor = Color3.fromRGB(0, 170, 255);
  private readonly cannotPlaceColor = Color3.fromRGB(255, 65, 65);
  private canPlace = true;
  private placing = false;
  private yOrientation = 0;
  private lastMousePosition = new Vector2;
  private previewModel?: TowerModel;
  private rangePreview?: MeshPart;
  private sizePreview?: typeof Assets.SizePreview;

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly camera: CameraController
  ) { super(); }

  public onStart(): void {
    this.input
      .Bind("Q", () => this.exitPlacement())
      .Bind("MouseButton1", () => this.confirmPlacement());
  }

  public onRender(dt: number): void {
    if (this.previewModel === undefined) return;
    if (this.rangePreview === undefined) return;
    if (this.sizePreview === undefined) return;

    const delta = this.mouse.getPosition().sub(this.lastMousePosition);
    const cameraCFrame = this.camera.getCurrent().instance.CFrame;
    this.lastMousePosition = this.mouse.getPosition();

    const limitedDelta = new Vector3(doubleSidedLimit(delta.X, 4), 0, doubleSidedLimit(delta.Y, 4));
    this.swaySpring.shove(cameraCFrame.VectorToObjectSpace(limitedDelta));

    const sway = this.swaySpring.update(dt).div(100);
    const swayAngles = CFrame.Angles(-sway.Z * 2, math.rad(this.yOrientation), sway.X);
    const mouseFilter = [this.character.get()!, PLACEMENT_STORAGE];
    const towerCFrame = new CFrame(this.mouse.getWorldPosition(undefined, mouseFilter))
      .add(new Vector3(0, this.previewModel.GetScale() * 3, 0));

    this.previewModel.PivotTo(towerCFrame.mul(swayAngles));
    this.rangePreview.CFrame = towerCFrame.sub(new Vector3(0, 0.8, 0));
    this.sizePreview.CFrame = towerCFrame.sub(new Vector3(0, 1, 0));

    const isWaterTower = <boolean>this.previewModel.GetAttribute("Water") ?? false;
    const raycastParams = new RaycastParamsBuilder()
      .SetFilter(mouseFilter)
      .SetIgnoreWater(true)
      .Build();

    const groundBelow = World.Raycast(towerCFrame.Position, new Vector3(0, -1.2, 0), raycastParams);
    const groundInside = World.Raycast(towerCFrame.Position, new Vector3(0, -1.1, 0), raycastParams);
    const inPlacableLocation = this.mouse.getTarget(undefined, mouseFilter)?.HasTag(isWaterTower ? "PlacableWater" : "PlacableGround") ?? false;
    this.canPlace = inPlacableLocation && groundBelow?.Instance !== undefined && groundInside?.Instance === undefined;
    this.rangePreview.Color = this.canPlace ? this.canPlaceColor : this.cannotPlaceColor;
  }

  public enterPlacement(towerName: string): void {
    if (this.placing)
      this.exitPlacement();

    this.placing = true;
    this.yOrientation = 0;
    this.previewModel = this.janitor.Add(Assets.Towers[<TowerName>towerName].Level0.Clone());
    this.previewModel.Parent = PLACEMENT_STORAGE;
    this.janitor.Add(growIn(this.previewModel), "cancel");

    const range = <number>this.previewModel.GetAttribute("Range");
    this.rangePreview = this.janitor.Add(Assets.RangePreview.Clone());
    this.rangePreview.Size = new Vector3(range, this.rangePreview.Size.Y, range);
    this.rangePreview.Parent = PLACEMENT_STORAGE;
    this.janitor.Add(growIn(this.rangePreview), "cancel");

    const size = <number>this.previewModel.GetAttribute("Size");
    this.sizePreview = this.janitor.Add(Assets.SizePreview.Clone());
    const defaultTowerSize = this.sizePreview.Size.X;
    const sizeScale = size / defaultTowerSize;

    this.sizePreview.Size = new Vector3(size, this.sizePreview.Size.Y, size);
    this.sizePreview.Beam1.CurveSize0 *= sizeScale;
    this.sizePreview.Beam1.CurveSize1 *= sizeScale;
    this.sizePreview.Beam2.CurveSize0 *= sizeScale;
    this.sizePreview.Beam2.CurveSize1 *= sizeScale;
    this.sizePreview.Left.Position = new Vector3(0, 0, this.sizePreview.Size.X / 2);
    this.sizePreview.Right.Position = new Vector3(0, 0, -this.sizePreview.Size.X / 2);
    this.sizePreview.Parent = PLACEMENT_STORAGE;

    this.previewModel.Humanoid.Animator.LoadAnimation(this.previewModel.Animations.Idle).Play(0);
    for (const part of this.previewModel.GetChildren().filter((i): i is BasePart => i.IsA("BasePart")))
      part.CanCollide = false;
  }

  public exitPlacement(): void {
    this.janitor.Cleanup();
    this.placing = false;
    this.previewModel = undefined;
  }

  private confirmPlacement(): void {
    if (!this.placing) return;
    if (!this.canPlace) return;
    if (this.previewModel === undefined) return;

    const towerName = <TowerName>this.previewModel.Name;
    const cframe = this.previewModel.GetPivot();
    Events.placeTower(towerName, cframe);
    this.exitPlacement();
  }
}