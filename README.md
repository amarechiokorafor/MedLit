# MedLit — website

Single-page static site for MedLit. Plain HTML + CSS, no frameworks and no build
step, so it deploys as-is.

```
index.html                       the whole page
styles.css                       the whole stylesheet
assets/medlit-logo.png           stacked lockup — header
assets/medlit-logo-vertical.png  full lockup with tagline — hero
assets/medlit-bottle.png         bottle detail from the lockup — footer
assets/favicon.png               browser tab icon
assets/apple-touch-icon.png      iOS home-screen icon
assets/guides/                   guide PDFs
```

All four are cut from the two official lockups at print resolution with
transparent backgrounds, so they sit on any background. The footer mark and
the favicon are the pill bottle taken out of the stacked lockup.

## Before you publish — one thing to swap

**The volunteer form.** Search `index.html` for `FORM_URL` (two places, both
flagged with a comment) and replace it with your Google Form link.

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch*, pick the
branch and the `/ (root)` folder. Live in a minute or two.

**Netlify** — drag the folder onto the Netlify dashboard, or connect the repo
and leave the build command empty with the publish directory set to `/`.

## Adding a guide

1. Put the PDF in `assets/guides/`.
2. In `index.html`, find the `<!-- ADD NEW GUIDE CARDS HERE -->` comment and copy
   the `<li class="guide">` block above it.
3. Change the title, the one-line description, the meta line, and the `href`.

The grid fills itself in — no CSS changes needed.

## Adding a section

Copy a `<section class="section">` block, give it a unique `id`, and add a
matching link to the header nav. Alternate `section--tint` on and off so the
background stripes keep their rhythm. There's an `<!-- ADD NEW SECTIONS HERE -->`
marker near the bottom of `<main>`.

## Brand colours

Sampled pixel-for-pixel from the logo and the Instagram posts, so the site and
the feed match. They're CSS variables at the top of `styles.css`.

| | | |
|---|---|---|
| `#083795` | brand navy | the wordmark — links, primary buttons |
| `#162044` | deep navy | headings, footer background |
| `#2E4674` | post navy | body copy |
| `#FFDDA3` | butter yellow | accent panels and the volunteer button |
| `#F7C56B` | bottle amber | hairlines, card edges |
| `#FB8645` | cap orange | reserved for decorative use |
| `#EEF1F7` | blue-gray | alternating section backgrounds |

## Accessibility notes

These aren't decoration — please keep them when editing:

- Body text is 18px minimum (`html { font-size: 18px }`); everything else scales
  from it in `rem`.
- Every text/background pair in the stylesheet meets WCAG AA. Butter yellow and
  amber are light, so they always carry dark navy ink, never white.
- No text is baked into images, and every meaningful image has alt text.
- Fully keyboard navigable, with a skip link and a visible focus ring.
- Responsive down to a 360px-wide screen.
