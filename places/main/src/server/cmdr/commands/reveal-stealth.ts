import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "reveal-stealth",
  Aliases: ["reveal-stealth-enemies", "reveal-all-stealth", "reveal-stealths"],
  Description: "Reveals every stealth enemy on screen",
  Group: "Dev",
  Args: []
});