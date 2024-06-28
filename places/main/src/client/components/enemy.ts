import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { PlayerGui } from "common/shared/utility/client";
import { tween } from "common/shared/utility/ui";
import { toSuffixedNumber } from "common/shared/utility/numbers";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { MouseController } from "../controllers/mouse";
import type { TimeScaleController } from "client/controllers/time-scale";
import { CharacterController } from "../controllers/character";

interface Attributes {
  readonly Speed: number;
  readonly Health: number;
}

@Component({ tag: "Enemy" })
export class Enemy extends DestroyableComponent<Attributes, EnemyModel> implements OnStart, OnRender {
  private walkAnimation!: AnimationTrack
  private health = this.attributes.Health;

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly timeScale: TimeScaleController
  ) { super(); }

  public onStart(): void {
    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.timeScale.changed.Connect(() => this.adjustWalkAnimationSpeed()));

    this.walkAnimation = this.janitor.Add(this.instance.Humanoid.Animator.LoadAnimation(this.instance.Animations.Walk));
    this.walkAnimation.Play();
    this.adjustWalkAnimationSpeed();
  }

  public onRender(dt: number): void {
    // TODO: call this function on tap for mobile
    this.updateEnemyInfoFrame();
  }

  private updateEnemyInfoFrame(): void {
    const target = this.mouse.getTarget(undefined, []);
    const targetModel = target?.FindFirstAncestorOfClass("Model");
    const enemyInfo = PlayerGui.Main.Main.EnemyInfo;
    if (targetModel === undefined || !targetModel.HasTag("Enemy")) {
      if (enemyInfo.Visible === false) return;
      enemyInfo.Visible = false;
      return;
    }

    if (targetModel !== this.instance) return;
    const { X, Y } = this.mouse.getPosition();
    enemyInfo.Position = UDim2.fromOffset(X, Y); // TODO: add traits frames
    enemyInfo.Main.EnemyName.Text = this.instance.Name.upper();
    enemyInfo.Main.Health.Amount.Text = `${toSuffixedNumber(this.health)}/${toSuffixedNumber(this.attributes.Health)} HP`;
    enemyInfo.Main.Health.Bar.Size = enemyInfo.Main.Health.Bar.Size.Lerp(UDim2.fromScale(this.health / this.attributes.Health, 1), 0.2);
    if (enemyInfo.Visible === false)
      enemyInfo.Visible = true;
  }

  private adjustWalkAnimationSpeed(): void {
    // TODO: call when enemy speed is updated
    const embeddedWalkSpeed = <number>this.instance.Animations.Walk.GetAttribute("EmbeddedWalkSpeed") ?? 16;
    this.walkAnimation.AdjustSpeed(1 / (embeddedWalkSpeed / this.attributes.Speed) * this.timeScale.get());
  }
}