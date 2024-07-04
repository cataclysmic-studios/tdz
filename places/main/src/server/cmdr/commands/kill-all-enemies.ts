import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "kill-all-enemies",
  Aliases: ["kill-every-enemy", "kill-all", "kill-enemies"],
  Description: "Kills every enemy on screen",
  Group: "Dev",
  Args: []
});