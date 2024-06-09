-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local TweenInfoBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").TweenInfoBuilder
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local tween = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "ui").tween
local UIEffectsController
do
	UIEffectsController = setmetatable({}, {
		__tostring = function()
			return "UIEffectsController"
		end,
	})
	UIEffectsController.__index = UIEffectsController
	function UIEffectsController.new(...)
		local self = setmetatable({}, UIEffectsController)
		return self:constructor(...) or self
	end
	function UIEffectsController:constructor()
		self.screen = Instance.new("ScreenGui", PlayerGui)
		self.blackFrame = Instance.new("Frame", self.screen)
	end
	function UIEffectsController:onInit()
		self.screen.Name = "UIEffects"
		self.screen.DisplayOrder = 10
		self.screen.ScreenInsets = Enum.ScreenInsets.DeviceSafeInsets
		self.blackFrame.Name = "Black"
		self.blackFrame.Size = UDim2.fromScale(1, 1)
		self.blackFrame.BackgroundColor3 = Color3.new()
		self.blackFrame.Transparency = 1
	end
	UIEffectsController.blackFade = TS.async(function(self, manualDisable, timeBetween, fadeTime)
		if manualDisable == nil then
			manualDisable = false
		end
		if timeBetween == nil then
			timeBetween = 0.5
		end
		if fadeTime == nil then
			fadeTime = 0.65
		end
		local info = TweenInfoBuilder.new():SetTime(fadeTime):SetEasingStyle(Enum.EasingStyle.Sine)
		local toggle = function(on)
			return tween(self.blackFrame, info, {
				Transparency = if on then 0 else 1,
			})
		end
		local fadeIn = toggle(true)
		fadeIn.Completed:Wait()
		fadeIn:Destroy()
		task.wait(timeBetween)
		if not manualDisable then
			toggle(false)
		end
		return TS.Promise.new(function(resolve)
			local _fn = resolve
			local _result
			if manualDisable == true then
				_result = function()
					return toggle(false)
				end
			else
				local _ = 0
				_result = nil
			end
			return _fn(_result)
		end)
	end)
	do
		-- (Flamework) UIEffectsController metadata
		Reflect.defineMetadata(UIEffectsController, "identifier", "common/src/client/controllers/ui-effects@UIEffectsController")
		Reflect.defineMetadata(UIEffectsController, "flamework:implements", { "$:flamework@OnInit", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) UIEffectsController decorators
Reflect.decorate(UIEffectsController, "$:flamework@Controller", Controller, {})
return {
	UIEffectsController = UIEffectsController,
}
