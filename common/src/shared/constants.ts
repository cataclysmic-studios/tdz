const enum DevID {
  Runic = 44966864,
  Collin = 101313060,
  Avertnus = 95976124
}

export const CREATOR_ID = game.CreatorType === Enum.CreatorType.User ? game.CreatorId : DevID.Runic; // add your user ID here if you're the creator
export const DEVELOPERS = [CREATOR_ID]; // add extra developer user IDs here