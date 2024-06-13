interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    RangePreview: MeshPart;
    SizePreview: MeshPart & {
      Left: Attachment;
      Right: Attachment;
      Beam1: Beam;
      Beam2: Beam;
    };
    Towers: Folder & {
      Rifleman: TowerFolder;
    };
    Maps: Folder & {
      ["Testing Grounds"]: MapModel;
    }
  };
}