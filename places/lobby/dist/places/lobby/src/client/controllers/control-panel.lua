-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local InputContext = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "gamejoy", "out").Context
local Runtime = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
local Object = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "object-utils")
local Iris = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "iris", "out")
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local DEVELOPERS = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "constants").DEVELOPERS
local ControlPanelController
do
	ControlPanelController = setmetatable({}, {
		__tostring = function()
			return "ControlPanelController"
		end,
	})
	ControlPanelController.__index = ControlPanelController
	function ControlPanelController.new(...)
		local self = setmetatable({}, ControlPanelController)
		return self:constructor(...) or self
	end
	function ControlPanelController:constructor(camera, mouse)
		self.camera = camera
		self.mouse = mouse
		self.input = InputContext.new({
			ActionGhosting = 0,
			Process = false,
			RunSynchronously = true,
		})
	end
	ControlPanelController.onStart = TS.async(function(self)
		local windowSize = Vector2.new(300, 400)
		local open = false
		self.input:Bind("Comma", function()
			local _condition = not Runtime:IsStudio()
			if _condition then
				local _userId = Player.UserId
				_condition = not (table.find(DEVELOPERS, _userId) ~= nil)
			end
			if _condition then
				return nil
			end
			open = not open
		end):Bind("P", function()
			local _condition = not Runtime:IsStudio()
			if _condition then
				local _userId = Player.UserId
				_condition = not (table.find(DEVELOPERS, _userId) ~= nil)
			end
			if _condition then
				return nil
			end
			self.mouse.behavior = if self.mouse.behavior == Enum.MouseBehavior.Default then Enum.MouseBehavior.LockCenter else Enum.MouseBehavior.Default
			Player.CameraMode = if Player.CameraMode == Enum.CameraMode.LockFirstPerson then Enum.CameraMode.Classic else Enum.CameraMode.LockFirstPerson
		end)
		Iris.Init()
		Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark)
		Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear)
		Iris:Connect(function()
			if not open then
				return nil
			end
			Iris.Window({ "Control Panel" }, {
				size = Iris.State(windowSize),
			})
			self:renderCameraTab()
			Iris.End()
		end)
	end)
	function ControlPanelController:renderCameraTab()
		Iris.Tree({ "Camera" })
		local currentCamera = self.camera:get().instance
		local fov = Iris.SliderNum({ "FOV", 0.25, 1, 120 }, {
			number = Iris.State(currentCamera.FieldOfView),
		})
		if fov.numberChanged() then
			currentCamera.FieldOfView = fov.state.number:get()
		end
		local _exp = Object.keys(self.camera.cameras)
		table.sort(_exp)
		local cameraComponents = _exp
		local componentIndex = Iris.State(self.camera.currentName)
		Iris.Combo({ "Camera Component" }, {
			index = componentIndex,
		})
		for _, component in cameraComponents do
			Iris.Selectable({ component, component }, {
				index = componentIndex,
			})
		end
		Iris.End()
		if self.camera.currentName ~= componentIndex:get() then
			self.camera:set(componentIndex:get())
		end
		Iris.End()
	end
	function ControlPanelController:renderSpringSettings(spring, prefix)
		Iris.Tree({ (if prefix ~= nil then prefix .. " " else "") .. "Spring" })
		do
			local mass = Iris.SliderNum({ "Spring Mass", 0.25, 0.25, 100 }, {
				number = Iris.State(spring.mass),
			})
			if mass.numberChanged() then
				spring.mass = mass.state.number:get()
			end
			local force = Iris.SliderNum({ "Spring Force", 0.25, 0.25, 100 }, {
				number = Iris.State(spring.force),
			})
			if force.numberChanged() then
				spring.force = force.state.number:get()
			end
			local damping = Iris.SliderNum({ "Spring Damping", 0.25, 0.25, 100 }, {
				number = Iris.State(spring.damping),
			})
			if damping.numberChanged() then
				spring.damping = damping.state.number:get()
			end
			local speed = Iris.SliderNum({ "Spring Speed", 0.25, 0.25, 100 }, {
				number = Iris.State(spring.speed),
			})
			if mass.numberChanged() then
				spring.speed = speed.state.number:get()
			end
		end
		Iris.End()
	end
	function ControlPanelController:renderWaveSettings(wave, prefix)
		local _fn = Iris
		local _condition = prefix
		if _condition == nil then
			_condition = "Sine"
		end
		_fn.Tree({ _condition .. " " .. "Wave" })
		do
			local useSin = Iris.Checkbox({ "Is Sine Wave?" }, {
				isChecked = Iris.State(wave.waveFunction == math.sin),
			})
			if useSin.checked() then
				wave.waveFunction = math.sin
			end
			if useSin.unchecked() then
				wave.waveFunction = math.cos
			end
			local amplitude = Iris.SliderNum({ "Amplitude", 0.05, 0.1, 10 }, {
				number = Iris.State(wave.amplitude),
			})
			if amplitude.numberChanged() then
				wave.amplitude = amplitude.state.number:get()
			end
			local frequency = Iris.SliderNum({ "Frequency", 0.05, 0, 10 }, {
				number = Iris.State(wave.frequency),
			})
			if frequency.numberChanged() then
				wave.frequency = frequency.state.number:get()
			end
			local phaseShift = Iris.SliderNum({ "Phase Shift", 0.01, 0, 5 }, {
				number = Iris.State(wave.phaseShift),
			})
			if phaseShift.numberChanged() then
				wave.phaseShift = phaseShift.state.number:get()
			end
			local verticalShift = Iris.SliderNum({ "Vertical Shift", 0.01, 0, 5 }, {
				number = Iris.State(wave.verticalShift),
			})
			if verticalShift.numberChanged() then
				wave.verticalShift = verticalShift.state.number:get()
			end
		end
		Iris.End()
	end
	do
		-- (Flamework) ControlPanelController metadata
		Reflect.defineMetadata(ControlPanelController, "identifier", "places/lobby/src/client/controllers/control-panel@ControlPanelController")
		Reflect.defineMetadata(ControlPanelController, "flamework:parameters", { "common/src/client/controllers/camera@CameraController", "common/src/client/controllers/mouse@MouseController" })
		Reflect.defineMetadata(ControlPanelController, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) ControlPanelController decorators
Reflect.decorate(ControlPanelController, "@flamework/core:out/flamework@Controller", Controller, {})
return {
	ControlPanelController = ControlPanelController,
}
