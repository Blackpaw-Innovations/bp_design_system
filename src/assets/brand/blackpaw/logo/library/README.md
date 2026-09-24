# Blackpaw logo library

Naming: `bp-<layout>-<colour>-<background>.png`

- **layout**: `mark` (bp symbol only), `horizontal` / `stacked` (wordmark + tagline), `tagline`, `background`
- **colour**: `color` (gradient mark, navy/coral text), `navy` (navy mark), `white`, `outline`, `color-mark-white-text`
- **background**: `transparent`, or `on-<gradient|black|white>-<square|circle>` (baked-in background)
- `cropped`: tight 1000x226 crop of the horizontal lockup (others are 1000x1000 with padding)
- `-cutout`: white-circle files with the black square corners made transparent. The non-cutout
  `*-on-white-circle.png` keep the original black corners, which act as circular-profile crop guidance.

Use `*-transparent` for in-app placement; `on-*-circle` for profile pictures.
