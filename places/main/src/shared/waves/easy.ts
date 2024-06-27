import type { WaveData } from "shared/structs";

const EASY_WAVES: WaveData[] = [
  {
    length: "1 minute",
    enemies: [
      {
        enemyName: "Zombie",
        amount: 8,
        interval: 1.2
      }
    ]
  }
];

export default EASY_WAVES;