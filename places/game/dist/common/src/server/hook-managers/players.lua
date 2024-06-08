-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Service = _core.Service
local Modding = _core.Modding
local Players = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Players
local PlayersService
do
	PlayersService = setmetatable({}, {
		__tostring = function()
			return "PlayersService"
		end,
	})
	PlayersService.__index = PlayersService
	function PlayersService.new(...)
		local self = setmetatable({}, PlayersService)
		return self:constructor(...) or self
	end
	function PlayersService:constructor()
	end
	function PlayersService:onStart()
		local joinListeners = {}
		local leaveListeners = {}
		Modding.onListenerAdded(function(object)
			local _object = object
			joinListeners[_object] = true
			return joinListeners
		end, "common/src/server/hooks@OnPlayerJoin")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = joinListeners[_object] ~= nil
			joinListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/server/hooks@OnPlayerJoin")
		Modding.onListenerAdded(function(object)
			local _object = object
			leaveListeners[_object] = true
			return leaveListeners
		end, "common/src/server/hooks@OnPlayerLeave")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = leaveListeners[_object] ~= nil
			leaveListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/server/hooks@OnPlayerLeave")
		Players.PlayerAdded:Connect(function(player)
			for listener in joinListeners do
				task.spawn(function()
					return listener:onPlayerJoin(player)
				end)
			end
		end)
		Players.PlayerRemoving:Connect(function(player)
			for listener in leaveListeners do
				task.spawn(function()
					return listener:onPlayerLeave(player)
				end)
			end
		end)
		for _, player in Players:GetPlayers() do
			for listener in joinListeners do
				task.spawn(function()
					return listener:onPlayerJoin(player)
				end)
			end
		end
	end
	do
		-- (Flamework) PlayersService metadata
		Reflect.defineMetadata(PlayersService, "identifier", "common/src/server/hook-managers/players@PlayersService")
		Reflect.defineMetadata(PlayersService, "flamework:implements", { "$:flamework@OnStart", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) PlayersService decorators
Reflect.decorate(PlayersService, "@flamework/core:out/flamework@Service", Service, { {
	loadOrder = 1,
} })
return {
	PlayersService = PlayersService,
}
