import type { WaveData } from "shared/structs";

// the length of the last wave doesnt matter so i am setting it to -1 as a marker.

const EASY_WAVES: WaveData[] = [
  { // 1
    length: "1 minute",
    completionReward: 200,
    enemies: [
      {
        enemyName: "Zombie",
        amount: 8,
        interval: 1.2,
        length: -1
      }
    ]
  }, { // 2
    length: "1 minute",
    completionReward: 280,
    enemies: [
      {
        enemyName: "Zombie",
        amount: 12,
        interval: 1,
        length: -1
      }
    ]
  }, { // 3
    length: "1 minute",
    completionReward: 360,
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
  }, { // 4
    length: "1 minute",
    completionReward: 360,
    enemies: [
      {
        enemyName: "Zombie",
        amount: 3,
        interval: 1,
        length: 1.5
      }, {
        enemyName: "Fast Zombie",
        amount: 16,
        interval: 0.8,
        length: 5
      }, {
        enemyName: "Zombie",
        amount: 4,
        interval: 1,
        length: -1
      }
    ]
  }, { // 5
    length: "1 minute",
    completionReward: 360,
    enemies: [
      {
        enemyName: "Fast Zombie",
        amount: 8,
        interval: 1,
        length: 2
      }, {
        enemyName: "Heavy Zombie",
        amount: 10,
        interval: 1.2,
        length: -1
      }
    ]
  }, { // 6
    length: "1 minute",
    completionReward: 400,
    enemies: [
      {
        enemyName: "Zombie",
        amount: 8,
        interval: 1,
        length: 3
      }, {
        enemyName: "Heavy Zombie",
        amount: 8,
        interval: 1.2,
        length: 5
      }, {
        enemyName: "Stealth Zombie",
        amount: 1,
        interval: 1,
        length: -1
      }
    ]
  }
];

export default EASY_WAVES;