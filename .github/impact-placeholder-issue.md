The **What we measure** band on the site still reads:

> Our first numbers arrive with our first workshops.

That was honest before the first workshop. It is not any more.

### What to change

In `index.html`, find `<p class="measure__figure">` and replace the placeholder
with the real result:

```html
<p class="measure__figure">
  <b>16 of 23</b> participants improved their comprehension score.
</p>
```

### The rules that come with it

- **The denominator is not optional.** "16 of 23", never "70%". A percentage
  with no bottom number is a claim the work has not earned, and a library
  programming lead or a funder can tell.
- **Report comprehension, and only comprehension.** Never better adherence,
  never prevented errors, never changed health outcomes, never "clinically
  proven" or "research-backed". Comprehension scores are what gets measured, so
  comprehension scores are what gets reported.
- Bump the `?v=` on the stylesheet link in `index.html` if you touch
  `styles.css` while you are in there, or returning visitors will keep the old
  one.

Closing this issue does not change the site. Editing `index.html` does. This
check runs every Monday and will reopen the request until the placeholder is
gone.
