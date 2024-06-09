-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Service = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Service
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local Market = _services.MarketplaceService
local Players = _services.Players
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local TransactionsService
do
	TransactionsService = setmetatable({}, {
		__tostring = function()
			return "TransactionsService"
		end,
	})
	TransactionsService.__index = TransactionsService
	function TransactionsService.new(...)
		local self = setmetatable({}, TransactionsService)
		return self:constructor(...) or self
	end
	function TransactionsService:constructor(db)
		self.db = db
		self.rewardHandlers = {}
	end
	function TransactionsService:onInit()
		Market.ProcessReceipt = function(_param)
			local PlayerId = _param.PlayerId
			local ProductId = _param.ProductId
			local PurchaseId = _param.PurchaseId
			local productKey = `{PlayerId}_{PurchaseId}`
			local player = Players:GetPlayerByUserId(PlayerId)
			local playerExists = player ~= nil
			local purchaseRecorded = true
			if playerExists then
				local purchaseHistory = self.db:get(player, "purchaseHistory", {})
				local alreadyPurchased = table.find(purchaseHistory, productKey) ~= nil
				if alreadyPurchased then
					return Enum.ProductPurchaseDecision.PurchaseGranted
				end
			else
				purchaseRecorded = nil
			end
			local success = true
			TS.try(function()
				local grantReward = self.rewardHandlers[ProductId]
				if playerExists and grantReward ~= nil then
					grantReward(player)
				end
			end, function(err)
				success = false
				purchaseRecorded = nil
				Log.warning(`Failed to process purchase for product {ProductId}: {err}`)
			end)
			return Enum.ProductPurchaseDecision[if (not success or purchaseRecorded == nil) then "NotProcessedYet" else "PurchaseGranted"]
		end
	end
	do
		-- (Flamework) TransactionsService metadata
		Reflect.defineMetadata(TransactionsService, "identifier", "common/src/server/services/transactions@TransactionsService")
		Reflect.defineMetadata(TransactionsService, "flamework:parameters", { "common/src/server/services/third-party/database@DatabaseService" })
		Reflect.defineMetadata(TransactionsService, "flamework:implements", { "$:flamework@OnInit" })
	end
end
-- (Flamework) TransactionsService decorators
Reflect.decorate(TransactionsService, "$:flamework@Service", Service, {})
return {
	TransactionsService = TransactionsService,
}
