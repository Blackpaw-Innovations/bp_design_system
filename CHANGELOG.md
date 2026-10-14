# Changelog

Changes to `@blackpaw/ui`. Releases are git tags `vX.Y.Z` on the merge commit;
earlier history lives in those tag messages and their pull requests.

## [1.20.2] - 2026-10-14

### Fixed
- **Popovers opened inside a SlideOver or FormDialog rendered behind it.**
  `.bp-pop` (Select, MultiSelect, DatePicker, DateRangePicker, Menu, table
  filter) sat on `--z-flyout` (50), under the scrim (`--z-overlay` 60) and the
  panel (`--z-panel` 61). It now uses the new `--z-popover` token (65): above
  panels and dialogs, still under toasts (70) and tooltips (80). Found in the
  13 Oct Hakiqa Gym UAT (Sell a plan member picker looked dead).
  Consumers can drop local overrides such as
  `:root .bp-pop { z-index: calc(var(--z-panel) + 1); }`.
