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

**The idea: the small press.** MedLit's product is a plain-language *edition* of
a document nobody can read. So the site is built as the press that publishes
those editions — warm bone stock, a transitional serif for display, hairline
rules, foil stamped in the logo's own navy and amber, section folios in the
margin, and exactly one shadow on the whole page.

The register is deliberate. The two people this page has to convince are an
activity director at a senior community and a library programming lead, both
deciding whether to hand a room full of their people over to students. A press
or an imprint reads as edited and accountable. A SaaS landing page does not.

The printed guide in `assets/guides/` is still the source of the annotation
vocabulary, and it survives where it earns its place: the label plate, the
numbered callouts on it, and the amber marker on the one line that matters.
Everything else is set as a book rather than as a document with notes on it.

Six rules hold it together:

1. **The label is the hero.** It is the whole mission in one object a person can
   click, at the top of the page, at full width. It was once a small box in the
   corner. Don't put it back there.
2. **Serif for display, Atkinson Hyperlegible for anything read at length.**
   Never the reverse. See the type notes below — this one is not negotiable.
3. **Amber is foil, not text.** It fills, rules and underlines. As text on bone
   it is 1.9:1.
4. **One shadow on the page**, under the guide, because the guide is the only
   thing here that is a physical object. If a second appears, delete it.
5. **Radius 0 everywhere.** Books are trimmed square.
6. **Nothing needs JavaScript to be read.**

**Rhythm.** The variation down the page is deliberate, and it is the part
easiest to destroy by adding one more section in the "house style". In order:
title page, thin routing strip, full-bleed facing-page translation, one enormous
statement alone on the screen with a drop cap, guides on a recessed band,
two-column workshops, a deliberately narrow and quiet checks list, full-bleed
reversed host, volunteer on a band again. If everything becomes the same frame,
the design is gone even if every colour is still correct.

**Colour.** The navy and the amber are the logo's own — the wordmark and the
pill bottle's cap. What changed in the redesign is the *ground*: white was
replaced by bone stock, and body copy is set in a warm near-black instead of in
navy. Navy is now foil. It appears on headings, rules and buttons, where it
reads as stamped rather than as the default colour of everything.

| | | |
|---|---|---|
| `#F3EEE3` | bone | the page ground |
| `#EAE2D2` | warm bone | recessed bands — guides, volunteer |
| `#FDFBF7` | sheet | plates and cards, the stock inside the frame |
| `#1B1915` | ink | body copy |
| `#57503F` | soft ink | captions and secondary copy |
| `#093A94` | brand navy | the wordmark's own. Headings, rules, primary actions |
| `#0F47AE` | mid navy | the lighter foil, held in reserve |
| `#0A2050` | deep navy | the reversed chapters and the footer |
| `#E8A33D` | bottle amber | the imprint marks, the kicker rule, the annotation spines |
| `#F0BC6A` | foil amber | the marker under the line that matters |
| `#F7E4BE` | pale amber | the fill on the `Sig` row and on door hovers |
| `#D6CCB6` | rule | the hairline that draws almost all the structure |
| `#B0A184` | firm rule | plate borders, section divisions, folios |

Everything used on the page was measured. The floor is AA and almost everything
clears AAA: ink on bone 15.2, soft ink on bone 6.9, navy on bone 8.9, amber on
deep navy 7.3, ink on pale amber 14.0.

Two pairs are ruled out by construction, not by care: **amber is never text on
bone** (1.9:1) and **white is never text on amber** (1.7:1).

**Type.** Three faces, self-hosted, latin subsets, no CDN — about 155 KB for the
set, which matters because this may load on an old phone on library wifi.

- **Atkinson Hyperlegible** for everything read at length. The Braille Institute
  drew it for low-vision readers — it pulls apart the character pairs that
  normally blur together. Given who our workshops are for, it's the whole
  argument in a typeface. **Don't swap it out.** The Stripe Press register this
  design borrows from would normally set body copy in an old-style serif; that
  is the one part of the recipe deliberately not followed, and legibility is why.
- **Source Serif 4** for display only — headings, pull quotes, the drop cap,
  captions. A transitional serif reads as an imprint, something edited. The
  optical-size axis is pinned at 28 and the weight axis left variable, which is
  why one 45 KB file covers 400–700.
- **IBM Plex Mono** for transcribed documents only — the label plate and the
  jargon column in the translation. It is the artefact's own voice.

Three typographic rules that are easy to undo by accident:

**Emphasis is italic, not a second colour.** The `h1` sets one word in the
serif's true italic. An earlier version tinted it blue. A serif has a real
italic and does not need the extra colour.

**Monospace is not a label style.** Where a small label is needed it is
Atkinson, letter-spaced, uppercase, at `.78`–`.82rem` — see `.kicker`,
`.facts dt`, `.rx__key`. Monospace on the page means "this is transcribed from
a real document", nothing else.

**The scale is three steps, not a ramp.** `--t1` / `--t2` / `--t3`. Nothing sits
between them, and something on the page is genuinely large. Add a fourth only if
you truly need it, and put it in the token block rather than inline.

**The signature moves**, so that edits keep them:

- **The imprint.** A 6px navy band across the top of the masthead with an amber
  block stamped into its left end, repeated at the top of the footer. It opens
  and closes the page.
- **The kicker rule.** Every kicker is followed by a hairline with an amber head
  — `.kicker::after`. It is the one ornament repeated across the page, which is
  what makes it a system rather than a flourish.
- **Section folios.** `§ 01`, `§ 02` in the margin, from a CSS counter on
  `main > section`, so sections can be added or reordered and the numbering
  follows. The `/ ""` in the `content` value gives the generated text an empty
  alternative so screen readers skip it — it is a printer's mark, not something
  anyone needs read aloud.
- **The plate.** The label sits on sheet stock inside a double rule (a border
  plus an `outline` with offset, so the outer line costs no layout and can never
  push the page wide).
- **The drop cap**, three lines deep in foil navy, on the problem statement and
  nowhere else.
- **The book object.** The guide cover carries a navy spine and the page's only
  shadow.

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
rather than described, and it is the most persuasive thing on the page. It is
set as a verso and a recto. The jargon is on the left, in the label's monospace,
reversed out of deep navy, because that is what it is: a transcribed document.
The plain version is on the right on sheet stock, large, in the serif, with the
dose ceiling marked. The two kickers borrow the printed guide's own words. Keep
the two halves the same instruction — if they ever drift apart the section stops
being an argument.

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

Do not give a new section a kicker, a folio and a definition table just because
other sections have them. The folio arrives on its own from the counter; the
rest should be a decision. Sameness is the thing this design was rebuilt to get
rid of.

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
  from it in `rem`. The only type below that is structural chrome — kickers,
  definition terms, the label's keys, the folios — which never goes under 14px
  and is never something you read a sentence of. The masthead nav is at full
  body size and sentence case on purpose: small letterspaced caps would have
  suited the imprint, but the people this page is for should not have to squint
  at the navigation.
- Every text/background pair on the rendered page meets WCAG AA. Verified in a
  real browser rather than by eye: 95 visible text nodes measured at 1440, 768
  and 390px, with the `<details>` rows forced open, and none below its threshold.
  Amber is light, so it always carries dark ink, never white.
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
