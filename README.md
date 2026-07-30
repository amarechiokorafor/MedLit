# MedLit — website

Single-page static site for MedLit. Plain HTML + CSS, no frameworks and no build
step, so it deploys as-is.

```
index.html                       the whole page (plus ~40 lines of inline JS)
styles.css                       the whole stylesheet
assets/medlit-logo.png           stacked lockup — header and footer
assets/medlit-logo-vertical.png  full lockup with tagline — source for the icons
assets/favicon.png               browser tab icon
assets/apple-touch-icon.png      iOS home-screen icon
assets/fonts/                    self-hosted woff2 (5 files, ~97 KB total)
assets/guides/                   guide PDFs and their cover images
```

Both lockups are cut from the official logo PDF at print resolution with
transparent backgrounds. The favicon is the vertical lockup squared off — it
keeps the wordmark, which a bottle-only icon would lose. In the footer the
wordmark sits on a white chip, because navy-on-navy would disappear.

## The volunteer form

Two links point at the same Google Form: the third of the three doors at the
top of the page, and the button in the Volunteer chapter. If the form link ever
changes, change both; the Volunteer one carries a comment saying so.

Volunteer submissions are handled by `automation/MedLit.gs`: it copies each one
to a Volunteers tab, emails you an alert, and sends the volunteer a
confirmation. That file has its own setup notes at the top.

## Installed skills

`.claude/skills/ui-ux-pro-max/` is a third-party design-reference skill from
<https://github.com/nextlevelbuilder/ui-ux-pro-max-skill> (MIT). It is a local,
searchable database of UI styles, colour palettes, font pairings and UX
guidelines. Nothing in it runs on its own or is published with the site —
`.claude/` is a dot-directory, so GitHub Pages skips it.

It is a reference to consult, not an authority. Where its suggestions disagree
with the design notes below or with the MedLit style guide, the notes below win.

## MCP servers

`.mcp.json` registers the 21st.dev MCP server for anyone who opens this repo in
Claude Code. It reads the key from `API_KEY_21ST` in your environment rather
than storing it, so nothing secret is committed. Set the variable, then restart
Claude Code and approve the server when prompted.

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch*, pick the
branch and the `/ (root)` folder. Live in a minute or two.

**Netlify** — drag the folder onto the Netlify dashboard, or connect the repo
and leave the build command empty with the publish directory set to `/`.

To preview locally, run `python3 -m http.server` in this folder and open
<http://localhost:8000>. Opening `index.html` straight off disk mostly works,
but the browser blocks the font preload over `file://`.

## Design notes

**The idea.** The best-designed thing this organisation has made is the guide in
`assets/guides/`. It annotates a real document: numbered callouts pointing at
the thing itself, plain language beside each one, and the single line that
matters most swiped in amber. That is the visual vocabulary here.

It is a vocabulary, not a template. An earlier version of this site applied the
same numbered-badge + heading + definition-table frame to six sections in a row,
and the repetition read as machinery rather than as design. So the callouts now
appear only where they mean something — the label and the guide — and each
section gets the width, alignment and scale its own job needs.

Six rules hold it together:

1. **The label is the hero.** It is the whole mission in one object a person can
   click, at the top of the page, at full width. It was once a small box in the
   corner. Don't put it back there.
2. **One accent word on the page**, in the `h1`. The blue-highlighted word is a
   device; used six times it is a tic.
3. **Three type sizes, far apart.** `--t1` is about six times body and `--t2`
   about two and a third. Nothing sits between them, and something on the page
   is genuinely large.
4. **Two widths, used with intent.** `.wide` fills the page, `.read` commits to
   a narrow measure. Content floating in the middle of a mid-size container with
   dead margins either side is what "unfinished" looks like.
5. **No shadows and no gradients.** Depth is hairline rules and flat fills. The
   guide has none; a `box-shadow` is the tell of a page laid out by default.
6. **Nothing needs JavaScript to be read.**

**Rhythm.** The variation down the page is deliberate, and it is the part
easiest to destroy by adding one more section in the "house style". In order:
wide hero, thin routing strip, full-bleed two-tone translation, one enormous
statement alone on the screen, asymmetric guides on a tint, two-column
workshops, a deliberately narrow and quiet checks list, full-bleed reversed
host, asymmetric volunteer. If everything becomes the same frame again, the
design is gone even if every colour is still correct.

**Colour.** Read off the logo file and the printed guide with a colour picker.
Nothing here is invented. All defined as CSS variables at the top of
`styles.css`.

| | | |
|---|---|---|
| `#FFFFFF` | white | the page ground, like the guide's |
| `#063690` | brand navy | the wordmark — 98% of the lockup's letterforms. Links, badges, primary actions |
| `#0C3CA2` | badge navy | the navy of the guide's own numbered callouts |
| `#041D5C` | deep navy | the inverted chapter and the footer |
| `#1F6FB2` | accent blue | the guide's light accent blue, deepened until it passes AA as text |
| `#0D1A3D` | ink | headings |
| `#26365F` | body | reading copy |
| `#B4D8F6` | panel blue | the fill of the guide's callout panels |
| `#EAF1FC` | tint | the faintest wash — the Workshops chapter ground |
| `#C9DCF4` | rule | the hairline that draws almost all the structure |
| `#F6C66C` | bottle amber | the badge on the inverted chapter, the annotation spines |
| `#FC8442` | cap orange | the strip down the label, the turn in the problem statement |
| `#FCF0CC` | swipe | the highlight, the one that matters |

Two pairs are ruled out by construction, not by care: **white text never sits on
the cap orange** (2.5:1) and **the guide's light accent blue is never text on
white** (2.9:1) — it appears only as a fill or a rule. That is why `--accent`
exists as a deepened version of it.

**Type.** Three faces, self-hosted, no CDN:

- **Atkinson Hyperlegible** for body copy. The Braille Institute drew it for
  low-vision readers — it pulls apart the character pairs that normally blur
  together. Given who our workshops are for, it's the whole argument in a
  typeface. Don't swap it out.
- **Outfit** for headlines. Geometric, so it sits naturally beside the logo
  wordmark.
- **IBM Plex Mono** for transcribed documents only — the label sheet and the
  jargon column in the translation. It is the artefact's own voice.

Two typographic rules that are easy to undo by accident:

**Monospace is not a label style.** Small uppercase letter-spaced monospace
eyebrows (`STUDENT-LED NONPROFIT`, `THE PROBLEM`, `HOW LONG`) read as a stock
design tic, and they were removed. Where a label is needed it is the same
typeface as everything else at a lighter weight, in sentence case — see
`.eyebrow`, `.facts dt`, `.translate__label`. The only uppercase left on the
page is the pharmacy line on the label, which is how labels actually print.

**The scale is three steps, not a ramp.** `--t1` / `--t2` / `--t3`. The
previous version had the hero and the section headings within 1.4× of each
other, which is why it read flat. Add a new size only if you genuinely need a
fourth, and then add it to the token block rather than inline.

**Writing.** Every piece of text a person reads follows the MedLit style guide.
That means the website, the emails and form copy in `automation/MedLit.gs`, the
logging dialogs, and error messages — not just the page.

- Short declarative sentences. Vary the rhythm. Fragments are fine for emphasis.
- Second person. "Your prescription label", not "the patient's medication".
- Concrete nouns. "Prescription labels, lab results, insurance letters", not
  "health information".
- Blame the system, not the person. The documents were badly designed and
  nobody explained them.
- Periods instead of em dashes.
- Headings state something rather than label it.
- No "empower", "leverage", "impact" as a verb, "solutions", "innovative". No
  "not because X, but because Y".
- No claim we haven't earned. Comprehension scores get reported with their
  denominator, as "16 of 23", never as a bare percentage.

If you edit copy, read it aloud first. If you wouldn't say it to someone's
face, rewrite it.

**The label is the hero.** The guide's centrepiece, rebuilt for the web and put
at the top of the page at full width, because one real label a person can open
argues the mission better than any paragraph. The wording comes straight out of
the printed guide. It's a stack of `<details>` elements, so it opens and closes
with no JavaScript and is keyboard-operable for free. The callout numbers are
CSS counters — add, remove or reorder lines and they renumber themselves.

The rows run in **two columns**, which is how the printed guide arranges its
callouts around the bottle, and it means the wide measure carries content rather
than air. The `Sig` line spans both columns because it is the line that matters
most, which is the same emphasis the guide gives it — that is the `.is-key`
class, and there should only ever be one.

The inline script does one thing: it *appends* the "3 of 6 lines explained"
readout. Delete the script and you lose that line and nothing else — the page
hides nothing.

**The translation.** The before/after section is the actual product, shown
rather than described, and it is the most persuasive thing on the page. The
jargon is set in the label's monospace on navy because that is what it is: a
transcribed document. The plain version is large, in the reading face, on white,
with the dose ceiling swiped. The column headings borrow the printed guide's own
words. Keep the two halves the same instruction — if they ever drift apart the
section stops being an argument.

There is no scroll animation anywhere, on purpose. The first audience for this
page is an activity director deciding whether to trust students with their
residents, and they are not here to watch things fade in.

## Adding a guide

1. Put the PDF in `assets/guides/`.
2. Make a cover image from its first page, about 620px wide, saved as `.jpg`
   next to the PDF.
3. In `index.html`, find `<!-- ADD NEW GUIDE CARDS HERE -->` and copy the
   `<li class="guide">` block above it.
4. Change the title, the alt text, the description, the three `<dd>` facts, the
   cover `src`, and both `href`s.

No CSS changes, ever. While there is only one guide it gets the full width and a
large cover, because the guides are the only real proof of work on the page and a
lone one shouldn't sit in a half-empty row. Add a second and both fall back to an
even grid; add ten and they wrap. That switch is a single `:has()` rule in
`styles.css` under "The guide shelf".

## Adding a section

There's an `<!-- ADD NEW SECTIONS HERE -->` marker near the bottom of `<main>`.
Give the section a unique `id`, a heading, and a matching link in the masthead
nav.

Then make a real decision about its width and weight, because there is no
house frame to drop it into and that is on purpose:

- `.wide` if it uses the page — a grid, artwork, a table of facts.
- `.read` if it is something to read. Two columns of prose at 84rem is not.
- Reverse it (navy ground, `--on-navy` text) only if it deserves the weight.
  There is one reversed section and one full-bleed two-tone section already;
  a third would spend what they buy.

Do not give a new section a numbered badge and a definition table just because
other sections have them. That sameness is the thing this design was rebuilt to
get rid of.

## Sharing

`assets/og-image.jpg` is the card that appears when the link is pasted into a
message, an email, or a social post. It is rendered from the site's own fonts and
colour variables, so it cannot drift from the page.

To regenerate it: build a 1200x630 HTML card, screenshot it headless at exactly
that size, and save it as JPEG.

```
python3 -m http.server 8000
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --screenshot=og.png --window-size=1200,630 http://localhost:8000/card.html
```

Serve it over HTTP rather than opening the file off disk — the self-hosted fonts
won't load over `file://`, and the card would silently render in a fallback face.

The `og:` and `canonical` URLs in `index.html` all point at
`https://amarechiokorafor.github.io/MedLit/`. If the site ever moves to its own
domain, those four URLs change with it.

## Accessibility notes

These aren't decoration — please keep them when editing:

- Body text is 18px minimum (`html { font-size: 18px }`); everything else scales
  from it in `rem`. The only type below that is the small mono structural labels
  (kickers, keys, meta lines), which never go under 14px.
- Every text/background pair in the stylesheet meets WCAG AA — 43 pairs checked,
  the lowest at 5.28:1 and most above 9:1. Amber and the swipe are light, so they
  always carry dark navy ink, never white.
- Fully keyboard navigable, with a skip link and a visible focus ring that flips
  to amber on the reversed sections and the footer.
- Every section contributes exactly one `<h2>` to the document outline. The
  translation and the problem statement have no visible heading — their content
  *is* the statement — so each carries a visually hidden `<h2>` instead. That is
  what the two `class="hidden"` headings are for; don't delete them to tidy up.
- The label decoder is the only interactive element on the page, and it is a
  native `<details>` — no custom keyboard handling to get wrong.
- Responsive down to a 360px-wide screen. Overflow is measured, not eyeballed:
  `scrollWidth` compared against `innerWidth` at 360, 390, 414, 768, 1024, 1440
  and 1920px. Watch for `minmax()` grid tracks — a bare `minmax(26rem, 1fr)`
  cannot shrink below its own minimum and will force a 468px column onto a 360px
  screen. The guide shelf uses `minmax(min(26rem, 100%), 1fr)` for exactly that
  reason.
- Every link and button is at least 44px tall on a phone. Measured, not
  assumed — the nav and the footer contact links both used to fall short.
