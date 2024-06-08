-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local slice = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "string-utils").slice
--[[
	*
	 * Takes a slug-string and converts it into PascalCase
	 
]]
local function slugToPascal(slug)
	local _exp = string.split(slug, "-")
	-- ▼ ReadonlyArray.map ▼
	local _newValue = table.create(#_exp)
	local _callback = function(word)
		return string.upper(string.sub(word, 1, 1)) .. slice(word, 1)
	end
	for _k, _v in _exp do
		_newValue[_k] = _callback(_v, _k - 1, _exp)
	end
	-- ▲ ReadonlyArray.map ▲
	return table.concat(_newValue, "")
end
--[[
	*
	 * Takes a camelCase string and converts it into spaced text
	 
]]
local function camelCaseToSpaced(camelCased)
	return (string.gsub(camelCased, "%u", " %1"))
end
--[[
	*
	 * Takes a PascalCase and converts it into paced text
	 
]]
local function pascalCaseToSpaced(pascalCased)
	return string.sub(camelCaseToSpaced(pascalCased), 2)
end
--[[
	*
	 * Capitalizes the first letter of `text`
	 
]]
local function capitalize(text)
	return (string.gsub(text, "^%1", function(s)
		return string.upper(s)
	end))
end
--[[
	*
	 * Removes all whitespace characters from `text`
	 
]]
local function removeWhitespace(text)
	return (string.gsub(text, "%s+", ""))
end
--[[
	*
	 * Trims all leading & trailing whitespace characters from `text`
	 
]]
local function trim(text)
	return (string.gsub(text, "^%s*(.-)%s*$", "%1"))
end
return {
	slugToPascal = slugToPascal,
	camelCaseToSpaced = camelCaseToSpaced,
	pascalCaseToSpaced = pascalCaseToSpaced,
	capitalize = capitalize,
	removeWhitespace = removeWhitespace,
	trim = trim,
}
