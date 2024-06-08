-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local Spring = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "classes", "spring").default
local BaseButtonAnimation = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "base-button-animation").default
local SpringScaleAnimation
do
	local super = BaseButtonAnimation
	SpringScaleAnimation = setmetatable({}, {
		__tostring = function()
			return "SpringScaleAnimation"
		end,
		__index = super,
	})
	SpringScaleAnimation.__index = SpringScaleAnimation
	function SpringScaleAnimation.new(...)
		local self = setmetatable({}, SpringScaleAnimation)
		return self:constructor(...) or self
	end
	function SpringScaleAnimation:constructor(...)
		super.constructor(self, ...)
		self.scale = self.instance:FindFirstChildOfClass("UIScale") or Instance.new("UIScale", self.instance)
		self.defaultScale = self.scale.Scale
		self.scaleIncrement = self.attributes.SpringScaleAnimation_ScaleIncrement
		self.spring = Spring.new(self.attributes.SpringScaleAnimation_Mass, self.attributes.SpringScaleAnimation_Force, self.attributes.SpringScaleAnimation_Damping, self.attributes.SpringScaleAnimation_Speed)
		self.active = nil
		self.inactive = nil
	end
	function SpringScaleAnimation:onStart()
		super.onStart(self)
	end
	function SpringScaleAnimation:onRender(dt)
		if self.hovered then
			self.spring:shove(Vector3.new(self.scaleIncrement, 0, 0))
		end
		local movement = self.spring:update(dt)
		self.scale.Scale = self.defaultScale + movement.X
	end
	do
		-- (Flamework) SpringScaleAnimation metadata
		Reflect.defineMetadata(SpringScaleAnimation, "identifier", "common/src/client/components/ui/animations/spring-scale@SpringScaleAnimation")
		Reflect.defineMetadata(SpringScaleAnimation, "flamework:implements", { "$:flamework@OnStart", "$:flamework@OnRender" })
	end
end
-- (Flamework) SpringScaleAnimation decorators
Reflect.decorate(SpringScaleAnimation, "$c:components@Component", Component, { {
	tag = "SpringScaleAnimation",
	defaults = {
		SpringScaleAnimation_ScaleIncrement = 0.2,
		SpringScaleAnimation_Mass = 5,
		SpringScaleAnimation_Force = 100,
		SpringScaleAnimation_Damping = 3,
		SpringScaleAnimation_Speed = 7.5,
	},
	attributes = {
		SpringScaleAnimation_ScaleIncrement = t.number,
		SpringScaleAnimation_Mass = t.number,
		SpringScaleAnimation_Force = t.number,
		SpringScaleAnimation_Damping = t.number,
		SpringScaleAnimation_Speed = t.number,
	},
} })
return {
	SpringScaleAnimation = SpringScaleAnimation,
}
