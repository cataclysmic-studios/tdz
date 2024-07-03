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
      Zombie: EnemyModel;
      ["Fast Zombie"]: EnemyModel;
      ["Heavy Zombie"]: EnemyModel;
      ["Stealth Zombie"]: EnemyModel;
      Brute: EnemyModel;
    };
    Towers: Folder & {
      Rifleman: TowerFolder;
    };
    Maps: Folder & {
      ["Pleasant Island"]: MapModel;
    };
    UI: Folder & {
      NotificationLabel: TextLabel & { UIStroke: UIStroke; };
    };
    VFX: Folder & {
      Projectiles: Folder & {
        BulletTracer: Part;
        LaserTracer: Part;
      };
    };
  };
}