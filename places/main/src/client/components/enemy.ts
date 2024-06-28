import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { TimeScaleController } from "client/controllers/time-scale";

interface Attributes {
  readonly Speed: number;
  readonly Health: number;
}

@Component({ tag: "Enemy" })
export class Enemy extends DestroyableComponent<Attributes, EnemyModel> implements OnStart {
  private walkAnimation!: AnimationTrack

  public constructor(
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

  private adjustWalkAnimationSpeed(): void {
    // TODO: call when enemy speed is updated
    const embeddedWalkSpeed = <number>this.instance.Animations.Walk.GetAttribute("EmbeddedWalkSpeed") ?? 16;
    this.walkAnimation.AdjustSpeed(1 / (embeddedWalkSpeed / this.attributes.Speed) * this.timeScale.get());
  }
}