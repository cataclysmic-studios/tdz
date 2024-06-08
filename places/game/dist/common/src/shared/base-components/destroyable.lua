-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local BaseComponent = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").BaseComponent
local Janitor = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "janitor", "src").Janitor
local DestroyableComponent
do
	local super = BaseComponent
	DestroyableComponent = setmetatable({}, {
		__tostring = function()
			return "DestroyableComponent"
		end,
		__index = super,
	})
	DestroyableComponent.__index = DestroyableComponent
	function DestroyableComponent.new(...)
		local self = setmetatable({}, DestroyableComponent)
		return self:constructor(...) or self
	end
	function DestroyableComponent:constructor(...)
		super.constructor(self, ...)
		self.janitor = Janitor.new()
	end
	function DestroyableComponent:destroy()
		self.janitor:Destroy()
	end
end
return {
	default = DestroyableComponent,
}
