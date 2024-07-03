import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ContentProvider, SoundService as Sound } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import { Events, Functions } from "client/network";
import { Player, PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { TOWER_STATS, TOWER_UPGRADE_META, TowerMeta, TowerStats, UpgradePath } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";

import type { NotificationController } from "common/client/controllers/notification";
import Log from "common/shared/logger";

const MAX_PATH_LEVEL = 5;
const INDICATOR_UNFILLED_BG = Color3.fromRGB(41, 44, 32);
const INDICATOR_UNFILLED_STROKE = Color3.fromRGB(7, 21, 10);
const INDICATOR_FILLED_BG = Color3.fromRGB(97, 229, 128);
const INDICATOR_FILLED_STROKE = Color3.fromRGB(68, 203, 97);

@Component({
  tag: "Upgrades",
  ancestorWhitelist: [PlayerGui]
})
export class Upgrades extends BaseComponent<{}, PlayerGui["Main"]["Main"]["TowerUpgrades"]> implements OnStart {
  private readonly updateJanitor = new Janitor;
  private currentID?: number;
  private currentInfo?: Omit<TowerInfo, "patch">;
  private path1Debounce = false;
  private path2Debounce = false;

  public constructor(
    private readonly notification: NotificationController
  ) { super(); }

  public onStart(): void {
    this.instance.GetPropertyChangedSignal("Visible")
      .Connect(() => this.instance.Visible ? this.updateJanitor.Cleanup() : undefined);

    task.spawn(() => { // pre-load upgrade icons
      const allMeta = Object.values(TOWER_UPGRADE_META);
      const allUpgradeIcons: string[] = [];
      for (const towerMeta of allMeta) {
        const [path1Meta, path2Meta] = towerMeta;
        for (const icon of path1Meta.map(meta => meta.icon))
          allUpgradeIcons.push(icon);
        for (const icon of path2Meta.map(meta => meta.icon))
          allUpgradeIcons.push(icon);
      }

      ContentProvider.PreloadAsync(allUpgradeIcons);
    });
  }

  public updateInfo(id: number, info: Omit<TowerInfo, "patch">): void {
    this.updateJanitor.Cleanup();
    this.instance.Info.Damage.Title.Text = toSuffixedNumber(info.totalDamage);
    this.instance.Info.Worth.Title.Text = `$${toSuffixedNumber(info.worth)}`;

    this.currentID = id;
    this.currentInfo = info;
    this.updateJanitor.Add(() => {
      this.currentID = undefined;
      this.currentInfo = undefined;
    });

    const [path1Level, path2Level] = info.upgrades;
    const nextPath1Meta = this.getMeta(1)!;
    const nextPath2Meta = this.getMeta(2)!;
    const nextPath1Stats = this.getStats(1)!;
    const nextPath2Stats = this.getStats(2)!;
    const canUpgradePath1 = this.canUpgrade(1);
    const canUpgradePath2 = this.canUpgrade(2);
    const path1 = this.instance.Upgrades.Path1;
    const path2 = this.instance.Upgrades.Path2;
    path1.Upgrade.Visible = canUpgradePath1;
    path2.Upgrade.Visible = canUpgradePath2;
    path1.UpgradeName.Text = nextPath1Meta.name;
    path2.UpgradeName.Text = nextPath2Meta.name;
    path1.Icon.Image = nextPath1Meta.icon;
    path2.Icon.Image = nextPath2Meta.icon;
    path1.Price.Text = `$${toSuffixedNumber(nextPath1Stats.price!)}`;
    path2.Price.Text = `$${toSuffixedNumber(nextPath2Stats.price!)}`;
    this.fillOutIndicator(path1, path1Level);
    this.fillOutIndicator(path2, path2Level);

    if (info.ownerID !== Player.UserId) return;
    if (canUpgradePath1)
      this.updateJanitor.Add(path1.Upgrade.MouseButton1Click.Once(() => this.requestUpgrade(1)));
    if (canUpgradePath2)
      this.updateJanitor.Add(path2.Upgrade.MouseButton1Click.Once(() => this.requestUpgrade(2)));
  }

  private async requestUpgrade(path: UpgradePath): Promise<void> {
    if (this.currentID === undefined) return;

    const debounceKey: "path1Debounce" | "path2Debounce" = `path${path}Debounce`;
    if (this[debounceKey]) return;
    this[debounceKey] = true;
    task.delay(0.15, () => this[debounceKey] = false);

    const stats = this.getStats(path);
    if (stats === undefined)
      return Log.warning(`Something went wrong: Upgrades.getStats(${path}) returned undefined`);

    const price = stats.price!;
    const [purchased, cashNeeded] = await Functions.spendCash(price);
    if (!purchased) {
      this.notification.failedPurchase(cashNeeded);
      return Sound.SoundEffects.Error.Play();
    }

    Events.upgradeTower(this.currentID, path, price);
  }

  private canUpgrade(path: UpgradePath): boolean {
    if (this.currentInfo === undefined) return false;
    const pathLevel = this.currentInfo.upgrades[path - 1];
    return pathLevel !== MAX_PATH_LEVEL && !this.isLocked(path);
  }

  private isLocked(path: UpgradePath): boolean {
    if (this.currentInfo === undefined) return false;
    const [path1Level, path2Level] = this.currentInfo.upgrades;
    const pathLevel = path === 1 ? path1Level : path2Level;
    const otherPathLevel = path === 1 ? path2Level : path1Level;
    return otherPathLevel >= 3 && pathLevel === 2;
  }

  private getMeta(path: UpgradePath): Maybe<TowerMeta> {
    if (this.currentInfo === undefined) return;
    const [path1Level, path2Level] = this.currentInfo.upgrades;
    const [allPath1Meta, allPath2Meta] = TOWER_UPGRADE_META[this.currentInfo.name];
    const nextPath1Meta = path1Level === MAX_PATH_LEVEL ? allPath1Meta[4] : allPath1Meta[path1Level];
    const nextPath2Meta = path2Level === MAX_PATH_LEVEL ? allPath2Meta[4] : allPath2Meta[path2Level];
    return path === 1 ? nextPath1Meta : nextPath2Meta;
  }

  private getStats(path: UpgradePath): Maybe<Partial<TowerStats>> {
    if (this.currentInfo === undefined) return;
    const [path1Level, path2Level] = this.currentInfo.upgrades;
    const [_, allPath1Stats, allPath2Stats] = TOWER_STATS[this.currentInfo.name];
    const nextPath1Stats = path1Level === MAX_PATH_LEVEL ? allPath1Stats[4] : allPath1Stats[path1Level];
    const nextPath2Stats = path2Level === MAX_PATH_LEVEL ? allPath2Stats[4] : allPath2Stats[path2Level];
    return path === 1 ? nextPath1Stats : nextPath2Stats
  }

  private fillOutIndicator(path: typeof this.instance.Upgrades.Path1, level: number): void {
    const dots = path.LevelIndicator.GetChildren().filter((i): i is Frame & { UIStroke: UIStroke; } => i.IsA("Frame") && i.Name === "Dot");
    for (const dot of dots)
      this.toggleDot(dot, false);

    if (level !== 0)
      for (const dot of dots) {
        if (dot.LayoutOrder <= MAX_PATH_LEVEL - level) continue;
        this.toggleDot(dot, true);
      }
  }

  private toggleDot(dot: Frame & { UIStroke: UIStroke; }, filled: boolean): void {
    dot.BackgroundColor3 = filled ? INDICATOR_FILLED_BG : INDICATOR_UNFILLED_BG;
    dot.UIStroke.Color = filled ? INDICATOR_FILLED_STROKE : INDICATOR_UNFILLED_STROKE;
  }
}