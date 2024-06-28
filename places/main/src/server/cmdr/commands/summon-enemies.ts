import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "summon-enemies",
  Aliases: ["spawn-enemies", "create-enemies"],
  Description: "Summons enemies from the summon data provided",
  Group: "Dev",
  Args: [
    {
      Type: "string",
      Name: "Name",
      Description: "The name of the enemies to be summoned"
    }, {
      Type: "number",
      Name: "Amount",
      Description: "The amount of enemies to summon",
      Default: 1
    }, {
      Type: "number",
      Name: "Interval",
      Description: "The interval (in seconds) between each enemy spawn",
      Default: 1
    }
  ],
});