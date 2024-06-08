-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Controller = _core.Controller
local Modding = _core.Modding
local BaseComponent = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").BaseComponent
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local LoggingController
do
	LoggingController = setmetatable({}, {
		__tostring = function()
			return "LoggingController"
		end,
	})
	LoggingController.__index = LoggingController
	function LoggingController.new(...)
		local self = setmetatable({}, LoggingController)
		return self:constructor(...) or self
	end
	function LoggingController:constructor()
	end
	function LoggingController:onStart()
		Modding.onListenerAdded(function(object)
			return if TS.instanceof(object, BaseComponent) then Log.client_component(object) else Log.controller(object)
		end, "common/src/shared/hooks@LogStart")
	end
	do
		-- (Flamework) LoggingController metadata
		Reflect.defineMetadata(LoggingController, "identifier", "common/src/client/hook-managers/logging@LoggingController")
		Reflect.defineMetadata(LoggingController, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) LoggingController decorators
Reflect.decorate(LoggingController, "@flamework/core:out/flamework@Controller", Controller, {})
return {
	LoggingController = LoggingController,
}
