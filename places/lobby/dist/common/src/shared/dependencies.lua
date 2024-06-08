-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Modding = _core.Modding
local Reflect = _core.Reflect
-- This file is for dependencies that aren't singletons or components
-- This type is to prevent type interning from TypeScript
--[[
	*
	 * The name of the dependency `Name` was injected into
	 
]]
--[[
	*
	 * Request the required metadata for lifecycle events and dependency resolution.
	 * @metadata flamework:implements flamework:parameters injectable
	 
]]
local Singleton = Modding.createDecorator("Class", function(descriptor)
	Reflect.defineMetadata(descriptor.object, "flamework:singleton", true)
end)
local function registerAll()
	Modding.registerDependency(function(ctor)
		return tostring(ctor)
	end, "common/src/shared/dependencies@Name")
end
return {
	registerAll = registerAll,
	Singleton = Singleton,
}
