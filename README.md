# erezults-www

Static site listing every Erezults Apple app (GitHub Pages). Data comes from App Store Connect / the public App Store lookup.

- `data/apps.json` — the apps (edit here)
- `node build.mjs` — regenerates `index.html` + `404.html`
- `icons/`, `shots/` — App Store artwork (1 screenshot per app)

Live: https://apps.erezults.com (staging domain; intended to become www.erezults.com).
