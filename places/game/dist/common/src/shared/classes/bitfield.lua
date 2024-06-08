-- Compiled with roblox-ts v2.3.0
--[[
	*
	 * Compact method of storing and manipulating individual bits within
	 * a data structure
	 *
	 * Used for efficient storage of boolean flags
	 * or integer values.
	 *
	 * Useful for networking or performance-heavy applications
	 
]]
local Bitfield
do
	Bitfield = {}
	function Bitfield:constructor()
		self.flags = 0
		self:setDefaults()
	end
	function Bitfield:setFlag(flag, value)
		self.flags = (if value then bit32.bor(self.flags, flag) else bit32.band(self.flags, bit32.bnot(flag)))
	end
	function Bitfield:getFlag(flag)
		return (bit32.band(self.flags, flag)) == flag
	end
	function Bitfield:setMultibitFlag(flag, value)
		local shift = self:calculateShift(flag)
		self.flags = (bit32.band(self.flags, bit32.bnot(flag)))
		self.flags = (bit32.bor(self.flags, (bit32.band((bit32.lshift(value, shift)), flag))))
	end
	function Bitfield:getMultibitFlag(flag)
		local shift = self:calculateShift(flag)
		return bit32.arshift((bit32.band(self.flags, flag)), shift)
	end
	function Bitfield:calculateShift(mask)
		local shift = 0
		while (bit32.band(mask, 1)) == 0 and mask ~= 0 do
			shift += 1
			mask = bit32.arshift(mask, 1)
		end
		return shift
	end
end
return {
	default = Bitfield,
}
