-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Reflect = _core.Reflect
local Flamework = _core.Flamework
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CameraControllerComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "camera-controller-component").CameraControllerComponent
local DefaultCamera
do
	local super = CameraControllerComponent
	DefaultCamera = setmetatable({}, {
		__tostring = function()
			return "DefaultCamera"
		end,
		__index = super,
	})
	DefaultCamera.__index = DefaultCamera
	function DefaultCamera.new(...)
		local self = setmetatable({}, DefaultCamera)
		return self:constructor(...) or self
	end
	function DefaultCamera:constructor(...)
		super.constructor(self, ...)
	end
	function DefaultCamera:create(controller)
		local components = Flamework.resolveDependency("$c:components@Components")
		local camera = World.CurrentCamera
		camera.Name = "DefaultCamera"
		camera.Parent = controller.cameraStorage
		return components:addComponent(camera, "common/src/client/components/cameras/default@DefaultCamera")
	end
	function DefaultCamera:toggle(on)
		super.toggle(self, on)
		Player.CameraMode = if on then Enum.CameraMode.Classic else Player.CameraMode
	end
	do
		-- (Flamework) DefaultCamera metadata
		Reflect.defineMetadata(DefaultCamera, "identifier", "common/src/client/components/cameras/default@DefaultCamera")
	end
end
-- (Flamework) DefaultCamera decorators
Reflect.decorate(DefaultCamera, "$c:components@Component", Component, { {
	tag = "DefaultCamera",
	attributes = {},
} })
return {
	DefaultCamera = DefaultCamera,
}
