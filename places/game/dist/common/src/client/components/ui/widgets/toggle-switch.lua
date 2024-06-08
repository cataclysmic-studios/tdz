-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local TweenInfoBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").TweenInfoBuilder
local Signal = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "signal")
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local tween = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "ui").tween
local DestroyableComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "base-components", "destroyable").default
local ToggleSwitch
do
	local super = DestroyableComponent
	ToggleSwitch = setmetatable({}, {
		__tostring = function()
			return "ToggleSwitch"
		end,
		__index = super,
	})
	ToggleSwitch.__index = ToggleSwitch
	function ToggleSwitch.new(...)
		local self = setmetatable({}, ToggleSwitch)
		return self:constructor(...) or self
	end
	function ToggleSwitch:constructor(...)
		super.constructor(self, ...)
		self.toggled = Signal.new()
		self.tweenInfo = TweenInfoBuilder.new():SetTime(0.2):SetEasingStyle(Enum.EasingStyle.Cubic):SetEasingDirection(Enum.EasingDirection.Out)
		self.on = self.attributes.ToggleSwitch_InitialState
	end
	function ToggleSwitch:onStart()
		self:toggle(self.on)
		self.janitor:Add(self.instance.MouseButton1Click:Connect(function()
			return self:toggle(not self.on)
		end))
	end
	function ToggleSwitch:toggle(on)
		self.on = on
		self.toggled:Fire(self.on)
		local color = if self.on then self.attributes.ToggleSwitch_EnabledColor else self.attributes.ToggleSwitch_DisabledColor
		tween(self.instance, self.tweenInfo, {
			BackgroundColor3 = color,
		})
		tween(self.instance.Node, self.tweenInfo, {
			AnchorPoint = Vector2.new(if on then 1 else 0, 0.5),
			Position = UDim2.fromScale(if on then 1 else 0, 0.5),
		})
	end
	do
		-- (Flamework) ToggleSwitch metadata
		Reflect.defineMetadata(ToggleSwitch, "identifier", "common/src/client/components/ui/widgets/toggle-switch@ToggleSwitch")
		Reflect.defineMetadata(ToggleSwitch, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) ToggleSwitch decorators
Reflect.decorate(ToggleSwitch, "$c:components@Component", Component, { {
	tag = "ToggleSwitch",
	ancestorWhitelist = { PlayerGui },
	defaults = {
		ToggleSwitch_InitialState = false,
		ToggleSwitch_EnabledColor = Color3.fromRGB(70, 224, 120),
		ToggleSwitch_DisabledColor = Color3.fromRGB(200, 200, 200),
	},
	attributes = {
		ToggleSwitch_InitialState = t.boolean,
		ToggleSwitch_EnabledColor = t.Color3,
		ToggleSwitch_DisabledColor = t.Color3,
	},
	instanceGuard = t.intersection(t.instanceIsA("ImageButton"), t.children({
		Node = t.instanceIsA("Frame"),
	})),
} })
return {
	ToggleSwitch = ToggleSwitch,
}
