-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local InputContext = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "gamejoy", "out").Context
local InputInfluenced
do
	InputInfluenced = setmetatable({}, {
		__tostring = function()
			return "InputInfluenced"
		end,
	})
	InputInfluenced.__index = InputInfluenced
	function InputInfluenced.new(...)
		local self = setmetatable({}, InputInfluenced)
		return self:constructor(...) or self
	end
	function InputInfluenced:constructor()
		self.input = InputContext.new({
			ActionGhosting = 0,
			Process = false,
			RunSynchronously = true,
		})
	end
end
return {
	InputInfluenced = InputInfluenced,
}
