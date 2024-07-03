interface TowerPreviewModel extends CharacterModel {
  Idle: Animation;
}

interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    UI: Folder & {
      NotificationLabel: TextLabel & { UIStroke: UIStroke; };
      TeleportScreen: ScreenGui;
      GameLobbyUI: SurfaceGui & {
        Medals: Frame & {
          Easy: ImageLabel;
          Intermediate: ImageLabel;
          Tough: ImageLabel;
          Expert: ImageLabel;
          Nightmare: ImageLabel;
        };
        UIPadding: UIPadding;
        PlayerCount: TextLabel;
      };
      ShopButton: ImageButton & {
        Viewport: ViewportFrame;
        Price: TextLabel;
      };
    };
    Towers: Folder & {
      Rifleman: TowerPreviewModel;
    };
  };
}