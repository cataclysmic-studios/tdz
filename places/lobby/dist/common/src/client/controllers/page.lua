-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local Lighting = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Lighting
local PageController
do
	PageController = setmetatable({}, {
		__tostring = function()
			return "PageController"
		end,
	})
	PageController.__index = PageController
	function PageController.new(...)
		local self = setmetatable({}, PageController)
		return self:constructor(...) or self
	end
	function PageController:constructor()
		self.blur = Instance.new("BlurEffect", Lighting)
	end
	function PageController:onInit()
		self.blur.Enabled = false
	end
	function PageController:set(destination, screen, exclusive, blur)
		local _exp = screen:GetChildren()
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _callback = function(i)
			return i:IsA("GuiObject") and not i:IsA("GuiButton")
		end
		local _length = 0
		for _k, _v in _exp do
			if _callback(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		local frames = _newValue
		local destinationFrame = screen:WaitForChild(destination)
		if exclusive then
			for _, frame in frames do
				if frame == destinationFrame then
					continue
				end
				frame.Visible = false
			end
		end
		self.blur.Enabled = blur
		destinationFrame.Visible = true
	end
	function PageController:toggleAll(screen, on)
		local _exp = screen:GetChildren()
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _callback = function(i)
			return i:IsA("GuiObject") and not i:IsA("GuiButton")
		end
		local _length = 0
		for _k, _v in _exp do
			if _callback(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		local frames = _newValue
		for _, frame in frames do
			frame.Visible = on
		end
	end
	do
		-- (Flamework) PageController metadata
		Reflect.defineMetadata(PageController, "identifier", "common/src/client/controllers/page@PageController")
		Reflect.defineMetadata(PageController, "flamework:implements", { "$:flamework@OnInit" })
	end
end
-- (Flamework) PageController decorators
Reflect.decorate(PageController, "$:flamework@Controller", Controller, {})
return {
	PageController = PageController,
}
