-- Compiled with roblox-ts v2.3.0
local _binding = math
local max = _binding.max
local min = _binding.min
local floor = _binding.floor
local random = _binding.random
local function shuffle(array)
	-- Fisher-Yates shuffle algorithm
	local _array = {}
	local _length = #_array
	table.move(array, 1, #array, _length + 1, _array)
	local shuffledArray = _array
	do
		local i = #shuffledArray - 1
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i -= 1
			else
				_shouldIncrement = true
			end
			if not (i > 0) then
				break
			end
			local j = floor(random() * (i + 1))
			local _index = i + 1
			local _index_1 = j + 1
			shuffledArray[_index], shuffledArray[_index_1] = shuffledArray[j + 1], shuffledArray[i + 1]
		end
	end
	return shuffledArray
end
local function removeDuplicates(array)
	local seen = {}
	-- ▼ ReadonlyArray.filter ▼
	local _newValue = {}
	local _callback = function(value)
		local _value = value
		if not (seen[_value] ~= nil) then
			local _value_1 = value
			seen[_value_1] = true
			return true
		end
		return false
	end
	local _length = 0
	for _k, _v in array do
		if _callback(_v, _k - 1, array) == true then
			_length += 1
			_newValue[_length] = _v
		end
	end
	-- ▲ ReadonlyArray.filter ▲
	return _newValue
end
local function flatten(array)
	local result = {}
	for _, value in array do
		if typeof(value) == "table" then
			local flattenedSubtable = flatten(value)
			for _1, subValue in flattenedSubtable do
				table.insert(result, subValue)
			end
		else
			table.insert(result, value)
		end
	end
	return result
end
local function reverse(arr)
	-- ▼ ReadonlyArray.map ▼
	local _newValue = table.create(#arr)
	local _callback = function(_, i)
		return arr[#arr - 1 - i + 1]
	end
	for _k, _v in arr do
		_newValue[_k] = _callback(_v, _k - 1, arr)
	end
	-- ▲ ReadonlyArray.map ▲
	return _newValue
end
local function slice(arr, start, finish)
	local length = #arr
	-- Handling negative indices
	local startIndex = if start < 0 then max(length + start, 0) else min(start, length)
	local endIndex = if finish == nil then length elseif finish < 0 then max(length + finish, 0) else min(finish, length)
	-- Creating a new array with sliced elements
	local slicedArray = {}
	do
		local i = startIndex
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < endIndex) then
				break
			end
			local _arg0 = arr[i + 1]
			table.insert(slicedArray, _arg0)
		end
	end
	return slicedArray
end
return {
	shuffle = shuffle,
	removeDuplicates = removeDuplicates,
	flatten = flatten,
	reverse = reverse,
	slice = slice,
}
