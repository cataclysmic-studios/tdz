export type UpgradePath = 1 | 2;
export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];
export type PathStats = readonly [Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>];

export const enum DamageType {
  Bullet,
  Laser,
  Ice,
  Fire,
  Melee
}

export interface TowerStats {
  price: number;
  damageType: DamageType;
  damage: number;
  range: number;
  minimumRange?: number;
  reloadTime: number;
  burstCount?: number;
  splashRadius?: number;
}

export const TOWER_UPGRADE_NAMES = <const>{
  Rifleman: [
    [
      "Focus",
      "Enhanced Optics",
      "Sharpshooter Accuracy",
      ".308 Winchester",
      ".50 BMG"
    ],
    [
      "Enhanced Ballistics",
      "Speed Training",
      "Semi Auto",
      "High Caliber",
      "Full Auto"
    ]
  ]
}

export const TOWER_STATS = <const>{
  Rifleman: [
    identity<TowerStats>({ // this is base stats. they are fixed values
      price: 200,
      damageType: DamageType.Bullet,
      damage: 3,
      range: 14,
      reloadTime: 1.2
    }),
    [ // these are path 1 upgrades, and they add number values, not set them!
      identity<Partial<TowerStats>>({ // this will set range to 16, and reload time to 1.1
        price: 80,
        range: 2,
        reloadTime: -0.1
      }),
      identity<Partial<TowerStats>>({
        price: 260,
        range: 6
      }),
      identity<Partial<TowerStats>>({
        price: 900,
        damage: 2,
        range: 10
      }),
      identity<Partial<TowerStats>>({
        price: 2160,
        damage: 26,
        reloadTime: 0.4,
        range: 6
      }),
      identity<Partial<TowerStats>>({
        price: 4820,
        damage: 55,
        reloadTime: 1.2,
        range: 4
      })
    ],
    [
      identity<Partial<TowerStats>>({
        price: 140,
        damage: 2
      }),
      identity<Partial<TowerStats>>({
        price: 540,
        damage: 1,
        reloadTime: -0.3
      }),
      identity<Partial<TowerStats>>({
        price: 820,
        damage: 2,
        reloadTime: -0.4
      }),
      identity<Partial<TowerStats>>({
        price: 1980,
        damage: 8,
        range: 8
      }),
      identity<Partial<TowerStats>>({
        price: 4380,
        damage: 4,
        reloadTime: -0.15
      })
    ]
  ]
};