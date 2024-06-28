import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "add-cash",
  Aliases: ["give-cash", "increment-cash"],
  Description: "Adds a given amount of cash",
  Group: "Dev",
  Args: [
    {
      Type: "number",
      Name: "Amount",
      Description: "The amount of cash to add"
    }
  ],
});