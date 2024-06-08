-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Runtime = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").RunService
local flatten = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "array").flatten
local getInstancePath = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "instances").getInstancePath
local getName = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "meta").getName
local repr = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "repr")
local DISABLED = {}
local log = function(category, ...)
	local messages = { ... }
	if DISABLED[category] then
		return nil
	end
	local prefix = `[{(string.gsub(string.upper(category), "_", " "))}]:`
	if category == "fatal" then
		local _exp = flatten(messages)
		-- ▼ ReadonlyArray.map ▼
		local _newValue = table.create(#_exp)
		local _callback = function(v)
			local _v = v
			return if typeof(_v) == "table" then repr(v) else v
		end
		for _k, _v in _exp do
			_newValue[_k] = _callback(_v, _k - 1, _exp)
		end
		-- ▲ ReadonlyArray.map ▲
		-- ▼ ReadonlyArray.join ▼
		local _result = table.create(#_newValue)
		for _k, _v in _newValue do
			_result[_k] = tostring(_v)
		end
		-- ▲ ReadonlyArray.join ▲
		error(`{prefix} {table.concat(_result, " ")}`, 0)
	else
		print(prefix, unpack(messages))
	end
end
local Log
local Log = {}
do
	local _container = Log
	local Exception
	do
		Exception = setmetatable({}, {
			__tostring = function()
				return "Exception"
			end,
		})
		Exception.__index = Exception
		function Exception.new(...)
			local self = setmetatable({}, Exception)
			return self:constructor(...) or self
		end
		function Exception:constructor(name, message, level)
			self.message = message
			self.level = level
			Log.fatal(`{name}Exception: {message}`)
		end
	end
	_container.Exception = Exception
	local function debug(...)
		local messages = { ... }
		if not Runtime:IsStudio() then
			return nil
		end
		log("debug", unpack(messages))
	end
	_container.debug = debug
	local function info(...)
		local messages = { ... }
		log("info", unpack(messages))
	end
	_container.info = info
	local function warning(...)
		local messages = { ... }
		log("warning", unpack(messages))
	end
	_container.warning = warning
	local function fatal(...)
		local messages = { ... }
		log("fatal", unpack(messages))
	end
	_container.fatal = fatal
	--[[
		*
		     * @param name Name of the component class
		     * @param component The component itself
		     
	]]
	local client_component = TS.async(function(component)
		log("client_component", `Started {getName(component)} on {TS.await(getInstancePath(component.instance))}`)
	end)
	_container.client_component = client_component
	--[[
		*
		     * @param name Name of the component class
		     * @param component The component itself
		     
	]]
	local server_component = TS.async(function(component)
		log("server_component", `Started {getName(component)} on {TS.await(getInstancePath(component.instance))}`)
	end)
	_container.server_component = server_component
	--[[
		*
		     * @param name Name of the controller
		     
	]]
	local function controller(controller)
		log("controller", `Started {getName(controller)}`)
	end
	_container.controller = controller
	--[[
		*
		     * @param name Name of the service
		     
	]]
	local function service(service)
		log("service", `Started {getName(service)}`)
	end
	_container.service = service
end
local default = Log
return {
	default = default,
}
