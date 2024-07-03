import { DamageType, ProjectileType, type PathStats, type TowerStats } from "shared/towers";

const RiflemanStats = identity<[TowerStats, PathStats, PathStats]>([
  { // base stats. they are fixed values
    price: 200,
    damageType: DamageType.Bullet,
    projectileType: ProjectileType.Bullet,
    damage: 3,
    range: 14,
    reloadTime: 1.2,
    canSeeStealth: false
  },
  [ // path 1 upgrades. they add number values, not set them!
    { // this will set range to 16, and reload time to 1.1 (adding 2 to 14 and subtracting 0.1 from 1.2)
      price: 80,
      range: 2,
      reloadTime: -0.1
    }, {
      price: 210,
      reloadTime: -0.1,
      range: 3
    }, {
      price: 1030,
      damage: 2,
      reloadTime: -0.4
    }, {
      price: 2160,
      damage: 8,
      reloadTime: -0.2,
      canSeeStealth: true
    }, {
      price: 4820,
      damage: 11,
      range: 6,
      canSeeStealth: true
    }
  ], [ // path 2
    {
      price: 140,
      damage: 2
    }, {
      price: 520,
      damage: 4,
      range: 4
    }, {
      price: 900,
      damage: 8,
      range: 10,
      canSeeStealth: true
    }, {
      price: 2100,
      damage: 18,
      range: 6,
      canSeeStealth: true
    }, {
      price: 7050,
      damage: 40,
      reloadTime: -0.2,
      canSeeStealth: true
    }
  ]
]);

export default RiflemanStats;