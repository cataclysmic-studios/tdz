-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Networking = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "networking", "out").Networking
local GlobalEvents = Networking.createEvent("places/lobby/src/shared/network@GlobalEvents")
local GlobalFunctions = Networking.createFunction("places/lobby/src/shared/network@GlobalFunctions")
return {
	GlobalEvents = GlobalEvents,
	GlobalFunctions = GlobalFunctions,
}
