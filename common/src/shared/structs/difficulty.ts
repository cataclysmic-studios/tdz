export const enum Difficulty {
  Easy = "Easy",
  Intermediate = "Intermediate",
  Tough = "Tough",
  Expert = "Expert",
  Nightmare = "Nightmare"
}

export const DIFFICULTY_MEDAL_COLORS = {
  [Difficulty.Easy]: Color3.fromRGB(176, 107, 50),
  [Difficulty.Intermediate]: Color3.fromRGB(148, 175, 180),
  [Difficulty.Tough]: Color3.fromRGB(255, 201, 6),
  [Difficulty.Expert]: Color3.fromRGB(123, 221, 226),
  [Difficulty.Nightmare]: Color3.fromRGB(61, 18, 18),
}