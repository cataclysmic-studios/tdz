import { Controller, type OnInit } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";

import { CommonEvents } from "../../client/network";
import { PlayerGui } from "../../shared/utility/client";
import { Assets } from "../../shared/utility/instances";
import { toSuffixedNumber } from "../../shared/utility/numbers";
import { tween } from "../../shared/utility/ui";
import { NotificationStyle } from "../../shared/structs/notifications";

interface StylePalette {
  readonly text: Color3;
  readonly stroke: Color3;
}

const PALETTES: Record<NotificationStyle, StylePalette> = {
  [NotificationStyle.Error]: {
    text: Color3.fromRGB(255, 80, 80),
    stroke: Color3.fromRGB(93, 30, 30)
  },
  [NotificationStyle.GainedMoney]: {
    text: Color3.fromRGB(64, 217, 99),
    stroke: Color3.fromRGB(26, 77, 36)
  }
};

@Controller()
export class NotificationController implements OnInit {
  public readonly defaultContainerPosition = PlayerGui.Main.Main.NotificationContainer.Position;
  private activeNotifications = 0;

  public onInit(): void {
    CommonEvents.sendNotification.connect((message, style, lifetime, fadeTime) => this.send(message, style, lifetime, fadeTime));
    CommonEvents.notifyFailedPurchase.connect(cashNeeded => this.failedPurchase(cashNeeded));
  }

  public moveContainer(position: UDim2): void {
    PlayerGui.Main.Main.NotificationContainer.Position = position;
  }

  public send(message: string, style: NotificationStyle, lifetime = 4, fadeTime = 1): void {
    const container = PlayerGui.Main.Main.NotificationContainer;
    const label = Assets.UI.NotificationLabel.Clone();
    const colors = PALETTES[style];
    label.UIStroke.Color = colors.stroke;
    label.TextColor3 = colors.text;
    label.Text = message;
    label.LayoutOrder = this.activeNotifications++;
    label.Parent = container;

    task.delay(lifetime, () => {
      const tweenInfo = new TweenInfoBuilder().SetTime(fadeTime);
      tween(label, tweenInfo, { TextTransparency: 1 });
      tween(label.UIStroke, tweenInfo, { Transparency: 1 })
        .Completed.Once(() => label.Destroy());
    });
  }

  public failedPurchase(cashNeeded: number): void {
    this.send(`You need $${toSuffixedNumber(cashNeeded)} more to purchase this!`, NotificationStyle.Error);
  }
}