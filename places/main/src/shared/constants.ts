import { Workspace as World } from "@rbxts/services";

import { Difficulty } from "common/shared/structs/difficulty";
import { ProjectileType } from "common/shared/towers";
import { metersToStuds } from "./utility/3D";
import { DifficultyInfo, EnemyTraitType, TeleportData } from "./structs";

export const TRAIT_ICONS: Record<EnemyTraitType, string> = {
  [EnemyTraitType.NoCash]: "rbxassetid://18324545188",
  [EnemyTraitType.BulletResistance]: "rbxassetid://395920626",
  [EnemyTraitType.LaserResistance]: "rbxassetid://395920626",
}

export const GRAVITATIONAL_PROJECTILE_TYPES: ProjectileType[] = [
  ProjectileType.Bullet
];

export const PROJECTILE_SPEEDS: Record<ProjectileType, number> = {
  [ProjectileType.Bullet]: metersToStuds(50),
  [ProjectileType.Laser]: metersToStuds(50),
  [ProjectileType.Explosive]: metersToStuds(20)
};

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