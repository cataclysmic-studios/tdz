import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";

import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { MouseController } from "../controllers/mouse";
import type { CharacterController } from "../controllers/character";
import type { TimeScaleController } from "client/controllers/time-scale";
import { EnemyTrait } from "shared/structs";
import { Assets } from "common/shared/utility/instances";
import { TRAIT_ICONS } from "shared/constants";
import { Functions } from "client/network";

interface Attributes {
  readonly ID: number;
  readonly MaxHealth: number;
  Health: number;
  Speed: number;
}

@Component({
  tag: "Enemy",
  defaults: {
    Health: 0
  }
})
export class Enemy extends DestroyableComponent<Attributes, EnemyModel> implements OnStart, OnRender {
  private readonly currentTraitFrames: ImageLabel[] = [];
  private walkAnimation!: AnimationTrack;
  private traits!: EnemyTrait[];

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly timeScale: TimeScaleController
  ) { super(); }

  public async onStart(): Promise<void> {
    this.attributes.Health = this.attributes.MaxHealth;
    this.traits = await Functions.getEnemyTraits(this.attributes.ID);

    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.timeScale.changed.Connect(() => this.adjustWalkAnimationSpeed()))
    this.janitor.Add(() => this.updateInfoFrame(true));

    this.walkAnimation = this.janitor.Add(this.instance.Humanoid.Animator.LoadAnimation(this.instance.Animations.Walk));
    this.walkAnimation.Priority = Enum.AnimationPriority.Idle;
    this.walkAnimation.Play();
    this.adjustWalkAnimationSpeed();
  }

  public onRender(dt: number): void {
    // TODO: call this function on tap for mobile
    this.updateInfoFrame();
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
    if (this.traits === undefined) return;
    const { X, Y } = this.mouse.getPosition();
    enemyInfo.Position = UDim2.fromOffset(X, Y);
    enemyInfo.Main.EnemyName.Text = this.instance.Name.upper();
    enemyInfo.Main.Health.Amount.Text = `${toSuffixedNumber(this.attributes.Health)}/${toSuffixedNumber(this.attributes.MaxHealth)} HP`;

    const notShowing = enemyInfo.Visible === false;
    const traitFrames = enemyInfo.Traits.GetChildren().filter((i): i is ImageLabel => i.IsA("ImageLabel"));
    const cleanupTraitFrames = () => {
      for (const frame of traitFrames)
        frame.Destroy();

      this.currentTraitFrames.clear();
    };

    const updateNeeded = this.currentTraitFrames.size() < this.traits.size() || this.currentTraitFrames.size() > this.traits.size();
    if (notShowing) cleanupTraitFrames();
    if (updateNeeded) {
      cleanupTraitFrames();
      for (const trait of this.traits) {
        const traitFrame = <typeof Assets.UI.Traits.RegularTrait>Assets.UI.Traits[trait.effectiveness === undefined ? "NoEffectivenessTrait" : "RegularTrait"].Clone();
        traitFrame.Icon.Image = TRAIT_ICONS[trait.type];
        if (trait.effectiveness !== undefined)
          traitFrame.Effectiveness.Text = `${trait.effectiveness}%`;

        traitFrame.Parent = enemyInfo.Traits;
        this.currentTraitFrames.push(traitFrame);
      }
    }

    const newBarSize = UDim2.fromScale(this.attributes.Health / this.attributes.MaxHealth, 1);
    enemyInfo.Main.Health.Bar.Size = notShowing ? newBarSize : enemyInfo.Main.Health.Bar.Size.Lerp(newBarSize, 0.2); // this needs to be changed if calling function on tap
    if (notShowing)
      enemyInfo.Visible = true;
  }

  private adjustWalkAnimationSpeed(): void {
    // TODO: call when enemy speed is updated
    const embeddedWalkSpeed = <number>this.instance.Animations.Walk.GetAttribute("EmbeddedWalkSpeed") ?? 16;
    this.walkAnimation.AdjustSpeed(1 / (embeddedWalkSpeed / this.attributes.Speed) * this.timeScale.get());
  }
}