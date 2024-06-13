export const enum DamageType {
  Bullet,
  Laser,
  Ice,
  Fire,
  Melee
}

export interface TowerStats {
  readonly price: number;
  readonly damageType: DamageType;
  readonly damage: number;
  readonly range: number;
  readonly minimumRange?: number;
  readonly reloadTime: number;
  readonly burstCount?: number;
  readonly splashRadius?: number;
}

export const TOWER_STATS = <const>{
  Rifleman: [
    identity<TowerStats>({
      price: 200,
      damageType: DamageType.Bullet,
      damage: 3,
      range: 14,
      reloadTime: 1.2
    }),
    [

    ],
    [

    ]
  ]
};