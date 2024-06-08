-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Controller = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Controller
local Player = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").Player
local CharacterController
do
	CharacterController = setmetatable({}, {
		__tostring = function()
			return "CharacterController"
		end,
	})
	CharacterController.__index = CharacterController
	function CharacterController.new(...)
		local self = setmetatable({}, CharacterController)
		return self:constructor(...) or self
	end
	function CharacterController:constructor()
	end
	function CharacterController:get()
		return Player.Character
	end
	function CharacterController:waitFor()
		return (Player.CharacterAdded:Wait())
	end
	function CharacterController:mustGet()
		return self:get() or self:waitFor()
	end
	function CharacterController:getRoot()
		local _result = self:getHumanoid()
		if _result ~= nil then
			_result = _result.RootPart
		end
		return _result
	end
	function CharacterController:mustGetRoot()
		return self:mustGetHumanoid().RootPart
	end
	function CharacterController:getHumanoid()
		local _result = self:get()
		if _result ~= nil then
			_result = _result.Humanoid
		end
		return _result
	end
	function CharacterController:mustGetHumanoid()
		return self:mustGet().Humanoid
	end
	do
		-- (Flamework) CharacterController metadata
		Reflect.defineMetadata(CharacterController, "identifier", "common/src/client/controllers/character@CharacterController")
	end
end
-- (Flamework) CharacterController decorators
Reflect.decorate(CharacterController, "@flamework/core:out/flamework@Controller", Controller, {})
return {
	CharacterController = CharacterController,
}
