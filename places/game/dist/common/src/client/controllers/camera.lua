-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local DefaultCamera = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "components", "cameras", "default").DefaultCamera
local FirstPersonCamera = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "components", "cameras", "first-person").FirstPersonCamera
local FixedCamera = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "components", "cameras", "fixed").FixedCamera
local FlyOnTheWallCamera = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "components", "cameras", "fly-on-the-wall").FlyOnTheWallCamera
-- add new camera components here
local CameraController
do
	CameraController = setmetatable({}, {
		__tostring = function()
			return "CameraController"
		end,
	})
	CameraController.__index = CameraController
	function CameraController.new(...)
		local self = setmetatable({}, CameraController)
		return self:constructor(...) or self
	end
	function CameraController:constructor()
		self.cameraStorage = Instance.new("Actor", World)
	end
	function CameraController:onInit()
		self.cameraStorage.Name = "Cameras"
		self.cameras = {
			Default = DefaultCamera:create(self),
			FirstPerson = FirstPersonCamera:create(self),
			Fixed = FixedCamera:create(self),
			FlyOnTheWall = FlyOnTheWallCamera:create(self),
		}
	end
	function CameraController:onRender(dt)
		local camera = self:get()
		local _condition = camera ~= nil and camera.onRender ~= nil
		if _condition then
			local _onRender = camera.onRender
			_condition = typeof(_onRender) == "function"
		end
		if _condition then
			local update = camera.onRender
			update(camera, dt)
		end
	end
	function CameraController:set(cameraName)
		self.currentName = cameraName
		for otherCameraName in pairs(self.cameras) do
			self:get(otherCameraName):toggle(cameraName == otherCameraName)
		end
	end
	function CameraController:get(cameraName)
		if cameraName == nil then
			cameraName = self.currentName
		end
		return self.cameras[cameraName]
	end
	do
		-- (Flamework) CameraController metadata
		Reflect.defineMetadata(CameraController, "identifier", "common/src/client/controllers/camera@CameraController")
		Reflect.defineMetadata(CameraController, "flamework:implements", { "$:flamework@OnInit", "$:flamework@OnRender", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) CameraController decorators
Reflect.decorate(CameraController, "@flamework/core:out/flamework@Controller", Controller, {})
return {
	CameraController = CameraController,
}
