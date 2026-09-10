#!/usr/bin/env python3
"""Give the MedLit mark back the white that was cut out of its middle.

THE BUG. The logo was lifted out of the source PDF by deleting its white
background. That is right outside the bottle and wrong inside it. Two whites
are drawn artwork, not background, and both went transparent with everything
else:

  1. THE LABEL. The white band across the bottle that carries the wordmark and
     the tagline. Losing it splits the bottle into two disconnected amber
     pieces with the wordmark floating in a void.
  2. THE LID STRIPE. The thin white line between the lid and the bottle's
     shoulder. Losing it puts a black gash across the neck.

On a white page neither is visible. On a dark browser tab, an iOS home screen
or a dark-mode preview, both are.

WHY THE OBVIOUS FIXES FAIL, in the order I tried them:

  - `binary_fill_holes` only recovers FULLY ENCLOSED regions. The lid stripe
    runs out past the lid's overhang at both ends to the canvas edge, and the
    label band has no boundary left at all, because the bottle's own edge lines
    through that band were white too and went with it. Recovered 156 of 65,536
    pixels.
  - A morphological CLOSE bridges the lid stripe, but at a radius wide enough
    to do that it also bridges the gap under the dot of the "i" — letter
    spacing, painted white, looking like a smear.
  - Filtering those candidates by the colour ringing them (bottle is warm,
    wordmark is navy) fixes the smear and still misses the label band entirely,
    because that band is ringed by BOTH the amber bottle and the navy wordmark
    sitting on it.

WHAT ACTUALLY WORKS. Rebuild the bottle's silhouette instead of trying to find
the gaps. The bottle body is a single flat colour, #f7c76d, that nothing else
in the mark uses. Take those pixels, drop specks, and the convex hull of what
is left is the bottle — a rotated rectangle with a rounded base, convex enough
that a hull traces it within a pixel or two. Every transparent pixel inside
that hull is interior white. The lid stripe sits just outside the hull, so the
close-and-colour-filter still earns its keep for that one.

The recovered pixels are COMPOSITED OVER WHITE, not painted white. A flat
overwrite discards anti-aliased edges and changes how the mark looks on the
white surfaces it actually sits on. Compositing keeps it bit-identical there.

Usage:  python3 tools/repair-logo-interior.py assets/favicon.png ...
        apple-touch-icon.png is additionally flattened onto opaque white,
        because iOS composites a transparent home-screen icon onto BLACK.
"""
import sys
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage
from scipy.spatial import ConvexHull

BOTTLE = np.array([0xF7, 0xC7, 0x6D])   # the bottle body, and nothing else
TOL = 26


def disc(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def bottle_silhouette(arr, solid):
    """Convex hull of the bottle body, as a filled mask. None if not found."""
    rgb = arr[..., :3].astype(np.int16)
    body = solid & (np.abs(rgb - BOTTLE).max(axis=2) <= TOL)
    lab, n = ndimage.label(body)
    if not n:
        return None
    sizes = ndimage.sum(body, lab, range(1, n + 1))
    if sizes.max() < 200:                      # no real bottle in this crop
        return None
    body = np.isin(lab, 1 + np.flatnonzero(sizes > sizes.max() * 0.02))
    ys, xs = np.nonzero(body)
    pts = np.column_stack([xs, ys])
    hull = ConvexHull(pts)
    poly = [tuple(int(v) for v in pts[i]) for i in hull.vertices]
    mask = Image.new("L", (arr.shape[1], arr.shape[0]), 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)
    return np.array(mask) > 0


def thin_gaps(arr, solid):
    """Narrow gaps the bottle encloses but the hull misses — the lid stripe."""
    rgb = arr[..., :3].astype(np.int16)
    warm = solid & ((rgb[..., 0] - rgb[..., 2]) > 30)
    cool = solid & ((rgb[..., 2] - rgb[..., 0]) > 30)
    r = max(2, round(min(arr.shape[:2]) * 0.012))
    closed = ndimage.binary_closing(solid, structure=disc(r))
    candidates = (closed & ~solid) | (ndimage.binary_fill_holes(solid) & ~solid)
    keep = np.zeros_like(candidates)
    labels, n = ndimage.label(candidates)
    ring = disc(2)
    for i in range(1, n + 1):
        comp = labels == i
        halo = ndimage.binary_dilation(comp, structure=ring) & solid
        if warm[halo].any() and not cool[halo].any():
            keep |= comp
    return keep


def repair(path, flatten=False):
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    solid = arr[..., 3] >= 128

    hull = bottle_silhouette(arr, solid)
    label_band = (hull & ~solid) if hull is not None else np.zeros_like(solid)
    stripe = thin_gaps(arr, solid)
    fill = label_band | stripe

    # Composite over white rather than overwrite, so anti-aliased edges survive.
    a = arr[..., 3:4].astype(np.float32) / 255.0
    blended = arr[..., :3].astype(np.float32) * a + 255.0 * (1.0 - a)
    arr[..., :3] = np.where(fill[..., None], np.rint(blended).astype(np.uint8), arr[..., :3])
    arr[..., 3] = np.where(fill, 255, arr[..., 3])

    out = Image.fromarray(arr)
    if flatten:
        bg = Image.new("RGBA", out.size, (255, 255, 255, 255))
        out = Image.alpha_composite(bg, out).convert("RGB")
    out.save(path)
    return int(label_band.sum()), int(stripe.sum()), hull is not None


if __name__ == "__main__":
    for p in sys.argv[1:]:
        flat = p.endswith("apple-touch-icon.png")
        band, stripe, found = repair(p, flatten=flat)
        note = "  + flattened onto white for iOS" if flat else ""
        where = "hull found" if found else "no bottle body — stripe only"
        print(f"  {p}: {where}; label band {band}px, lid stripe {stripe}px{note}")
