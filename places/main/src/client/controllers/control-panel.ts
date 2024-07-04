import { Controller, type OnStart } from "@flamework/core";
import { Context as InputContext } from "@rbxts/gamejoy";
import { RunService as Runtime } from "@rbxts/services";
import Object from "@rbxts/object-utils";
import Iris from "@rbxts/iris";

import { Player } from "common/shared/utility/client";
import { DEVELOPERS } from "common/shared/constants";
import type Spring from "common/shared/classes/spring";
import type Wave from "common/shared/classes/wave";

import type { CameraController } from "./camera";
import type { MouseController } from "./mouse";
import { Events } from "client/network";

@Controller()
export class ControlPanelController implements OnStart {
  private doubleSpeedEnabled = false;

  private readonly input = new InputContext({
    ActionGhosting: 0,
    Process: false,
    RunSynchronously: true
  });

  public constructor(
    private readonly camera: CameraController,
    private readonly mouse: MouseController,
  ) { }

  public async onStart(): Promise<void> {
    const windowSize = new Vector2(300, 400);
    let open = false;

    this.input
      .Bind("Comma", () => {
        if (!Runtime.IsStudio() && !DEVELOPERS.includes(Player.UserId)) return;
        open = !open;
      })
      .Bind("P", () => {
        if (!Runtime.IsStudio() && !DEVELOPERS.includes(Player.UserId)) return;
        this.mouse.behavior = this.mouse.behavior === Enum.MouseBehavior.Default ? Enum.MouseBehavior.LockCenter : Enum.MouseBehavior.Default;
        Player.CameraMode = Player.CameraMode === Enum.CameraMode.LockFirstPerson ? Enum.CameraMode.Classic : Enum.CameraMode.LockFirstPerson;
      });

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);

    Iris.Connect(() => {
      if (!open) return;
      Iris.Window(["Control Panel"], { size: Iris.State(windowSize) });

      this.renderCameraTab();

      Iris.End();
    });
  }

  private renderCameraTab(): void {
    Iris.Tree(["Camera"]);

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

    Iris.End();
  }

  private renderSpringSettings(spring: Spring, prefix?: string): void {
    Iris.Tree([(prefix !== undefined ? prefix + " " : "") + "Spring"]);
    {
      const mass = Iris.SliderNum(["Spring Mass", 0.25, 0.25, 100], { number: Iris.State(spring.mass) });
      if (mass.numberChanged())
        spring.mass = mass.state.number.get();

      const force = Iris.SliderNum(["Spring Force", 0.25, 0.25, 100], { number: Iris.State(spring.force) });
      if (force.numberChanged())
        spring.force = force.state.number.get();

      const damping = Iris.SliderNum(["Spring Damping", 0.25, 0.25, 100], { number: Iris.State(spring.damping) });
      if (damping.numberChanged())
        spring.damping = damping.state.number.get();

      const speed = Iris.SliderNum(["Spring Speed", 0.25, 0.25, 100], { number: Iris.State(spring.speed) });
      if (mass.numberChanged())
        spring.speed = speed.state.number.get();
    }
    Iris.End();
  }

  private renderWaveSettings(wave: Wave, prefix?: string): void {
    Iris.Tree([(prefix ?? "Sine") + " " + "Wave"]);
    {
      const useSin = Iris.Checkbox(["Is Sine Wave?"], { isChecked: Iris.State(wave.waveFunction === math.sin) });
      if (useSin.checked())
        wave.waveFunction = math.sin;
      if (useSin.unchecked())
        wave.waveFunction = math.cos;

      const amplitude = Iris.SliderNum(["Amplitude", 0.05, 0.1, 10], { number: Iris.State(wave.amplitude) });
      if (amplitude.numberChanged())
        wave.amplitude = amplitude.state.number.get();

      const frequency = Iris.SliderNum(["Frequency", 0.05, 0, 10], { number: Iris.State(wave.frequency) });
      if (frequency.numberChanged())
        wave.frequency = frequency.state.number.get();

      const phaseShift = Iris.SliderNum(["Phase Shift", 0.01, 0, 5], { number: Iris.State(wave.phaseShift) });
      if (phaseShift.numberChanged())
        wave.phaseShift = phaseShift.state.number.get();

      const verticalShift = Iris.SliderNum(["Vertical Shift", 0.01, 0, 5], { number: Iris.State(wave.verticalShift) });
      if (verticalShift.numberChanged())
        wave.verticalShift = verticalShift.state.number.get();
    }
    Iris.End();
  }
}