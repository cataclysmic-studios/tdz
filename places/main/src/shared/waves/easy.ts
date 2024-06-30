import type { WaveData } from "shared/structs";

// the length of the last wave doesnt matter so i am setting it to -1 as a marker.

const EASY_WAVES: WaveData[] = [
  {
    length: "1 minute",
    enemies: [
      {
        enemyName: "Zombie",
        amount: 8,
        interval: 1.2,
        length: -1
      }
    ]
  }, {
    length: "1 minute",
    enemies: [
      {
        enemyName: "Zombie",
        amount: 12,
        interval: 1,
        length: -1
      }
    ]
  }, {
    length: "1 minute",
    enemies: [
      {
        enemyName: "Zombie",
        amount: 6,
        interval: 1,
        length: 3
      }, {
        enemyName: "Fast Zombie",
        amount: 8,
        interval: 0.8,
        length: -1
      }
    ]
  }
];

export default EASY_WAVES;