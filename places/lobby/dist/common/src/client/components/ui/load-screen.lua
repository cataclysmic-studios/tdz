-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local TweenInfoBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").TweenInfoBuilder
local StarterGui = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").StarterGui
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local tween = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "ui").tween
local DestroyableComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "base-components", "destroyable").default
local LoadScreen
do
	local super = DestroyableComponent
	LoadScreen = setmetatable({}, {
		__tostring = function()
			return "LoadScreen"
		end,
		__index = super,
	})
	LoadScreen.__index = LoadScreen
	function LoadScreen.new(...)
		local self = setmetatable({}, LoadScreen)
		return self:constructor(...) or self
	end
	function LoadScreen:constructor(uiEffects)
		super.constructor(self)
		self.uiEffects = uiEffects
		self.background = self.instance.Background
	end
	function LoadScreen:onStart()
		self.janitor:LinkToInstance(self.instance, true)
		local logoSize = self.background.Logo:GetAttribute("DefaultSize")
		task.delay(self.attributes.LoadScreen_Delay, function()
			self:startLogoAnimation(logoSize)
			task.delay(self.attributes.LoadScreen_Lifetime, TS.async(function()
				TS.await(self.uiEffects:blackFade())
				StarterGui:SetCoreGuiEnabled("All", true)
				self.instance:Destroy()
			end))
		end)
	end
	function LoadScreen:startLogoAnimation(size)
		tween(self.background.Logo, TweenInfoBuilder.new():SetTime(1.25):SetEasingStyle(Enum.EasingStyle.Back), {
			Size = size,
		})
	end
	do
		-- (Flamework) LoadScreen metadata
		Reflect.defineMetadata(LoadScreen, "identifier", "common/src/client/components/ui/load-screen@LoadScreen")
		Reflect.defineMetadata(LoadScreen, "flamework:parameters", { "common/src/client/controllers/ui-effects@UIEffectsController" })
		Reflect.defineMetadata(LoadScreen, "flamework:implements", { "$:flamework@OnStart", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) LoadScreen decorators
Reflect.decorate(LoadScreen, "$c:components@Component", Component, { {
	tag = "LoadScreen",
	ancestorWhitelist = { PlayerGui },
	attributes = {
		LoadScreen_Delay = t.number,
		LoadScreen_Lifetime = t.number,
	},
	instanceGuard = t.intersection(t.instanceIsA("ScreenGui"), t.children({
		Background = t.intersection(t.instanceIsA("ImageLabel"), t.children({
			UIGradient = t.instanceIsA("UIGradient"),
			UIPadding = t.instanceIsA("UIPadding"),
			Spinner = t.intersection(t.instanceIsA("ImageLabel"), t.children({
				UIAspectRatioConstraint = t.instanceIsA("UIAspectRatioConstraint"),
				MiniSpinner = t.instanceIsA("ImageLabel"),
			})),
			Logo = t.intersection(t.instanceIsA("ImageLabel"), t.children({
				UIAspectRatioConstraint = t.instanceIsA("UIAspectRatioConstraint"),
			})),
		})),
	})),
} })
return {
	LoadScreen = LoadScreen,
}
