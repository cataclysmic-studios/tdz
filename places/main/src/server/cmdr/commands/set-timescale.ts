import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "set-timescale",
  Aliases: ["scale-time"],
  Description: "Sets the time scale",
  Group: "Dev",
  Args: [
    {
      Type: "timeScale",
      Name: "timeScale",
      Description: "The time scale to adjust to"
    }
  ],
});