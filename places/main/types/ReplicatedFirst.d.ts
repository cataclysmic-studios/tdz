interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    RangePreview: MeshPart;
    SizePreview: MeshPart & {
      Left: Attachment;
      Right: Attachment;
      Beam1: Beam;
      Beam2: Beam;
    };
    Enemies: Folder & {
      Zombie: CharacterModel;
    };
    Towers: Folder & {
      Rifleman: TowerFolder;
    };
    Maps: Folder & {
      ["Testing Grounds"]: MapModel;
      ["Pleasant Island"]: MapModel;
    }
  };
}