-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local HTTP = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").HttpService
local Unique
do
	Unique = setmetatable({}, {
		__tostring = function()
			return "Unique"
		end,
	})
	Unique.__index = Unique
	function Unique.new(...)
		local self = setmetatable({}, Unique)
		return self:constructor(...) or self
	end
	function Unique:constructor()
		self.id = HTTP:GenerateGUID()
	end
end
return {
	default = Unique,
}
