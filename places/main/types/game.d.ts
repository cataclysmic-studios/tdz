interface MapModel extends Model {
  EndPoint: Part;
  StartPoint: Part;
}

type TowerName = ExtractKeys<ReplicatedFirst["Assets"]["Towers"], TowerFolder>;
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
  };
}