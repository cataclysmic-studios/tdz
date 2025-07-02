import { Controller, type OnStart } from "@flamework/core";
import { RunService as Runtime, Stats } from "@rbxts/services";
import { StandardActionBuilder } from "@rbxts/mechanism";
import type { Widget } from "@rbxts/iris/out/IrisDeclaration";
import type { MenuItemCreation } from "@rbxts/iris/out/widgetsTypes/Menu";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import { Player } from "common/shared/utility/client";
import { roundDecimal } from "common/shared/utility/numbers";
import { DEVELOPERS, INPUT_MANAGER } from "common/shared/constants";

import type { CameraController } from "./camera";

const enum PanelPage {
  Stats,
  Camera
}

@Controller()
export class ControlPanelController implements OnStart {
  private enabledPage = PanelPage.Stats;

  public constructor(
    private readonly camera: CameraController
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(400, 350);
    let open = false;

    const canAccess = Runtime.IsStudio() || DEVELOPERS.includes(Player.UserId);
    const openAction = new StandardActionBuilder("Comma");
    openAction.activated.Connect(() => {
      if (!canAccess) return;
      open = !open;
    });

    INPUT_MANAGER.bind(openAction);
    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => {
      if (!open) return;
      Iris.Window(["Control Panel", undefined, undefined, undefined, true], { size: Iris.State(windowSize) });
      {
        Iris.MenuBar();
        {
          const pad = 11;
          const selectedColor = Color3.fromRGB(38, 77, 227);
          const setup = (menuItemWidget: Widget<MenuItemCreation>, page: PanelPage): Widget<MenuItemCreation> => {
            const label = menuItemWidget.Instance.FindFirstChildOfClass("TextLabel")!;
            menuItemWidget.Instance.Size = UDim2.fromScale(0, .05).add(UDim2.fromOffset(label.TextBounds.X + pad, 0));
            menuItemWidget.Instance.BackgroundTransparency = menuItemWidget.hovered() || this.enabledPage === page ? 0 : 1;
            if (!menuItemWidget.hovered() && this.enabledPage === page)
              menuItemWidget.Instance.BackgroundColor3 = selectedColor;
            if (menuItemWidget.clicked())
              this.enabledPage = page;

            return menuItemWidget;
          };

          setup(Iris.MenuItem(["Statistics"]), PanelPage.Stats);
          setup(Iris.MenuItem(["Camera"]), PanelPage.Camera);
        }
        Iris.End();

        this.renderPage();
      }
      Iris.End();
    });
  }

  private renderPage(): void {
    switch (this.enabledPage) {
      case PanelPage.Stats: {
        const receive = Stats.DataReceiveKbps;
        const send = Stats.DataSendKbps;
        Iris.Text([`Network Receive: ${receive < 1 ? "<1" : math.floor(receive)} kb/s`]);
        Iris.Text([`Network Send: ${send < 1 ? "<1" : math.floor(send)} kb/s`]);
        Iris.Text([`Heartbeat Time: ${roundDecimal(Stats.HeartbeatTimeMs, 3)} ms`]);
        Iris.Text([`Memory Usage (Signals): ${math.floor(Stats.GetMemoryUsageMbForTag("Signals"))} mb`]);
        Iris.Text([`Memory Usage (Script): ${math.floor(Stats.GetMemoryUsageMbForTag("Script"))} mb`]);
        Iris.Text([`Memory Usage (Total): ${math.floor(Stats.GetTotalMemoryUsageMb())} mb`]);
        break;
      }
      case PanelPage.Camera: {
        const currentCamera = this.camera.getCurrent().instance;
        const fov = Iris.SliderNum(["FOV", 0.25, 1, 120], { number: Iris.State(currentCamera.FieldOfView) });
        if (fov.numberChanged())
          currentCamera.FieldOfView = fov.state.number.get();

        const cameraComponents = Object.keys(this.camera.cameras).sort();
        const componentIndex = Iris.State<keyof typeof this.camera.cameras>(this.camera.currentName);
        Iris.Combo(["Camera Component"], { index: componentIndex });
        for (const component of cameraComponents)
          Iris.Selectable([component, component], { index: componentIndex });
        Iris.End();

        if (this.camera.currentName !== componentIndex.get())
          this.camera.set(componentIndex.get());

        break;
      }
    }
  }
}