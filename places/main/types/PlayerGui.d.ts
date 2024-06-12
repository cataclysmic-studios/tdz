interface PlayerGui extends BasePlayerGui {
  Main: ScreenGui & {
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
    };
  };
}