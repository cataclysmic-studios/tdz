-- Compiled with roblox-ts v2.3.0
return {
	Name = "set-data",
	Aliases = { "data-set" },
	Description = "Set the data at the given directory to the given value",
	Group = "Dev",
	Args = { {
		Type = "string",
		Name = "Directory",
		Description = "Directory of the data being set",
	}, {
		Type = "any",
		Name = "Value",
		Description = "The value to set the data at the given directory to",
	} },
}
