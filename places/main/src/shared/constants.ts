import { Workspace as World } from "@rbxts/services";

import { Difficulty } from "common/shared/structs/difficulty";
import type { DifficultyInfo, TeleportData } from "./structs";

export const SIZE_PREVIEW_COLORS = {
  MyTowers: Color3.fromRGB(77, 232, 82),
  NotMyTowers: Color3.fromRGB(255, 255, 115),
  Selected: Color3.fromRGB(110, 191, 232)
};

export const PLACEMENT_STORAGE = <Folder>World.FindFirstChild("PlacementStorage") ?? new Instance("Folder");
PLACEMENT_STORAGE.Name = "PlacementStorage";
PLACEMENT_STORAGE.Parent = World;

export const TEST_TP_DATA: TeleportData = {
  difficulty: Difficulty.Easy,
  map: "Pleasant Island"
};

export const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  [Difficulty.Easy]: {
    waves: 20,
    startingHealth: 300,
    startingCash: 600
  },
  [Difficulty.Intermediate]: {
    waves: 28,
    startingHealth: 275,
    startingCash: 750
  },
  [Difficulty.Tough]: {
    waves: 35,
    startingHealth: 200,
    startingCash: 850
  },
  [Difficulty.Expert]: {
    waves: 42,
    startingHealth: 175,
    startingCash: 950
  },
  [Difficulty.Nightmare]: {
    waves: 50,
    startingHealth: 125,
    startingCash: 1100
  }
}