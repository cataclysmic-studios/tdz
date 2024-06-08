-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local HTTP = _services.HttpService
local DataStore = _services.DataStoreService
local _string_utils = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "string-utils")
local endsWith = _string_utils.endsWith
local slice = _string_utils.slice
local Object = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "object-utils")
local MissingEnvValueException = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "exceptions").MissingEnvValueException
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local DB_URL = "https://rbx-tdz-default-rtdb.firebaseio.com/"
if DB_URL == nil then
	error(MissingEnvValueException.new("FIREBASE_URL"))
end
local Firebase
do
	Firebase = setmetatable({}, {
		__tostring = function()
			return "Firebase"
		end,
	})
	Firebase.__index = Firebase
	function Firebase.new(...)
		local self = setmetatable({}, Firebase)
		return self:constructor(...) or self
	end
	function Firebase:constructor()
		self.auth = (DataStore:GetDataStore("Secrets", "SUCKMEOFF"):GetAsync("FIREBASE_AUTH"))
		self.authURL = `.json?auth={self.auth}`
		self.baseURL = self:fixPath(DB_URL) .. "/"
	end
	function Firebase:set(path, value, headers)
		if headers == nil then
			headers = {
				["X-HTTP-Method-Override"] = "PUT",
			}
		end
		local _value = value
		local _condition = typeof(_value) == "table"
		if _condition then
			_condition = value ~= nil
		end
		local valueIsObject = _condition
		local valueIsEmptyArray = valueIsObject and value.size ~= nil and #value == 0
		local valueIsEmptyObject = valueIsObject and #Object.entries(value) == 0
		if valueIsEmptyArray or valueIsEmptyObject then
			return self:delete(path)
		end
		TS.try(function()
			HTTP:PostAsync(self:getEndpoint(path), HTTP:JSONEncode(value), "ApplicationJson", false, headers)
		end, function(error)
			Log.fatal(`[Firebase]: {error}`)
		end)
	end
	function Firebase:get(path, defaultValue)
		local _exitType, _returns = TS.try(function()
			local _condition = HTTP:JSONDecode(HTTP:GetAsync(self:getEndpoint(path), true))
			if _condition == nil then
				_condition = defaultValue
			end
			return TS.TRY_RETURN, { _condition }
		end, function(error)
			error(Log.fatal(`[Firebase]: {error}`))
		end)
		if _exitType then
			return unpack(_returns)
		end
	end
	function Firebase:delete(path)
		self:set(path, nil, {
			["X-HTTP-Method-Override"] = "DELETE",
		})
	end
	function Firebase:reset()
		self:delete("")
	end
	function Firebase:increment(path, delta)
		if delta == nil then
			delta = 1
		end
		local result = self:get(path) + delta
		self:set(path, result)
		return result
	end
	function Firebase:addToArray(path, value, maxArraySize)
		local data = self:get(path, {})
		if maxArraySize ~= nil then
			if #data >= maxArraySize then
				local diff = #data - maxArraySize
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < diff + 1) then
							break
						end
						table.remove(data, 1)
					end
				end
			end
		end
		local _value = value
		table.insert(data, _value)
		self:set(path, data)
	end
	function Firebase:getEndpoint(path)
		path = self:fixPath(path)
		return self.baseURL .. HTTP:UrlEncode(if path == nil then "" else `/{path}`) .. self.authURL
	end
	function Firebase:fixPath(path)
		if path == nil then
			return ""
		end
		path = self:removeExtraSlash(path)
		return path
	end
	function Firebase:removeExtraSlash(path)
		if endsWith(path, "/") then
			path = slice(path, 0, -1)
		end
		return if endsWith(path, "/") then self:removeExtraSlash(path) else path
	end
end
return {
	default = Firebase,
}
