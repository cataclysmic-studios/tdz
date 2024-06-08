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
local RotationAnimation
do
	local super = ButtonTweenAnimation
	RotationAnimation = setmetatable({}, {
		__tostring = function()
			return "RotationAnimation"
		end,
		__index = super,
	})
	RotationAnimation.__index = RotationAnimation
	function RotationAnimation.new(...)
		local self = setmetatable({}, RotationAnimation)
		return self:constructor(...) or self
	end
	function RotationAnimation:constructor(...)
		super.constructor(self, ...)
		self.defaultRotation = self.instance.Rotation
		self.includeClick = false
		self.tweenInfo = TweenInfoBuilder.new():SetEasingStyle(EasingStyle.Quad):SetTime(self.attributes.Speed)
	end
	function RotationAnimation:onStart()
		super.onStart(self)
	end
	function RotationAnimation:active()
		tween(self.instance, self.tweenInfo, {
			Rotation = self.attributes.RotationGoal,
		})
	end
	function RotationAnimation:inactive()
		tween(self.instance, self.tweenInfo, {
			Rotation = self.defaultRotation,
		})
	end
	do
		-- (Flamework) RotationAnimation metadata
		Reflect.defineMetadata(RotationAnimation, "identifier", "common/src/client/components/ui/animations/rotation@RotationAnimation")
		Reflect.defineMetadata(RotationAnimation, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) RotationAnimation decorators
Reflect.decorate(RotationAnimation, "$c:components@Component", Component, { {
	tag = "RotationAnimation",
	defaults = {
		RotationGoal = 15,
		Speed = 0.35,
	},
	attributes = {
		RotationGoal = t.number,
		Speed = t.number,
	},
} })
return {
	RotationAnimation = RotationAnimation,
}
