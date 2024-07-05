import RiflemanMeta from "./tower-meta/rifleman";
import RiflemanStats from "./tower-stats/rifleman";
import SniperMeta from "./tower-meta/sniper";
import SniperStats from "./tower-stats/sniper";

export type UpgradePath = 1 | 2;
export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];
export type PathStats = readonly [Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>];

export const enum DamageType {
  Bullet = "Bullet",
  Laser = "Laser",
  Ice = "Ice",
  Fire = "Fire",
  Melee = "Melee",
  Explosion = "Explosion",
  God = "God"
}

export const enum ProjectileType {
  Bullet = "Bullet",
  Laser = "Laser",
  Explosive = "Explosive"
}

export interface TowerStats {
  price: number;
  damageType: DamageType;
  projectileType: ProjectileType;
  damage: number;
  range: number;
  canSeeStealth: boolean;
  reloadTime: number;
  minimumRange?: number;
  burstCount?: number;
  splashRadius?: number;
}

export interface TowerMeta {
  readonly name: string;
  readonly icon: string;
}

export const TOWER_UPGRADE_META = <const>{ // path 2
  Rifleman: RiflemanMeta,
  Sniper: SniperMeta,
}

export const TOWER_STATS = <const>{
  Rifleman: RiflemanStats,
  Sniper: SniperStats
};