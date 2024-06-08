-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local StringUtils = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "string-utils")
local _binding = math
local floor = _binding.floor
local function toTimerFormat(seconds)
	local hours = floor(seconds / 3600)
	local minutes = floor((seconds % 3600) / 60)
	local remainingSeconds = seconds % 60
	local formattedHours = if hours > 0 then `{hours}:` else ""
	local formattedMinutes = if minutes < 10 and hours > 0 then `0{minutes}` else `{minutes}`
	local formattedSeconds = if remainingSeconds < 10 then `0{remainingSeconds}` else `{remainingSeconds}`
	return `{formattedHours}{formattedMinutes}:{formattedSeconds}`
end
local s = 1
local m = 60
local h = 3600
local d = 86400
local w = 604800
local timePatterns = {
	s = s,
	second = s,
	seconds = s,
	m = m,
	minute = m,
	minutes = m,
	h = h,
	hour = h,
	hours = h,
	d = d,
	day = d,
	days = d,
	w = w,
	week = w,
	weeks = w,
}
-- Takes a remaining time string (e.g. 1d 5h 10s) and
-- converts it to the amount of time it represents in seconds.
local function toSeconds(time)
	local seconds = 0
	for value, unit in string.gmatch((string.gsub(time, " ", "")), "(%d+)(%a)") do
		local timeUnit = unit
		local figure = value
		seconds += figure * timePatterns[timeUnit]
	end
	return seconds
end
-- Takes a time in seconds (e.g. 310) and converts
-- it to a remaining time string (e.g. 5m 10s)
local function toRemainingTime(seconds)
	local dayDivisor = 60 * 60 * 24
	local days = floor(seconds / dayDivisor)
	seconds %= dayDivisor
	local hourDivisor = 60 * 60
	local hours = floor(seconds / hourDivisor)
	seconds %= hourDivisor
	local minuteDivisor = 60
	local minutes = floor(seconds / minuteDivisor)
	seconds %= minuteDivisor
	local remainingTime = ""
	if days > 0 then
		remainingTime ..= string.format("%dd ", days)
	end
	if hours > 0 then
		remainingTime ..= string.format("%dh ", hours)
	end
	if minutes > 0 then
		remainingTime ..= string.format("%dm ", minutes)
	end
	if seconds > 0 then
		local _seconds = seconds
		remainingTime ..= string.format("%ds ", _seconds)
	end
	return StringUtils.trim(remainingTime)
end
local function toLongRemainingTime(seconds)
	local hours = floor(seconds / 3600)
	local minutes = floor((seconds % 3600) / 60)
	local remainingSeconds = seconds % 60
	return string.format("%02d:%02d:%02d", hours, minutes, remainingSeconds)
end
return {
	toTimerFormat = toTimerFormat,
	toSeconds = toSeconds,
	toRemainingTime = toRemainingTime,
	toLongRemainingTime = toLongRemainingTime,
}
