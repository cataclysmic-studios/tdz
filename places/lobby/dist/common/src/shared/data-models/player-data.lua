-- Compiled with roblox-ts v2.3.0
local INITIAL_DATA = {
	coins = 0,
	ownedTowers = { "Rifleman" },
	equippedTowers = { "Rifleman" },
	lastLogin = 0,
	loginStreak = 0,
	claimedDaily = false,
	difficultiesWon = {},
	settings = {
		general = {
			autoskip = false,
		},
		audio = {
			sfx = 100,
			music = 100,
			ambience = 100,
		},
		graphics = {
			towerVFX = true,
		},
	},
}
return {
	INITIAL_DATA = INITIAL_DATA,
}
