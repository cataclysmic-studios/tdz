import { Difficulty } from "../structs/difficulty";

export const INITIAL_DATA = {
  coins: 0,
  ownedTowers: <string[]>["Rifleman"],
  equippedTowers: <string[]>["Rifleman"],
  lastLogin: 0,
  loginStreak: 0,
  claimedDaily: false,
  difficultiesWon: <Record<string, Difficulty[]>>{},
  settings: {
    general: {
      autoskip: false
    },
    audio: {
      sfx: 100,
      music: 100,
      ambience: 100
    },
    graphics: {
      towerVFX: true
    }
  }
};

export type PlayerData = typeof INITIAL_DATA;