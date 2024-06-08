-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local _network = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "network")
local CommonGlobalEvents = _network.CommonGlobalEvents
local CommonGlobalFunctions = _network.CommonGlobalFunctions
local CommonEvents = CommonGlobalEvents:createServer({}, {
	incomingIds = {},
	incoming = {},
	incomingUnreliable = {},
	outgoingIds = {},
	outgoingUnreliable = {},
	namespaceIds = { "data" },
	namespaces = {
		data = {
			incomingIds = { "initialize", "set", "increment", "decrement", "addToArray", "deleteFromArray", "updateLoginStreak" },
			incoming = {
				initialize = { {}, nil },
				set = { { t.string, t.union(t.any, t.none) }, nil },
				increment = { { t.string, t.optional(t.number) }, nil },
				decrement = { { t.string, t.optional(t.number) }, nil },
				addToArray = { { t.string, t.any }, nil },
				deleteFromArray = { { t.string, t.any }, nil },
				updateLoginStreak = { {}, nil },
			},
			incomingUnreliable = {},
			outgoingIds = { "updated" },
			outgoingUnreliable = {},
			namespaceIds = {},
			namespaces = {},
		},
	},
})
local CommonFunctions = CommonGlobalFunctions:createServer({}, {
	incomingIds = {},
	incoming = {},
	outgoingIds = {},
	outgoing = {},
	namespaceIds = { "data", "github" },
	namespaces = {
		data = {
			incomingIds = { "get" },
			incoming = {
				get = { { t.optional(t.string), t.union(t.any, t.none) }, nil },
			},
			outgoingIds = {},
			outgoing = {},
			namespaceIds = {},
			namespaces = {},
		},
		github = {
			incomingIds = { "getInfo" },
			incoming = {
				getInfo = { {}, nil },
			},
			outgoingIds = {},
			outgoing = {},
			namespaceIds = {},
			namespaces = {},
		},
	},
})
return {
	CommonEvents = CommonEvents,
	CommonFunctions = CommonFunctions,
}
