interface PlayerGui extends BasePlayerGui {
  Main: ScreenGui & {
    LeaveLobby: TextButton;
    Main: Frame & {
      Towers: Frame & {
        UIListLayout: UIListLayout;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
      };
      XP: Frame & {
        Level: TextLabel & {
          UIStroke: UIStroke;
        };
        UIGradient: UIGradient;
        Count: TextLabel & {
          UIStroke: UIStroke;
        };
        UICorner: UICorner;
        UIStroke: UIStroke;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        Bar: Frame & {
          UICorner: UICorner;
          UIGradient: UIGradient;
        };
      };
      Buttons: Frame & {
        Shop: ImageButton & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Icon: ImageLabel;
        };
        PowerUps: ImageButton & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Icon: ImageLabel;
        };
        Combine: ImageButton & {
          UICorner: UICorner;
          UIStroke: UIStroke;
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Icon: ImageLabel;
        };
        Mini: Frame & {
          Achievements: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          VIP: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          Settings: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          Codes: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          Announcements: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          Emotes: ImageButton & {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIAspectRatioConstraint: UIAspectRatioConstraint;
            Icon: ImageLabel;
          };
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          UIGridLayout: UIGridLayout;
        };
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        UIListLayout: UIListLayout;
      };
    };
  }
}