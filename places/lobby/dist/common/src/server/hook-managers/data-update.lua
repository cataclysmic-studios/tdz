-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Service = _core.Service
local Modding = _core.Modding
local DataUpdateService
do
	DataUpdateService = setmetatable({}, {
		__tostring = function()
			return "DataUpdateService"
		end,
	})
	DataUpdateService.__index = DataUpdateService
	function DataUpdateService.new(...)
		local self = setmetatable({}, DataUpdateService)
		return self:constructor(...) or self
	end
	function DataUpdateService:constructor(database)
		self.database = database
	end
	function DataUpdateService:onStart()
		local dataUpdateListeners = {}
		Modding.onListenerAdded(function(object)
			local _object = object
			dataUpdateListeners[_object] = true
			return dataUpdateListeners
		end, "common/src/server/hooks@OnDataUpdate")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = dataUpdateListeners[_object] ~= nil
			dataUpdateListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/server/hooks@OnDataUpdate")
		self.database.updated:Connect(function(player, directory, value)
			for listener in dataUpdateListeners do
				listener:onDataUpdate(player, directory, value)
			end
		end)
	end
	do
		-- (Flamework) DataUpdateService metadata
		Reflect.defineMetadata(DataUpdateService, "identifier", "common/src/server/hook-managers/data-update@DataUpdateService")
		Reflect.defineMetadata(DataUpdateService, "flamework:parameters", { "common/src/server/services/third-party/database@DatabaseService" })
		Reflect.defineMetadata(DataUpdateService, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) DataUpdateService decorators
Reflect.decorate(DataUpdateService, "$:flamework@Service", Service, {})
return {
	DataUpdateService = DataUpdateService,
}
