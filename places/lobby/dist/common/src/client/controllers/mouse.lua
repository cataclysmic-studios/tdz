-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local UIS = _services.UserInputService
local World = _services.Workspace
local RaycastParamsBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").RaycastParamsBuilder
local InputContext = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "gamejoy", "out").Context
local _Actions = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "gamejoy", "out", "Actions")
local Action = _Actions.Action
local Axis = _Actions.Axis
local Union = _Actions.Union
local Signal = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "signal")
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local _binding = math
local abs = _binding.abs
local MOUSE_RAY_DISTANCE = 1000
local MouseController
do
	MouseController = setmetatable({}, {
		__tostring = function()
			return "MouseController"
		end,
	})
	MouseController.__index = MouseController
	function MouseController.new(...)
		local self = setmetatable({}, MouseController)
		return self:constructor(...) or self
	end
	function MouseController:constructor()
		self.lmbUp = Signal.new()
		self.rmbUp = Signal.new()
		self.mmbUp = Signal.new()
		self.lmbDown = Signal.new()
		self.rmbDown = Signal.new()
		self.mmbDown = Signal.new()
		self.scrolled = Signal.new()
		self.isLmbDown = false
		self.isRmbDown = false
		self.isMmbDown = false
		self.behavior = Enum.MouseBehavior.Default
		self.playerMouse = Player:GetMouse()
		self.clickAction = Union.new({ "MouseButton1", "Touch" })
		self.rightClickAction = Action.new("MouseButton2")
		self.middleClickAction = Action.new("MouseButton3")
		self.scrollAction = Axis.new("MouseWheel")
		self.input = InputContext.new({
			ActionGhosting = 0,
			Process = false,
			RunSynchronously = false,
		})
	end
	function MouseController:onInit()
		-- Mouse controls
		self.input:Bind(self.clickAction, function()
			self.isLmbDown = true
			self.lmbDown:Fire()
		end):BindEvent("onLmbRelease", self.clickAction.Released, function()
			self.isLmbDown = false
		end)
		self.input:Bind(self.rightClickAction, function()
			self.isRmbDown = true
			self.rmbDown:Fire()
		end):BindEvent("onRmbRelease", self.rightClickAction.Released, function()
			self.isRmbDown = false
		end)
		self.input:Bind(self.scrollAction, function()
			return self.scrolled:Fire(-self.scrollAction.Position.Z)
		end):Bind(self.middleClickAction, function()
			self.isMmbDown = true
			self.mmbDown:Fire()
		end):BindEvent("onMmbRelease", self.middleClickAction.Released, function()
			self.isMmbDown = false
		end)
		-- Touch controls
		UIS.TouchPinch:Connect(function(_, scale)
			return self.scrolled:Fire((if scale < 1 then 1 else -1) * abs(scale - 2))
		end)
		UIS.TouchStarted:Connect(function()
			self.isLmbDown = true
			return self.isLmbDown
		end)
		UIS.TouchEnded:Connect(function()
			self.isLmbDown = false
			return self.isLmbDown
		end)
	end
	function MouseController:onRender(dt)
		if self.behavior == Enum.MouseBehavior.Default then
			return nil
		end
		UIS.MouseBehavior = self.behavior
	end
	function MouseController:getPosition()
		return UIS:GetMouseLocation()
	end
	function MouseController:getWorldPosition(distance)
		if distance == nil then
			distance = MOUSE_RAY_DISTANCE
		end
		local _binding_1 = UIS:GetMouseLocation()
		local X = _binding_1.X
		local Y = _binding_1.Y
		local _binding_2 = World.CurrentCamera:ViewportPointToRay(X, Y)
		local Origin = _binding_2.Origin
		local Direction = _binding_2.Direction
		local raycastResult = self:createRay(distance)
		local _result
		if raycastResult ~= nil then
			_result = raycastResult.Position
		else
			local _distance = distance
			local _arg0 = Direction * _distance
			_result = Origin + _arg0
		end
		return _result
	end
	function MouseController:target(distance)
		if distance == nil then
			distance = MOUSE_RAY_DISTANCE
		end
		local _result = self:createRay(distance)
		if _result ~= nil then
			_result = _result.Instance
		end
		return _result
	end
	function MouseController:getDelta()
		return UIS:GetMouseDelta()
	end
	function MouseController:setTargetFilter(filterInstance)
		self.playerMouse.TargetFilter = filterInstance
	end
	function MouseController:setIcon(icon)
		UIS.MouseIcon = icon
	end
	function MouseController:createRay(distance, filter)
		if filter == nil then
			filter = {}
		end
		local _binding_1 = UIS:GetMouseLocation()
		local X = _binding_1.X
		local Y = _binding_1.Y
		local _binding_2 = World.CurrentCamera:ViewportPointToRay(X, Y)
		local Origin = _binding_2.Origin
		local Direction = _binding_2.Direction
		local raycastParams = RaycastParamsBuilder.new():SetIgnoreWater(true):AddToFilter(unpack(filter)):Build()
		local _fn = World
		local _distance = distance
		return _fn:Raycast(Origin, Direction * _distance, raycastParams)
	end
	do
		-- (Flamework) MouseController metadata
		Reflect.defineMetadata(MouseController, "identifier", "common/src/client/controllers/mouse@MouseController")
		Reflect.defineMetadata(MouseController, "flamework:implements", { "$:flamework@OnInit", "$:flamework@OnRender" })
	end
end
-- (Flamework) MouseController decorators
Reflect.decorate(MouseController, "@flamework/core:out/flamework@Controller", Controller, {})
return {
	MouseController = MouseController,
}
