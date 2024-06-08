-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local _components = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "components", "out")
local Component = _components.Component
local BaseComponent = _components.BaseComponent
local slice = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "string-utils").slice
local CommonFunctions = TS.import(script, game:GetService("ReplicatedStorage"), "common", "client", "network").CommonFunctions
local PlayerGui = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client").PlayerGui
local REFRESH_RATE = 180
local VersionLabel
do
	local super = BaseComponent
	VersionLabel = setmetatable({}, {
		__tostring = function()
			return "VersionLabel"
		end,
		__index = super,
	})
	VersionLabel.__index = VersionLabel
	function VersionLabel.new(...)
		local self = setmetatable({}, VersionLabel)
		return self:constructor(...) or self
	end
	function VersionLabel:constructor(...)
		super.constructor(self, ...)
	end
	function VersionLabel:onStart()
		task.spawn(function()
			repeat
				do
					self:update()
				end
				local _value = task.wait(REFRESH_RATE)
			until not (_value ~= 0 and _value == _value and _value)
		end)
	end
	VersionLabel.update = TS.async(function(self)
		local _binding = TS.await(CommonFunctions.github.getInfo())
		local _binding_1 = _binding.tags
		local tag = _binding_1[1]
		local _binding_2 = _binding.commits
		local commit = _binding_2[1]
		self.instance.Text = `{tag.name} ({slice(commit.tree.sha, 0, 7)})`
	end)
	do
		-- (Flamework) VersionLabel metadata
		Reflect.defineMetadata(VersionLabel, "identifier", "common/src/client/components/ui/version-label@VersionLabel")
		Reflect.defineMetadata(VersionLabel, "flamework:implements", { "$:flamework@OnStart", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) VersionLabel decorators
Reflect.decorate(VersionLabel, "$c:components@Component", Component, { {
	tag = "VersionLabel",
	ancestorWhitelist = { PlayerGui },
	attributes = {},
	instanceGuard = t.instanceIsA("TextLabel"),
} })
return {
	VersionLabel = VersionLabel,
}
