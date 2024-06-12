import { Controller } from "@flamework/core";

@Controller()
export class PlacementController {
  private placing = false;

  public enterPlacement(towerName: string): void {
    if (this.placing)
      this.exitPlacement();

    this.placing = true;
  }

  public exitPlacement(): void {
    this.placing = false;
  }
}