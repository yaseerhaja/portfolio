# Portfolio — Hajamohaideen Kudhbudeen

Personal portfolio for a Senior Frontend Engineer working in Angular, TypeScript and design
systems. Live at **https://yaseerhaja.github.io/portfolio/**.

## What it is

One page, hand-written, with no framework and no build step:

```
index.html          the whole page
css/style.css       design tokens, layout, motion
js/script.js        interactions, no dependencies
img/                portrait, share card, favicons
pdf/                downloadable résumé
sitemap.xml         single-URL sitemap
```

Roughly 115 KB gzipped over the wire, fonts aside. Everything ships as it is written — there is
nothing to compile, install or bundle.

## Running it locally

Any static file server will do. From the repository root:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. There is no `npm install` step, and no `package.json` — the site
has no JavaScript dependencies.

## How it is built

- **Design system in CSS custom properties.** Colour, spacing, radius, shadow and easing are
  declared once on `:root`, with a `[data-theme='light']` block overriding the colour tokens.
  Dark is the default; the toggle in the header persists the choice to `localStorage`.
- **Type.** Space Grotesk for display, Archivo for body, both from Google Fonts with `display=swap`
  and a real fallback stack.
- **Motion is transform and opacity only**, on a single rAF-throttled scroll pass, and every effect
  switches itself off under `prefers-reduced-motion`. There is a print stylesheet too.
- **Accessibility** is part of the build, not a pass at the end: skip link, visible focus rings,
  ARIA tab and disclosure patterns, `aria-hidden` on the carousel's cloned cards, and a
  visually-hidden transcript behind the animated role line.

## Deployment

GitHub Pages serves `master` from the repository root. Pushing to `master` publishes.

## Editing the content

The page content mirrors `HajamohaideenK_Senior_FrontEnd_Developer_Resum.docx`. When the résumé
changes, update both the relevant section in `index.html` and the PDF in `pdf/`, so the page and
the download never disagree.
