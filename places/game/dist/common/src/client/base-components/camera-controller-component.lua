-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local BaseComponent = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").BaseComponent
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local _binding = math
local rad = _binding.rad
local CameraControllerComponent
do
	local super = BaseComponent
	CameraControllerComponent = setmetatable({}, {
		__tostring = function()
			return "CameraControllerComponent"
		end,
		__index = super,
	})
	CameraControllerComponent.__index = CameraControllerComponent
	function CameraControllerComponent.new(...)
		local self = setmetatable({}, CameraControllerComponent)
		return self:constructor(...) or self
	end
	function CameraControllerComponent:constructor(...)
		super.constructor(self, ...)
		self.offsets = {}
	end
	function CameraControllerComponent:toggle(on)
		World.CurrentCamera = if on then self.instance else World.CurrentCamera
	end
	function CameraControllerComponent:setCFrame(cframe)
		self.instance.CFrame = cframe
	end
	function CameraControllerComponent:setPosition(position)
		self:setCFrame(CFrame.new(position))
	end
	function CameraControllerComponent:setOrientation(orientation)
		local _fn = self
		local _cFrame = self.instance.CFrame
		local _arg0 = CFrame.Angles(rad(orientation.X), rad(orientation.Y), rad(orientation.Z))
		_fn:setCFrame(_cFrame * _arg0)
	end
	function CameraControllerComponent:lookAt(position)
		self:setCFrame(CFrame.lookAt(self.instance.CFrame.Position, position))
	end
end
return {
	CameraControllerComponent = CameraControllerComponent,
}
