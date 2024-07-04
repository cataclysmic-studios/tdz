import { DamageType, ProjectileType, type PathStats, type TowerStats } from "../../shared/towers";

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
    { // this will set range to 16 (adding 2 to 14)
      price: 120,
      range: 2,
    }, {
      price: 260,
      range: 6,
      reloadTime: -0.1
    }, {
      price: 1000,
      damage: 5,
      range: 10,
      reloadTime: -0.1
    }, {
      price: 3120,
      damage: 10,
      range: 6,
      reloadTime: -0.2
    }, {
      price: 6540,
      damage: 20,
      range: 12,
      reloadTime: -0.5
    }
  ], [ // path 2
    {
      price: 140,
      damage: 2
    }, {
      price: 540,
      damage: 1,
      range: 5
    }, {
      price: 1200,
      damage: 10,
      range: 10,
      reloadTime: -0.1,
      canSeeStealth: true
    }, {
      price: 3450,
      damage: 25,
      range: 12,
      reloadTime: -0.1,
      canSeeStealth: true
    }, {
      price: 5680,
      damage: 60,
      range: 40,
      reloadTime: -0.1,
      canSeeStealth: true
    }
  ]
]);

export default RiflemanStats;