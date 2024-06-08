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
local GradientAnimation
do
	local super = ButtonTweenAnimation
	GradientAnimation = setmetatable({}, {
		__tostring = function()
			return "GradientAnimation"
		end,
		__index = super,
	})
	GradientAnimation.__index = GradientAnimation
	function GradientAnimation.new(...)
		local self = setmetatable({}, GradientAnimation)
		return self:constructor(...) or self
	end
	function GradientAnimation:constructor(...)
		super.constructor(self, ...)
		self.defaultOffset = self.instance.UIGradient.Offset
		self.tweenInfo = TweenInfoBuilder.new():SetEasingStyle(EasingStyle.Quad):SetTime(self.attributes.Speed)
	end
	function GradientAnimation:onStart()
		super.onStart(self)
	end
	function GradientAnimation:active()
		tween(self.instance.UIGradient, self.tweenInfo, {
			Offset = self.attributes.OffsetGoal,
		})
	end
	function GradientAnimation:inactive()
		tween(self.instance.UIGradient, self.tweenInfo, {
			Offset = self.defaultOffset,
		})
	end
	do
		-- (Flamework) GradientAnimation metadata
		Reflect.defineMetadata(GradientAnimation, "identifier", "common/src/client/components/ui/animations/gradient@GradientAnimation")
		Reflect.defineMetadata(GradientAnimation, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) GradientAnimation decorators
Reflect.decorate(GradientAnimation, "$c:components@Component", Component, { {
	tag = "GradientAnimation",
	defaults = {
		OffsetGoal = 0.15,
		Speed = 0.1,
	},
	attributes = {
		OffsetGoal = t.Vector2,
		Speed = t.number,
	},
	instanceGuard = t.intersection(t.instanceIsA("GuiButton"), t.children({
		UIGradient = t.instanceIsA("UIGradient"),
	})),
} })
return {
	GradientAnimation = GradientAnimation,
}
