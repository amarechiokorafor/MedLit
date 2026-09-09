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
assets/fonts/                    self-hosted woff2 (2 files, ~65 KB total)
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
- **The numbered callout disc from the printed guide.** A navy circle with a
  white numeral, pointing at something and saying what it means.
- **Every word of language set in Atkinson Hyperlegible Next** — the body copy
  and the 124px headline alike. An organisation whose entire product is
  legibility should not borrow an editorial serif to look serious. The
  personality comes from scale, weight and colour.

The register is deliberate. The two people this page has to convince are an
activity director at a senior community and a library programming lead, both
deciding whether to hand a room full of their people over to students. Loud and
legible reads as confident. It also happens to be the thing MedLit sells.

Five rules hold it together:

1. **One typeface.** Atkinson Hyperlegible Next, everywhere. If a serif shows
   up here, ask what it knows that Atkinson doesn't.
2. **Amber carries dark ink only.** White on amber is 1.7:1, and `--ink-2` on
   amber is 4.1:1. On amber the secondary voice is `--navy-deep`.
3. **The callout disc** — a navy circle with a white numeral, lifted from the
   printed guide. One home now, in "How we check it". See below.
4. **Spend the boldness in one place.** The amber field is the loud thing, and it
   only stays loud because everything under it is quiet.
5. **Nothing needs JavaScript to be read.**

**One left rail.** Every section starts at the same x, from the masthead to
the footer, and the only thing that varies is how far right the content runs.
`.read` used to be a narrow box centred in the *viewport*, which put its left
edge 266px inside the flush-left sections above and below it — centred is not
the same as aligned, and next to a run of flush-left blocks it reads as shoved
right with a dead strip down the left of the page. `.read` now has the exact
geometry of `.wide` and caps its *children* at the reading measure instead.

The related trap, which has now caught two elements: **never put a `max-width`
on an element that also carries `.wide`.** It overrides `.wide`'s own max-width,
and `margin-inline: auto` then centres the whole block away from the rail. Cap
an inner element instead. `.hero__head` and `.measure__inner` are both nested
for this reason.

**Rhythm.** The variation down the page is deliberate, and it is the part
easiest to destroy by adding one more section in the "house style". In order:
amber field, thin routing strip, one enormous statement alone on the screen,
three columns of what we do, a counts ledger, a full-bleed amber band for the
comprehension promise, guides on a
recessed band, two-column workshops, a deliberately narrow and quiet checks
list, full-bleed reversed host, volunteer on
a band again. If everything becomes the same frame, the design is gone even if
every colour is still correct.

**Colour.** The navy and the amber are the logo's own — the wordmark and the
pill bottle's cap.

| | | |
|---|---|---|
| `#FFFFFF` | stock | the page and the cards |
| `#F6F5F1` | recessed | the bands under doors, guides and volunteer |
| `#14161C` | ink | body copy and headlines |
| `#4A4F5C` | soft ink | captions and secondary copy. Never on amber |
| `#0B3EA0` | brand navy | links, rules, primary actions, callout numerals |
| `#062563` | deep navy | the reversed sections, the footer, ink on amber |
| `#F4A838` | bottle amber | the hero field, the kicker bar, annotation rules |
| `#FFE0A8` | pale amber | the fill on the one line that matters |
| `#A05A04` | dark amber | the only amber legible as text on white, held in reserve |
| `#DCDDE2` | rule | the hairline that draws most of the structure |
| `#A9ADB8` | firm rule | held in reserve for anything that needs a hard edge |

Everything used on the page was measured in a rendered browser. The floor is AA
and most pairs clear AAA: ink on stock 18.1, ink on amber 9.1, navy-deep on
amber 7.2, navy on stock 9.5, soft ink on stock 8.2, amber on navy-deep 7.2.

**Type.** One family, self-hosted, latin subset, no CDN — about 65 KB, which
matters because this may load on an old phone on library wifi.

- **Atkinson Hyperlegible Next** for every word of language on the page. The
  Braille Institute drew it for readers with low vision — it pulls apart the
  character pairs that normally blur together. Given who our workshops are for,
  it is the argument in a typeface. It is a variable font with a 200–800 weight
  axis, which is the whole reason one family can carry an extreme type scale.
  **Don't swap it out, and don't add a display face beside it.**
IBM Plex Mono used to sit beside it for the transcribed documents in the
interactive label and the before/after panel. Both are gone, so it went too.

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

**The callout disc** is the printed guide's own mark: a navy circle with a white
numeral, pointing at something and saying what it means. It used to appear in
three places; two of them left with the label and the before/after panel, so its
one remaining home is the two commitments in "How we check it".

One use is thin for a repeating mark, and that is worth knowing rather than
papering over. If a section ever arrives that genuinely points at something and
explains it, this is the mark for it. Do not sprinkle it on things that are
neither a document nor a claim just to make it recur — section folios
(`§ 01`, `§ 02`) were tried that way and removed, and they are the warning: page
numbers on a page that has one page are decoration wearing the costume of
structure.

**The signature moves**, so that edits keep them:

- **The amber field.** The page opens on the bottle's own colour at full
  strength carrying the largest type on the site, and that is the entire hero.
- **The kicker bar.** A short amber block in front of every kicker —
  `.kicker::before`. One ornament, repeated, which is what makes it a system.
- **The amber rule.** A 4–5px amber bar: over each "what we do" column, down the
  left of each check, above the turn in "Our why". It is the page's one repeated
  structural mark.
- **`--r` is 4px, everywhere.** One radius, on controls and cards. That is the
  entire radius system.

**Motion.** Blocks settle in as they enter the viewport and let go as they
leave — **every time, both directions**, not once on first sight. `opacity` and
`translateY` over 550ms on `cubic-bezier(.16, 1, .3, 1)`, driven by
`IntersectionObserver`, which is never unobserved. Only `transform` and
`opacity`, so it composites and never reflows.

Three details are what make it read as considered rather than as twitch, and
they are the easy ones to break:

1. **The transition lives on the base rule**, not only on `.is-in`. With it only
   on `.is-in`, a block fades in gently and then snaps out.
2. **`--rv` is the direction**, set from JavaScript on every crossing from
   `entry.boundingClientRect.top`. A block leaving past the top of the screen
   carries on upward; one leaving past the bottom goes down. The movement always
   agrees with the scroll.
3. **The observer band is inset 7% top and bottom** (`rootMargin`), so a block
   commits to being in or out instead of flickering across an exact boundary.

`.js [data-reveal]:focus-within` sets `transition: none` as well as full
opacity. Tabbing into a block that has scrolled out puts it on screen *now* — a
keyboard user should never spend half a second watching the thing they just
focused fade up. Verified by tabbing 30 stops through the page and checking that
none of them land in a block below full opacity.

Hover effects sit behind `@media (hover: hover) and (pointer: fine)` so a touch
device never gets a stuck hover state, and the whole reveal system is inside
`@media (prefers-reduced-motion: no-preference)`.

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

## Two things that were built here and removed. Twice.

Both worked. Both are the kind of thing a future editor rebuilds without
knowing why they went, so:

**The interactive prescription label.** Lines that rewrote themselves into
plain English when you chose them — a pure CSS checkbox toggle, no JavaScript
needed, keyboard-operable for free. It was the most impressive thing on the
page.

**The "same sentence, twice" panel.** One line of pharmacy shorthand on navy,
its plain version beside it on stock, large type and almost no chrome.

They were cut for the same reason both times: **the guides already do this
job**, on paper, reviewed by a licensed professional, printable, and free to
hand out at a front desk. A widget that demonstrates the product ends up
standing in front of the product. The before/after had a second problem — one
fixed example is a slogan, not a demonstration. It would earn its place as
something that changes, a literacy fact rotating daily, and not before.

If MedLit ever wants a **quick interactive guide** as a genuine format
alongside the printed ones, that is a real idea. It gets its own page and its
own reviewed content, not a slot in the hero.

IBM Plex Mono went with them. It existed to give transcribed documents their
own voice, and there is nothing left on the page being transcribed.

## The work so far, and what we measure

**Two kinds of number, two separate sections, on purpose.** A count of guides is
not a count of people helped, and putting them under one heading is how that
line gets blurred.

### The work so far — counts

Guides handed out, sessions run, places visited. Today that is **160 guides at
Cy-Fair Helping Hands, 90 in English and 70 in Spanish**. The split does real
work: the site claims English and Spanish in three other places, and this is the
only one that proves it with a number.

A count is a fact you can stand on, and it is not an outcome.

**To add an event**, copy one `<li>` in `.tally__list` and change the number, the
place and the split. The numeral column is `auto`, which in CSS Grid sizes to the
widest content across every row — so figures stay aligned down the column as
events are added, without hard-coding a width a four-digit number would blow out.

### What we measure — the comprehension promise

This band is about scores, and there are none yet. It reads *"Our first
comprehension numbers arrive with our first workshops."* That sentence is one
word longer than it used to be: "Our first numbers" stopped being true the moment
the counts above went live, and a sentence contradicting the section above it
costs more than it saves.

When there are scores, they go in the same band in this shape:
`<b>16 of 23</b> participants improved their comprehension score.`

**The denominator is not optional.** "16 of 23", never "70%". A percentage with
no bottom number is a claim the work has not earned, and a library programming
lead or a funder can tell.

**What may never be claimed here**, whatever the numbers say: better adherence,
prevented errors, changed health outcomes, "clinically proven",
"research-backed". Comprehension scores are what gets measured, so comprehension
scores are what gets reported.

### The guard

`.github/scripts/check_numbers.py` runs on every push and pull request via
`.github/workflows/check-numbers.yml`, and enforces two things:

- **every row's split adds up to that row's headline.** Publish 160 over 90/70,
  change one and forget the others, and the site is quietly publishing arithmetic
  that does not work. Checked per row, so adding a second event cannot mask a
  broken first one.
- **no bare percentage in the visible text** — the denominator rule, mechanically.
  It strips tags and comments first, so it reads what a person reads: a
  percentage in a code comment is fine, one on the page is not.

Run it locally, unchanged: `python3 .github/scripts/check_numbers.py`. Four
failure modes are tested — broken row arithmetic, a broken row hidden behind a
second good one, a bare percentage anywhere on the page, and the counts section
being renamed out from under it — plus the false positive it would otherwise hit
on the `%20` escapes in the mailto link.

It replaced `impact-placeholder.yml`, which watched for the placeholder sentence
*"Our first numbers arrive with our first workshops"* and opened an issue if it
outlived the first workshop. **That worked** — it fired on 2026-08-17, the first
Monday after the deadline, and opened issue #1. A check that can only fire once
is finished once, so it was retired for one that guards the mistakes you make
while editing numbers, which is the only time anyone touches them.

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

## When you have photographs

There are none on this site yet, and there is no placeholder pretending to be
one — a dashed grey box reading "photo goes here" on a live nonprofit site
reads as unfinished, which is worse than reading as spare. What exists instead
is **the layout that will hold them**, so adding the first real photograph is a
markup change with no CSS to write.

**Two slots**, both marked in `index.html` with a commented-out
`<figure class="shot">` and full instructions:

| Slot | Where | What to shoot |
|---|---|---|
| One | inside `.workshops__grid` | A session happening. A volunteer and a participant, heads down over a real document, hands and paper in frame. |
| Two | inside `.host__grid` | The room. Wide, from the back, mid-session. |

Each of those sections is a two-column grid today. **Uncomment a `.shot` and it
becomes three columns on its own** — the `:has()` rules in section 20 of
`styles.css` do that, so there is nothing to edit. Verified by dropping a
stand-in image in and measuring: three columns at 1440px, one column at 768 and
390, no overflow at any of them. A browser without `:has()` keeps two columns
and stacks the figure, which is a perfectly good outcome.

Practical notes:

- **Get written permission before publishing anyone's face**, and keep it on
  file. Non-negotiable when the people in frame are at a senior community. Shots
  of hands and documents avoid the question entirely and are often the better
  picture anyway.
- Landscape, roughly 3:2. Export about 1600px wide, JPEG quality ~82, into
  `assets/photos/`.
- Keep real `width` and `height` attributes so the page doesn't jump while it
  loads.
- `loading="lazy"` on both of these. They are well below the fold.
- Alt text describes what is happening, not what the file is: "A MedLit
  volunteer and a participant reading a prescription label together at a table",
  not "workshop photo".

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
  definition terms — which never goes under 14px
  and is never something you read a sentence of. The masthead nav is at full
  body size and sentence case on purpose: small letterspaced caps would have
  suited the imprint, but the people this page is for should not have to squint
  at the navigation.
- Every text/background pair on the rendered page meets WCAG AA. Verified in a
  real browser rather than by eye: 90 visible text nodes measured at 1440, 768
  and 390px, none below its threshold. Amber is light, so it always carries
  dark ink, never white.
- Fully keyboard navigable, with a skip link and a visible focus ring that flips
  to amber on the reversed sections and the footer.
- Every section contributes exactly one visible `<h2>` to the document outline.
  There are no headings hidden off-screen any more: "Our why" carries its heading
  as `.section-mark`, small on purpose because the statement below it is the
  display type and two things that size would fight.
- Nothing on the page is a custom widget. Every interactive element is a link,
  so there is no keyboard handling to get wrong and no ARIA to get wrong.
- Responsive down to a 320px-wide screen, checked at every 5px step from 320 to
  1920. Overflow is measured two ways, and the second one matters: `scrollWidth`
  against `clientWidth` on the document, **and on every element**. A headline can
  spill past its own content box into the gutter while the document still
  measures clean — that is exactly how a real bug hid here once, so both checks
  now run.

- **A word can overflow while the web font is still loading.** `font-display:
  swap` paints the fallback face first, and the system-ui fallback runs about
  16% wider than Atkinson — enough to push "Understanding" and the footer email
  past the edge of a 320–450px phone and let the page scroll sideways until the
  real font arrives. On library wifi that is seconds, not a flicker. Swept at
  every 5px from 320 to 1920 with `**/*.woff2` blocked, which is the worst case.

  The fix is `overflow-wrap` — but **`break-word` is not enough**, and that
  distinction cost a round of debugging. `break-word` breaks a long word
  visually while leaving the element's *min-content* width unchanged, so the
  flex and grid items above it still refuse to shrink and the overflow
  survives. `overflow-wrap: anywhere` reduces min-content too. Flex and grid
  items also need `min-width: 0`, since they default to `min-width: auto` and
  will not go below their content without it. Both are on the footer contact
  links; headings get the simpler `break-word`, which is sufficient there
  because they are not flex items.

- **`rem` inside a media query does not mean what it looks like.** It always
  resolves against the browser's initial root font size of 16px and ignores
  `html { font-size: 18px }`. So `@media (max-width: 22.5rem)` meant 360px, not
  405px, and every phone between 361px and 400px fell through the gap with an
  oversized headline. The small-screen breakpoint at the bottom of `styles.css`
  is written in **pixels on purpose**. Don't tidy it into rem.

- **Print gets the whole page.** Because a block fades back out once it leaves
  the viewport, anything off-screen at the moment of printing would come out
  blank. `@media print` forces every `[data-reveal]` back to full opacity.
  Someone handing this page round a staff meeting is a real thing that happens. Watch for `minmax()` grid tracks — a bare `minmax(26rem, 1fr)`
  cannot shrink below its own minimum and will force a 468px column onto a 360px
  screen. The guide shelf uses `minmax(min(26rem, 100%), 1fr)` for exactly that
  reason.
- Every link and button is at least 44px tall on a phone. Measured, not
  assumed — the nav and the footer contact links both used to fall short.
