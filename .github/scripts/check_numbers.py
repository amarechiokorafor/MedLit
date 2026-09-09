#!/usr/bin/env python3
"""Guards the two rules the "What we measure" band lives or dies by.

This replaced a one-off check that watched for a placeholder sentence and went
quiet the moment it was replaced. These two never expire, because they guard
mistakes you make while EDITING the numbers, which is the only time they get
touched:

  1. THE SPLIT MUST ADD UP. Publish "160 guides" over "90 in English /
     70 in Spanish" and then update one number without the others, and the site
     is quietly publishing arithmetic that does not work. A funder or a library
     programming lead will add it up.

  2. NO BARE PERCENTAGE IN THE VISIBLE TEXT. "16 of 23", never "70%". A
     percentage with no bottom number is a claim the work has not earned. The
     word "percent" spelled out is fine — the band's own copy uses it to state
     the rule.

Run it locally the same way CI does:  python3 .github/scripts/check_numbers.py
Exits 0 when clean, 1 with an explanation when not.
"""

import re
import sys
from pathlib import Path

PAGE = Path(__file__).resolve().parents[2] / "index.html"


def visible_text(html: str) -> str:
    """Everything a person actually reads. Comments, scripts, styles and tags
    are stripped, which also keeps URL escapes like %20 in a mailto out of the
    percentage check."""
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def main() -> int:
    html = PAGE.read_text(encoding="utf-8")
    failures = []

    # --- 1. the split adds up ------------------------------------------------
    band = re.search(
        r'<section class="measure".*?</section>', html, flags=re.S
    )
    if not band:
        failures.append('No <section class="measure"> found. Was the band renamed?')
    else:
        band = band.group(0)
        headline = re.search(r"<b>([\d,]+)\s", band)
        parts = re.findall(r'class="measure__n">([\d,]+)<', band)
        if headline and parts:
            total = int(headline.group(1).replace(",", ""))
            values = [int(p.replace(",", "")) for p in parts]
            if sum(values) != total:
                failures.append(
                    "The split does not add up. Headline says {}, the parts are "
                    "{} and come to {}. Fix whichever is wrong — both are on the "
                    "page for anyone to add up.".format(
                        total, " + ".join(str(v) for v in values), sum(values)
                    )
                )
        elif parts and not headline:
            failures.append(
                "There is a .measure__split but no <b>number</b> headline above "
                "it to check it against."
            )

    # --- 2. no bare percentage ----------------------------------------------
    bare = re.findall(r"\d[\d,.]*\s*%", visible_text(html))
    if bare:
        failures.append(
            "Bare percentage in the visible text: {}. The denominator is not "
            'optional — write "16 of 23", never "70%".'.format(", ".join(bare))
        )

    if failures:
        print("check_numbers: FAIL\n")
        for f in failures:
            print("  - " + f + "\n")
        return 1

    print("check_numbers: the split adds up and no bare percentage is published.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
