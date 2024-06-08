-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _network = TS.import(script, game:GetService("ReplicatedStorage"), "shared", "network")
local GlobalEvents = _network.GlobalEvents
local GlobalFunctions = _network.GlobalFunctions
local Events = GlobalEvents:createClient({}, {
	incomingIds = {},
	incoming = {},
	incomingUnreliable = {},
	outgoingIds = {},
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
