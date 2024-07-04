import type { TowerMeta } from "../../shared/towers"

const RiflemanMeta = identity<TowerMeta[][]>([
  [ // path 1
    {
      name: "Focus",
      icon: "rbxassetid://18325395028"
    }, {
      name: "Speed Training",
      icon: "rbxassetid://18325403805"
    }, {
      name: "Thompson SMG",
      icon: "rbxassetid://18325415475"
    }, {
      name: "Back Support",
      icon: "rbxassetid://18325430042"
    }, {
      name: "M1918 BAR",
      icon: "rbxassetid://18325442872"
    }
  ], [ // path 2
    {
      name: "Enhanced Ballistics",
      icon: "rbxassetid://18325457212"
    }, {
      name: "Enhanced Optics",
      icon: "rbxassetid://18325466881"
    }, {
      name: "M1903 Springfield",
      icon: "rbxassetid://18325476876"
    }, {
      name: "High Caliber",
      icon: "rbxassetid://18325457212"
    }, {
      name: "M1941 Johnson Rifle",
      icon: "rbxassetid://18325492061"
    }
  ]
]);

export default RiflemanMeta
