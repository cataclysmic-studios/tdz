import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Janitor } from "@rbxts/janitor";
import Signal from "@rbxts/signal";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player } from "common/shared/utility/client";
import { tween } from "common/shared/utility/ui";
import { createRangePreview, getTowerModelName, setSizePreviewColor, upgradeTowerModel } from "shared/utility";
import { PLACEMENT_STORAGE } from "shared/constants";
import type { TowerStats } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";
import Log from "common/shared/logger";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { SelectionController } from "client/controllers/selection";
import type { TimeScaleController } from "client/controllers/time-scale";

type AnimationName = ExtractKeys<TowerModel["Animations"], Animation>;

const enum AttackVfxType {
  Muzzle = "Muzzle",
  OnImpact = "OnImpact"
}

const enum ProjectileImpactVfxType {
  Explosion = "Explosion"
}

const enum ProjectileType {
  Bullet = "Bullet",
  Laser = "Laser",
  Explosive = "Explosive"
}

interface BaseAttributes {
  readonly ID: number;
  readonly Size: number;
  readonly Melee: boolean;
  readonly WeaponName: string;
  CurrentModelName: TowerModelName;
}

type Attributes = BaseAttributes & ({
  readonly Melee: true;
  readonly AttackVfxType: Maybe<AttackVfxType.OnImpact>;
  readonly ProjectileImpactVfxType: never;
  readonly ProjectileType: never;
} | {
  readonly Melee: false;
  readonly AttackVfxType?: AttackVfxType;
  readonly ProjectileImpactVfxType?: ProjectileImpactVfxType;
  readonly ProjectileType: ProjectileType;
});

@Component({
  tag: "Tower",
  defaults: {
    WeaponName: "Weapon"
  }
})
export class Tower extends DestroyableComponent<Attributes, TowerModel> implements OnStart, OnRender {
  public readonly name = this.instance.Name;
  public readonly infoUpdated = new Signal<(newInfo: Omit<TowerInfo, "patch">) => void>;

  private readonly loadedAnimations: Partial<Record<AnimationName, AnimationTrack>> = {};
  private readonly sizePreviewTweenInfo = new TweenInfoBuilder().SetTime(0.08);
  private readonly defaultSizePreviewHeight = Assets.SizePreview.Beam1.Width0;
  private readonly defaultLeftAttachmentPosition = Assets.SizePreview.Left.Position;
  private readonly defaultRightAttachmentPosition = Assets.SizePreview.Right.Position;
  private readonly selectionFillTransparency = 0.75;
  private currentRangePreview?: MeshPart;
  private highlight!: Highlight;
  private info!: Omit<TowerInfo, "patch">;

  public constructor(
    private readonly selection: SelectionController,
    private readonly timeScale: TimeScaleController
  ) { super(); }

  public async onStart(): Promise<void> {
    this.info = await Functions.getTowerInfo(this.attributes.ID);
    this.loadHighlight();
    this.loadAnimations();

    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance);
    this.janitor.Add(this.timeScale.changed.Connect(() => this.adjustAnimationSpeeds()));
    this.janitor.Add(Events.updateTowerStats.connect((id, info) => {
      if (id !== this.attributes.ID) return;

      const hasChanges = this.info !== info;
      this.info = info;
      if (hasChanges) {
        this.infoUpdated.Fire(info);
        if (info.upgrades[0] === 0 && info.upgrades[1] === 0) return;

        const newModelName = getTowerModelName(info.upgrades)
        if (this.instance.GetAttribute("CurrentModelName") === newModelName) return;
        upgradeTowerModel(<TowerName>this.instance.Name, this.instance, info.upgrades, this.instance.GetPivot());
        this.loadHighlight(this.selection.isSelected(this));
        this.loadAnimations();
      }
    }));
    this.janitor.Add(Events.towerAttacked.connect((id, enemyPosition) => {
      if (id !== this.attributes.ID) return;

      const towerPosition = this.instance.GetPivot().Position;
      this.instance.PivotTo(CFrame.lookAt(towerPosition, new Vector3(enemyPosition.X, towerPosition.Y, enemyPosition.Z)));
      this.playAnimation("Attack");
      task.spawn(() => this.playAttackSound());
      task.spawn(() => this.createAttackVFX());
    }));

  }

  public onRender(dt: number): void {
    if (this.currentRangePreview === undefined) return;

    const range = this.info.stats.range;
    this.currentRangePreview.Size = this.currentRangePreview.Size.Lerp(new Vector3(range, this.currentRangePreview.Size.Y, range), 0.2);
  }

  public createRangePreview(): MeshPart {
    const oldPreview = this.currentRangePreview
    this.currentRangePreview = undefined
    oldPreview?.Destroy();

    this.currentRangePreview = createRangePreview(this.info.stats.range);
    return this.currentRangePreview;
  }

  public isHighlightEnabled(): boolean {
    return this.highlight.Enabled;
  }

  public toggleHoverHighlight(on: boolean): void {
    if (this.highlight.FillTransparency === this.selectionFillTransparency) return; // if selection highlight is enabled dont turn off
    this.highlight.Enabled = on;
    this.highlight.FillTransparency = on ? 1 : 0;
  }

  public toggleSelectionHighlight(on: boolean): void {
    if (this.highlight.FillTransparency === 1) return; // if hover highlight is enabled dont turn off
    this.highlight.Enabled = on;
    this.highlight.FillTransparency = on ? this.selectionFillTransparency : 0;
  }

  public getSizePreview(): typeof Assets.SizePreview {
    return PLACEMENT_STORAGE.GetChildren().find((i): i is typeof Assets.SizePreview => i.IsA("MeshPart") && i.Name === "SizePreview" && i.GetAttribute("TowerID") === this.attributes.ID)!;
  }

  public resetSizePreviewHeight(): Janitor {
    return this.setSizePreviewHeight(this.defaultSizePreviewHeight);
  }

  /**
   * @param height Height to set the size preview to
   * @returns Janitor containing all tweens
   */
  public setSizePreviewHeight(height: number): Janitor {
    const tweenJanitor = new Janitor;
    const sizePreview = this.getSizePreview();
    const difference = height - this.defaultSizePreviewHeight;

    tweenJanitor.Add(tween(sizePreview.Beam1, this.sizePreviewTweenInfo, {
      Width0: height, Width1: height
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Beam2, this.sizePreviewTweenInfo, {
      Width0: height, Width1: height
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Left, this.sizePreviewTweenInfo, {
      Position: this.defaultLeftAttachmentPosition.add(new Vector3(0, difference / 2, 0))
    }), "Cancel");
    tweenJanitor.Add(tween(sizePreview.Right, this.sizePreviewTweenInfo, {
      Position: this.defaultRightAttachmentPosition.add(new Vector3(0, difference / 2, 0))
    }), "Cancel");

    return tweenJanitor;
  }

  public setSizePreviewColor(color: Color3): void {
    setSizePreviewColor(this.getSizePreview(), color);
  }

  public getInfo(): Omit<TowerInfo, "patch"> {
    return this.info;
  }

  public getStats(): TowerStats {
    return this.info.stats;
  }

  public isMine(): boolean {
    return this.getInfo().ownerID === Player.UserId;
  }

  private createProjectile(): void {
    // check if AttackVfxType is OnImpact when the projectile connects
  }

  private createAttackVFX(): void {
    switch (this.attributes.AttackVfxType) {
      case AttackVfxType.Muzzle: {
        const attachment = this.getMuzzleAttachment();
        if (attachment === undefined)
          return Log.warning(`Could not create attack VFX for ${this.instance.Name} tower: Could not find gun or muzzle attachment`);

        for (const particle of attachment.GetChildren().filter((i): i is ParticleEmitter => i.IsA("ParticleEmitter"))) {
          const emitCount = <Maybe<number>>particle.GetAttribute("EmitCount");
          if (emitCount === undefined) {
            const lifetime = <number>particle.GetAttribute("EnabledLifetime") ?? 0.1;
            particle.Enabled = true;
            task.delay(lifetime, () => particle.Enabled = false);
          } else
            particle.Emit(emitCount);
        }
      }

      case undefined: return;
    }
  }

  private playAttackSound(): void {
    const gun = this.getWeapon();
    if (gun === undefined) return;

    const part = gun.IsA("Model") ? gun.PrimaryPart! : gun;
    const sound = <Sound>part.FindFirstChild("Attack");
    if (sound === undefined) return;

    this.playSound(sound, part);
  }

  private playSound(sound: Sound, parent: Instance): void {
    sound = sound.Clone();
    sound.Parent = parent;
    sound.Ended.Once(() => sound.Destroy());
    sound.Play();
  }

  private loadHighlight(loadSelected = false): void {
    this.highlight?.Destroy();
    this.highlight = this.janitor.Add(new Instance("Highlight", this.instance));
    this.highlight.Enabled = false;
    this.highlight.Adornee = this.instance;
    this.highlight.FillColor = new Color3(1, 1, 1);
    this.highlight.OutlineColor = new Color3(1, 1, 1);
    if (loadSelected)
      this.toggleSelectionHighlight(true);
  }


  private loadAnimations(): void {
    for (const animation of <Animation[]>this.instance.Animations.GetChildren()) {
      const name = <AnimationName>animation.Name;
      this.loadedAnimations[name] = this.instance.Humanoid.Animator.LoadAnimation(this.instance.Animations[name]);
    }
    this.adjustAnimationSpeeds();
  }

  private getMuzzleAttachment(): Maybe<Attachment> {
    const gun = this.getWeapon();
    if (gun === undefined) return;

    const part = gun.IsA("Model") ? gun.PrimaryPart! : gun;
    return <Attachment>part.FindFirstChild("Muzzle");
  }

  private getWeapon<I extends Model | BasePart>(): Maybe<I> {
    return <I>this.instance.FindFirstChild(this.attributes.WeaponName);
  }

  private playAnimation(name: AnimationName): AnimationTrack {
    const track = this.loadedAnimations[name]!;
    track.Play();
    this.adjustAnimationSpeeds();
    return track;
  }

  private adjustAnimationSpeeds(): void {
    for (const track of this.instance.Humanoid.Animator.GetPlayingAnimationTracks())
      track.AdjustSpeed(this.timeScale.get());
  }
}