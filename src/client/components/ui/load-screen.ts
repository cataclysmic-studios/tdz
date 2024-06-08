import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";
import { StarterGui } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { PlayerGui } from "shared/utility/client";
import { tween } from "shared/utility/ui";

import DestroyableComponent from "shared/base-components/destroyable";
import type { UIEffectsController } from "client/controllers/ui-effects";

interface Attributes {
  readonly LoadScreen_Delay: number;
  readonly LoadScreen_Lifetime: number;
}

@Component({
  tag: "LoadScreen",
  ancestorWhitelist: [PlayerGui]
})
export class LoadScreen extends DestroyableComponent<Attributes, PlayerGui["LoadScreen"]> implements OnStart, LogStart {
  private readonly background = this.instance.Background;

  public constructor(
    private readonly uiEffects: UIEffectsController
  ) { super(); }

  public onStart(): void {
    this.janitor.LinkToInstance(this.instance, true);

    const logoSize = <UDim2>this.background.Logo.GetAttribute("DefaultSize");
    task.delay(this.attributes.LoadScreen_Delay, () => {
      this.startLogoAnimation(logoSize);
      task.delay(this.attributes.LoadScreen_Lifetime, async () => {
        await this.uiEffects.blackFade();
        StarterGui.SetCoreGuiEnabled("All", true);
        this.instance.Destroy();
      });
    });
  }

  private startLogoAnimation(size: UDim2): void {
    tween(
      this.background.Logo,
      new TweenInfoBuilder()
        .SetTime(1.25)
        .SetEasingStyle(Enum.EasingStyle.Back),

      { Size: size }
    );
  }
}