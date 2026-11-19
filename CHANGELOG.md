# Changelog

Changes to `@blackpaw/ui`. Releases are git tags `vX.Y.Z` on the merge commit;
earlier history lives in those tag messages and their pull requests.

## [1.20.3] - 2026-10-16

### Fixed
- **Open popovers covered toasts.** `.toast-region` was hard-coded to
  z-index 60, under `--z-popover` (62) and SlideOvers (61). It now uses
  `--z-toast` (70), so toasts and their Undo/Retry actions stay on top.

## [1.20.2] - 2026-10-16

### Fixed
- **Popovers opened inside a SlideOver or FormDialog rendered behind it.**
  `.bp-pop` (Select, MultiSelect, DatePicker, DateRangePicker, Menu, table
  filter) moved from `--z-flyout` (50) to the new `--z-popover` (62), above
  `--z-panel` (61). Found in the 13 Oct Hakiqa Gym UAT. Consumers can drop
  local `.bp-pop { z-index }` overrides.
- `.facts` is styled on its own at 15 px; `.bp-dock-section .facts` keeps 14 px.
