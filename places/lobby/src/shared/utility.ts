const BASE_XP = 40;

export function getXPUntilNextLevel(level: number): number {
  return BASE_XP * (level ** 2 + level);
}