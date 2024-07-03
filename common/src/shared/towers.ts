export type UpgradePath = 1 | 2;
export type PathLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeLevel = [PathLevel, PathLevel];
export type PathStats = readonly [Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>, Partial<TowerStats>];

export const enum DamageType {
  Bullet = "Bullet",
  Laser = "Laser",
  Ice = "Ice",
  Fire = "Fire",
  Melee = "Melee"
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
  Rifleman: [
    identity<TowerMeta[]>([
      {
        name: "Focus",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Enhanced Optics",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Sharpshooter Accuracy",
        icon: "rbxassetid://10909681909"
      }, {
        name: ".308 Winchester",
        icon: "rbxassetid://10909681909"
      }, {
        name: ".50 BMG",
        icon: "rbxassetid://10909681909"
      }
    ]),
    identity<TowerMeta[]>([ // path 2
      {
        name: "Enhanced Ballistics",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Speed Training",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Semi Auto",
        icon: "rbxassetid://10909681909"
      }, {
        name: "High Caliber",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Full Auto",
        icon: "rbxassetid://10909681909"
      }
    ])
  ],
  Sniper: [
    [
      {
        name: "Focus",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Enhanced Optics",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Sharpshooter Accuracy",
        icon: "rbxassetid://10909681909"
      }, {
        name: ".308 Winchester",
        icon: "rbxassetid://10909681909"
      }, {
        name: ".50 BMG",
        icon: "rbxassetid://10909681909"
      }
    ], [
      {
        name: "Enhanced Ballistics",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Speed Training",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Semi Auto",
        icon: "rbxassetid://10909681909"
      }, {
        name: "High Caliber",
        icon: "rbxassetid://10909681909"
      }, {
        name: "Full Auto",
        icon: "rbxassetid://10909681909"
      }
    ]
  ]
}

export const TOWER_STATS = <const>{
  Rifleman: [
    identity<TowerStats>({ // this is base stats. they are fixed values
      price: 200,
      damageType: DamageType.Bullet,
      projectileType: ProjectileType.Bullet,
      damage: 3,
      range: 14,
      reloadTime: 1.2,
      canSeeStealth: false
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
        range: 10,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 2160,
        damage: 26,
        reloadTime: 0.6,
        range: 6,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 4820,
        damage: 55,
        reloadTime: 1,
        range: 12,
        canSeeStealth: true
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
        range: 6,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 4380,
        damage: 4,
        reloadTime: -0.15,
        canSeeStealth: true
      })
    ]
  ],
  Sniper: [
    identity<TowerStats>({ // this is base stats. they are fixed values
      price: 200,
      damageType: DamageType.Bullet,
      projectileType: ProjectileType.Bullet,
      damage: 3,
      range: 14,
      reloadTime: 1.2,
      canSeeStealth: false
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
        range: 10,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 2160,
        damage: 26,
        reloadTime: 0.6,
        range: 6,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 4820,
        damage: 55,
        reloadTime: 1,
        range: 12,
        canSeeStealth: true
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
        range: 6,
        canSeeStealth: true
      }),
      identity<Partial<TowerStats>>({
        price: 4380,
        damage: 4,
        reloadTime: -0.15,
        canSeeStealth: true
      })
    ]
  ]
};