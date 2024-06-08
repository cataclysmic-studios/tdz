interface PlayerGui extends BasePlayerGui {
  LoadScreen: ScreenGui & {
    Background: ImageLabel & {
      UIGradient: UIGradient;
      UIPadding: UIPadding;
      Spinner: ImageLabel & {
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        MiniSpinner: ImageLabel;
      };
      Logo: ImageLabel & {
        UIAspectRatioConstraint: UIAspectRatioConstraint;
      };
    };
  };
}