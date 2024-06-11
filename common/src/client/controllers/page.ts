import { Controller, type OnInit } from "@flamework/core";
import { Lighting } from "@rbxts/services";

@Controller()
export class PageController implements OnInit {
  private readonly blur = new Instance("BlurEffect", Lighting);

  public onInit(): void {
    this.blur.Enabled = false;
  }

  /**
   * @param destination The page to go to
   * @param exclusive Whether or not all other pages should be disabled when destination page is reached
   * @param screen The screen to search for pages in
   */
  public set(destination: string, screen: ScreenGui, exclusive: boolean, blur: boolean): void {
    const frames = screen.GetChildren().filter((i): i is GuiObject => i.IsA("GuiObject") && !i.IsA("GuiButton"));
    const destinationFrame = <GuiObject>screen.WaitForChild(destination);
    if (exclusive)
      for (const frame of frames) {
        if (frame === destinationFrame) continue;
        frame.Visible = false;
      }

    this.blur.Enabled = blur;
    destinationFrame.Visible = true;
  }

  public toggleAll(screen: ScreenGui, on: boolean): void {
    const frames = screen.GetChildren().filter((i): i is GuiObject => i.IsA("GuiObject") && !i.IsA("GuiButton"));
    for (const frame of frames)
      frame.Visible = on;
  }
}