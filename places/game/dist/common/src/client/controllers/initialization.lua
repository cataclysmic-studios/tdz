-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local CommonEvents = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "network").CommonEvents
local InitializationController
do
	InitializationController = setmetatable({}, {
		__tostring = function()
			return "InitializationController"
		end,
	})
	InitializationController.__index = InitializationController
	function InitializationController.new(...)
		local self = setmetatable({}, InitializationController)
		return self:constructor(...) or self
	end
	function InitializationController:constructor(camera)
		self.camera = camera
	end
	function InitializationController:onStart()
		self.camera:set("Default")
		CommonEvents.data.initialize()
	end
	do
		-- (Flamework) InitializationController metadata
		Reflect.defineMetadata(InitializationController, "identifier", "common/src/client/controllers/initialization@InitializationController")
		Reflect.defineMetadata(InitializationController, "flamework:parameters", { "common/src/client/controllers/camera@CameraController" })
		Reflect.defineMetadata(InitializationController, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) InitializationController decorators
Reflect.decorate(InitializationController, "@flamework/core:out/flamework@Controller", Controller, { {
	loadOrder = 1000,
} })
return {
	InitializationController = InitializationController,
}
