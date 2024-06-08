-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Cmdr = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "cmdr", "TS").Cmdr
local parent = script.Parent
Cmdr:RegisterDefaultCommands()
Cmdr:RegisterCommandsIn(parent:FindFirstChild("commands"))
Cmdr:RegisterTypesIn(parent:FindFirstChild("types"))
Cmdr:RegisterHooksIn(parent:FindFirstChild("hooks"))
