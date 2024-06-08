-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local t = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "t", "lib", "ts").t
local _network = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "network")
local CommonGlobalEvents = _network.CommonGlobalEvents
local CommonGlobalFunctions = _network.CommonGlobalFunctions
local CommonEvents = CommonGlobalEvents:createClient({}, {
	incomingIds = {},
	incoming = {},
	incomingUnreliable = {},
	outgoingIds = {},
	outgoingUnreliable = {},
	namespaceIds = { "data" },
	namespaces = {
		data = {
			incomingIds = { "updated" },
			incoming = {
				updated = { { t.string, t.union(t.any, t.none) }, nil },
			},
			incomingUnreliable = {},
			outgoingIds = { "initialize", "set", "increment", "decrement", "addToArray", "deleteFromArray", "updateLoginStreak" },
			outgoingUnreliable = {},
			namespaceIds = {},
			namespaces = {},
		},
	},
})
local CommonFunctions = CommonGlobalFunctions:createClient({}, {
	incomingIds = {},
	incoming = {},
	outgoingIds = {},
	outgoing = {},
	namespaceIds = { "data", "github" },
	namespaces = {
		data = {
			incomingIds = {},
			incoming = {},
			outgoingIds = { "get" },
			outgoing = {
				get = t.union(t.any, t.none),
			},
			namespaceIds = {},
			namespaces = {},
		},
		github = {
			incomingIds = {},
			incoming = {},
			outgoingIds = { "getInfo" },
			outgoing = {
				getInfo = t.interface({
					commits = t.array(t.interface({
						message = t.string,
						url = t.string,
						committer = t.interface({
							date = t.string,
							email = t.string,
							name = t.string,
						}),
						tree = t.interface({
							sha = t.string,
						}),
					})),
					tags = t.array(t.interface({
						name = t.string,
					})),
				}),
			},
			namespaceIds = {},
			namespaces = {},
		},
	},
})
return {
	CommonEvents = CommonEvents,
	CommonFunctions = CommonFunctions,
}
