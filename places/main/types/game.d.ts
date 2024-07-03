interface Leaderstats extends Folder {
  readonly Cash: IntValue;
}

interface EnemyModel extends CharacterModel {
  Animations: Folder & {
    Walk: Animation;
  }
}

interface MapModel extends Model {
  PathNodes: Folder & Record<string, Part>;
  EndPoint: Part;
  StartPoint: Part;
}

type ProjectileName = ExtractKeys<ReplicatedFirst["Assets"]["VFX"]["Projectiles"], BasePart>;
type EnemyName = ExtractKeys<ReplicatedFirst["Assets"]["Enemies"], EnemyModel>;
type TowerName = ExtractKeys<ReplicatedFirst["Assets"]["Towers"], TowerFolder>;
type TowerModelName =
  | "Level0"
  | "Level1"
  | "Level2"
  | "Level3A"
  | "Level3B"
  | "Level4A"
  | "Level4B"
  | "Level5A"
  | "Level5B";

type TowerFolder = Folder & Record<TowerModelName, TowerModel>;

interface TowerModel extends CharacterModel {
  Animations: Folder & {
    Idle: Animation;
    Attack: Animation;
  };
}