-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local BaseComponent = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").BaseComponent
local Janitor = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "janitor", "src").Janitor
local BaseButtonAnimation
do
	local super = BaseComponent
	BaseButtonAnimation = setmetatable({}, {
		__tostring = function()
			return "BaseButtonAnimation"
		end,
		__index = super,
	})
	BaseButtonAnimation.__index = BaseButtonAnimation
	function BaseButtonAnimation:constructor(...)
		super.constructor(self, ...)
		self.includeClick = true
		self.janitor = Janitor.new()
		self.hovered = false
	end
	function BaseButtonAnimation:onStart()
		self.janitor:Add(self.instance.MouseEnter:Connect(function()
			self.hovered = true
			local _self = self
			local _result = _self.active
			if _result ~= nil then
				_result(_self)
			end
		end))
		self.janitor:Add(self.instance.MouseLeave:Connect(function()
			self.hovered = false
			local _self = self
			local _result = _self.inactive
			if _result ~= nil then
				_result(_self)
			end
		end))
		if self.includeClick then
			self.janitor:Add(self.instance.MouseButton1Down:Connect(function()
				self.hovered = false
				local _self = self
				local _result = _self.inactive
				if _result ~= nil then
					_result(_self)
				end
			end))
			self.janitor:Add(self.instance.MouseButton1Up:Connect(function()
				self.hovered = true
				local _self = self
				local _result = _self.active
				if _result ~= nil then
					_result(_self)
				end
			end))
		end
	end
end
return {
	default = BaseButtonAnimation,
}
