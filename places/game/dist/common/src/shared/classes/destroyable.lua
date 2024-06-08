-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Janitor = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "janitor", "src").Janitor
local Destroyable
do
	Destroyable = setmetatable({}, {
		__tostring = function()
			return "Destroyable"
		end,
	})
	Destroyable.__index = Destroyable
	function Destroyable.new(...)
		local self = setmetatable({}, Destroyable)
		return self:constructor(...) or self
	end
	function Destroyable:constructor()
		self.janitor = Janitor.new()
	end
	function Destroyable:destroy()
		self.janitor:Destroy()
	end
end
return {
	default = Destroyable,
}
