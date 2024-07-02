import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ContentProvider, SoundService as Sound } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import { Player, PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import { TOWER_STATS, TOWER_UPGRADE_META } from "common/shared/towers";
import type { TowerInfo } from "shared/entity-components";
import { Events, Functions } from "client/network";

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
  private path1Debounce = false;
  private path2Debounce = false;

  public onStart(): void {
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

    const [path1Level, path2Level] = info.upgrades;
    const [_, allPath1Stats, allPath2Stats] = TOWER_STATS[info.name];
    const [allPath1Meta, allPath2Meta] = TOWER_UPGRADE_META[info.name];
    const path1Max = path1Level === 5;
    const path2Max = path2Level === 5;
    const path1Locked = path2Level >= 3 && path1Level === 2;
    const path2Locked = path1Level >= 3 && path2Level === 2;
    const nextPath1Meta = path1Max ? allPath1Meta[4] : allPath1Meta[path1Level];
    const nextPath2Meta = path2Max ? allPath2Meta[4] : allPath2Meta[path2Level];
    const nextPath1Stats = path1Max ? allPath1Stats[4] : allPath1Stats[path1Level];
    const nextPath2Stats = path2Max ? allPath2Stats[4] : allPath2Stats[path2Level];
    const path1 = this.instance.Upgrades.Path1;
    const path2 = this.instance.Upgrades.Path2;

    const canUpgradePath1 = !path1Max && !path1Locked;
    const canUpgradePath2 = !path2Max && !path2Locked;
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
      this.updateJanitor.Add(path1.Upgrade.MouseButton1Click.Once(async () => {
        if (this.path1Debounce) return;
        this.path1Debounce = true;
        task.delay(0.15, () => this.path1Debounce = false);

        const price = nextPath1Stats.price!;
        const purchased = await Functions.spendCash(price);
        if (!purchased)
          return Sound.SoundEffects.Error.Play();

        Events.upgradeTower(id, 1, price);
      }));
    if (canUpgradePath2)
      this.updateJanitor.Add(path2.Upgrade.MouseButton1Click.Once(async () => {
        if (this.path2Debounce) return;
        this.path2Debounce = true;
        task.delay(0.15, () => this.path2Debounce = false);

        const price = nextPath2Stats.price!;
        const purchased = await Functions.spendCash(price);
        if (!purchased)
          return Sound.SoundEffects.Error.Play();

        Events.upgradeTower(id, 2, price);
      }));
  }

  private fillOutIndicator(path: typeof this.instance.Upgrades.Path1, level: number): void {
    const dots = path.LevelIndicator.GetChildren().filter((i): i is Frame & { UIStroke: UIStroke; } => i.IsA("Frame") && i.Name === "Dot");
    if (level === 0)
      for (const dot of dots)
        this.toggleDot(dot, false);
    else
      for (const dot of dots) {
        if (dot.LayoutOrder <= 5 - level) continue;
        this.toggleDot(dot, true);
      }
  }

  private toggleDot(dot: Frame & { UIStroke: UIStroke; }, filled: boolean): void {
    dot.BackgroundColor3 = filled ? INDICATOR_FILLED_BG : INDICATOR_UNFILLED_BG;
    dot.UIStroke.Color = filled ? INDICATOR_FILLED_STROKE : INDICATOR_UNFILLED_STROKE;
  }
}