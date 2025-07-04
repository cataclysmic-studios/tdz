import type { OnStart, OnRender } from "@flamework/core";
import { Component } from "@flamework/components";
import { Workspace as World, Players } from "@rbxts/services";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";
import { RaycastParamsBuilder } from "@rbxts/builders";
import { Trash } from "@rbxts/trash";
import FastCast, { Caster } from "@rbxts/fastcast";
import type { PartCache } from "@rbxts/partcache/out/class";
import PartCacheModule from "@rbxts/partcache";
import Signal from "@rbxts/lemon-signal";

import { Events, Functions } from "client/network";
import { Assets } from "common/shared/utility/instances";
import { Player, PlayerGui } from "common/shared/utility/client";
import { createRangePreview, getTowerModelName, resetSizePreviewHeight, setSizePreviewHeight, setSizePreviewColor, upgradeTowerModel } from "shared/utility";
import { findLeadShot } from "shared/projectile-utility";
import { fuzzyEquals, lerp } from "common/shared/utility/numbers";
import { AttackVfxType, ProjectileImpactVfxType } from "shared/structs";
import { DISTANCE_ACCURACY, SPEED_ACCURACY } from "shared/optimization-accuracies";
import { ENEMY_STORAGE, PLACEMENT_STORAGE, PROJECTILE_SPEEDS, RANGE_PREVIEW_COLORS } from "shared/constants";
import type { TowerStats } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";
import { TowerAttackPacket, type TowerInfoPacket } from "shared/packet-structs";
import Log from "common/shared/logger";

import DestroyableComponent from "common/shared/base-components/destroyable";
import type { MouseController } from "common/client/controllers/mouse";
import type { CharacterController } from "common/client/controllers/character";
import type { TimeScaleController } from "client/controllers/time-scale";
import type { SelectionController } from "client/controllers/selection";
import type { PathController } from "client/controllers/path";
import { $nameof } from "rbxts-transform-debug";

type AnimationName = ExtractKeys<TowerModel["Animations"], Animation>;

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
  readonly ProjectileName: never;
} | {
  readonly Melee: false;
  readonly AttackVfxType?: AttackVfxType;
  readonly ProjectileImpactVfxType?: ProjectileImpactVfxType;
  readonly ProjectileName: ProjectileName;
});

@Component({
  tag: $nameof<Tower>(),
  defaults: {
    WeaponName: "Weapon"
  }
})
export class Tower extends DestroyableComponent<Attributes, TowerModel> implements OnStart, OnRender {
  public readonly name = this.instance.Name;
  public readonly infoUpdated = new Signal<(newInfo: Omit<TowerInfo, "patch">) => void>;

  private readonly nameCache: Record<number, string> = {};
  private readonly loadedAnimations: Partial<Record<AnimationName, AnimationTrack>> = {};
  private readonly selectionFillTransparency = 0.7;
  private currentRangePreview?: typeof Assets.RangePreview;
  private highlight?: Highlight;
  private projectileCache!: PartCache;
  private caster!: Caster;
  private info!: Omit<TowerInfo, "patch">;

  public constructor(
    private readonly mouse: MouseController,
    private readonly character: CharacterController,
    private readonly timeScale: TimeScaleController,
    private readonly selection: SelectionController,
    private readonly path: PathController
  ) { super(); }

  public async onStart(): Promise<void> {
    this.info = await Functions.getTowerInfo(this.attributes.ID);
    this.loadAnimations();
    this.loadProjectileCache();

    this.caster = new FastCast;
    this.trash.add(this.caster.LengthChanged.Connect((_, lastPoint, rayDirection, displacement, segmentVelocity, projectile) =>
      this.updateProjectile(projectile as BasePart, lastPoint, rayDirection, displacement, segmentVelocity)
    ));
    this.trash.add(this.caster.CastTerminating.Connect(cast => {
      try {
        this.projectileCache.ReturnPart(cast.RayInfo.CosmeticBulletObject as BasePart);
      } catch (err) {
        Log.warning("Failed to return projectile to part cache.");
      }
    }));

    this.trash.linkToInstance(this.instance, { allowMultiple: true, trackInstance: false });
    this.trash.add(() => {
      // TODO: play sell sound
      this.selection.deselect();
      this.getSizePreview().Destroy();
      this.updateInfoFrame(true)
    });
    this.trash.add(this.timeScale.changed.Connect(() => this.adjustAnimationSpeeds()));
    this.trash.add(Events.towerSold.connect(id => {
      if (id !== this.attributes.ID) return;
      this.destroy();
    }));

    const infoSerializer = createBinarySerializer<TowerInfoPacket>();
    this.trash.add(Events.updateTowerStats.connect((id, { buffer, blobs }) => {
      if (id !== this.attributes.ID) return;

      const info = infoSerializer.deserialize(buffer, blobs);
      const hasChanges = this.info !== info;
      if (hasChanges) {
        this.info = info;
        this.infoUpdated.Fire(info);
        if (info.upgrades[0] === 0 && info.upgrades[1] === 0) return;

        const newModelName = getTowerModelName(info.upgrades)
        if (this.instance.GetAttribute("CurrentModelName") === newModelName) return;
        upgradeTowerModel(<TowerName>this.instance.Name, this.instance, info.upgrades, this.instance.GetPivot());
        this.loadAnimations();
        this.loadProjectileCache();
      }
    }));

    const attackSerializer = createBinarySerializer<TowerAttackPacket>();
    this.trash.add(Events.towerAttacked.connect((id, { buffer, blobs }) => {
      if (id !== this.attributes.ID) return;

      const { enemyDistance, enemySpeed } = attackSerializer.deserialize(buffer, blobs);
      const enemyCFrame = this.path.get().getCFrameAtDistance(enemyDistance / DISTANCE_ACCURACY);
      const enemyVelocity = enemyCFrame.LookVector.mul(enemySpeed / SPEED_ACCURACY + 3);
      const towerPosition = this.instance.GetPivot().Position;
      this.instance.PivotTo(CFrame.lookAt(towerPosition, new Vector3(enemyCFrame.X, towerPosition.Y, enemyCFrame.Z)));
      this.playAnimation("Attack");
      this.playAttackSound();
      this.createAttackVFX(enemyCFrame.Position, enemyVelocity)
    }));
  }

  public onRender(): void {
    this.updateInfoFrame()
    if (this.currentRangePreview === undefined || this.currentRangePreview.Parent === undefined) {
      this.currentRangePreview = undefined;
      return;
    }

    const { range } = this.info.stats;
    const referenceRange = Assets.RangePreview.Circle.Size.X;
    this.currentRangePreview.ScaleTo(lerp(this.currentRangePreview.GetScale(), range / referenceRange, 0.2));
  }

  private updateInfoFrame(disable = false): void {
    const target = this.mouse.getTarget(undefined, [this.character.get()!]);
    const targetModel = target?.FindFirstAncestorOfClass("Model");
    const towerInfo = PlayerGui.Main.Main.TowerInfo;
    if (disable || targetModel === undefined || !targetModel.HasTag("Tower")) {
      if (towerInfo.Visible === false) return;
      towerInfo.Visible = false;
      return;
    }

    if (targetModel !== this.instance) return;
    if (this.info === undefined) return;
    const { X, Y } = this.mouse.getPosition();
    towerInfo.Position = UDim2.fromOffset(X, Y);
    towerInfo.Main.TowerName.Text = this.instance.Name.upper();
    towerInfo.OwnerName.Text = this.getPlayerNameFromID(this.info.ownerID);
    towerInfo.Level.Value.Text = `${this.info.upgrades[0]}-${this.info.upgrades[1]}`;
    towerInfo.CanSeeStealth.Visible = this.info.stats.canSeeStealth;
    if (towerInfo.Visible === false)
      towerInfo.Visible = true;
  }

  public createRangePreview(): typeof Assets.RangePreview {
    const oldPreview = this.currentRangePreview;
    this.currentRangePreview = undefined;
    oldPreview?.Destroy();

    this.currentRangePreview = this.trash.add(createRangePreview(this.info.stats.range));
    this.currentRangePreview.Circle.Color = RANGE_PREVIEW_COLORS.CanPlace;
    this.currentRangePreview.PivotTo(this.instance.GetPivot().sub(new Vector3(0, 0.8, 0)));
    return this.currentRangePreview;
  }

  public isHighlightEnabled(): boolean {
    return this.highlight?.Enabled ?? false;
  }

  public toggleHoverHighlight(on: boolean): void {
    if (this.highlight !== undefined && fuzzyEquals(this.highlight.FillTransparency, this.selectionFillTransparency)) return;
    if (on) {
      this.createHighlight();
      this.highlight!.FillTransparency = 1;
    } else {
      this.highlight?.Destroy();
      this.highlight = undefined;
    }
  }

  public toggleSelectionHighlight(on: boolean): void {
    if (on) {
      this.createHighlight();
      this.highlight!.FillTransparency = this.selectionFillTransparency;
    } else {
      this.highlight?.Destroy();
      this.highlight = undefined;
    }
  }

  public getSizePreview(): typeof Assets.SizePreview {
    return PLACEMENT_STORAGE.GetChildren().find((i): i is typeof Assets.SizePreview => i.IsA("MeshPart") && i.Name === "SizePreview" && i.GetAttribute("TowerID") === this.attributes.ID)!;
  }

  public resetSizePreviewHeight(): Trash {
    return resetSizePreviewHeight(this.getSizePreview());
  }

  /**
   * @param height Height to set the size preview to
   * @returns Janitor containing all tweens
   */
  public setSizePreviewHeight(height: number): Trash {
    return setSizePreviewHeight(this.getSizePreview(), height);
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

  private createHighlight(): void {
    if (this.highlight !== undefined) return;
    this.highlight = this.trash.add(new Instance("Highlight", this.instance));
    this.highlight.Enabled = true;
    this.highlight.FillTransparency = 0;
    this.highlight.Adornee = this.instance;
    this.highlight.FillColor = new Color3(1, 1, 1);
    this.highlight.OutlineColor = new Color3(1, 1, 1);
  }

  private getPlayerNameFromID(id: number): string {
    const name = this.nameCache[id] ?? Players.GetNameFromUserIdAsync(id);
    this.nameCache[id] = name;
    return name;
  }

  private updateProjectile(projectile: BasePart, lastPoint: Vector3, rayDirection: Vector3, displacement: number, segmentVelocity: Vector3): void {
    const currentPoint = lastPoint.add(rayDirection.mul(displacement));
    projectile.CFrame = CFrame.lookAlong(currentPoint, rayDirection);
  }

  private createProjectile(target: Vector3, targetVelocity: Vector3): void {
    const attachment = this.getMuzzleAttachment();
    if (attachment === undefined) return;

    // check if AttackVfxType is OnImpact when the projectile connects
    const origin = attachment.WorldPosition;
    const direction = attachment.WorldCFrame.LookVector;
    const speed = PROJECTILE_SPEEDS[this.info.stats.projectileType];
    const distance = origin.sub(target).Magnitude;
    const raycastParams = new RaycastParamsBuilder()
      .SetFilter(ENEMY_STORAGE.GetChildren(), Enum.RaycastFilterType.Include)
      .SetIgnoreWater(true)
      .Build();

    const ledTarget = findLeadShot(origin, target, targetVelocity, speed);
    const ledDirection = CFrame.lookAt(origin, ledTarget.add(new Vector3(0, -ledTarget.Y + origin.Y, 0))).LookVector;
    this.caster.Fire(origin, direction, ledDirection.mul(speed), {
      MaxDistance: distance,
      RaycastParams: raycastParams,
      Acceleration: new Vector3(0, -World.Gravity, 0),
      CosmeticBulletProvider: this.projectileCache,
      HighFidelityBehavior: 1,
      HighFidelitySegmentSize: 1,
      AutoIgnoreContainer: true,
      CanPierceFunction: () => false
    });
  }

  private createAttackVFX(target: Vector3, targetVelocity: Vector3): void {
    switch (this.attributes.AttackVfxType) {
      case AttackVfxType.Muzzle: {
        const attachment = this.getMuzzleAttachment();
        if (attachment === undefined)
          return Log.warning(`Could not create attack VFX for ${this.instance.Name} tower: Could not find gun or muzzle attachment`);

        task.spawn(() => this.createProjectile(target, targetVelocity));
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

  private loadProjectileCache(): void {
    this.projectileCache?.Dispose();

    const projectileTemplate = Assets.VFX.Projectiles[this.attributes.ProjectileName];
    this.projectileCache = new PartCacheModule(projectileTemplate, math.ceil(math.max(10 / (this.info.stats.reloadTime * 1.2), 10)));
    this.projectileCache.SetCacheParent(PLACEMENT_STORAGE);
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
    return part.FindFirstChild<Attachment>("Muzzle");
  }

  private getWeapon<I extends Model | BasePart>(): Maybe<I> {
    return this.instance.FindFirstChild<I>(this.attributes.WeaponName);
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