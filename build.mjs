#!/usr/bin/env node
// Builds index.html (static, bilingual he/en, no runtime fetch) from data/apps.json.
//   node build.mjs
import fs from 'node:fs';

const apps = JSON.parse(fs.readFileSync(new URL('./data/apps.json', import.meta.url), 'utf8'));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (he, en) => `<span lang="he">${esc(he)}</span><span lang="en">${esc(en)}</span>`;

const APPLE = `<svg class="apple" viewBox="0 0 170 170" aria-hidden="true"><path fill="currentColor" d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z"/></svg>`;

const card = a => `
<article class="card" data-cat="${esc(a.category)}" id="${esc(a.slug)}">
  <div class="shot" aria-hidden="true"><img src="${esc(a.shot)}" alt="" loading="lazy" decoding="async" width="443" height="960"></div>
  <div class="body">
    <header class="head">
      <img class="icon" src="${esc(a.icon)}" alt="" width="72" height="72" decoding="async">
      <div class="titles">
        <h2>${t(a.nameHe, a.name)}</h2>
        <p class="sub">${t(a.subtitle.he, a.subtitle.en)}</p>
      </div>
    </header>
    <p class="blurb">${t(a.blurb.he, a.blurb.en)}</p>
    <ul class="meta" aria-label="platforms">
      <li class="chip cat">${t(a.categoryLabel.he, a.categoryLabel.en)}</li>
      ${a.platforms.includes('ios') ? `<li class="chip">iPhone · iPad</li>` : ''}
      ${a.platforms.includes('mac') ? `<li class="chip">Mac</li>` : ''}
    </ul>
    <div class="actions">
      <a class="btn primary" href="${esc(a.store.ios || a.store.mac)}" target="_blank" rel="noopener">${APPLE}<span>App Store</span></a>
      ${a.store.mac && a.store.mac !== a.store.ios ? `<a class="btn" href="${esc(a.store.mac)}" target="_blank" rel="noopener">${APPLE}<span>Mac App Store</span></a>` : ''}
      ${a.site ? `<a class="link" href="${esc(a.site)}" target="_blank" rel="noopener">${t('לאתר האפליקציה', 'App website')} <span class="arr" aria-hidden="true">↗</span></a>` : ''}
    </div>
  </div>
</article>`;

const cats = [...new Map(apps.map(a => [a.category, a.categoryLabel])).entries()];
const chips = [`<button class="filter is-on" data-cat="all" type="button">${t('הכול', 'All')} <b>${apps.length}</b></button>`]
  .concat(cats.map(([k, l]) => `<button class="filter" data-cat="${esc(k)}" type="button">${t(l.he, l.en)} <b>${apps.filter(a => a.category === k).length}</b></button>`)).join('\n      ');

const html = `<!doctype html>
<html lang="he" dir="rtl" data-lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Erezults — Apps</title>
<meta name="description" content="Erezults: ${apps.length} apps for iPhone, iPad and Mac — finances, family, health and privacy. Hebrew and English, privacy first.">
<meta property="og:title" content="Erezults — Apps for iPhone, iPad & Mac">
<meta property="og:description" content="${apps.length} apps that put your life in order: expenses, rentals, payslips, pension, crypto, health, photos, calendar and home network.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://apps.erezults.com/">
<meta property="og:image" content="https://apps.erezults.com/og.png">
<meta name="theme-color" content="#0b0d12" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f7fb" media="(prefers-color-scheme: light)">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1d4ed8"/><text x="32" y="44" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="38" fill="#fff" text-anchor="middle">E</text></svg>')}">
<style>
:root{
  --bg:#f6f7fb; --bg-2:#ffffff; --fg:#0f1222; --fg-2:#4b5168; --fg-3:#7c829a;
  --line:rgba(15,18,34,.08); --line-2:rgba(15,18,34,.14);
  --accent:#1d4ed8; --accent-fg:#ffffff; --chip:#eef1f8; --chip-fg:#394059;
  --shadow:0 1px 2px rgba(15,18,34,.04),0 12px 32px -12px rgba(15,18,34,.18);
  --ease:cubic-bezier(.23,1,.32,1); --r:22px;
}
@media (prefers-color-scheme: dark){:root{
  --bg:#0b0d12; --bg-2:#141822; --fg:#f2f4fa; --fg-2:#b3b9cc; --fg-3:#7d85a0;
  --line:rgba(255,255,255,.08); --line-2:rgba(255,255,255,.14);
  --accent:#3b82f6; --accent-fg:#ffffff; --chip:#1d2331; --chip-fg:#c3c9db;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 16px 40px -16px rgba(0,0,0,.6);
}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
html[data-lang="he"] [lang="en"],html[data-lang="en"] [lang="he"]{display:none}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
@media(min-width:720px){.wrap{padding:0 28px}}

/* top bar */
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:saturate(180%) blur(18px);-webkit-backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;height:56px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-.01em}
.brand .mark{width:28px;height:28px;border-radius:8px;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800;font-size:17px}
.lang{appearance:none;border:1px solid var(--line-2);background:var(--bg-2);color:var(--fg);border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:transform .16s var(--ease),background .2s}
.lang:active{transform:scale(.97)}

/* hero */
.hero{padding:56px 0 28px;text-align:center}
@media(min-width:720px){.hero{padding:88px 0 40px}}
.hero h1{margin:0 auto;max-width:16ch;font-size:clamp(34px,6vw,64px);line-height:1.05;letter-spacing:-.03em;font-weight:800}
.hero p{margin:18px auto 0;max-width:52ch;color:var(--fg-2);font-size:clamp(16px,2vw,20px)}
.badges{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:22px}
.badges span{border:1px solid var(--line-2);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--fg-2);background:var(--bg-2)}

/* filters */
.filters{display:flex;gap:8px;overflow-x:auto;padding:18px 0 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.filters::-webkit-scrollbar{display:none}
.filter{flex:0 0 auto;appearance:none;border:1px solid var(--line-2);background:var(--bg-2);color:var(--fg-2);border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:transform .16s var(--ease),background .2s,color .2s,border-color .2s}
.filter b{font-weight:600;color:var(--fg-3);margin-inline-start:4px}
.filter:active{transform:scale(.97)}
.filter.is-on{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.filter.is-on b{color:inherit;opacity:.7}

/* grid */
.grid{display:grid;grid-template-columns:1fr;gap:16px;padding:12px 0 64px}
@media(min-width:720px){.grid{grid-template-columns:repeat(2,1fr);gap:20px}}
@media(min-width:1080px){.grid{grid-template-columns:repeat(3,1fr)}}
.card{display:flex;flex-direction:column;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);transition:transform .25s var(--ease),box-shadow .25s var(--ease),opacity .25s var(--ease)}
@media(hover:hover){.card:hover{transform:translateY(-3px)}}
.card[hidden]{display:none}
.shot{position:relative;height:200px;background:linear-gradient(180deg,var(--chip),transparent);overflow:hidden}
.shot img{width:62%;max-width:260px;height:auto;margin:22px auto 0;border-radius:22px 22px 0 0;box-shadow:0 -2px 0 0 var(--line-2),0 20px 40px -20px rgba(0,0,0,.45)}
.shot::after{content:"";position:absolute;inset:auto 0 0 0;height:56px;background:linear-gradient(180deg,transparent,var(--bg-2))}
.body{display:flex;flex-direction:column;gap:12px;padding:16px 18px 18px;flex:1}
.head{display:flex;align-items:center;gap:14px}
.icon{width:64px;height:64px;border-radius:22.5%;box-shadow:0 0 0 1px var(--line),0 6px 16px -8px rgba(0,0,0,.4);flex:0 0 auto}
.titles{min-width:0}
h2{margin:0;font-size:20px;line-height:1.2;letter-spacing:-.02em;font-weight:700}
.sub{margin:3px 0 0;color:var(--fg-2);font-size:14px}
.blurb{margin:0;color:var(--fg-2);font-size:15px}
.meta{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.chip{background:var(--chip);color:var(--chip-fg);border-radius:999px;padding:4px 10px;font-size:12.5px;font-weight:600}
.chip.cat{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}
.actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:auto;padding-top:4px}
.btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-2);background:var(--bg-2);color:var(--fg);border-radius:12px;padding:9px 13px;font-size:14px;font-weight:650;transition:transform .16s var(--ease),background .2s,border-color .2s}
.btn.primary{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.btn:active{transform:scale(.97)}
.btn .apple{width:14px;height:14px;margin-top:-2px}
.link{margin-inline-start:auto;color:var(--accent);font-size:14px;font-weight:600;white-space:nowrap}
.link .arr{display:inline-block;transition:transform .2s var(--ease)}
html[dir="rtl"] .link .arr{transform:scaleX(-1)}
.link:hover .arr{transform:translate(2px,-2px)}
html[dir="rtl"] .link:hover .arr{transform:scaleX(-1) translate(2px,-2px)}

/* footer */
footer{border-top:1px solid var(--line);padding:28px 0 calc(28px + env(safe-area-inset-bottom));color:var(--fg-3);font-size:14px}
footer .wrap{display:flex;flex-wrap:wrap;gap:10px 24px;align-items:center;justify-content:space-between}
footer a{color:var(--fg-2)}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
</style>
</head>
<body>
<div class="top"><div class="wrap">
  <a class="brand" href="#"><span class="mark" aria-hidden="true">E</span><span>Erezults</span></a>
  <button class="lang" type="button" id="lang" aria-label="Switch language"><span lang="he">English</span><span lang="en">עברית</span></button>
</div></div>

<main class="wrap">
  <section class="hero">
    <h1>${t('אפליקציות שעושות סדר בחיים', 'Apps that put your life in order')}</h1>
    <p>${t(`${apps.length} אפליקציות ל-iPhone, ל-iPad ול-Mac מבית Erezults: כספים, משפחה, בריאות ופרטיות. עברית מלאה, פרטיות קודם, בלי רעש.`,
            `${apps.length} apps for iPhone, iPad and Mac by Erezults: money, family, health and privacy. Hebrew and English, privacy first, no noise.`)}</p>
    <div class="badges">
      <span>iPhone · iPad · Mac</span>
      <span>${t('עברית + English', 'Hebrew + English')}</span>
      <span>${t('פרטיות קודם', 'Privacy first')}</span>
      <span>${t('חינם להורדה', 'Free to download')}</span>
    </div>
  </section>

  <nav class="filters" aria-label="${esc('Categories')}">
      ${chips}
  </nav>

  <section class="grid" id="grid">
${apps.map(card).join('\n')}
  </section>
</main>

<footer><div class="wrap">
  <span>© ${new Date().getFullYear()} Erezults</span>
  <span>${t('כל האפליקציות זמינות ב-App Store. Apple, App Store ו-Mac הם סימנים מסחריים של Apple Inc.', 'All apps are available on the App Store. Apple, App Store and Mac are trademarks of Apple Inc.')}</span>
</div></footer>

<script>
(function(){
  var root=document.documentElement, KEY='erezults-lang';
  function apply(l){root.setAttribute('data-lang',l);root.setAttribute('lang',l);root.setAttribute('dir',l==='he'?'rtl':'ltr');try{localStorage.setItem(KEY,l)}catch(e){}}
  var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  apply(saved||((navigator.language||'').toLowerCase().indexOf('he')===0?'he':'en'));
  document.getElementById('lang').addEventListener('click',function(){apply(root.getAttribute('data-lang')==='he'?'en':'he')});
  var filters=document.querySelectorAll('.filter'), cards=document.querySelectorAll('.card');
  filters.forEach(function(f){f.addEventListener('click',function(){
    filters.forEach(function(x){x.classList.toggle('is-on',x===f)});
    var c=f.getAttribute('data-cat');
    cards.forEach(function(k){k.hidden=!(c==='all'||k.getAttribute('data-cat')===c)});
  })});
})();
</script>
</body>
</html>
`;
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
fs.writeFileSync(new URL('./404.html', import.meta.url), html);
console.log(`built index.html (${apps.length} apps, ${(html.length / 1024).toFixed(1)} KB)`);
