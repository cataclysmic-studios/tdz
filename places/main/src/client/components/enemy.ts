import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";

import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { MouseController } from "../controllers/mouse";
import type { CharacterController } from "../controllers/character";
import type { TimeScaleController } from "client/controllers/time-scale";

interface Attributes {
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
  private walkAnimation!: AnimationTrack

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly timeScale: TimeScaleController
  ) { super(); }

  public onStart(): void {
    this.attributes.Health = this.attributes.MaxHealth;
    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.timeScale.changed.Connect(() => this.adjustWalkAnimationSpeed()))
    this.janitor.Add(() => this.updateEnemyInfoFrame(true));

    this.walkAnimation = this.janitor.Add(this.instance.Humanoid.Animator.LoadAnimation(this.instance.Animations.Walk));
    this.walkAnimation.Priority = Enum.AnimationPriority.Idle;
    this.walkAnimation.Play();
    this.adjustWalkAnimationSpeed();
  }

  public onRender(dt: number): void {
    // TODO: call this function on tap for mobile
    this.updateEnemyInfoFrame();
  }

  private updateEnemyInfoFrame(disable = false): void {
    const target = this.mouse.getTarget(undefined, [this.character.get()!]);
    const targetModel = target?.FindFirstAncestorOfClass("Model");
    const enemyInfo = PlayerGui.Main.Main.EnemyInfo;
    if (disable || targetModel === undefined || !targetModel.HasTag("Enemy")) {
      if (enemyInfo.Visible === false) return;
      enemyInfo.Visible = false;
      return;
    }

    if (targetModel !== this.instance) return;
    const { X, Y } = this.mouse.getPosition();
    enemyInfo.Position = UDim2.fromOffset(X, Y); // TODO: add traits frames
    enemyInfo.Main.EnemyName.Text = this.instance.Name.upper();
    enemyInfo.Main.Health.Amount.Text = `${toSuffixedNumber(this.attributes.Health)}/${toSuffixedNumber(this.attributes.MaxHealth)} HP`;
    enemyInfo.Main.Health.Bar.Size = enemyInfo.Main.Health.Bar.Size.Lerp(UDim2.fromScale(this.attributes.Health / this.attributes.MaxHealth, 1), 0.2); // this needs to be changed if calling function on tap
    if (enemyInfo.Visible === false)
      enemyInfo.Visible = true;
  }

  private adjustWalkAnimationSpeed(): void {
    // TODO: call when enemy speed is updated
    const embeddedWalkSpeed = <number>this.instance.Animations.Walk.GetAttribute("EmbeddedWalkSpeed") ?? 16;
    this.walkAnimation.AdjustSpeed(1 / (embeddedWalkSpeed / this.attributes.Speed) * this.timeScale.get());
  }
}