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

All three "Get involved" buttons — header nav, hero, and the Get involved panel
— point at the same Google Form. If the form link ever changes, change all
three; the header one carries a comment saying so.

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

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch*, pick the
branch and the `/ (root)` folder. Live in a minute or two.

**Netlify** — drag the folder onto the Netlify dashboard, or connect the repo
and leave the build command empty with the publish directory set to `/`.

To preview locally, run `python3 -m http.server` in this folder and open
<http://localhost:8000>. Opening `index.html` straight off disk mostly works,
but the browser blocks the font preload over `file://`.

## Design notes

**Colour.** Sampled from the logo and the Instagram posts, so the site and the
feed match. All defined as CSS variables at the top of `styles.css`.

| | | |
|---|---|---|
| `#FBF8F3` | paper | the page ground — a warm off-white, the colour of a printed handout |
| `#0E1A3C` | ink | the dark panels, headings, footer |
| `#083795` | brand navy | the wordmark blue — links, primary buttons |
| `#2E4674` | post navy | body copy |
| `#FFDDA3` | butter | the Get involved panel, highlights |
| `#F7C56B` | bottle amber | the label card, rules |
| `#FB8645` | cap orange | the bottle cap, the turn in the problem statement |
| `#EAEFF9` | blue-gray | the Guides section ground |

**Type.** Three faces, self-hosted, no CDN:

- **Atkinson Hyperlegible** for body copy. The Braille Institute drew it for
  low-vision readers — it pulls apart the character pairs that normally blur
  together. Given who our workshops are for, it's the whole argument in a
  typeface. Don't swap it out.
- **Outfit** for headlines. Geometric, so it sits naturally beside the logo
  wordmark.
- **IBM Plex Mono** for the prescription label and the small signpost labels.

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

**The label in the hero.** The wording comes straight out of the prescription
guide. It's a stack of `<details>` elements, so it opens and closes with no
JavaScript and is keyboard-operable for free. The inline script only adds the
"3 of 6 lines explained" counter and a shadow on the header once you scroll.
Turn JavaScript off and the page still works completely, with nothing hidden.

## Adding a guide

1. Put the PDF in `assets/guides/`.
2. Make a cover image from its first page, about 620px wide, saved as `.jpg`
   next to the PDF.
3. In `index.html`, find `<!-- ADD NEW GUIDE CARDS HERE -->` and copy the
   `<li class="guide">` block above it.
4. Change the title, the description, the meta line, the cover `src`, and the
   three `href`s.

The grid fills itself in — no CSS changes needed.

## Adding a section

Copy a `<section class="section">` block, give it a unique `id`, and add a
matching link to the header nav. Alternate the backgrounds — plain, then
`section--tint`, `panel panel--ink`, or `panel panel--butter` — so the page
keeps its rhythm. There's an `<!-- ADD NEW SECTIONS HERE -->` marker near the
bottom of `<main>`.

## Accessibility notes

These aren't decoration — please keep them when editing:

- Body text is 18px minimum (`html { font-size: 18px }`); everything else scales
  from it in `rem`. The only type below that is the small mono signpost labels
  (eyebrows, tags, meta lines), which never go under 14px.
- Every text/background pair in the stylesheet meets WCAG AA — 40 pairs checked,
  the lowest at 5.8:1. Butter and amber are light, so they always carry dark navy
  ink, never white.
- Fully keyboard navigable, with a skip link and a visible focus ring that flips
  to butter on the dark panels.
- Hover lifts and transitions are disabled under `prefers-reduced-motion`.
- The label decoder is the only interactive element on the page, and it is a
  native `<details>` — no custom keyboard handling to get wrong.
- Responsive down to a 360px-wide screen, checked for horizontal overflow at
  360, 414, 768, 1024, 1440 and 1920px.
