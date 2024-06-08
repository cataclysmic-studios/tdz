-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Service = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Service
local startsWith = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "string-utils").startsWith
local Signal = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "signal")
local _network = TS.import(script, game:GetService("ReplicatedStorage"), "common", "server", "network")
local CommonEvents = _network.CommonEvents
local CommonFunctions = _network.CommonFunctions
local INITIAL_DATA = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "data-models", "player-data").INITIAL_DATA
local Firebase = TS.import(script, game:GetService("ReplicatedStorage"), "common", "server", "firebase").default
local DatabaseService
do
	DatabaseService = setmetatable({}, {
		__tostring = function()
			return "DatabaseService"
		end,
	})
	DatabaseService.__index = DatabaseService
	function DatabaseService.new(...)
		local self = setmetatable({}, DatabaseService)
		return self:constructor(...) or self
	end
	function DatabaseService:constructor()
		self.loaded = Signal.new()
		self.updated = Signal.new()
		self.playerData = {}
	end
	function DatabaseService:onInit()
		CommonEvents.data.initialize:connect(function(player)
			return self:setup(player)
		end)
		CommonEvents.data.set:connect(function(player, directory, value)
			return self:set(player, directory, value)
		end)
		CommonEvents.data.increment:connect(function(player, directory, amount)
			return self:increment(player, directory, amount)
		end)
		CommonEvents.data.decrement:connect(function(player, directory, amount)
			return self:decrement(player, directory, amount)
		end)
		CommonEvents.data.addToArray:connect(function(player, directory, value)
			return self:addToArray(player, directory, value)
		end)
		CommonEvents.data.deleteFromArray:connect(function(player, directory, value)
			return self:deleteFromArray(player, directory, value)
		end)
		CommonFunctions.data.get:setCallback(function(player, directory, defaultValue)
			local _fn = self
			local _exp = player
			local _condition = directory
			if _condition == nil then
				_condition = ""
			end
			return _fn:get(_exp, _condition, defaultValue)
		end)
	end
	function DatabaseService:onStart()
		self.db = Firebase.new()
		self.playerData = self:getDatabase()
	end
	function DatabaseService:onPlayerLeave(player)
		self.db:set(`playerData/{player.UserId}`, self:getCached(player))
	end
	function DatabaseService:get(player, directory, defaultValue)
		local data = self:getCached(player)
		if directory == "" then
			return data
		end
		local pieces = string.split(directory, "/")
		for _, piece in pieces do
			data = (data or {})[piece]
		end
		local _condition = data
		if _condition == nil then
			_condition = defaultValue
		end
		return _condition
	end
	function DatabaseService:set(player, directory, value)
		local data = self:getCached(player)
		local pieces = string.split(directory, "/")
		local lastPiece = pieces[#pieces]
		for _, piece in pieces do
			if piece == lastPiece then
				continue
			end
			data = (data or {})[piece] or {}
		end
		data[lastPiece] = value
		self:update(player, self:getDirectoryForPlayer(player, directory), value)
	end
	function DatabaseService:increment(player, directory, amount)
		if amount == nil then
			amount = 1
		end
		local oldValue = self:get(player, directory, 0)
		local value = oldValue + amount
		self:set(player, directory, value)
		return value
	end
	function DatabaseService:decrement(player, directory, amount)
		if amount == nil then
			amount = 1
		end
		return self:increment(player, directory, -amount)
	end
	function DatabaseService:addToArray(player, directory, value)
		local array = self:get(player, directory, {})
		local _value = value
		table.insert(array, _value)
		self:set(player, directory, array)
	end
	function DatabaseService:deleteFromArray(player, directory, value)
		local array = self:get(player, directory)
		local _value = value
		local _arg0 = (table.find(array, _value) or 0) - 1
		table.remove(array, _arg0 + 1)
		self:set(player, directory, array)
	end
	function DatabaseService:filterFromArray(player, directory, filter)
		local array = self:get(player, directory, {})
		local _fn = self
		local _exp = player
		local _exp_1 = directory
		local _filter = filter
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in array do
			if _filter(_v, _k - 1, array) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		_fn:set(_exp, _exp_1, _newValue)
	end
	function DatabaseService:delete(player, directory)
		self:set(player, directory, nil)
	end
	function DatabaseService:getDatabase()
		return self.db:get("playerData", {})
	end
	function DatabaseService:getCached(player)
		return self.playerData[tostring(player.UserId)] or INITIAL_DATA
	end
	function DatabaseService:update(player, fullDirectory, value)
		self.updated:Fire(player, fullDirectory, value)
		CommonEvents.data.updated(player, fullDirectory, value)
	end
	function DatabaseService:setup(player)
		local data = self.db:get(`playerData/{player.UserId}`, table.clone(INITIAL_DATA))
		self.playerData[tostring(player.UserId)] = data
		self:initialize(player, "coins", 0)
		self:initialize(player, "ownedTowers", {})
		self:initialize(player, "lastLogin", 0)
		self:initialize(player, "loginStreak", 0)
		self:initialize(player, "claimedDaily", false)
		self:initializeSettings(player)
		self.loaded:Fire(player)
	end
	function DatabaseService:initializeSettings(player)
		self:initialize(player, "settings/general/autoskip", false)
		self:initialize(player, "settings/audio/sfx", 100)
		self:initialize(player, "settings/audio/music", 100)
		self:initialize(player, "settings/audio/ambience", 100)
		self:initialize(player, "settings/graphics/towerVFX", true)
	end
	function DatabaseService:initialize(player, directory, initialValue)
		self:set(player, directory, self:get(player, directory, initialValue))
	end
	function DatabaseService:getDirectoryForPlayer(player, directory)
		if startsWith(directory, `playerData/{player.UserId}/`) then
			return directory
		end
		return `playerData/{player.UserId}/{directory}`
	end
	do
		-- (Flamework) DatabaseService metadata
		Reflect.defineMetadata(DatabaseService, "identifier", "common/src/server/services/third-party/database@DatabaseService")
		Reflect.defineMetadata(DatabaseService, "flamework:implements", { "$:flamework@OnInit", "$:flamework@OnStart", "common/src/server/hooks@OnPlayerLeave", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) DatabaseService decorators
Reflect.decorate(DatabaseService, "@flamework/core:out/flamework@Service", Service, { {
	loadOrder = 0,
} })
return {
	DatabaseService = DatabaseService,
}
