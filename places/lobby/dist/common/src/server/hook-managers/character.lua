-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Modding = _core.Modding
local Service = _core.Service
local CharacterAddService
do
	CharacterAddService = setmetatable({}, {
		__tostring = function()
			return "CharacterAddService"
		end,
	})
	CharacterAddService.__index = CharacterAddService
	function CharacterAddService.new(...)
		local self = setmetatable({}, CharacterAddService)
		return self:constructor(...) or self
	end
	function CharacterAddService:constructor()
		self.addListeners = {}
		self.removeListeners = {}
	end
	function CharacterAddService:onStart()
		Modding.onListenerAdded(function(object)
			local _addListeners = self.addListeners
			local _object = object
			_addListeners[_object] = true
			return _addListeners
		end, "common/src/shared/hooks@OnCharacterAdd")
		Modding.onListenerRemoved(function(object)
			local _addListeners = self.addListeners
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = _addListeners[_object] ~= nil
			_addListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/shared/hooks@OnCharacterAdd")
		Modding.onListenerAdded(function(object)
			local _removeListeners = self.removeListeners
			local _object = object
			_removeListeners[_object] = true
			return _removeListeners
		end, "common/src/shared/hooks@OnCharacterRemove")
		Modding.onListenerRemoved(function(object)
			local _removeListeners = self.removeListeners
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = _removeListeners[_object] ~= nil
			_removeListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/shared/hooks@OnCharacterRemove")
	end
	function CharacterAddService:onPlayerJoin(player)
		if player.Character ~= nil then
			self:characterAdded(player.Character)
		end
		player.CharacterAdded:Connect(function(character)
			return self:characterAdded(character)
		end)
		player.CharacterRemoving:Connect(TS.async(function(model)
			for listener in self.removeListeners do
				listener:onCharacterRemove(model)
			end
		end))
	end
	CharacterAddService.characterAdded = TS.async(function(self, character)
		for listener in self.addListeners do
			listener:onCharacterAdd(character)
		end
	end)
	do
		-- (Flamework) CharacterAddService metadata
		Reflect.defineMetadata(CharacterAddService, "identifier", "common/src/server/hook-managers/character@CharacterAddService")
		Reflect.defineMetadata(CharacterAddService, "flamework:implements", { "$:flamework@OnStart", "common/src/server/hooks@OnPlayerJoin" })
	end
end
-- (Flamework) CharacterAddService decorators
Reflect.decorate(CharacterAddService, "$:flamework@Service", Service, { {
	loadOrder = 0,
} })
return {
	CharacterAddService = CharacterAddService,
}
