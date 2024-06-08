-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local TweenService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").TweenService
local TweenInfoBuilder = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "builders", "out").TweenInfoBuilder
local function tween(instance, tweenInfo, goal)
	if TS.instanceof(tweenInfo, TweenInfoBuilder) then
		tweenInfo = tweenInfo:Build()
	end
	local tween = TweenService:Create(instance, tweenInfo, goal)
	tween:Play()
	return tween
end
return {
	tween = tween,
}
