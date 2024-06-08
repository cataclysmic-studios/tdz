-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local isNaN = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "numbers").isNaN
return function(registry)
	registry:RegisterType("any", {
		Parse = function(value)
			if tonumber(value) ~= nil and not isNaN(tonumber(value)) then
				return tonumber(value)
			elseif value == "true" then
				return true
			elseif value == "false" then
				return false
			else
				local _value = value
				if table.find({ "undefined", "null", "nil" }, _value) ~= nil then
					return nil
				else
					return value
				end
			end
		end,
	})
end
