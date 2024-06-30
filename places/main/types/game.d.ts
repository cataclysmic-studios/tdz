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

type TowerName = ExtractKeys<ReplicatedFirst["Assets"]["Towers"], TowerFolder>;
type EnemyName = ExtractKeys<ReplicatedFirst["Assets"]["Enemies"], EnemyModel>;
interface TowerFolder extends Folder {
  Level0: TowerModel;
  Level1: TowerModel;
  Level2: TowerModel;
  Level3: TowerModel;
  Level4: TowerModel;
  Level5: TowerModel;
}

interface TowerModel extends CharacterModel {
  Animations: Folder & {
    Idle: Animation;
    Attack: Animation;
  };
}