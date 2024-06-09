-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Service = _core.Service
local Modding = _core.Modding
local BaseComponent = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").BaseComponent
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local LoggingService
do
	LoggingService = setmetatable({}, {
		__tostring = function()
			return "LoggingService"
		end,
	})
	LoggingService.__index = LoggingService
	function LoggingService.new(...)
		local self = setmetatable({}, LoggingService)
		return self:constructor(...) or self
	end
	function LoggingService:constructor()
	end
	function LoggingService:onStart()
		Modding.onListenerAdded(function(object)
			return if TS.instanceof(object, BaseComponent) then Log.server_component(object) else Log.service(object)
		end, "common/src/shared/hooks@LogStart")
	end
	do
		-- (Flamework) LoggingService metadata
		Reflect.defineMetadata(LoggingService, "identifier", "common/src/server/hook-managers/logging@LoggingService")
		Reflect.defineMetadata(LoggingService, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) LoggingService decorators
Reflect.decorate(LoggingService, "$:flamework@Service", Service, { {
	loadOrder = 0,
} })
return {
	LoggingService = LoggingService,
}
