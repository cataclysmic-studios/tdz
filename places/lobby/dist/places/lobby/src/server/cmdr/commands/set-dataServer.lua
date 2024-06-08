-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Flamework = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Flamework
return function(context, directory, value)
	local db = Flamework.resolveDependency("common/src/server/services/third-party/database@DatabaseService")
	TS.try(function()
		db:set(context.Executor, directory, value)
		context:Reply(`Successfully set data at "{directory}" to "{value}"!`, Color3.fromRGB(0, 255, 0))
	end, function(err)
		context:Reply(`Error: {err}`, Color3.fromRGB(255, 0, 0))
	end)
end
