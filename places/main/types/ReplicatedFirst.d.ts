interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    RangePreview: Model & {
      Circle: MeshPart;
      Ring: MeshPart;
    };
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
      Traits: Folder & {
        NoEffectivenessTrait: ImageLabel & {
          Icon: ImageLabel;
        };
        RegularTrait: ImageLabel & {
          Icon: ImageLabel;
          Effectiveness: TextLabel;
        };
      };
    };
    VFX: Folder & {
      Projectiles: Folder & {
        BulletTracer: Part;
        LaserTracer: Part;
      };
    };
  };
}