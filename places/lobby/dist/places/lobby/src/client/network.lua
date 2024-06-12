-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local _network = TS.import(script, game:GetService("ReplicatedStorage"), "shared", "network")
local GlobalEvents = _network.GlobalEvents
local GlobalFunctions = _network.GlobalFunctions
local Events = GlobalEvents:createClient({}, {
	incomingIds = { "toggleInLobbyButtons" },
	incoming = {
		toggleInLobbyButtons = { { t.boolean, t.boolean, t.number }, nil },
	},
	incomingUnreliable = {},
	outgoingIds = { "leaveLobby", "startGame" },
	outgoingUnreliable = {},
	namespaceIds = {},
	namespaces = {},
})
local Functions = GlobalFunctions:createClient({}, {
	incomingIds = {},
	incoming = {},
	outgoingIds = {},
	outgoing = {},
	namespaceIds = {},
	namespaces = {},
})
return {
	Events = Events,
	Functions = Functions,
}
