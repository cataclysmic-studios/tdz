import { Workspace as World } from "@rbxts/services";

import { Difficulty } from "common/shared/structs/difficulty";
import type { DifficultyInfo, TeleportData } from "./structs";

export const RANGE_PREVIEW_COLORS = {
  CanPlace: Color3.fromRGB(0, 170, 255),
  CanNotPlace: Color3.fromRGB(255, 65, 65)
};

export const SIZE_PREVIEW_COLORS = {
  MyTowers: Color3.fromRGB(77, 232, 82),
  NotMyTowers: Color3.fromRGB(255, 255, 115),
  Selected: Color3.fromRGB(110, 191, 232)
};

export const ENEMY_STORAGE = <Folder>World.FindFirstChild("EnemyStorage") ?? new Instance("Folder");
ENEMY_STORAGE.Name = "EnemyStorage";
ENEMY_STORAGE.Parent = World;

export const PLACEMENT_STORAGE = <Folder>World.FindFirstChild("PlacementStorage") ?? new Instance("Folder");
PLACEMENT_STORAGE.Name = "PlacementStorage";
PLACEMENT_STORAGE.Parent = World;

export const TEST_TP_DATA: TeleportData = {
  difficulty: Difficulty.Easy,
  map: "Pleasant Island"
};

export const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  [Difficulty.Easy]: {
    waveCount: 20,
    startingHealth: 300,
    startingCash: 600
  },
  [Difficulty.Intermediate]: {
    waveCount: 28,
    startingHealth: 275,
    startingCash: 750
  },
  [Difficulty.Tough]: {
    waveCount: 35,
    startingHealth: 200,
    startingCash: 850
  },
  [Difficulty.Expert]: {
    waveCount: 42,
    startingHealth: 175,
    startingCash: 950
  },
  [Difficulty.Nightmare]: {
    waveCount: 50,
    startingHealth: 125,
    startingCash: 1100
  }
}