-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Reflect = _core.Reflect
local Flamework = _core.Flamework
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CameraControllerComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "base-components", "camera-controller-component").CameraControllerComponent
local FlyOnTheWallCamera
do
	local super = CameraControllerComponent
	FlyOnTheWallCamera = setmetatable({}, {
		__tostring = function()
			return "FlyOnTheWallCamera"
		end,
		__index = super,
	})
	FlyOnTheWallCamera.__index = FlyOnTheWallCamera
	function FlyOnTheWallCamera.new(...)
		local self = setmetatable({}, FlyOnTheWallCamera)
		return self:constructor(...) or self
	end
	function FlyOnTheWallCamera:constructor(character)
		super.constructor(self)
		self.character = character
	end
	function FlyOnTheWallCamera:create(controller)
		local components = Flamework.resolveDependency("$c:components@Components")
		local camera = World.CurrentCamera:Clone()
		camera.CameraType = Enum.CameraType.Scriptable
		camera.Name = "FlyOnTheWallCamera"
		camera.Parent = controller.cameraStorage
		return components:addComponent(camera, "common/src/client/components/cameras/fly-on-the-wall@FlyOnTheWallCamera")
	end
	function FlyOnTheWallCamera:onRender(dt)
		local root = self.character:getRoot()
		if root == nil then
			return nil
		end
		self:lookAt(root.Position)
	end
	function FlyOnTheWallCamera:toggle(on)
		super.toggle(self, on)
		Player.CameraMode = if on then Enum.CameraMode.Classic else Player.CameraMode
	end
	do
		-- (Flamework) FlyOnTheWallCamera metadata
		Reflect.defineMetadata(FlyOnTheWallCamera, "identifier", "common/src/client/components/cameras/fly-on-the-wall@FlyOnTheWallCamera")
		Reflect.defineMetadata(FlyOnTheWallCamera, "flamework:parameters", { "common/src/client/controllers/character@CharacterController" })
		Reflect.defineMetadata(FlyOnTheWallCamera, "flamework:implements", { "$:flamework@OnRender" })
	end
end
-- (Flamework) FlyOnTheWallCamera decorators
Reflect.decorate(FlyOnTheWallCamera, "$c:components@Component", Component, { {
	tag = "FlyOnTheWallCamera",
	attributes = {},
} })
return {
	FlyOnTheWallCamera = FlyOnTheWallCamera,
}
