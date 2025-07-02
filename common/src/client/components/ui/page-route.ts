import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { $nameof } from "rbxts-transform-debug";

import { PlayerGui } from "../../../shared/utility/client";

import DestroyableComponent from "../../../shared/base-components/destroyable";
import type { PageController } from "../../controllers/page";

interface Attributes {
  PageRoute_Destination: string;
  PageRoute_Exclusive: boolean;
  PageRoute_Blur: boolean;
}

@Component({
  tag: $nameof<PageRoute>(),
  ancestorWhitelist: [PlayerGui],
  defaults: {
    PageRoute_Exclusive: true,
    PageRoute_Blur: false
  }
})
export class PageRoute extends DestroyableComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly page: PageController
  ) { super(); }

  public onStart(): void {
    this.trash.add(this.instance.MouseButton1Click.Connect(() => this.page.set(
      this.attributes.PageRoute_Destination,
      this.instance.FindFirstAncestorOfClass("ScreenGui")!,
      this.attributes.PageRoute_Exclusive,
      this.attributes.PageRoute_Blur
    )));
  }
}