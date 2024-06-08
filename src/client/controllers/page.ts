import { Controller } from "@flamework/core";

@Controller()
export class PageController {
  /**
   * @param destination The page to go to
   * @param exclusive Whether or not all other pages should be disabled when destination page is reached
   * @param screen The screen to search for pages in
   */
  public set(destination: string, exclusive: boolean, screen: ScreenGui): void {
    const frames = screen.GetChildren().filter((i): i is Frame => i.IsA("Frame"));
    const destinationFrame = <Frame>screen.WaitForChild(destination);
    if (exclusive)
      for (const frame of frames) {
        if (frame === destinationFrame) continue;
        frame.Visible = false;
      }

    destinationFrame.Visible = true;
  }

  public toggleAll(screen: ScreenGui, on: boolean): void {
    const frames = screen.GetChildren().filter((i): i is Frame => i.IsA("Frame"));
    for (const frame of frames)
      frame.Visible = on;
  }
}