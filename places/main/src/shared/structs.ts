export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];

export interface TowerInfo {
  cframe: CFrame;
  ownerID: number;
  upgrades: UpgradeLevel;
}