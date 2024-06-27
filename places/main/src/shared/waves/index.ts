import { Difficulty } from "../structs/difficulty";
import EASY_WAVES from "./easy";
import INTERMEDIATE_WAVES from "./intermediate";
import TOUGH_WAVES from "./tough";
import EXPERT_WAVES from "./expert";
import NIGHTMARE_WAVES from "./nightmare";

const WAVES = {
  [Difficulty.Easy]: EASY_WAVES,
  [Difficulty.Intermediate]: INTERMEDIATE_WAVES,
  [Difficulty.Tough]: TOUGH_WAVES,
  [Difficulty.Expert]: EXPERT_WAVES,
  [Difficulty.Nightmare]: NIGHTMARE_WAVES
};

export default WAVES;