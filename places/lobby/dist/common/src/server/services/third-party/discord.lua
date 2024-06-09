-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Service = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Service
local HTTP = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").HttpService
local _exceptions = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "exceptions")
local HttpException = _exceptions.HttpException
local MissingEnvValueException = _exceptions.MissingEnvValueException
local DiscordService
do
	DiscordService = setmetatable({}, {
		__tostring = function()
			return "DiscordService"
		end,
	})
	DiscordService.__index = DiscordService
	function DiscordService.new(...)
		local self = setmetatable({}, DiscordService)
		return self:constructor(...) or self
	end
	function DiscordService:constructor()
	end
	function DiscordService:log(player, logType, message, fields)
		-- Comment/uncomment this based on whether or not you want Discord logs to be sent while testing
		-- if (Runtime.IsStudio()) return;
		local url = nil
		if url == nil then
			error(MissingEnvValueException.new("DISCORD_WEBHOOK"))
		end
		local data = HTTP:JSONEncode({
			WebhookURL = url,
			WebhookData = {
				username = "Game Logger",
				embeds = { {
					title = logType,
					description = message,
					fields = fields,
					timestamp = DateTime.now():ToIsoDate(),
					color = 0xe09f36,
					author = {
						name = player.Name,
						url = "https://www.roblox.com/users/" .. tostring(player.UserId) .. "/profile",
					},
				} },
			},
		})
		TS.try(function()
			HTTP:PostAsync(url, data)
		end, function(e)
			error(HttpException.new(e))
		end)
	end
	do
		-- (Flamework) DiscordService metadata
		Reflect.defineMetadata(DiscordService, "identifier", "common/src/server/services/third-party/discord@DiscordService")
	end
end
-- (Flamework) DiscordService decorators
Reflect.decorate(DiscordService, "$:flamework@Service", Service, {})
return {
	DiscordService = DiscordService,
}
