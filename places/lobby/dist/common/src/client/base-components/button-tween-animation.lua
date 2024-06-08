-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local BaseButtonAnimation = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "base-button-animation").default
local ButtonTweenAnimation
do
	local super = BaseButtonAnimation
	ButtonTweenAnimation = setmetatable({}, {
		__tostring = function()
			return "ButtonTweenAnimation"
		end,
		__index = super,
	})
	ButtonTweenAnimation.__index = ButtonTweenAnimation
	function ButtonTweenAnimation:constructor(...)
		super.constructor(self, ...)
	end
	function ButtonTweenAnimation:onStart()
		super.onStart(self)
	end
end
return {
	default = ButtonTweenAnimation,
}
