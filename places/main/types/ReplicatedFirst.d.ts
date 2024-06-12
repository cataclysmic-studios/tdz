interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    Towers: Folder & {
      Rifleman: TowerFolder;
    };
  };
}