interface PlayerGui extends BasePlayerGui {
  Main: ScreenGui & {
    Main: Frame & {
      SkipWave: ImageLabel & {
        Title: TextLabel;
        VoteCount: TextLabel;
        VoteNo: ImageButton & {
          UIGradient: UIGradient;
          UICorner: UICorner;
          UIStroke: UIStroke;
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Icon: ImageLabel;
        };
        UICorner: UICorner;
        UIStroke: UIStroke;
        VoteYes: ImageButton & {
          UIGradient: UIGradient;
          UICorner: UICorner;
          UIStroke: UIStroke;
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Icon: ImageLabel;
        };
        UIGradient: UIGradient;
      };
      NotificationContainer: Frame & {
        UIListLayout: UIListLayout;
      };
      TowerInfo: Frame & {
        Main: ImageLabel & {
          UIStroke: UIStroke;
          TowerName: TextLabel & {
            UIStroke: UIStroke;
          };
        };
        OwnerName: TextLabel & {
          UITextSizeConstraint: UITextSizeConstraint;
          UIStroke: UIStroke;
          UIPadding: UIPadding;
        };
        Level: ImageLabel & {
          Value: TextLabel & {
            UIStroke: UIStroke;
          };
          UIStroke: UIStroke;
        };
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        CanSeeStealth: ImageLabel & {
          UIAspectRatioConstraint: UIAspectRatioConstraint;
        };
      };
      EnemyInfo: Frame & {
        Main: ImageLabel & {
          UIStroke: UIStroke;
          EnemyName: TextLabel & {
            UIStroke: UIStroke;
          };
          UIPadding: UIPadding;
          Health: Frame & {
            Amount: TextLabel & {
              UIStroke: UIStroke;
            };
            UIStroke: UIStroke;
            UIGradient: UIGradient;
            Bar: Frame & {
              UIGradient: UIGradient;
            };
          };
        };
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        Traits: Frame;
      };
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
      Health: Frame & {
        UIGradient: UIGradient;
        Amount: TextLabel & {
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
      TowerUpgrades: ImageLabel & {
        TargetingType: TextLabel;
        NextTargeting: ImageButton;
        LastTargeting: ImageButton;
        Sell: ImageButton & {
          Price: TextLabel;
        };
        Info: Frame & {
          Worth: Frame & {
            UIListLayout: UIListLayout;
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
            };
            Title: TextLabel & {
              UIStroke: UIStroke;
            };
          };
          UIListLayout: UIListLayout;
          Damage: Frame & {
            UIListLayout: UIListLayout;
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
            };
            Title: TextLabel & {
              UIStroke: UIStroke;
            };
          };
        };
        UIPadding: UIPadding;
        Upgrades: Frame & {
          UIListLayout: UIListLayout;
          Path2: Frame & {
            UpgradeName: TextLabel & {
              UIStroke: UIStroke;
            };
            Upgrade: ImageButton & {
              UICorner: UICorner;
              UIStroke: UIStroke;
              UIAspectRatioConstraint: UIAspectRatioConstraint;
              Icon: ImageLabel;
            };
            Price: TextLabel & {
              UIStroke: UIStroke;
            };
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
            };
            LevelIndicator: Frame & {
              UIListLayout: UIListLayout;
              UIPadding: UIPadding;
            };
          };
          Path1: Frame & {
            UpgradeName: TextLabel & {
              UIStroke: UIStroke;
            };
            Upgrade: ImageButton & {
              UICorner: UICorner;
              UIStroke: UIStroke;
              UIAspectRatioConstraint: UIAspectRatioConstraint;
              Icon: ImageLabel;
            };
            Price: TextLabel & {
              UIStroke: UIStroke;
            };
            Icon: ImageLabel & {
              UIAspectRatioConstraint: UIAspectRatioConstraint;
            };
            LevelIndicator: Frame & {
              UIListLayout: UIListLayout;
              UIPadding: UIPadding;
            };
          };
        };
        UICorner: UICorner;
        UIStroke: UIStroke;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        Viewport: ViewportFrame & {
          UIAspectRatioConstraint: UIAspectRatioConstraint;
          Title: TextLabel & {
            UIStroke: UIStroke;
          };
        };
      };
    };
  };
}