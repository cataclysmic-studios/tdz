-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local _binding = math
local floor = _binding.floor
local log = _binding.log
local abs = _binding.abs
local clamp = _binding.clamp
local isNaN = function(n)
	return n ~= n
end
local isEven = function(n)
	return n % 2 == 0
end
local function lerp(a, b, t)
	return a + (b - a) * t
end
local function doubleSidedLimit(n, limit)
	return clamp(n, -limit, limit)
end
--[[
	*
	 * Returns 0 if the number is close enough to 0 by `epsilon`
	 * @param n
	 * @param epsilon
	 
]]
local function flattenNumber(n, epsilon)
	if epsilon == nil then
		epsilon = 0.001
	end
	return if abs(n) < epsilon then 0 else n
end
local function toNearestFiveOrTen(n)
	local result = floor(n / 5 + 0.5) * 5
	if result % 10 ~= 0 then
		result += 10 - result % 10
	end
	return result
end
local function commaFormat(n)
	local formatted = tostring(n)
	local parts = {}
	while #formatted > 3 do
		local _arg1 = string.sub(formatted, -3)
		table.insert(parts, 1, _arg1)
		formatted = string.sub(formatted, 1, -4)
	end
	local _formatted = formatted
	table.insert(parts, 1, _formatted)
	return table.concat(parts, ",")
end
local suffixes = { "K", "M", "B", "T", "Q" }
local function toSuffixedNumber(n)
	if n < 100000 then
		return commaFormat(n)
	end
	local index = floor(log(n, 1000)) - 1
	local divisor = 10 ^ ((index + 1) * 3)
	local _arg0 = floor(n / divisor)
	local baseNumber = string.gsub(string.format("%.1f", _arg0), "%.?0+$", "")
	return baseNumber .. (if index < 0 then "" else suffixes[index + 1])
end
local function parseSuffixedNumber(suffixed)
	local match = { string.match((string.gsub(suffixed, ",", "")), "^([0-9,.]+)([KMBT]?)$") }
	if not match then
		error(Log.Exception.new("InvalidSuffixedNumber", "Invalid suffixed number format"))
	end
	local numberPart = tostring(match[1])
	local suffix = tostring(match[2])
	local _condition = suffix
	if _condition ~= "" and _condition then
		_condition = suffix ~= "" and suffix ~= "nil"
	end
	if _condition ~= "" and _condition then
		local _arg0 = string.lower(suffix)
		local index = (table.find(suffixes, _arg0) or 0) - 1
		if index == -1 then
			error(Log.Exception.new("InvalidNumberSuffix", "Invalid suffix in suffixed number"))
		end
		local multiplier = 10 ^ ((index + 1) * 3)
		numberPart = tostring(tonumber(numberPart) * multiplier)
	end
	return tonumber(numberPart)
end
return {
	lerp = lerp,
	doubleSidedLimit = doubleSidedLimit,
	flattenNumber = flattenNumber,
	toNearestFiveOrTen = toNearestFiveOrTen,
	commaFormat = commaFormat,
	toSuffixedNumber = toSuffixedNumber,
	parseSuffixedNumber = parseSuffixedNumber,
	isNaN = isNaN,
	isEven = isEven,
}
