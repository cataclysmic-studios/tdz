-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local TweenInfoBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").TweenInfoBuilder
local tween = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "ui").tween
local ButtonTweenAnimation = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "button-tween-animation").default
local _binding = Enum
local EasingStyle = _binding.EasingStyle
local TransparencyAnimation
do
	local super = ButtonTweenAnimation
	TransparencyAnimation = setmetatable({}, {
		__tostring = function()
			return "TransparencyAnimation"
		end,
		__index = super,
	})
	TransparencyAnimation.__index = TransparencyAnimation
	function TransparencyAnimation.new(...)
		local self = setmetatable({}, TransparencyAnimation)
		return self:constructor(...) or self
	end
	function TransparencyAnimation:constructor(...)
		super.constructor(self, ...)
		self.defaultTransparency = self.instance.Transparency
		self.includeClick = false
		self.tweenInfo = TweenInfoBuilder.new():SetEasingStyle(EasingStyle.Quad):SetTime(self.attributes.Speed)
	end
	function TransparencyAnimation:onStart()
		super.onStart(self)
	end
	function TransparencyAnimation:active()
		tween(self.instance, self.tweenInfo, {
			BackgroundTransparency = self.attributes.TransparencyGoal,
		})
	end
	function TransparencyAnimation:inactive()
		tween(self.instance, self.tweenInfo, {
			BackgroundTransparency = self.defaultTransparency,
		})
	end
	do
		-- (Flamework) TransparencyAnimation metadata
		Reflect.defineMetadata(TransparencyAnimation, "identifier", "common/src/client/components/ui/animations/transparency@TransparencyAnimation")
		Reflect.defineMetadata(TransparencyAnimation, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) TransparencyAnimation decorators
Reflect.decorate(TransparencyAnimation, "$c:components@Component", Component, { {
	tag = "TransparencyAnimation",
	defaults = {
		TransparencyGoal = 0.5,
		Speed = 0.35,
	},
	attributes = {
		TransparencyGoal = t.number,
		Speed = t.number,
	},
} })
return {
	TransparencyAnimation = TransparencyAnimation,
}
