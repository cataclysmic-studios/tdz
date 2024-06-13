import { Workspace as World } from "@rbxts/services";

import { Difficulty } from "common/shared/structs/difficulty";
import type { DifficultyInfo, TeleportData } from "./structs";

export const PLACEMENT_STORAGE = new Instance("Folder");
PLACEMENT_STORAGE.Name = "PlacementStorage";
PLACEMENT_STORAGE.Parent = World;

export const TEST_TP_DATA: TeleportData = {
  difficulty: Difficulty.Easy,
  map: "Testing Grounds"
};

export const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  [Difficulty.Easy]: {
    waves: 20,
    startingCash: 600
  },
  [Difficulty.Intermediate]: {
    waves: 28,
    startingCash: 750
  },
  [Difficulty.Tough]: {
    waves: 35,
    startingCash: 850
  },
  [Difficulty.Expert]: {
    waves: 42,
    startingCash: 950
  },
  [Difficulty.Nightmare]: {
    waves: 50,
    startingCash: 1100
  }
}