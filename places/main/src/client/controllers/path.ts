import { Controller, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import { Events } from "client/network";
import { Path } from "shared/classes/path";

/**
 * Keeps track of the client-side Path API
 */
@Controller()
export class PathController implements OnInit {
  private path!: Path;

  public onInit(): void {
    Events.mapLoaded.connect(mapName => {
      const map = <MapModel>World.WaitForChild(mapName);
      map.WaitForChild("PathNodes");
      map.WaitForChild("StartPoint");
      map.WaitForChild("EndPoint");
      this.path = new Path(map);
    });
  }

  public get(): Path {
    return this.path;
  }
}