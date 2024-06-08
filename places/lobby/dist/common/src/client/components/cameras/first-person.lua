-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Reflect = _core.Reflect
local Flamework = _core.Flamework
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CameraControllerComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "camera-controller-component").CameraControllerComponent
local FirstPersonCamera
do
	local super = CameraControllerComponent
	FirstPersonCamera = setmetatable({}, {
		__tostring = function()
			return "FirstPersonCamera"
		end,
		__index = super,
	})
	FirstPersonCamera.__index = FirstPersonCamera
	function FirstPersonCamera.new(...)
		local self = setmetatable({}, FirstPersonCamera)
		return self:constructor(...) or self
	end
	function FirstPersonCamera:constructor(mouse, character)
		super.constructor(self)
		self.mouse = mouse
		self.character = character
	end
	function FirstPersonCamera:create(controller)
		local components = Flamework.resolveDependency("$c:components@Components")
		local camera = World.CurrentCamera:Clone()
		camera.Name = "FirstPersonCamera"
		camera.VRTiltAndRollEnabled = true
		camera.Parent = controller.cameraStorage
		return components:addComponent(camera, "common/src/client/components/cameras/first-person@FirstPersonCamera")
	end
	function FirstPersonCamera:onRender(dt)
		local character = self.character:get()
		if character == nil or self.character:getRoot() == nil then
			return nil
		end
		self.instance.CameraSubject = character.Humanoid
	end
	function FirstPersonCamera:toggle(on)
		super.toggle(self, on)
		self:onRender(0)
		self.mouse.behavior = if on then Enum.MouseBehavior.LockCenter else self.mouse.behavior
		Player.CameraMode = if on then Enum.CameraMode.LockFirstPerson else Player.CameraMode
	end
	do
		-- (Flamework) FirstPersonCamera metadata
		Reflect.defineMetadata(FirstPersonCamera, "identifier", "common/src/client/components/cameras/first-person@FirstPersonCamera")
		Reflect.defineMetadata(FirstPersonCamera, "flamework:parameters", { "common/src/client/controllers/mouse@MouseController", "common/src/client/controllers/character@CharacterController" })
	end
end
-- (Flamework) FirstPersonCamera decorators
Reflect.decorate(FirstPersonCamera, "$c:components@Component", Component, { {
	tag = "FirstPersonCamera",
	attributes = {},
} })
return {
	FirstPersonCamera = FirstPersonCamera,
}
