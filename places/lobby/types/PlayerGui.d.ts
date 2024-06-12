interface PlayerGui extends BasePlayerGui {
  Main: ScreenGui & {
    LeaveLobby: TextButton;
    Main: Frame & {
      Towers: Frame & {
        UIListLayout: UIListLayout;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        ["1"]: ImageButton & {
          Viewport: ViewportFrame;
        };
        ["2"]: ImageButton & {
          Viewport: ViewportFrame;
        };
        ["3"]: ImageButton & {
          Viewport: ViewportFrame;
        };
        ["4"]: ImageButton & {
          Viewport: ViewportFrame;
        };
        ["5"]: ImageButton & {
          Viewport: ViewportFrame;
        };
        ["6"]: ImageButton & {
          Viewport: ViewportFrame;
        };
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
    Shop: ImageLabel & {
      Buttons: Frame & {
        UIListLayout: UIListLayout;
        Towers: ImageButton & {
          Title: TextLabel & {
            UIStroke: UIStroke;
          };
          UIAspectRatioConstraint: UIAspectRatioConstraint;
        };
        Crates: ImageButton & {
          Title: TextLabel & {
            UIStroke: UIStroke;
          };
          UIAspectRatioConstraint: UIAspectRatioConstraint;
        };
        Emotes: ImageButton & {
          Title: TextLabel & {
            UIStroke: UIStroke;
          };
          UIAspectRatioConstraint: UIAspectRatioConstraint;
        };
      };
      Towers: ScrollingFrame;
      Crates: ScrollingFrame;
      Emotes: ScrollingFrame;
      UICorner: UICorner;
      UIStroke: UIStroke;
      UIAspectRatioConstraint: UIAspectRatioConstraint;
      Close: ImageButton & {
        UICorner: UICorner;
        UIStroke: UIStroke;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        Icon: ImageLabel;
      };
    };
  };
}