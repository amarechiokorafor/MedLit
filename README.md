# MedLit — website

Single-page static site for MedLit. Plain HTML + CSS, no frameworks and no build
step, so it deploys as-is.

```
index.html                 the whole page
styles.css                 the whole stylesheet
assets/medlit-mark.svg     logo mark (header + footer)
assets/favicon.svg         browser tab icon
assets/guides/             guide PDFs
```

## Before you publish — two things to swap

1. **The volunteer form.** Search `index.html` for `FORM_URL` (two places, both
   flagged with a comment) and replace it with your Google Form link.
2. **The logo.** `assets/medlit-mark.svg` is a vector rebuild of the pill-bottle
   mark. Drop the official export into `assets/` and point the two `<img>` tags
   in `index.html` at it — the header one is marked with a comment. The word
   "MedLit" and the tagline are real HTML text, not part of the image, so they
   stay readable by screen readers and search engines.

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

## Accessibility notes

These aren't decoration — please keep them when editing:

- Body text is 18px minimum (`html { font-size: 18px }`); everything else scales
  from it in `rem`.
- Every text/background pair in the stylesheet meets WCAG AA. Orange never
  carries white text — it doesn't have the contrast. It uses dark navy ink.
- No text is baked into images, and every meaningful image has alt text.
- Fully keyboard navigable, with a skip link and a visible focus ring.
- Responsive down to a 360px-wide screen.
