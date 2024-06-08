-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local _components = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out")
local Component = _components.Component
local BaseComponent = _components.BaseComponent
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local lerp = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "numbers").lerp
local _binding = math
local min = _binding.min
local Spin
do
	local super = BaseComponent
	Spin = setmetatable({}, {
		__tostring = function()
			return "Spin"
		end,
		__index = super,
	})
	Spin.__index = Spin
	function Spin.new(...)
		local self = setmetatable({}, Spin)
		return self:constructor(...) or self
	end
	function Spin:constructor(...)
		super.constructor(self, ...)
	end
	function Spin:onRender(dt)
		dt = min(dt, 1)
		self.instance.Rotation = lerp(self.instance.Rotation, self.instance.Rotation + self.attributes.Spin_DegreesPerSecond * dt * 60, 0.5)
	end
	do
		-- (Flamework) Spin metadata
		Reflect.defineMetadata(Spin, "identifier", "common/src/client/components/ui/spin@Spin")
		Reflect.defineMetadata(Spin, "flamework:implements", { "$:flamework@OnRender" })
	end
end
-- (Flamework) Spin decorators
Reflect.decorate(Spin, "$c:components@Component", Component, { {
	tag = "Spin",
	ancestorWhitelist = { PlayerGui },
	defaults = {
		Spin_DegreesPerSecond = 5,
	},
	attributes = {
		Spin_DegreesPerSecond = t.number,
	},
	instanceGuard = t.instanceIsA("GuiObject"),
} })
return {
	Spin = Spin,
}
