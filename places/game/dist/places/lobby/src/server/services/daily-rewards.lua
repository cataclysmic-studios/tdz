-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Service = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Service
local CommonEvents = TS.import(script, game:GetService("ReplicatedStorage"), "common", "server", "network").CommonEvents
local ONE_DAY = 24 * 60 * 60
local DailyRewardService
do
	DailyRewardService = setmetatable({}, {
		__tostring = function()
			return "DailyRewardService"
		end,
	})
	DailyRewardService.__index = DailyRewardService
	function DailyRewardService.new(...)
		local self = setmetatable({}, DailyRewardService)
		return self:constructor(...) or self
	end
	function DailyRewardService:constructor(db)
		self.db = db
	end
	function DailyRewardService:onInit()
		self.db.loaded:Connect(function(player)
			return self:updateStreak(player)
		end)
		CommonEvents.data.updateLoginStreak:connect(function(player)
			return self:updateStreak(player)
		end)
	end
	function DailyRewardService:updateStreak(player)
		local lastLogin = self.db:get(player, "lastLogin", 0)
		local timeSinceLastLogin = os.time() - lastLogin
		if timeSinceLastLogin >= ONE_DAY then
			self.db:set(player, "lastLogin", os.time())
			self.db:set(player, "claimedDaily", false)
			if timeSinceLastLogin < ONE_DAY * 2 then
				self.db:increment(player, "loginStreak")
			else
				self.db:set(player, "loginStreak", 0)
			end
		end
	end
	do
		-- (Flamework) DailyRewardService metadata
		Reflect.defineMetadata(DailyRewardService, "identifier", "places/lobby/src/server/services/daily-rewards@DailyRewardService")
		Reflect.defineMetadata(DailyRewardService, "flamework:parameters", { "common/src/server/services/third-party/database@DatabaseService" })
		Reflect.defineMetadata(DailyRewardService, "flamework:implements", { "$:flamework@OnInit", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) DailyRewardService decorators
Reflect.decorate(DailyRewardService, "@flamework/core:out/flamework@Service", Service, {})
return {
	DailyRewardService = DailyRewardService,
}
