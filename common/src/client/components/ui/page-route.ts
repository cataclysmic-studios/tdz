import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import { PlayerGui } from "../../../shared/utility/client";

import DestroyableComponent from "../../../shared/base-components/destroyable";
import type { PageController } from "../../controllers/page";

interface Attributes {
  PageRoute_Destination: string;
  PageRoute_Exclusive: boolean;
}

@Component({
  tag: "PageRoute",
  ancestorWhitelist: [PlayerGui],
  defaults: {
    PageRoute_Exclusive: true
  }
})
export class PageRoute extends DestroyableComponent<Attributes, GuiButton> implements OnStart {
  public constructor(
    private readonly page: PageController
  ) { super(); }

  public onStart(): void {
    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => this.page.set(
      this.attributes.PageRoute_Destination,
      this.attributes.PageRoute_Exclusive,
      this.instance.FindFirstAncestorOfClass("ScreenGui")!
    )));
  }
}