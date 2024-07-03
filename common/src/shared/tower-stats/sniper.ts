import { DamageType, ProjectileType, type PathStats, type TowerStats } from "../../shared/towers";

const SniperStats = identity<[TowerStats, PathStats, PathStats]>([
  { // base stats. they are fixed values
    price: 450,
    damageType: DamageType.Bullet,
    projectileType: ProjectileType.Bullet,
    damage: 10,
    range: 20,
    reloadTime: 2,
    canSeeStealth: false
  },
  [ // path 1 upgrades. they add number values, not set them!
    {
      price: 120,
      range: 4,
      reloadTime: -0.1
    }, {
      price: 280,
      range: 6
    }, {
      price: 900,
      damage: 2,
      range: 8,
      canSeeStealth: true
    }, {
      price: 2160,
      damage: 26,
      reloadTime: 0.6,
      range: 8,
      canSeeStealth: true
    }, {
      price: 4820,
      damage: 55,
      reloadTime: 1,
      range: 12,
      canSeeStealth: true
    }
  ], [ // path 2
    {
      price: 140,
      damage: 4
    }, {
      price: 540,
      damage: 3,
      reloadTime: -0.3
    }, {
      price: 820,
      damage: 2,
      reloadTime: -0.4
    }, {
      price: 1980,
      damage: 8,
      range: 6,
      canSeeStealth: true
    }, {
      price: 4380,
      damage: 4,
      reloadTime: -0.15,
      canSeeStealth: true
    }
  ]
]);

export default SniperStats;