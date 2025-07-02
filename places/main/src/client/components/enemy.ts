import type { OnStart, OnRender, OnTick } from "@flamework/core";
import { Component } from "@flamework/components";

import { PlayerGui } from "common/shared/utility/client";
import { Assets } from "common/shared/utility/instances";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { didEnemyCompletePath } from "shared/utility";
import { EnemyInfo } from "shared/entity-components";
import { TRAIT_ICONS } from "shared/constants";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { MouseController } from "../controllers/mouse";
import type { CharacterController } from "../controllers/character";
import type { TimeScaleController } from "client/controllers/time-scale";
import type { PathController } from "client/controllers/path";
import { getDescendantsOfType } from "@rbxts/instance-utility";

interface Attributes {
  readonly ID: number;
}

@Component({
  tag: "Enemy"
})
export class Enemy extends DestroyableComponent<Attributes, EnemyModel> implements OnStart, OnTick, OnRender {
  private readonly parts = getDescendantsOfType(this.instance, "BasePart");
  private readonly defaultTransparencies = this.parts.map(part => part.Transparency);
  private currentTraitFrames: ImageLabel[] = [];
  private walkAnimation!: AnimationTrack;
  private info!: Omit<EnemyInfo, "patch">;

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly timeScale: TimeScaleController,
    private readonly path: PathController
  ) { super(); }

  public onStart(): void {
    this.instance.AddTag("Enemy");
    this.trash.linkToInstance(this.instance, { allowMultiple: true });
    this.trash.add(() => this.updateInfoFrame(true));

    task.spawn(() => {
      this.walkAnimation = this.trash.add(this.instance.Humanoid.Animator.LoadAnimation(this.instance.Animations.Walk));
      this.walkAnimation.Priority = Enum.AnimationPriority.Idle;
      this.walkAnimation.Play();

      for (const part of this.parts) {
        part.CanCollide = false;
        part.CollisionGroup = "plrs";
      }
    });
  }

  public onRender(): void {
    // TODO: call this function on tap for mobile
    this.updateInfoFrame()
  }

  public onTick(dt: number): void {
    const root = this.instance.PrimaryPart;
    if (root === undefined || this.info === undefined) return;

    for (const part of this.parts) {
      if (["Left Eye", "Right Eye", "HumanoidRootPart", "Face Decals"].includes(part.Name)) continue;
      const i = this.parts.indexOf(part);
      part.Transparency = this.info.isStealth ? 0.4 : this.defaultTransparencies[i];
    }

    this.adjustWalkAnimationSpeed();
    const path = this.path.get();
    const map = path.map;
    const cframe = path.getCFrameAtDistance(this.info.distance)
      .sub(Vector3.yAxis)
      .add(new Vector3(0, this.info.scale * 3, 0));

    root.CFrame = root.CFrame.Lerp(cframe, dt / 0.2 * this.timeScale.get());
    if (didEnemyCompletePath(cframe.Position, map.EndPoint.Position))
      this.destroy();
  }

  public setInfo(info: Omit<EnemyInfo, "patch">): void {
    this.info = info;
  }

  private updateInfoFrame(disable = false): void {
    const target = this.mouse.getTarget(undefined, [this.character.get()!]);
    const targetModel = target?.FindFirstAncestorOfClass("Model");
    const enemyInfo = PlayerGui.Main.Main.EnemyInfo;
    if (disable || targetModel === undefined || !targetModel.HasTag("Enemy")) {
      if (enemyInfo.Visible === false) return;
      enemyInfo.Visible = false;
      return;
    }

    if (targetModel !== this.instance) return;
    if (this.info === undefined) return;
    const { X, Y } = this.mouse.getPosition();
    enemyInfo.Position = UDim2.fromOffset(X, Y);
    enemyInfo.Main.EnemyName.Text = this.instance.Name.upper();
    enemyInfo.Main.Health.Amount.Text = `${toSuffixedNumber(this.info.health)}/${toSuffixedNumber(this.info.maxHealth)} HP`;

    const notShowing = enemyInfo.Visible === false;
    const traitFrames = enemyInfo.Traits.GetChildren().filter((i): i is ImageLabel => i.IsA("ImageLabel"));
    const cleanupTraitFrames = () => {
      for (const frame of traitFrames)
        frame.Destroy();

      this.currentTraitFrames = [];
    };

    const updateNeeded = this.currentTraitFrames.size() < this.info.traits.size() || this.currentTraitFrames.size() > this.info.traits.size();
    if (notShowing) cleanupTraitFrames();
    if (updateNeeded) {
      cleanupTraitFrames();
      for (const trait of this.info.traits) {
        const traitFrame = <typeof Assets.UI.Traits.RegularTrait>Assets.UI.Traits[trait.effectiveness === undefined ? "NoEffectivenessTrait" : "RegularTrait"].Clone();
        traitFrame.Icon.Image = TRAIT_ICONS[trait.type];
        if (trait.effectiveness !== undefined)
          traitFrame.Effectiveness.Text = `${trait.effectiveness}%`;

        traitFrame.Parent = enemyInfo.Traits;
        this.currentTraitFrames.push(traitFrame);
      }
    }

    const newBarSize = UDim2.fromScale(this.info.health / this.info.maxHealth, 1);
    enemyInfo.Main.Health.Bar.Size = notShowing ? newBarSize : enemyInfo.Main.Health.Bar.Size.Lerp(newBarSize, 0.2); // this needs to be changed if calling function on tap
    if (notShowing)
      enemyInfo.Visible = true;
  }

  private adjustWalkAnimationSpeed(): void {
    if (this.info === undefined) return;
    const embeddedWalkSpeed = <number>this.instance.Animations.Walk.GetAttribute("EmbeddedWalkSpeed") ?? 16;
    this.walkAnimation.AdjustSpeed(1 / (embeddedWalkSpeed / this.info.speed) * this.timeScale.get());
  }
}