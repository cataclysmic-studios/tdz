interface ReplicatedFirst extends Instance {
  Assets: Folder & {
    UI: Folder & {
      NotificationLabel: TextLabel & { UIStroke: UIStroke; };
    };
  };
}