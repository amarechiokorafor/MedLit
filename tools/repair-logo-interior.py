#!/usr/bin/env python3
"""Give the MedLit mark back the white that was cut out of its middle.

THE BUG. The logo was lifted out of the source PDF by deleting its white
background. That is correct outside the bottle and wrong inside it: the thin
white stripe between the lid and the bottle body is drawn artwork, not
background, and it went transparent with everything else. On a dark surface — a
dark browser tab, an iOS home screen — it comes back as a black gash.

WHY `binary_fill_holes` IS NOT ENOUGH. It only recovers fully enclosed regions.
This stripe runs out past the lid's overhang at both ends and reaches the edge
of the canvas, so it reads as background. Filling holes recovered 156 of 65,536
pixels.

WHY CLOSING ALONE IS NOT ENOUGH EITHER. A morphological close bridges the
stripe, but at a radius wide enough to do that it also bridges the gap under
the dot of the "i" and the notch beside the "t" — background between letter
shapes, which then gets painted white and looks like a smear.

WHAT ACTUALLY WORKS. Close to find candidate gaps, then keep only the ones the
BOTTLE encloses. The test is the colour of the artwork around each gap: the
bottle is warm (R > B), the wordmark is navy (B > R). A gap ringed by warm
pixels is inside the bottle and gets its white back; a gap touching navy is
letter spacing and is left alone.
"""
import sys
from PIL import Image
import numpy as np
from scipy import ndimage


def disc(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def repair(path, flatten=False, alpha_cut=128):
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[..., :3].astype(np.int16)
    solid = arr[..., 3] >= alpha_cut

    warm = solid & ((rgb[..., 0] - rgb[..., 2]) > 30)   # orange and amber
    cool = solid & ((rgb[..., 2] - rgb[..., 0]) > 30)   # the navy wordmark

    r = max(2, round(min(arr.shape[:2]) * 0.012))
    closed = ndimage.binary_closing(solid, structure=disc(r))
    candidates = (closed & ~solid) | (ndimage.binary_fill_holes(solid) & ~solid)

    keep = np.zeros_like(candidates)
    labels, n = ndimage.label(candidates)
    ring = disc(2)
    kept = skipped = 0
    for i in range(1, n + 1):
        comp = labels == i
        halo = ndimage.binary_dilation(comp, structure=ring) & solid
        if warm[halo].sum() > 0 and cool[halo].sum() == 0:
            keep |= comp
            kept += int(comp.sum())
        else:
            skipped += int(comp.sum())

    # Composite the gap over white rather than painting it white. A flat
    # overwrite would throw away the anti-aliased edge pixels, which changes
    # how the mark looks on the WHITE surfaces it actually sits on — the
    # masthead and the footer chip. Blending each pixel against white gives a
    # result that is bit-identical there and correct everywhere else.
    a = (arr[..., 3:4].astype(np.float32) / 255.0)
    blended = (arr[..., :3].astype(np.float32) * a + 255.0 * (1.0 - a))
    arr[..., :3] = np.where(keep[..., None], np.rint(blended).astype(np.uint8), arr[..., :3])
    arr[..., 3] = np.where(keep, 255, arr[..., 3])
    out = Image.fromarray(arr)

    if flatten:
        # iOS composites a transparent apple-touch-icon onto BLACK, which is
        # the same bug arriving by another route. Give it an opaque white square.
        bg = Image.new("RGBA", out.size, (255, 255, 255, 255))
        out = Image.alpha_composite(bg, out).convert("RGB")

    out.save(path)
    return kept, skipped, r, n


if __name__ == "__main__":
    for p in sys.argv[1:]:
        flat = p.endswith("apple-touch-icon.png")
        kept, skipped, r, n = repair(p, flatten=flat)
        print(f"  {p}: r={r}px, {n} candidate gaps -> repainted {kept}px, "
              f"left {skipped}px as background"
              + ("  + flattened onto white for iOS" if flat else ""))
