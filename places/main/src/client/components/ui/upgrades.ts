import { Component, BaseComponent } from "@flamework/components";
import { TOWER_STATS, TOWER_UPGRADE_NAMES } from "common/shared/towers";

import { PlayerGui } from "common/shared/utility/client";
import { toSuffixedNumber } from "common/shared/utility/numbers";
import type { TowerInfo } from "shared/entity-components";

const INDICATOR_UNFILLED_BG = Color3.fromRGB(41, 44, 32);
const INDICATOR_UNFILLED_STROKE = Color3.fromRGB(7, 21, 10);
const INDICATOR_FILLED_BG = Color3.fromRGB(97, 229, 128);
const INDICATOR_FILLED_STROKE = Color3.fromRGB(68, 203, 97);

@Component({
  tag: "Upgrades",
  ancestorWhitelist: [PlayerGui]
})
export class Upgrades extends BaseComponent<{}, PlayerGui["Main"]["Main"]["TowerUpgrades"]> {
  public updateInfo(info: Omit<TowerInfo, "patch">): void {
    this.instance.Info.Damage.Title.Text = toSuffixedNumber(info.totalDamage);
    this.instance.Info.Worth.Title.Text = `$${toSuffixedNumber(info.worth)}`;

    const [path1Level, path2Level] = info.upgrades;
    const [_, allPath1Stats, allPath2Stats] = TOWER_STATS[info.name];
    const [path1Names, path2Names] = TOWER_UPGRADE_NAMES[info.name];
    const path1Max = path1Level === 5;
    const path2Max = path2Level === 5;
    const nextPath1Name = path1Max ? path1Names[4] : path1Names[path1Level];
    const nextPath2Name = path2Max ? path1Names[4] : path2Names[path2Level];
    const nextPath1Stats = path1Max ? allPath1Stats[4] : allPath1Stats[path1Level];
    const nextPath2Stats = path2Max ? allPath2Stats[4] : allPath2Stats[path2Level];
    const path1 = this.instance.Upgrades.Path1;
    const path2 = this.instance.Upgrades.Path2;

    path1.Upgrade.Visible = !path1Max;
    path2.Upgrade.Visible = !path2Max;
    path1.UpgradeName.Text = nextPath1Name;
    path2.UpgradeName.Text = nextPath2Name;
    path1.Price.Text = `$${toSuffixedNumber(nextPath1Stats.price!)}`;
    path2.Price.Text = `$${toSuffixedNumber(nextPath2Stats.price!)}`;

    this.fillOutIndicator(path1, path1Level);
    this.fillOutIndicator(path2, path2Level);
  }

  private fillOutIndicator(path: typeof this.instance.Upgrades.Path1, level: number): void {
    const dots = path.LevelIndicator.GetChildren().filter((i): i is Frame & { UIStroke: UIStroke; } => i.IsA("Frame") && i.Name === "Dot");
    if (level === 0)
      for (const dot of dots)
        this.toggleDot(dot, false);
    else
      for (const i of $range(1, level)) {
        const dot = dots.find(dot => dot.LayoutOrder === i);
        if (dot === undefined) continue;
        this.toggleDot(dot, false);
      }
  }

  private toggleDot(dot: Frame & { UIStroke: UIStroke; }, filled: boolean): void {
    dot.BackgroundColor3 = filled ? INDICATOR_FILLED_BG : INDICATOR_UNFILLED_BG;
    dot.UIStroke.Color = filled ? INDICATOR_FILLED_STROKE : INDICATOR_UNFILLED_STROKE;
  }
}