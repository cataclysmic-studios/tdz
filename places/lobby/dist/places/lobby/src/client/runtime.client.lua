-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Flamework = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Flamework
local FlameworkIgnitionException = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "exceptions").FlameworkIgnitionException
local Dependencies = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "dependencies")
TS.try(function()
	Dependencies.registerAll()
	Flamework._addPaths({ { "ReplicatedStorage", "common", "client", "hook-managers" } })
	Flamework._addPaths({ { "ReplicatedStorage", "common", "client", "components" } })
	Flamework._addPaths({ { "ReplicatedStorage", "common", "client", "controllers" } })
	Flamework._addPaths({ { "StarterPlayer", "StarterPlayerScripts", "TS", "components" } })
	Flamework._addPaths({ { "StarterPlayer", "StarterPlayerScripts", "TS", "controllers" } })
	Flamework.ignite()
end, function(e)
	error(FlameworkIgnitionException.new(e))
end)
