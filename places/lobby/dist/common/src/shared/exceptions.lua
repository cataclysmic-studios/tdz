-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local FlameworkIgnitionException
do
	local super = Log.Exception
	FlameworkIgnitionException = setmetatable({}, {
		__tostring = function()
			return "FlameworkIgnitionException"
		end,
		__index = super,
	})
	FlameworkIgnitionException.__index = FlameworkIgnitionException
	function FlameworkIgnitionException.new(...)
		local self = setmetatable({}, FlameworkIgnitionException)
		return self:constructor(...) or self
	end
	function FlameworkIgnitionException:constructor(message)
		super.constructor(self, "FlameworkIgnition", message)
		self.message = message
	end
end
local MissingAttributeException
do
	local super = Log.Exception
	MissingAttributeException = setmetatable({}, {
		__tostring = function()
			return "MissingAttributeException"
		end,
		__index = super,
	})
	MissingAttributeException.__index = MissingAttributeException
	function MissingAttributeException.new(...)
		local self = setmetatable({}, MissingAttributeException)
		return self:constructor(...) or self
	end
	function MissingAttributeException:constructor(instance, attributeName)
		super.constructor(self, "MissingAttribute", `{instance.ClassName} "{instance.Name}" is missing attribute "{attributeName}"`)
	end
end
local HttpException
do
	local super = Log.Exception
	HttpException = setmetatable({}, {
		__tostring = function()
			return "HttpException"
		end,
		__index = super,
	})
	HttpException.__index = HttpException
	function HttpException.new(...)
		local self = setmetatable({}, HttpException)
		return self:constructor(...) or self
	end
	function HttpException:constructor(message)
		super.constructor(self, "Http", message)
	end
end
local MissingEnvValueException
do
	local super = Log.Exception
	MissingEnvValueException = setmetatable({}, {
		__tostring = function()
			return "MissingEnvValueException"
		end,
		__index = super,
	})
	MissingEnvValueException.__index = MissingEnvValueException
	function MissingEnvValueException.new(...)
		local self = setmetatable({}, MissingEnvValueException)
		return self:constructor(...) or self
	end
	function MissingEnvValueException:constructor(valueName)
		super.constructor(self, "MissingEnvValue", `"{valueName}" was not found in .env file`)
	end
end
return {
	FlameworkIgnitionException = FlameworkIgnitionException,
	MissingAttributeException = MissingAttributeException,
	HttpException = HttpException,
	MissingEnvValueException = MissingEnvValueException,
}
