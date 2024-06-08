-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Networking = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "networking", "out").Networking
local CommonGlobalEvents = Networking.createEvent("common/src/shared/network@CommonGlobalEvents")
local CommonGlobalFunctions = Networking.createFunction("common/src/shared/network@CommonGlobalFunctions")
return {
	CommonGlobalEvents = CommonGlobalEvents,
	CommonGlobalFunctions = CommonGlobalFunctions,
}
