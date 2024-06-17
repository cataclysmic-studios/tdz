import { Component, BaseComponent } from "@flamework/components";

import { PlayerGui } from "common/shared/utility/client";

@Component({
  tag: "Upgrades",
  ancestorWhitelist: [PlayerGui]
})
export class Upgrades extends BaseComponent<{}, PlayerGui["Main"]["Main"]["TowerUpgrades"]> {

}