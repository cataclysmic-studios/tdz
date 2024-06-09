-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Controller = _core.Controller
local Modding = _core.Modding
local CommonEvents = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "network").CommonEvents
local DataUpdateController
do
	DataUpdateController = setmetatable({}, {
		__tostring = function()
			return "DataUpdateController"
		end,
	})
	DataUpdateController.__index = DataUpdateController
	function DataUpdateController.new(...)
		local self = setmetatable({}, DataUpdateController)
		return self:constructor(...) or self
	end
	function DataUpdateController:constructor()
	end
	function DataUpdateController:onStart()
		local dataUpdateListeners = {}
		Modding.onListenerAdded(function(object)
			local _object = object
			dataUpdateListeners[_object] = true
			return dataUpdateListeners
		end, "common/src/client/hooks@OnDataUpdate")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = dataUpdateListeners[_object] ~= nil
			dataUpdateListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/client/hooks@OnDataUpdate")
		CommonEvents.data.updated:connect(function(directory, value)
			for listener in dataUpdateListeners do
				listener:onDataUpdate(directory, value)
			end
		end)
	end
	do
		-- (Flamework) DataUpdateController metadata
		Reflect.defineMetadata(DataUpdateController, "identifier", "common/src/client/hook-managers/data-update@DataUpdateController")
		Reflect.defineMetadata(DataUpdateController, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) DataUpdateController decorators
Reflect.decorate(DataUpdateController, "$:flamework@Controller", Controller, { {
	loadOrder = 999,
} })
return {
	DataUpdateController = DataUpdateController,
}
