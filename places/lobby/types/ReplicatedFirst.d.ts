interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    UI: Folder & {
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
    };
  };
}