import { Controller, type OnInit, type OnRender, type OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { SoundService as Sound, CollectionService as Collection } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import type { LogStart } from "common/shared/hooks";
import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player, PlayerGui } from "common/shared/utility/client";
import { doubleSidedLimit } from "common/shared/utility/numbers";
import {
  getTowerModelName,
  createTowerModel,
  createRangePreview,
  createSizePreview,
  setSizePreviewColor,
  growIn, shrinkOut,
  canPlaceTower,
  setSizePreviewHeight,
  fadeOutParts
} from "shared/utility";
import { NotificationStyle } from "common/shared/structs/notifications";
import { PLACEMENT_STORAGE, RANGE_PREVIEW_COLORS, SIZE_PREVIEW_COLORS } from "shared/constants";
import { TOWER_STATS } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";
import Spring from "common/shared/classes/spring";
import SmoothValue from "common/shared/classes/smooth-value";

import { InputInfluenced } from "common/client/classes/input-influenced";
import type { Tower } from "client/components/tower";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "common/client/controllers/character";
import type { NotificationController } from "common/client/controllers/notification";
import type { SelectionController } from "./selection";

@Controller()
export class PlacementController extends InputInfluenced implements OnInit, OnStart, OnRender, LogStart {
  private readonly placementJanitor = new Janitor;
  private readonly swaySpring = new Spring;
  private placementModel?: TowerModel;
  private placementRangePreview?: typeof Assets.RangePreview;
  private placementSizePreview?: typeof Assets.SizePreview;
  private lastMouseWorldPosition = new Vector3;
  private canPlace = true;
  private placing = false;
  private yOrientation = new SmoothValue(0, 8);
  private lastDt = 0;

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly notification: NotificationController,
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

    const delta = this.mouse.getWorldPosition().sub(this.lastMouseWorldPosition).mul(12);
    this.lastMouseWorldPosition = this.mouse.getWorldPosition();
    this.swaySpring.shove(new Vector3(doubleSidedLimit(delta.X, 30), 0, doubleSidedLimit(delta.Z, 30)));

    const swayAngles = this.getSway(dt);
    const [map] = <MapModel[]>Collection.GetTagged("Map");
    const mouseFilter = [this.character.get()!, PLACEMENT_STORAGE, map.PathNodes, map.StartPoint, map.EndPoint];
    const towerCFrame = new CFrame(this.mouse.getWorldPosition(undefined, mouseFilter))
      .add(new Vector3(0, this.placementModel.GetScale() * 3, 0));

    this.placementModel.PivotTo(towerCFrame.mul(swayAngles));
    this.placementRangePreview.PivotTo(towerCFrame.sub(new Vector3(0, 0.8, 0)));
    this.placementSizePreview.CFrame = towerCFrame.sub(new Vector3(0, 1, 0));

    const isWaterTower = <boolean>this.placementModel.GetAttribute("Water") ?? false;
    const inPlacableLocation = this.mouse.getTarget(undefined, mouseFilter)?.HasTag(isWaterTower ? "PlacableWater" : "PlacableGround") ?? false;
    this.canPlace = inPlacableLocation && canPlaceTower(this.placementModel, this.placementSizePreview, mouseFilter);

    const previewColor = RANGE_PREVIEW_COLORS[this.canPlace ? "CanPlace" : "CanNotPlace"];
    this.placementRangePreview.Circle.Color = previewColor;
    this.placementSizePreview.Beam1.Color = new ColorSequence(previewColor);
    this.placementSizePreview.Beam2.Color = new ColorSequence(previewColor);
    this.lastDt = dt;
  }

  public place(id: number, towerInfo: Omit<TowerInfo, "patch">): void {
    const { name, ownerID, upgrades, cframe } = towerInfo;
    const myTower = ownerID === Player.UserId;
    const modelName = getTowerModelName(upgrades);
    const towerModel = createTowerModel(name, modelName, cframe);
    towerModel.SetAttribute("ID", id);
    towerModel.SetAttribute("CurrentModelName", modelName);

    const size = <number>towerModel.GetAttribute("Size");
    const sizePreview = createSizePreview(size, id);
    setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS[myTower ? "MyTowers" : "NotMyTowers"]);
    sizePreview.CFrame = towerModel.GetPivot().sub(new Vector3(0, 1, 0));

    growIn(sizePreview);
    growIn(towerModel);
    Sound.SoundEffects.Place.Play();
    towerModel.AddTag("Tower");
  }

  public enterPlacement(towerName: TowerName): void {
    if (this.placing)
      this.exitPlacement();

    const tooltip = PlayerGui.Main.Main.ExitPlacementTip;
    tooltip.Visible = true;
    this.placementJanitor.Add(() => tooltip.Visible = false);

    this.selection.deselect();
    this.placing = true;
    this.yOrientation.zeroize();
    this.placementModel = createTowerModel(towerName, "Level0");

    const [{ range }] = TOWER_STATS[towerName];
    this.placementRangePreview = createRangePreview(range);

    const size = <number>this.placementModel.GetAttribute("Size");
    this.placementSizePreview = createSizePreview(size);
    this.placementJanitor.Add(() => {
      if (this.placementModel !== undefined)
        fadeOutParts(this.placementModel);
      if (this.placementSizePreview !== undefined)
        setSizePreviewHeight(this.placementSizePreview, 0, new TweenInfoBuilder().SetTime(0.12));
      if (this.placementRangePreview !== undefined) {
        fadeOutParts(this.placementRangePreview!);
        shrinkOut(this.placementRangePreview!, 0.2).then(() => {
          this.placementSizePreview?.Destroy();
          this.placementSizePreview = undefined;
          this.placementRangePreview?.Destroy();
          this.placementRangePreview = undefined;
          this.placementModel?.Destroy();
          this.placementModel = undefined;
        });
      }
    });

    for (const tower of this.components.getAllComponents<Tower>())
      task.spawn(() => {
        const sizePreview = tower.getSizePreview();
        const originalColor = sizePreview.Beam1.Color;
        setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS.Selected);

        this.placementJanitor.Add(() => {
          sizePreview.Beam1.Color = originalColor;
          sizePreview.Beam2.Color = originalColor;
        });
      });
  }

  public exitPlacement(): void {
    this.placementJanitor.Cleanup();
    this.placing = false;
  }

  private async confirmPlacement(): Promise<void> {
    if (!this.placing) return;
    if (this.placementModel === undefined) return;
    if (!this.canPlace) {
      this.notification.send("You cannot place towers here.", NotificationStyle.Error);
      return Sound.SoundEffects.Error.Play();
    }

    const towerName = <TowerName>this.placementModel.Name;
    const sway = this.getSway(this.lastDt);
    const cframe = this.placementModel.GetPivot().mul(sway.Inverse());
    const [{ price }] = TOWER_STATS[towerName];
    const [purchased, cashNeeded] = await Functions.spendCash(price);
    if (!purchased) {
      this.notification.failedPurchase(cashNeeded);
      return Sound.SoundEffects.Error.Play();
    }

    Events.placeTower(towerName, cframe, price);
    this.exitPlacement();
  }

  private getSway(dt: number): CFrame {
    const sway = this.swaySpring.update(dt).div(100);
    return CFrame.Angles(-sway.Z * 2, math.rad(this.yOrientation.update(dt)), sway.X);
  }
}