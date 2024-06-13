import { Controller, type OnInit } from "@flamework/core";
import { TeleportService } from "@rbxts/services";

import { Events } from "client/network";
import { TEST_TP_DATA } from "shared/constants";
import type { TeleportData } from "shared/structs";

@Controller()
export class LoadController implements OnInit {
  public onInit(): void {
    Events.loadTeleportData(<TeleportData>TeleportService.GetLocalPlayerTeleportData() ?? TEST_TP_DATA);
  }
}