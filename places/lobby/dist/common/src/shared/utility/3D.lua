-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local World = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").Workspace
local _binding = math
local abs = _binding.abs
local toStorableVector3 = function(_param)
	local X = _param.X
	local Y = _param.Y
	local Z = _param.Z
	return {
		x = X,
		y = Y,
		z = Z,
	}
end
local toUsableVector3 = function(_param)
	local x = _param.x
	local y = _param.y
	local z = _param.z
	return Vector3.new(x, y, z)
end
local function toRegion3(_param, areaShrink)
	local CFrame = _param.CFrame
	local Size = _param.Size
	if areaShrink == nil then
		areaShrink = 0
	end
	local _binding_1 = Size
	local sx = _binding_1.X
	local sy = _binding_1.Y
	local sz = _binding_1.Z
	local x, y, z, r00, r01, r02, r10, r11, r12, r20, r21, r22 = CFrame:GetComponents()
	local wsx = 0.5 * (abs(r00) * sx + abs(r01) * sy + abs(r02) * sz)
	local wsy = 0.5 * (abs(r10) * sx + abs(r11) * sy + abs(r12) * sz)
	local wsz = 0.5 * (abs(r20) * sx + abs(r21) * sy + abs(r22) * sz)
	return Region3.new(Vector3.new(x - wsx + areaShrink, y - wsy, z - wsz + areaShrink), Vector3.new(x + wsx - areaShrink, y + wsy, z + wsz - areaShrink))
end
local function createRayVisualizer(position, direction, decayTime, transparency, color)
	if decayTime == nil then
		decayTime = 3
	end
	if transparency == nil then
		transparency = 0.7
	end
	if color == nil then
		color = Color3.new(1, 0, 0)
	end
	local raySize = direction.Magnitude
	local visual = Instance.new("Part", World)
	visual.Color = color
	visual.Transparency = transparency
	visual.Anchored = true
	visual.CanCollide = false
	visual.Size = Vector3.new(0.5, 0.5, raySize)
	local _fn = CFrame
	local _position = position
	local _direction = direction
	local _arg0 = raySize / 2
	visual.CFrame = _fn.lookAlong(_position + (_direction * _arg0), direction)
	task.delay(decayTime, function()
		return visual:Destroy()
	end)
end
local function combineCFrames(cframes)
	local _cframes = cframes
	local _cFrame = CFrame.new()
	-- ▼ ReadonlyArray.reduce ▼
	local _result = _cFrame
	local _callback = function(sum, cf)
		local _sum = sum
		local _cf = cf
		return _sum * _cf
	end
	for _i = 1, #_cframes do
		_result = _callback(_result, _cframes[_i], _i - 1, _cframes)
	end
	-- ▲ ReadonlyArray.reduce ▲
	return _result
end
local STUDS_TO_METERS_CONSTANT = 3.571
local function studsToMeters(studs)
	return studs / STUDS_TO_METERS_CONSTANT
end
local function metersToStuds(meters)
	return meters * STUDS_TO_METERS_CONSTANT
end
return {
	toRegion3 = toRegion3,
	createRayVisualizer = createRayVisualizer,
	combineCFrames = combineCFrames,
	studsToMeters = studsToMeters,
	metersToStuds = metersToStuds,
	toStorableVector3 = toStorableVector3,
	toUsableVector3 = toUsableVector3,
	STUDS_TO_METERS_CONSTANT = STUDS_TO_METERS_CONSTANT,
}
