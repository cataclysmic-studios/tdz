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
local ScaleAnimation
do
	local super = ButtonTweenAnimation
	ScaleAnimation = setmetatable({}, {
		__tostring = function()
			return "ScaleAnimation"
		end,
		__index = super,
	})
	ScaleAnimation.__index = ScaleAnimation
	function ScaleAnimation.new(...)
		local self = setmetatable({}, ScaleAnimation)
		return self:constructor(...) or self
	end
	function ScaleAnimation:constructor(...)
		super.constructor(self, ...)
		self.scale = self.instance:FindFirstChildOfClass("UIScale") or Instance.new("UIScale", self.instance)
		self.defaultScale = self.scale.Scale
		self.scaleIncrement = self.attributes.ScaleIncrement
		self.tweenInfo = TweenInfoBuilder.new():SetEasingStyle(EasingStyle.Sine):SetTime(self.attributes.Speed)
	end
	function ScaleAnimation:onStart()
		super.onStart(self)
	end
	function ScaleAnimation:inactive()
		tween(self.scale, self.tweenInfo, {
			Scale = self.defaultScale,
		})
	end
	function ScaleAnimation:active()
		tween(self.scale, self.tweenInfo, {
			Scale = self.defaultScale + self.scaleIncrement,
		})
	end
	do
		-- (Flamework) ScaleAnimation metadata
		Reflect.defineMetadata(ScaleAnimation, "identifier", "common/src/client/components/ui/animations/scale@ScaleAnimation")
		Reflect.defineMetadata(ScaleAnimation, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) ScaleAnimation decorators
Reflect.decorate(ScaleAnimation, "$c:components@Component", Component, { {
	tag = "ScaleAnimation",
	defaults = {
		ScaleIncrement = 0.05,
		Speed = 0.35,
	},
	attributes = {
		ScaleIncrement = t.number,
		Speed = t.number,
	},
} })
return {
	ScaleAnimation = ScaleAnimation,
}
