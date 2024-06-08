-- Compiled with roblox-ts v2.3.0
local Range
do
	Range = setmetatable({}, {
		__tostring = function()
			return "Range"
		end,
	})
	Range.__index = Range
	function Range.new(...)
		local self = setmetatable({}, Range)
		return self:constructor(...) or self
	end
	function Range:constructor(minimum, maximum)
		if maximum == nil then
			maximum = minimum
		end
		self.minimum = minimum
		self.maximum = maximum
	end
	function Range:randomInteger()
		return (Random.new()):NextInteger(self.minimum, self.maximum)
	end
	function Range:randomNumber()
		return (Random.new()):NextNumber(self.minimum, self.maximum)
	end
	function Range:numberIsWithin(n)
		return n >= self.minimum and n <= self.maximum
	end
	function Range:numberIsExclusivelyWithin(n)
		return n > self.minimum and n < self.maximum
	end
end
return {
	default = Range,
}
