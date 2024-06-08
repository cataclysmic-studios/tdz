-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local Component = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out").Component
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local DestroyableComponent = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "base-components", "destroyable").default
local PageRoute
do
	local super = DestroyableComponent
	PageRoute = setmetatable({}, {
		__tostring = function()
			return "PageRoute"
		end,
		__index = super,
	})
	PageRoute.__index = PageRoute
	function PageRoute.new(...)
		local self = setmetatable({}, PageRoute)
		return self:constructor(...) or self
	end
	function PageRoute:constructor(page)
		super.constructor(self)
		self.page = page
	end
	function PageRoute:onStart()
		self.janitor:Add(self.instance.MouseButton1Click:Connect(function()
			return self.page:set(self.attributes.PageRoute_Destination, self.attributes.PageRoute_Exclusive, self.instance:FindFirstAncestorOfClass("ScreenGui"))
		end))
	end
	do
		-- (Flamework) PageRoute metadata
		Reflect.defineMetadata(PageRoute, "identifier", "common/src/client/components/ui/page-route@PageRoute")
		Reflect.defineMetadata(PageRoute, "flamework:parameters", { "common/src/client/controllers/page@PageController" })
		Reflect.defineMetadata(PageRoute, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) PageRoute decorators
Reflect.decorate(PageRoute, "$c:components@Component", Component, { {
	tag = "PageRoute",
	ancestorWhitelist = { PlayerGui },
	defaults = {
		PageRoute_Exclusive = true,
	},
	attributes = {
		PageRoute_Destination = t.string,
		PageRoute_Exclusive = t.boolean,
	},
	instanceGuard = t.instanceIsA("GuiButton"),
} })
return {
	PageRoute = PageRoute,
}
