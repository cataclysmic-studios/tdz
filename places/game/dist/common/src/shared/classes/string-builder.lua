-- Compiled with roblox-ts v2.3.0
local StringBuilder
do
	StringBuilder = setmetatable({}, {
		__tostring = function()
			return "StringBuilder"
		end,
	})
	StringBuilder.__index = StringBuilder
	function StringBuilder.new(...)
		local self = setmetatable({}, StringBuilder)
		return self:constructor(...) or self
	end
	function StringBuilder:constructor(tabSize)
		if tabSize == nil then
			tabSize = 4
		end
		self.tabSize = tabSize
		self.indentation = 0
		self.parts = {}
	end
	function StringBuilder:string()
		return table.concat(self.parts, "")
	end
	function StringBuilder:append(...)
		local strings = { ... }
		for _, str in strings do
			local _exp = self.parts
			table.insert(_exp, str)
		end
	end
	function StringBuilder:peekLastPart()
		return self.parts[#self.parts]
	end
	function StringBuilder:popLastPart()
		local _exp = self.parts
		-- ▼ Array.pop ▼
		local _length = #_exp
		local _result = _exp[_length]
		_exp[_length] = nil
		-- ▲ Array.pop ▲
		return _result
	end
	function StringBuilder:pushIndentation()
		self.indentation += 1
	end
	function StringBuilder:popIndentation()
		self.indentation -= 1
	end
	function StringBuilder:newLine(amount)
		if amount == nil then
			amount = 1
		end
		local _fn = self
		local _tabSize = self.tabSize
		local _exp = string.rep(" ", _tabSize)
		local _indentation = self.indentation
		local _exp_1 = ("\n" .. string.rep(_exp, _indentation))
		local _amount = amount
		_fn:append(string.rep(_exp_1, _amount))
	end
end
return {
	default = StringBuilder,
}
