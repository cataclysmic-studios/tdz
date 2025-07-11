import type { OnStart } from "@flamework/core";
import { BaseComponent, Component } from "@flamework/components";
import { ContentProvider } from "@rbxts/services";
import { Trash } from "@rbxts/trash";
import { StandardActionBuilder } from "@rbxts/mechanism";
import Object from "@rbxts/object-utils";

import { Events, Functions } from "client/network";
import { Player, PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { TOWER_STATS, TOWER_UPGRADE_META } from "common/shared/towers";
import { INPUT_MANAGER } from "common/shared/constants";
import { MAX_PATH_LEVEL } from "shared/constants";
import { TargetingType } from "shared/structs";
import type { TowerMeta, TowerStats, UpgradePath } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";
import Log from "common/shared/logger";

import type { Tower } from "../tower";
import type { SelectionController } from "client/controllers/selection";

const INDICATOR_UNFILLED_BG = Color3.fromRGB(41, 44, 32);
const INDICATOR_UNFILLED_STROKE = Color3.fromRGB(7, 21, 10);
const INDICATOR_FILLED_BG = Color3.fromRGB(97, 229, 128);
const INDICATOR_FILLED_STROKE = Color3.fromRGB(68, 203, 97);

@Component({
  tag: "Upgrades",
  ancestorWhitelist: [PlayerGui]
})
export class Upgrades extends BaseComponent<{}, PlayerGui["Main"]["Main"]["TowerUpgrades"]> implements OnStart {
  private readonly updateTrash = new Trash;
  private currentID?: number;
  private currentInfo?: Omit<TowerInfo, "patch">;
  private debounce = false;

  public constructor(
    private readonly selection: SelectionController
  ) { super(); }

  public onStart(): void {
    const upgradePath1Action = new StandardActionBuilder("E");
    const upgradePath2Action = new StandardActionBuilder("R");
    upgradePath1Action.activated.Connect(() => this.requestUpgrade(1));
    upgradePath2Action.activated.Connect(() => this.requestUpgrade(2));
    INPUT_MANAGER
      .bind(upgradePath1Action)
      .bind(upgradePath2Action);

    this.instance.NextTargeting.MouseButton1Click.Connect(() => {
      if (this.currentID === undefined) return;
      Events.cycleTowerTargeting(this.currentID, 1);
    });
    this.instance.LastTargeting.MouseButton1Click.Connect(() => {
      if (this.currentID === undefined) return;
      Events.cycleTowerTargeting(this.currentID, -1);
    });

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

  public updateInfo(tower: Tower): void {
    const id = tower.attributes.ID;
    const info = tower.getInfo();
    const isMyTower = info.ownerID === Player.UserId;
    this.updateTrash.purge();
    this.instance.Info.Damage.Title.Text = toSuffixedNumber(info.totalDamage);
    this.instance.Info.Worth.Title.Text = "$" + toSuffixedNumber(info.worth);
    this.instance.Sell.Price.Text = "$" + toSuffixedNumber(math.floor(info.worth / 2));
    this.instance.TargetingType.Text = TargetingType[math.floor(info.targeting)].upper();
    this.instance.NextTargeting.Visible = isMyTower;
    this.instance.LastTargeting.Visible = isMyTower;

    this.currentID = id;
    this.currentInfo = info;
    const [path1Level, path2Level] = info.upgrades;
    const nextPath1Meta = this.getMeta(1)!;
    const nextPath2Meta = this.getMeta(2)!;
    const nextPath1Stats = this.getStats(1)!;
    const nextPath2Stats = this.getStats(2)!;
    const canUpgradePath1 = this.canUpgrade(1);
    const canUpgradePath2 = this.canUpgrade(2);
    const path1 = this.instance.Upgrades.Path1;
    const path2 = this.instance.Upgrades.Path2;
    path1.Upgrade.Visible = isMyTower && canUpgradePath1;
    path2.Upgrade.Visible = isMyTower && canUpgradePath2;
    path1.UpgradeName.Text = nextPath1Meta.name;
    path2.UpgradeName.Text = nextPath2Meta.name;
    path1.Icon.Image = nextPath1Meta.icon;
    path2.Icon.Image = nextPath2Meta.icon;
    path1.Price.Text = "$" + toSuffixedNumber(nextPath1Stats.price!);
    path2.Price.Text = "$" + toSuffixedNumber(nextPath2Stats.price!);
    this.fillOutIndicator(path1, path1Level);
    this.fillOutIndicator(path2, path2Level);

    if (!isMyTower) return;
    this.updateTrash.add(path1.Upgrade.MouseButton1Click.Connect(() => this.requestUpgrade(1)));
    this.updateTrash.add(path2.Upgrade.MouseButton1Click.Connect(() => this.requestUpgrade(2)));
    this.updateTrash.add(this.instance.Sell.MouseButton1Click.Once(() => {
      tower.destroy();
      Events.sellTower(id);
    }));
  }

  private async requestUpgrade(path: UpgradePath): Promise<void> {
    if (this.currentID === undefined) return;
    if (this.currentInfo === undefined) return;
    if (!this.selection.isSelected()) return;
    this.updateTrash.purge();

    const stats = this.getStats(path);
    if (stats === undefined)
      return Log.warning(`Something went wrong: Upgrades.getStats(${path}) returned undefined`);

    const canUpgrade = this.canUpgrade(path);
    if (!canUpgrade) return;
    if (this.debounce) return;

    const id = this.currentID;
    task.spawn(async () => {
      this.debounce = true;
      await Functions.requestTowerUpgrade(id, path);
      this.debounce = false;
    });
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