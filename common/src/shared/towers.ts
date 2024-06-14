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
      })
    ],
    [
      identity<Partial<TowerStats>>({
        price: 140,
        damage: 2,
      })
    ]
  ]
};