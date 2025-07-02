import { Controller, type OnInit, type OnRender, type OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { SoundService as Sound, CollectionService as Collection } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { StandardActionBuilder } from "@rbxts/mechanism";
import { Trash } from "@rbxts/trash";
import Object from "@rbxts/object-utils";

import type { LogStart } from "common/shared/hooks";
import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
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
import SmoothValue from "common/shared/classes/smooth-value";
import Spring from "common/shared/classes/spring";

import type { Tower } from "client/components/tower";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "common/client/controllers/character";
import type { NotificationController } from "common/client/controllers/notification";
import type { SelectionController } from "./selection";
import { INPUT_MANAGER } from "common/shared/constants";

@Controller()
export class PlacementController implements OnInit, OnStart, OnRender, LogStart {
  private readonly placementTrash = new Trash;
  private readonly swaySpring = new Spring;
  private placementModel?: TowerModel;
  private placementRangePreview?: typeof Assets.RangePreview;
  private placementSizePreview?: typeof Assets.SizePreview;
  private lastMouseWorldPosition = Vector3.zero;
  private placing = false;
  private yOrientation = new SmoothValue(0, 8);
  private lastDt = 0;

  public constructor(
    private readonly components: Components,
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly notification: NotificationController,
    private readonly selection: SelectionController
  ) { }

  public onInit(): void {
    Events.replicateTower.connect((id, towerInfo) => this.place(id, towerInfo));
    Events.loadTowers.connect(allTowers => {
      for (const [id, towerInfo] of Object.entries(allTowers))
        task.spawn(() => this.place(id, towerInfo));
    });
  }

  public onStart(): void {
    const exitAction = new StandardActionBuilder("Q");
    const rotateAction = new StandardActionBuilder("R");
    const confirmAction = new StandardActionBuilder("MouseButton1");
    exitAction.activated.Connect(() => this.exitPlacement());
    rotateAction.activated.Connect(() => this.yOrientation.incrementTarget(90));
    confirmAction.activated.Connect(() => this.confirmPlacement());

    INPUT_MANAGER
      .bind(exitAction)
      .bind(rotateAction)
      .bind(confirmAction);
  }

  public onRender(dt: number): void {
    if (this.placementModel === undefined) return;
    if (this.placementRangePreview === undefined) return;
    if (this.placementSizePreview === undefined) return;

    const mouseWorldPosition = this.mouse.getWorldPosition();
    const delta = mouseWorldPosition.sub(this.lastMouseWorldPosition).mul(12);
    this.lastMouseWorldPosition = mouseWorldPosition;
    this.swaySpring.shove(new Vector3(doubleSidedLimit(delta.X, 30), 0, doubleSidedLimit(delta.Z, 30)));

    const swayAngles = this.getSway(dt);
    const mouseFilter = this.getMouseFilter();
    const towerCFrame = new CFrame(this.mouse.getWorldPosition(undefined, mouseFilter))
      .add(new Vector3(0, this.placementModel.GetScale() * 3, 0));

    this.placementModel.PivotTo(towerCFrame.mul(swayAngles));
    this.placementRangePreview.PivotTo(towerCFrame.sub(new Vector3(0, 0.8, 0)));
    this.placementSizePreview.CFrame = towerCFrame.sub(Vector3.yAxis);

    const previewColor = RANGE_PREVIEW_COLORS[this.getCanPlace() ? "CanPlace" : "CanNotPlace"];
    this.placementRangePreview.Circle.Color = previewColor;
    this.placementSizePreview.Beam1.Color = new ColorSequence(previewColor);
    this.placementSizePreview.Beam2.Color = new ColorSequence(previewColor);
    this.lastDt = dt;
  }

  private getCanPlace(): boolean {
    if (!this.placing) return false;
    if (this.placementModel === undefined) return false;
    if (this.placementSizePreview === undefined) return false;

    const mouseFilter = this.getMouseFilter();
    const isWaterTower = <boolean>this.placementModel.GetAttribute("Water") ?? false;
    const inPlacableLocation = this.mouse.getTarget(undefined, mouseFilter)?.HasTag(isWaterTower ? "PlacableWater" : "PlacableGround") ?? false;
    return inPlacableLocation && canPlaceTower(this.placementModel, this.placementSizePreview, mouseFilter);
  }

  private getMouseFilter(): Instance[] {
    const [map] = Collection.GetTagged("Map") as MapModel[];
    return [this.character.get()!, PLACEMENT_STORAGE, map.PathNodes, map.StartPoint, map.EndPoint];
  }

  public place(id: number, towerInfo: Omit<TowerInfo, "patch">): void {
    const { name, ownerID, upgrades, cframe } = towerInfo;
    const myTower = ownerID === Player.UserId;
    const modelName = getTowerModelName(upgrades);
    const towerModel = createTowerModel(name, modelName, cframe);
    towerModel.SetAttribute("ID", id);
    towerModel.SetAttribute("CurrentModelName", modelName);

    const size = <number>towerModel.GetAttribute("Size");
    const sizePreview = createSizePreview(size, id, towerModel.GetPivot().sub(new Vector3(0, 1, 0)));
    setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS[myTower ? "MyTowers" : "NotMyTowers"]);

    growIn(towerModel);
    Sound.SoundEffects.Place.Play();
    towerModel.AddTag("Tower");
  }

  public async enterPlacement(towerName: TowerName): Promise<void> {
    if (this.placing) {
      const exitPromise = this.placementTrash.add(this.exitPlacement());
      const [status] = exitPromise.awaitStatus();
      if (status === "Cancelled") return;
    }

    const [tooltip] = <TextLabel[]>Collection.GetTagged("ExitPlacementTip");
    tooltip.Visible = true;
    this.placementTrash.add(() => tooltip.Visible = false);
    this.selection.deselect();
    this.yOrientation.zeroize();

    const placementModel = createTowerModel(towerName, "Level0");
    const size = placementModel.GetAttribute<number>("Size")!;
    const sizePreview = createSizePreview(size);
    const touchConnection = sizePreview.Touched.Connect(() => { });

    const [{ range }] = TOWER_STATS[towerName];
    this.placementRangePreview = createRangePreview(range);
    this.placementModel = placementModel;
    this.placementSizePreview = sizePreview;
    this.placing = true;

    this.placementTrash.add(() => {
      if (this.placementModel !== undefined)
        fadeOutParts(this.placementModel);
      if (this.placementSizePreview !== undefined)
        setSizePreviewHeight(this.placementSizePreview, 0, new TweenInfo(0.12));
      if (this.placementRangePreview !== undefined) {
        fadeOutParts(this.placementRangePreview!);
        shrinkOut(this.placementRangePreview!, 0.2).then(() => {
          this.placementSizePreview?.Destroy();
          this.placementSizePreview = undefined;
          this.placementRangePreview?.Destroy();
          this.placementRangePreview = undefined;
          this.placementModel?.Destroy();
          this.placementModel = undefined;
          this.placing = false;
          touchConnection.Disconnect();
        });
      }
    });

    for (const tower of this.components.getAllComponents<Tower>())
      task.spawn(() => {
        const sizePreview = tower.getSizePreview();
        const originalColor = sizePreview.Beam1.Color;
        setSizePreviewColor(sizePreview, SIZE_PREVIEW_COLORS.Selected);

        this.placementTrash.add(() => {
          sizePreview.Beam1.Color = originalColor;
          sizePreview.Beam2.Color = originalColor;
        });
      });
  }

  public async exitPlacement(): Promise<void> {
    this.placementTrash.purge();
    return new Promise(resolve => {
      while (this.placing) task.wait(0.1);
      resolve();
    });
  }

  private async confirmPlacement(): Promise<void> {
    if (!this.placing) return;
    if (this.placementModel === undefined) return;
    if (!this.getCanPlace()) {
      this.notification.send("You cannot place towers here.", NotificationStyle.Error);
      return Sound.SoundEffects.Error.Play();
    }

    const towerName = <TowerName>this.placementModel.Name;
    const sway = this.getSway(this.lastDt);
    const cframe = this.placementModel.GetPivot()
      .mul(sway.Inverse())
      .mul(CFrame.Angles(0, math.rad(this.yOrientation.getTarget()), 0));

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