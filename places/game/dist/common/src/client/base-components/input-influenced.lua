-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local InputContext = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "gamejoy", "out").Context
local DestroyableComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "base-components", "destroyable").default
local InputInfluenced
do
	local super = DestroyableComponent
	InputInfluenced = setmetatable({}, {
		__tostring = function()
			return "InputInfluenced"
		end,
		__index = super,
	})
	InputInfluenced.__index = InputInfluenced
	function InputInfluenced.new(...)
		local self = setmetatable({}, InputInfluenced)
		return self:constructor(...) or self
	end
	function InputInfluenced:constructor(...)
		super.constructor(self, ...)
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
