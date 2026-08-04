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
assets/fonts/                    self-hosted woff2 (4 files, ~96 KB total)
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

`.claude/skills/` holds third-party design-reference skills for anyone who opens
this repo in Claude Code. Nothing in them runs on its own or is published with
the site — `.claude/` is a dot-directory, so GitHub Pages skips it.

| Skill | From | What it is for |
|---|---|---|
| `frontend-design` | anthropics/claude-code | Distinctive visual direction. The most useful one here — see the note below. |
| `anti-ui-slop` | github/awesome-copilot | A design contract and a finish gate to run before calling a UI done. |
| `web-design-reviewer` | github/awesome-copilot | Structured critique of a rendered page. |
| `web-design-engineer` | ConardLi/garden-skills | Workflow: design read, system declaration, v0, build, verify. |
| `taste-skill` | leonxlnx/taste-skill | Anti-template landing-page direction, audit-first on redesigns. |
| `minimalist-skill` | leonxlnx/taste-skill | The `minimalist-ui` recipe. |
| `brutalist-skill` | leonxlnx/taste-skill | The `industrial-brutalist-ui` recipe. |
| `frontend-ui-ux` | code-yeongyu/oh-my-opencode | Taste router, palettes, accessibility critique, Lighthouse workflow. |
| `ui-ux-pro-max` | nextlevelbuilder | Searchable database of UI styles, palettes, font pairings. |
| `gsap-core` | greensock/gsap-skills | GSAP's core API, for reference. |

**Four from that list were deliberately not installed**, because this site is one
HTML file and one stylesheet with no build step:

- **shadcn** — a React + Tailwind component registry installed through a CLI.
  There is no React, no Tailwind, no `package.json` and no build here. It has
  nothing to attach to.
- **mobile-app-ui-design** and **swiftui-skills** — native iOS and Android
  patterns and Swift code.
- **material-3-skill** — Material Design. Its elevation, ripple and pill-shaped
  components would fight this page's visual language in every direction at once.

**These are references, not authorities**, and several of them contradict each
other and this project. Where they disagree with the design notes below or with
the MedLit style guide, the notes below win. Specifically:

- `premium-frontend-ui` asks for preloaders, scroll hijacking, custom cursors
  and magnetic buttons. On a page whose primary audience is older adults on
  library wifi, every one of those is a cost with no return. What was taken from
  it: extreme type-scale contrast, `transform`/`opacity`-only animation, and
  guarding hover effects behind `@media (hover: hover) and (pointer: fine)`.
- `minimalist-skill` prescribes warm bone off-white with an editorial serif —
  which is the exact look this site just moved away from, for the reason in
  the design notes. What was taken from it: the motion spec (`IntersectionObserver`,
  `translateY`, 600ms, `cubic-bezier(.16, 1, .3, 1)`).
- `brutalist-skill` is installed because it was asked for, and is not applied.
  Analog degradation effects and extreme density are the opposite of what this
  audience needs.

The one that changed the design outright is `frontend-design`, which says: *"AI
generated design right now clusters around three looks: (1) a warm cream
background (near #F4F1EA) with a high-contrast serif display and a terracotta
accent … (3) a broadsheet-style layout with hairline rules, zero border-radius,
and dense newspaper-like columns."* The previous version of this site was bone
`#F3EEE3`, a transitional serif display, hairline rules and zero radius — both
of those clusters at once. It was executed well and it still belonged to nobody.
That is what the current version is a reaction to.

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

**The idea.** MedLit's whole argument is that a document should be readable. So
the page is built out of MedLit's own materials rather than out of a house
style:

- **Pharmacy amber, at full strength, as a field.** Not a 4px accent. It is the
  one colour nobody else in this category owns, because it is the colour of the
  bottle in the logo.
- **White label stock for the documents that sit on it.** The document reader
  overlaps the amber edge the way a label wraps a bottle.
- **Every word set in Atkinson Hyperlegible Next** — the body copy and the 124px
  headline alike. An organisation whose entire product is legibility should not
  borrow an editorial serif to look serious. The personality comes from scale,
  weight and colour.

The register is deliberate. The two people this page has to convince are an
activity director at a senior community and a library programming lead, both
deciding whether to hand a room full of their people over to students. Loud and
legible reads as confident. It also happens to be the thing MedLit sells.

Five rules hold it together:

1. **The document reader is the hero.** It is the whole mission in three objects
   a person can click, at the top of the page, at full width. It was once a small
   box in the corner. Don't put it back there.
2. **One typeface for language, one for transcribed documents.** If a serif shows
   up here again, ask what it knows that Atkinson doesn't.
3. **Amber carries dark ink only.** White on amber is 1.7:1, and `--ink-2` on
   amber is 4.1:1. On amber the secondary voice is `--navy-deep`.
4. **Numbers are for sequences.** The reader's callouts are numbered because you
   read a document line by line. Nothing else on this page is — see below.
5. **Nothing needs JavaScript to be read.**

**Rhythm.** The variation down the page is deliberate, and it is the part
easiest to destroy by adding one more section in the "house style". In order:
amber field, the reader pulled up into it, thin routing strip, full-bleed
two-tone translation, one enormous statement alone on the screen, guides on a
recessed band, two-column workshops, a deliberately narrow and quiet checks
list, full-bleed reversed host, volunteer on a band again. If everything becomes
the same frame, the design is gone even if every colour is still correct.

**Colour.** The navy and the amber are the logo's own — the wordmark and the
pill bottle's cap.

| | | |
|---|---|---|
| `#FFFFFF` | stock | the page, the plates, the cards |
| `#F6F5F1` | recessed | the bands under doors, guides and volunteer |
| `#14161C` | ink | body copy and headlines |
| `#4A4F5C` | soft ink | captions and secondary copy. Never on amber |
| `#0B3EA0` | brand navy | links, rules, primary actions, callout numerals |
| `#062563` | deep navy | the reversed sections, the footer, ink on amber |
| `#F4A838` | bottle amber | the hero field, the kicker bar, annotation rules |
| `#FFE0A8` | pale amber | the fill on the one line that matters |
| `#A05A04` | dark amber | the only amber legible as text on white, held in reserve |
| `#DCDDE2` | rule | the hairline that draws most of the structure |
| `#A9ADB8` | firm rule | plate borders, tab borders |

Everything used on the page was measured in a rendered browser. The floor is AA
and most pairs clear AAA: ink on stock 18.1, ink on amber 9.1, navy-deep on
amber 7.2, navy on stock 9.5, soft ink on stock 8.2, amber on navy-deep 7.2.

**Type.** Two families, self-hosted, latin subsets, no CDN — about 96 KB for the
set, down from 155 KB, which matters because this may load on an old phone on
library wifi.

- **Atkinson Hyperlegible Next** for every word of language on the page. The
  Braille Institute drew it for readers with low vision — it pulls apart the
  character pairs that normally blur together. Given who our workshops are for,
  it is the argument in a typeface. It is a variable font with a 200–800 weight
  axis, which is the whole reason one family can carry an extreme type scale.
  **Don't swap it out, and don't add a display face beside it.**
- **IBM Plex Mono** for transcribed documents only — the reader's plates and the
  jargon column in the translation. It is the artefact's own voice.

Three typographic rules that are easy to undo by accident:

**Emphasis is the family's own italic.** Atkinson Next has a real one, which is
another reason not to bring in a serif to get one.

**Monospace is not a label style.** Where a small label is needed it is Atkinson,
letter-spaced, uppercase, at `.78`–`.8rem` — see `.kicker`, `.facts dt`, `.k`.
Monospace on this page means "this is transcribed from a real document", nothing
else.

**The scale is three steps, not a ramp.** `--t1` / `--t2` / `--t3`, and `--t1` is
about six times body. Nothing sits between them, and something on the page is
genuinely large. Add a fourth only if you truly need it, and put it in the token
block rather than inline.

**Numbers are for sequences.** The reader's callouts are numbered because a
document is read line by line and the order carries information a person needs.
The "How we check it" list used to be numbered too — it is two parallel
commitments, not steps one and two of anything, so the numbers came off and an
amber rule went on instead. Section folios (`§ 01`, `§ 02`) came off for the same
reason: page numbers on a page that has one page are decoration wearing the
costume of structure.

**The signature moves**, so that edits keep them:

- **The amber field**, and the reader overlapping its bottom edge. That overlap
  is why `.hero` carries so much bottom padding and `.deck` a negative top
  margin. It is the composition; don't flatten it on a whim. On phones the
  overlap is dropped, because there is no room for it to read.
- **The kicker bar.** A short amber block in front of every kicker —
  `.kicker::before`. One ornament, repeated, which is what makes it a system.
- **The plates.** White stock, 2px border, one soft shadow, radius 0. Documents
  are paper. Controls get `--r` (4px). That is the entire radius system.
- **The marker.** A solid amber band under the baseline on the one line that
  matters, and never more than one per section.

**Motion.** New in this version, and deliberately small. Blocks settle in on
arrival — `opacity` and `translateY(14px)` over 600ms on
`cubic-bezier(.16, 1, .3, 1)`, driven by `IntersectionObserver`, once per block,
then the observer lets go. Only `transform` and `opacity`, so it composites and
never reflows. Hover effects are behind
`@media (hover: hover) and (pointer: fine)` so a touch device never gets a stuck
hover state. Everything is inside `@media (prefers-reduced-motion: no-preference)`.

The important part is how it fails. The stylesheet only hides a block before
revealing it when the `js` class is on `<html>`, and a script in the `<head>`
sets that class **only if `IntersectionObserver` exists**. The script that does
the revealing is wrapped in a `try`/`catch` that strips the class again if
anything throws. Without JavaScript, or with a broken script, nothing is ever
hidden — so there is nothing to strand.

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

## The document reader

This is the hero and the reason the page works: three real documents a person
can open line by line, at the top of the page, at full width. One real document
someone can click argues the mission better than any paragraph.

**Why three, and not just the prescription label.** The earlier version showed
only a label, lifted straight out of the printed guide. It was the best thing on
the page and it was also quietly mis-selling the organisation: MedLit's own
sentence is *"prescription labels, lab results, and insurance letters,"* and the
page demonstrated one of the three. Someone deciding whether to book a workshop
came away thinking this was a medication charity. The reader now covers all
three, so the demonstration and the mission statement say the same thing.

**The numbers in the two new documents are invented.** They are plausible, and
the explanations are about how to *read* a document rather than what any result
means — that is deliberate, and it is the same job the printed guide does. Even
so: the lab result and the insurance letter should get the same licensed review
the guides get before this goes in front of the public. Nothing else on the site
makes a claim that needs checking; these two do.

**How it works.** Three radio buttons and three stacks of `<details>`. No
JavaScript, no ARIA to get wrong, no custom keyboard handling:

- The picker is a real `<fieldset>` with a hidden `<legend>` and three native
  radios, so arrow keys already drive it and a screen reader announces "Lab
  result, radio button, 2 of 3". The radios are visually hidden but still
  focusable; the focus ring is drawn on the visible `<label>` through a sibling
  selector.
- `#doc-2:checked ~ .plate[data-doc="2"] { display: block }` does the switching.
  It works with JavaScript disabled — verified, not assumed.
- Every row is a native `<details>`, keyboard-operable for free.
- The callout numbers are CSS counters. Add, remove or reorder lines and they
  renumber themselves.

The rows run in **two columns**, which is how the printed guide arranges its
callouts around the bottle, and it means the wide measure carries content rather
than air. One line per document spans both columns and is filled amber — the
`.is-key` class. There should only ever be one, and it should be the line people
actually get wrong: the dosing line, the result, the words "not a bill".

The inline script *appends* the "3 of 6 lines explained" readout to each plate.
Delete the script and you lose those lines and nothing else.

**To add a fourth document**: copy one `<input>`, one `<label>` and one `.plate`
block, give them a matching new id, write the rows, and add the id to the two
grouped selectors in section 8 of `styles.css`. No new CSS.

**The translation.** The before/after section is the same argument compressed
into one line. The jargon is on the left, in the documents' own monospace,
reversed out of deep navy. The plain version is on the right on stock, large,
with the dose ceiling marked. The two kickers borrow the printed guide's own
words. Keep the two halves the same instruction — if they ever drift apart the
section stops being an argument.

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

Do not give a new section a kicker and a definition table just because other
sections have them. Sameness is the thing this design was rebuilt to get rid of.
And keep the boldness where it is: the amber field is the one loud thing on this
page, and it only stays loud because everything under it is quiet.

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
  definition terms, the reader's keys — which never goes under 14px
  and is never something you read a sentence of. The masthead nav is at full
  body size and sentence case on purpose: small letterspaced caps would have
  suited the imprint, but the people this page is for should not have to squint
  at the navigation.
- Every text/background pair on the rendered page meets WCAG AA. Verified in a
  real browser rather than by eye: 97 visible text nodes measured at 1440, 768
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
