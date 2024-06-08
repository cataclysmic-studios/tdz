-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
--[[
	*
	 * Generates a [mapping] decorator, and map, for the given object type and constructor arguments
	 
]]
local function createMappingDecorator()
	local map = {}
	local decorator = function(ctor)
		local _arg0 = tostring(ctor)
		local _ctor = ctor
		map[_arg0] = _ctor
		local _ = map
		return nil
	end
	return { map, decorator }
end
local getName = function(obj)
	return string.split((Reflect.getMetadatas(obj, "identifier")[1]), "@")[2]
end
return {
	createMappingDecorator = createMappingDecorator,
	getName = getName,
}
