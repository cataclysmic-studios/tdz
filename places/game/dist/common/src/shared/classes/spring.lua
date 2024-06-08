-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local isNaN = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "numbers").isNaN
local _binding = math
local ceil = _binding.ceil
local min = _binding.min
local INF = _binding.huge
--[[
	
	  If delta time in the spring class is lower than this value,
	  it will split up the update into multiple smaller updates
	
]]
local MAX_SPRING_DELTA = 1 / 40
local Spring
do
	Spring = setmetatable({}, {
		__tostring = function()
			return "Spring"
		end,
	})
	Spring.__index = Spring
	function Spring.new(...)
		local self = setmetatable({}, Spring)
		return self:constructor(...) or self
	end
	function Spring:constructor(mass, force, damping, speed)
		if mass == nil then
			mass = 5
		end
		if force == nil then
			force = 50
		end
		if damping == nil then
			damping = 4
		end
		if speed == nil then
			speed = 4
		end
		self.mass = mass
		self.force = force
		self.damping = damping
		self.speed = speed
		self.target = Vector3.new()
		self.position = Vector3.new()
		self.velocity = Vector3.new()
	end
	function Spring:shove(force)
		local _binding_1 = force
		local X = _binding_1.X
		local Y = _binding_1.Y
		local Z = _binding_1.Z
		if isNaN(X) or X == INF or X == -INF then
			X = 0
		end
		if isNaN(Y) or Y == INF or Y == -INF then
			Y = 0
		end
		if isNaN(Z) or Z == INF or Z == -INF then
			Z = 0
		end
		local _velocity = self.velocity
		local _vector3 = Vector3.new(X, Y, Z)
		self.velocity = _velocity + _vector3
	end
	function Spring:update(dt)
		if dt > MAX_SPRING_DELTA then
			local iter = ceil(dt / MAX_SPRING_DELTA)
			do
				local i = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i += 1
					else
						_shouldIncrement = true
					end
					if not (i < iter) then
						break
					end
					self:update(dt / iter)
				end
			end
			return self.position
		end
		local scaledDt = (min(dt, 1) * self.speed) / Spring.iterations
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < Spring.iterations) then
					break
				end
				local _target = self.target
				local _position = self.position
				local force = _target - _position
				local _force = self.force
				local _exp = force * _force
				local _mass = self.mass
				local _velocity = self.velocity
				local _damping = self.damping
				local acceleration = _exp / _mass - (_velocity * _damping)
				local _velocity_1 = self.velocity
				local _arg0 = acceleration * scaledDt
				self.velocity = _velocity_1 + _arg0
				local _position_1 = self.position
				local _arg0_1 = self.velocity * scaledDt
				self.position = _position_1 + _arg0_1
			end
		end
		return self.position
	end
	Spring.iterations = 8
end
return {
	default = Spring,
}
