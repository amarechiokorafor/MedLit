#!/usr/bin/env python3
"""Guards the two rules the "What we measure" band lives or dies by.

This replaced a one-off check that watched for a placeholder sentence and went
quiet the moment it was replaced. These two never expire, because they guard
mistakes you make while EDITING the numbers, which is the only time they get
touched:

  1. EVERY ROW'S SPLIT MUST ADD UP. Publish "160" over "90 in English,
     70 in Spanish" and then update one number without the others, and the site
     is quietly publishing arithmetic that does not work. A funder or a library
     programming lead will add it up. Checked per row, so adding a second event
     cannot mask a broken first one.

  2. NO BARE PERCENTAGE IN THE VISIBLE TEXT. "16 of 23", never "70%". A
     percentage with no bottom number is a claim the work has not earned. The
     word "percent" spelled out is fine — the "What we measure" band uses it to
     state the rule.

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

    # --- 1. every row's split adds up to that row's headline ---------------
    band = re.search(r'<section class="tally".*?</section>', html, flags=re.S)
    if not band:
        failures.append(
            'No <section class="tally"> found. Was "Our impact" renamed? '
            "If the counts moved, point this check at wherever they live now."
        )
    else:
        rows = re.findall(r"<li>(.*?)</li>", band.group(0), flags=re.S)
        checked = 0
        for i, row in enumerate(rows, 1):
            headline = re.search(r'class="tally__n">([\d,]+)<', row)
            parts = re.findall(r'class="tally__part">([\d,]+)<', row)
            if not headline or not parts:
                continue
            checked += 1
            total = int(headline.group(1).replace(",", ""))
            values = [int(p.replace(",", "")) for p in parts]
            if sum(values) != total:
                failures.append(
                    "Row {} does not add up. The headline says {}, the parts are "
                    "{} and come to {}. Fix whichever is wrong — both are on the "
                    "page for anyone to add up.".format(
                        i, total, " + ".join(str(v) for v in values), sum(values)
                    )
                )
        if not checked:
            failures.append(
                "No row in the tally has both a .tally__n and a .tally__part, so "
                "nothing was checked. Either the markup changed or a row is "
                "half-written."
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

    print("check_numbers: every split adds up and no bare percentage is published.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
