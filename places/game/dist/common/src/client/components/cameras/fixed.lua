-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Reflect = _core.Reflect
local Flamework = _core.Flamework
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CameraControllerComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "camera-controller-component").CameraControllerComponent
local FixedCamera
do
	local super = CameraControllerComponent
	FixedCamera = setmetatable({}, {
		__tostring = function()
			return "FixedCamera"
		end,
		__index = super,
	})
	FixedCamera.__index = FixedCamera
	function FixedCamera.new(...)
		local self = setmetatable({}, FixedCamera)
		return self:constructor(...) or self
	end
	function FixedCamera:constructor(...)
		super.constructor(self, ...)
	end
	function FixedCamera:create(controller)
		local components = Flamework.resolveDependency("$c:components@Components")
		local camera = World.CurrentCamera:Clone()
		camera.CameraType = Enum.CameraType.Scriptable
		camera.Name = "FixedCamera"
		camera.VRTiltAndRollEnabled = true
		camera.Parent = controller.cameraStorage
		return components:addComponent(camera, "common/src/client/components/cameras/fixed@FixedCamera")
	end
	function FixedCamera:toggle(on)
		super.toggle(self, on)
		Player.CameraMode = if on then Enum.CameraMode.Classic else Player.CameraMode
	end
	do
		-- (Flamework) FixedCamera metadata
		Reflect.defineMetadata(FixedCamera, "identifier", "common/src/client/components/cameras/fixed@FixedCamera")
	end
end
-- (Flamework) FixedCamera decorators
Reflect.decorate(FixedCamera, "$c:components@Component", Component, { {
	tag = "FixedCamera",
	attributes = {},
} })
return {
	FixedCamera = FixedCamera,
}
