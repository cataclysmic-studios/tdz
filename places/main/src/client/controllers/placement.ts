import { Controller, type OnInit, type OnRender, type OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { Workspace as World, SoundService as Sound } from "@rbxts/services";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
import { doubleSidedLimit } from "common/shared/utility/numbers";
import { createRangePreview, createSizePreview, createTowerModel, growIn, setSizePreviewColor } from "shared/utility";
import { PLACEMENT_STORAGE, SIZE_PREVIEW_COLORS } from "shared/constants";
import { TOWER_STATS } from "common/shared/towers";
import type { TowerInfo } from "shared/structs";
import Spring from "common/shared/classes/spring";
import SmoothValue from "common/shared/classes/smooth-value";

import { InputInfluenced } from "common/client/classes/input-influenced";
import type { Tower } from "client/components/tower";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "common/client/controllers/character";
import type { CameraController } from "common/client/controllers/camera";
import type { SelectionController } from "./selection";

// TODO: collision groups, show "Press 'Q' to exit placement mode" gui
@Controller()
export class PlacementController extends InputInfluenced implements OnInit, OnStart, OnRender {
  private readonly placementJanitor = new Janitor;
  private readonly swaySpring = new Spring;
  private readonly canPlaceColor = Color3.fromRGB(0, 170, 255);
  private readonly cannotPlaceColor = Color3.fromRGB(255, 65, 65);
  private placementModel?: TowerModel;
  private placementRangePreview?: MeshPart;
  private placementSizePreview?: typeof Assets.SizePreview;
  private lastMousePosition = new Vector2;
  private canPlace = true;
  private placing = false;
  private yOrientation = new SmoothValue(0, 8);

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly camera: CameraController,
    private readonly selection: SelectionController
  ) { super(); }

  public onInit(): void {
    Events.replicateTower.connect((id, towerInfo) => this.place(id, towerInfo));
    Events.loadTowers.connect(allTowers => {
      for (const [id, towerInfo] of Object.entries(allTowers))
        task.spawn(() => this.place(id, towerInfo));
    });
  }

  public onStart(): void {
    this.input
      .Bind("Q", () => this.exitPlacement())
      .Bind("R", () => this.yOrientation.incrementTarget(90))
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
    const swayAngles = CFrame.Angles(-sway.Z * 2, math.rad(this.yOrientation.update(dt)), sway.X);
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
    this.canPlace = inPlacableLocation && groundBelow?.Instance !== undefined && groundInside?.Instance === undefined && !this.placementSizePreview.GetTouchingParts().map(part => part.Name).includes("SizePreview");

    const previewColor = this.canPlace ? this.canPlaceColor : this.cannotPlaceColor;
    this.placementRangePreview.Color = previewColor;
    this.placementSizePreview.Beam1.Color = new ColorSequence(previewColor);
    this.placementSizePreview.Beam2.Color = new ColorSequence(previewColor);
  }

  public place(id: number, towerInfo: TowerInfo): void {
    const { name, ownerID, upgrades, cframe } = towerInfo;
    const myTower = ownerID === Player.UserId;
    const level = math.max(upgrades[0], upgrades[1]);
    const towerModel = createTowerModel(name, `Level${level}`, cframe);
    towerModel.SetAttribute("ID", id);

    const size = <number>towerModel.GetAttribute("Size");
    const sizePreview = createSizePreview(size, id);
    setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS[myTower ? "MyTowers" : "NotMyTowers"]);
    sizePreview.CFrame = towerModel.GetPivot().sub(new Vector3(0, 1, 0));

    growIn(sizePreview);
    growIn(towerModel)
    Sound.SoundEffects.Place.Play();

    towerModel.AddTag("Tower");
  }

  public enterPlacement(towerName: TowerName): void {
    if (this.placing)
      this.exitPlacement();

    this.selection.deselect();
    this.placing = true;
    this.yOrientation.zeroize();
    this.placementModel = this.placementJanitor.Add(createTowerModel(towerName, "Level0"));

    const [{ range }] = TOWER_STATS[towerName];
    this.placementRangePreview = this.placementJanitor.Add(createRangePreview(range));

    const size = <number>this.placementModel.GetAttribute("Size");
    this.placementSizePreview = this.placementJanitor.Add(createSizePreview(size));
    this.placementJanitor.Add(this.placementSizePreview.Touched.Connect(() => { }));

    for (const tower of this.components.getAllComponents<Tower>())
      task.spawn(() => {
        const sizePreview = tower.getSizePreview();
        const originalColor = sizePreview.Beam1.Color;
        setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS.Selected);

        this.placementJanitor.Add(sizePreview.Touched.Connect(() => { }));
        this.placementJanitor.Add(() => {
          sizePreview.Beam1.Color = originalColor;
          sizePreview.Beam2.Color = originalColor;
        });
      });
  }

  public exitPlacement(): void {
    this.placementJanitor.Cleanup();
    this.placing = false;
    this.placementModel = undefined;
  }

  private async confirmPlacement(): Promise<void> {
    if (!this.placing) return;
    if (!this.canPlace) return;
    if (this.placementModel === undefined) return;

    const towerName = <TowerName>this.placementModel.Name;
    const cframe = this.placementModel.GetPivot();
    const [{ price }] = TOWER_STATS[towerName];
    const purchased = await Functions.makePurchase(price);
    if (!purchased)
      return Sound.SoundEffects.Error.Play();

    Events.placeTower(towerName, cframe, price);
    this.exitPlacement();
  }
}