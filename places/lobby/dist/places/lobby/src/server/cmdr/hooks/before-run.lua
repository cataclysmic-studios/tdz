-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Runtime = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
local DEVS = { game.CreatorId }
local NO_PERMISSION = "You do not have permission to execute this command!"
return function(registry)
	registry:RegisterHook("BeforeRun", function(ctx)
		local _exp = ctx.Group
		repeat
			if _exp == "Dev" then
				local _userId = ctx.Executor.UserId
				local _condition = table.find(DEVS, _userId) ~= nil
				if not _condition then
					_condition = Runtime:IsStudio()
				end
				if _condition then
					return nil
				end
				return NO_PERMISSION
			end
		until true
	end)
end
