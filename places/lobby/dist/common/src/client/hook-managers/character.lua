-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local _core = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out")
local Modding = _core.Modding
local Controller = _core.Controller
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CharacterAddController
do
	CharacterAddController = setmetatable({}, {
		__tostring = function()
			return "CharacterAddController"
		end,
	})
	CharacterAddController.__index = CharacterAddController
	function CharacterAddController.new(...)
		local self = setmetatable({}, CharacterAddController)
		return self:constructor(...) or self
	end
	function CharacterAddController:constructor()
	end
	function CharacterAddController:onStart()
		local addListeners = {}
		local removeListeners = {}
		Modding.onListenerAdded(function(object)
			local _object = object
			addListeners[_object] = true
			return addListeners
		end, "common/src/shared/hooks@OnCharacterAdd")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = addListeners[_object] ~= nil
			addListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/shared/hooks@OnCharacterAdd")
		Modding.onListenerAdded(function(object)
			local _object = object
			removeListeners[_object] = true
			return removeListeners
		end, "common/src/shared/hooks@OnCharacterRemove")
		Modding.onListenerRemoved(function(object)
			local _object = object
			-- ▼ Set.delete ▼
			local _valueExisted = removeListeners[_object] ~= nil
			removeListeners[_object] = nil
			-- ▲ Set.delete ▲
			return _valueExisted
		end, "common/src/shared/hooks@OnCharacterRemove")
		local characterAdded = TS.async(function(character)
			for listener in addListeners do
				listener:onCharacterAdd(character)
			end
		end)
		if Player.Character ~= nil then
			characterAdded(Player.Character)
		end
		Player.CharacterAdded:Connect(characterAdded)
		Player.CharacterRemoving:Connect(TS.async(function(model)
			for listener in removeListeners do
				listener:onCharacterRemove(model)
			end
		end))
	end
	do
		-- (Flamework) CharacterAddController metadata
		Reflect.defineMetadata(CharacterAddController, "identifier", "common/src/client/hook-managers/character@CharacterAddController")
		Reflect.defineMetadata(CharacterAddController, "flamework:implements", { "$:flamework@OnStart" })
	end
end
-- (Flamework) CharacterAddController decorators
Reflect.decorate(CharacterAddController, "$:flamework@Controller", Controller, { {
	loadOrder = 0,
} })
return {
	CharacterAddController = CharacterAddController,
}
