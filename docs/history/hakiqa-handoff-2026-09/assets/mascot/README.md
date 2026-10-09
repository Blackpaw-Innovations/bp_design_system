# Haki mascot assets

**The `.png` files in this folder are the single source of truth.** There is
no `.svg` source — a prior set of hand-drawn SVGs here drew a completely
different, unrelated orange fox/cat character instead of Haki's actual
blue-creature design, and got mistaken for "the real source to rasterize
from" across three separate fix attempts in `hakiqa-connect` (10 Aug, 17 Aug,
20 Aug 2026) before the mismatch was caught. They were deleted for exactly
this reason — don't recreate an SVG version of this character without
re-deriving it from these PNGs and checking it side-by-side first.

To ship a new size/format: rasterize or crop directly from the `.png` files
here, not from any other copy that might exist elsewhere in this repo or
another one.
