-- Compiled with roblox-ts v2.3.0
local Wave
do
	Wave = setmetatable({}, {
		__tostring = function()
			return "Wave"
		end,
	})
	Wave.__index = Wave
	function Wave.new(...)
		local self = setmetatable({}, Wave)
		return self:constructor(...) or self
	end
	function Wave:constructor(amplitude, frequency, phaseShift, verticalShift, waveFunction)
		if amplitude == nil then
			amplitude = 1
		end
		if frequency == nil then
			frequency = 1
		end
		if phaseShift == nil then
			phaseShift = 0
		end
		if verticalShift == nil then
			verticalShift = 0
		end
		if waveFunction == nil then
			waveFunction = math.sin
		end
		self.amplitude = amplitude
		self.frequency = frequency
		self.phaseShift = phaseShift
		self.verticalShift = verticalShift
		self.waveFunction = waveFunction
	end
	function Wave:update(dt, damping)
		if damping == nil then
			damping = 1
		end
		return ((self.amplitude * self.waveFunction(self.frequency * os.clock() + self.phaseShift) + self.verticalShift) * dt) / damping
	end
end
return {
	default = Wave,
}
