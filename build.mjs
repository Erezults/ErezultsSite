#!/usr/bin/env node
// Builds index.html (static, bilingual he/en, dark/light) from data/apps.json — node build.mjs
// Design language = the previous erezults.com landing (cosmic dark, starfield, floating nav,
// purple→pink→orange gradient headline, dark cards, stat tiles), now for the Apple apps.
import fs from 'node:fs';

const apps = JSON.parse(fs.readFileSync(new URL('./data/apps.json', import.meta.url), 'utf8'));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (he, en) => `<span lang="he">${esc(he)}</span><span lang="en">${esc(en)}</span>`;
const tRaw = (he, en) => `<span lang="he">${he}</span><span lang="en">${en}</span>`;
const YEAR = new Date().getFullYear();

// ---------- copy extraction from the ASC description ----------
const NOISE = /^(iOS 27 READY|macOS 27 READY|תנאי שימוש|Terms of Use|EULA|Privacy Policy|מדיניות פרטיות|https?:\/\/)/i;
const FEAT_HEAD = /^(תכונות עיקריות|Key Features|Features|Main features|מה תקבלו|What you get|Highlights)\s*:?$/i;
function extract(desc) {
  const paras = desc.replace(/\r/g, '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    .map(p => p.split('\n').map(l => l.trim()).filter(l => l && !NOISE.test(l)).join('\n')).filter(Boolean);
  const lead = []; const feats = [];
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i]; const lines = p.split('\n');
    const bullets = lines.filter(l => /^[•\-–▪●✓]/.test(l));
    if (bullets.length >= 2) { // bullet list
      for (const b of bullets) { const s = b.replace(/^[•\-–▪●✓]\s*/, ''); const m = s.match(/^(.{3,60}?)\s*(—|–|:)\s+(.+)$/); feats.push(m ? { t: m[1].trim(), d: m[3].trim() } : { t: '', d: s }); }
      continue;
    }
    if (FEAT_HEAD.test(p)) continue;
    // "Heading\nBody" inside ONE paragraph (Fundiva/Healthy style)
    if (lines.length >= 2 && lines[0].length <= 64 && !/[.!?…:]$/.test(lines[0]) && lines[1].length > 40) { feats.push({ t: lines[0], d: firstSentence(lines.slice(1).join(" ")) }); continue; }
    const isHeading = lines.length === 1 && p.length <= 64 && !/[.!?…]$/.test(p) && i + 1 < paras.length && !/^[•\-–▪●✓]/.test(paras[i + 1]);
    if (isHeading) { const body = paras[++i].split('\n')[0]; feats.push({ t: p.replace(/:$/, ''), d: firstSentence(body) }); continue; }
    if (feats.length === 0 && lead.length < 2) lead.push(p.replace(/\n/g, ' '));
  }
  return { lead, feats: feats.slice(0, 6) };
}
function firstSentence(s) { const m = s.match(/^[^.!?]{20,}?[.!?](\s|$)/); return (m ? m[0] : s).trim(); }

// ---------- SVG bits ----------
const APPLE = `<svg class="ic" viewBox="0 0 170 170" aria-hidden="true"><path fill="currentColor" d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z"/></svg>`;
const SUN = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const MOON = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const GLOBE = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>`;
const CHECK = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

// ---------- sections ----------
const gridCard = a => `
<a class="gcard" href="#${esc(a.slug)}" data-cat="${esc(a.category)}">
  <img class="gicon" src="${esc(a.icon)}" alt="" width="56" height="56" decoding="async">
  <h3>${t(a.nameHe, a.name)}</h3>
  <p>${t(a.subtitle.he, a.subtitle.en)}</p>
  <span class="more">${t('לפרטים', 'View details')} <i aria-hidden="true">→</i></span>
</a>`;

const gallery = (a, lang) => {
  const g = a.gallery?.[lang] || { iphone: [], mac: [] };
  const phones = g.iphone.map((src, i) => `<figure class="ph"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="310" height="674"></figure>`).join('');
  const macs = g.mac.map(src => `<figure class="mac"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" width="600" height="375"></figure>`).join('');
  return `<div class="gal" lang="${lang}"><div class="strip" tabindex="0">${phones}${macs}</div></div>`;
};

const featList = (feats, lang) => feats.length ? `<ul class="feats" lang="${lang}">${feats.map(f => `<li>${CHECK}<span>${f.t ? `<b>${esc(f.t)}</b> ` : ''}${esc(f.d)}</span></li>`).join('')}</ul>` : '';

const detail = (a, i) => {
  const he = extract(a.desc?.he || ''), en = extract(a.desc?.en || '');
  return `
<section class="app ${i % 2 ? 'flip' : ''}" id="${esc(a.slug)}" data-cat="${esc(a.category)}">
  <div class="app-text">
    <div class="app-head">
      <img class="aicon" src="${esc(a.icon)}" alt="" width="84" height="84" decoding="async">
      <div>
        <h3>${t(a.nameHe, a.name)}</h3>
        <p class="asub">${t(a.subtitle.he, a.subtitle.en)}</p>
        <ul class="tags"><li>${t(a.categoryLabel.he, a.categoryLabel.en)}</li>${a.platforms.includes('ios') ? '<li>iPhone · iPad</li>' : ''}${a.platforms.includes('mac') ? '<li>Mac</li>' : ''}<li>v${esc(a.version)}</li></ul>
      </div>
    </div>
    <div class="lead" lang="he">${he.lead.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    <div class="lead" lang="en">${en.lead.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    ${featList(he.feats, 'he')}${featList(en.feats, 'en')}
    <div class="cta">
      <a class="btn grad" href="${esc(a.store.ios || a.store.mac)}" target="_blank" rel="noopener">${APPLE}<span>${t('הורדה ב-App Store', 'Download on the App Store')}</span></a>
      ${a.store.mac && a.store.mac !== a.store.ios ? `<a class="btn ghost" href="${esc(a.store.mac)}" target="_blank" rel="noopener">${APPLE}<span>Mac App Store</span></a>` : ''}
      ${a.site ? `<a class="btn ghost" href="${esc(a.site)}" target="_blank" rel="noopener"><span>${t('לאתר האפליקציה', 'App website')} ↗</span></a>` : ''}
    </div>
  </div>
  <div class="app-media">${gallery(a, 'he')}${gallery(a, 'en')}</div>
</section>`;
};

const cats = [...new Map(apps.map(a => [a.category, a.categoryLabel])).entries()];
const filters = [`<button class="chip is-on" data-cat="all" type="button">${t('הכול', 'All')}</button>`]
  .concat(cats.map(([k, l]) => `<button class="chip" data-cat="${esc(k)}" type="button">${t(l.he, l.en)}</button>`)).join('');

const macCount = apps.filter(a => a.platforms.includes('mac')).length;

const html = `<!doctype html>
<html lang="he" dir="rtl" data-lang="he" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Erezults — Apps</title>
<meta name="description" content="Erezults builds ${apps.length} apps for iPhone, iPad and Mac — money, family, health and privacy. Hebrew and English. Privacy first.">
<meta property="og:title" content="Erezults — Apps for iPhone, iPad & Mac">
<meta property="og:description" content="${apps.length} apps that put your life in order: expenses, rentals, payslips, pension, crypto, health, photos, calendar and home network.">
<meta property="og:type" content="website"><meta property="og:url" content="https://erezults.com/"><meta property="og:image" content="https://erezults.com/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0a0a0f">
<link rel="icon" href="brand/favicon.png"><link rel="apple-touch-icon" href="brand/apple-touch-icon.png">
<style>
:root{
  --bg:#0a0a0f; --bg-2:#111118; --card:rgba(255,255,255,.035); --card-b:rgba(255,255,255,.09); --card-b2:rgba(168,85,247,.45);
  --fg:#f4f4f8; --fg-2:#a9abbd; --fg-3:#6f7289;
  --p:#a855f7; --pk:#ec4899; --or:#fb923c; --grad:linear-gradient(90deg,#c084fc 0%,#ec4899 55%,#fb923c 100%);
  --btn:linear-gradient(90deg,#9333ea,#c026d3); --ease:cubic-bezier(.23,1,.32,1);
  --nav:rgba(20,18,32,.72); --ring:rgba(168,85,247,.35);
}
html[data-theme="light"]{
  --bg:#fafafc; --bg-2:#ffffff; --card:#ffffff; --card-b:rgba(15,10,40,.08); --card-b2:rgba(147,51,234,.4);
  --fg:#15122b; --fg-2:#4d4a66; --fg-3:#8a879f; --nav:rgba(255,255,255,.78); --ring:rgba(147,51,234,.25);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
html[data-lang="he"] [lang="en"],html[data-lang="en"] [lang="he"]{display:none!important}
a{color:inherit;text-decoration:none} img{display:block;max-width:100%} .ic{width:1em;height:1em;flex:none}
.wrap{max-width:1160px;margin:0 auto;padding:0 20px} @media(min-width:900px){.wrap{padding:0 32px}}
.grad{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
#stars{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.9} html[data-theme="light"] #stars{opacity:.18}
.glow{position:fixed;z-index:0;pointer-events:none;inset:0;background:radial-gradient(60vw 60vw at 15% -10%,rgba(124,58,237,.28),transparent 60%),radial-gradient(50vw 50vw at 100% 20%,rgba(236,72,153,.10),transparent 60%)}
html[data-theme="light"] .glow{background:radial-gradient(60vw 60vw at 15% -10%,rgba(124,58,237,.12),transparent 60%)}
main,header,footer{position:relative;z-index:1}

/* floating nav */
.nav{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:6px;padding:6px 8px 6px 10px;border-radius:999px;background:var(--nav);border:1px solid var(--card-b);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);box-shadow:0 10px 40px -12px rgba(0,0,0,.5);max-width:calc(100vw - 24px)}
.nav .logo{height:30px;width:auto;border-radius:8px;margin-inline-end:6px}
.nav a.l{padding:7px 12px;border-radius:999px;font-size:14px;font-weight:600;color:var(--fg-2);transition:color .2s,background .2s}
.nav a.l:hover{color:var(--fg);background:var(--card)}
@media(max-width:640px){.nav a.l{display:none}}
.pill{display:inline-flex;align-items:center;gap:6px;appearance:none;border:1px solid var(--card-b);background:var(--card);color:var(--fg);border-radius:999px;padding:6px 11px;font:inherit;font-size:13px;font-weight:650;cursor:pointer;transition:transform .16s var(--ease),background .2s}
.pill:active{transform:scale(.96)} .pill .ic{color:var(--p)}

/* hero */
.hero{min-height:92vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:110px 0 40px}
.badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--card-b2);background:rgba(168,85,247,.08);color:#d8b4fe;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600}
html[data-theme="light"] .badge{color:#7e22ce}
.badge i{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 0 rgba(74,222,128,.6);animation:pulse 2s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}
.hero .logo{height:96px;width:auto;border-radius:18px;margin:34px 0 26px;box-shadow:0 30px 60px -30px rgba(168,85,247,.6)}
@media(min-width:720px){.hero .logo{height:128px}}
.hero h1{margin:0;font-size:clamp(42px,8vw,96px);line-height:1.02;letter-spacing:-.035em;font-weight:900;max-width:14ch}
.hero p{margin:22px auto 0;max-width:58ch;color:var(--fg-2);font-size:clamp(16px,2.1vw,20px)}
.hero .cta{margin-top:36px}
.cta{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.hero .cta{justify-content:center}
.btn{display:inline-flex;align-items:center;gap:9px;border-radius:12px;padding:12px 20px;font-size:15px;font-weight:700;border:1px solid var(--card-b);background:var(--card);color:var(--fg);transition:transform .16s var(--ease),box-shadow .25s var(--ease),background .2s;white-space:nowrap}
.btn:active{transform:scale(.97)}
.btn.grad{background:var(--btn);border-color:transparent;color:#fff;box-shadow:0 10px 30px -10px rgba(168,85,247,.7)}
.btn.grad:hover{box-shadow:0 14px 36px -10px rgba(168,85,247,.9)}
.btn.ghost:hover{background:rgba(255,255,255,.07)} html[data-theme="light"] .btn.ghost:hover{background:#f3f0fa}
.scroll{margin-top:60px;color:var(--fg-3);font-size:12px;display:flex;flex-direction:column;align-items:center;gap:4px;animation:bob 2.2s infinite}
@keyframes bob{50%{transform:translateY(6px)}}

/* sections */
.sec{padding:96px 0}
.eyebrow{text-align:center;font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--p);font-weight:800;margin:0 0 14px}
.h2{text-align:center;margin:0;font-size:clamp(32px,5vw,52px);line-height:1.08;letter-spacing:-.03em;font-weight:900}
.sub{text-align:center;color:var(--fg-2);margin:14px auto 0;max-width:56ch;font-size:17px}
.filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:34px 0 26px}
.chip{appearance:none;border:1px solid var(--card-b);background:var(--card);color:var(--fg-2);border-radius:999px;padding:8px 16px;font:inherit;font-size:14px;font-weight:650;cursor:pointer;transition:transform .16s var(--ease),background .2s,color .2s,border-color .2s}
.chip:active{transform:scale(.96)} .chip.is-on{background:var(--btn);color:#fff;border-color:transparent}

/* grid */
.grid{display:grid;grid-template-columns:1fr;gap:18px}
@media(min-width:640px){.grid{grid-template-columns:repeat(2,1fr)}} @media(min-width:980px){.grid{grid-template-columns:repeat(3,1fr)}}
.gcard{display:flex;flex-direction:column;gap:10px;padding:26px;border-radius:20px;background:var(--card);border:1px solid var(--card-b);transition:transform .3s var(--ease),border-color .3s,box-shadow .3s var(--ease);position:relative;overflow:hidden}
.gcard::before{content:"";position:absolute;inset:0;background:radial-gradient(500px 200px at var(--mx,50%) -20%,rgba(168,85,247,.16),transparent 70%);opacity:0;transition:opacity .3s}
.gcard:hover{transform:translateY(-4px);border-color:var(--card-b2);box-shadow:0 30px 60px -30px rgba(168,85,247,.45)} .gcard:hover::before{opacity:1}
.gcard[hidden]{display:none}
.gicon{width:56px;height:56px;border-radius:14px;box-shadow:0 8px 20px -10px rgba(0,0,0,.6)}
.gcard h3{margin:4px 0 0;font-size:20px;font-weight:800;letter-spacing:-.02em}
.gcard p{margin:0;color:var(--fg-2);font-size:14.5px;flex:1}
.more{color:#c084fc;font-size:13.5px;font-weight:700;margin-top:6px} html[data-theme="light"] .more{color:#7e22ce}
.more i{display:inline-block;font-style:normal;transition:transform .2s var(--ease)} html[dir="rtl"] .more i{transform:scaleX(-1)}
.gcard:hover .more i{transform:translateX(4px)} html[dir="rtl"] .gcard:hover .more i{transform:scaleX(-1) translateX(4px)}

/* app details */
.app{display:grid;grid-template-columns:minmax(0,1fr);gap:34px;align-items:center;padding:56px 0;border-top:1px solid var(--card-b);scroll-margin-top:90px}
.app[hidden]{display:none}
@media(min-width:980px){.app{grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:56px;padding:84px 0} .app.flip .app-text{order:2}}
.app-head{display:flex;gap:18px;align-items:center;margin-bottom:22px}
.aicon{width:84px;height:84px;border-radius:22.5%;box-shadow:0 20px 40px -18px rgba(0,0,0,.8),0 0 0 1px var(--card-b)}
.app h3{margin:0;font-size:clamp(28px,4vw,40px);font-weight:900;letter-spacing:-.03em;line-height:1.05}
.asub{margin:4px 0 8px;color:var(--fg-2);font-size:17px}
.tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.tags li{border:1px solid var(--card-b);background:var(--card);border-radius:999px;padding:3px 10px;font-size:12px;font-weight:650;color:var(--fg-2)}
.tags li:first-child{color:#d8b4fe;border-color:var(--card-b2)} html[data-theme="light"] .tags li:first-child{color:#7e22ce}
.lead p{margin:0 0 12px;color:var(--fg-2);font-size:16.5px}
.lead p:first-child{color:var(--fg);font-size:18px;font-weight:500}
.feats{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:10px}
.feats li{display:flex;gap:10px;align-items:flex-start;font-size:15px;color:var(--fg-2)}
.feats .ic{color:#4ade80;margin-top:4px;width:16px;height:16px} .feats b{color:var(--fg);font-weight:700}
.app .cta{margin-top:26px}
.gal .strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:14px 4px 18px;scrollbar-width:none;-webkit-overflow-scrolling:touch;align-items:center}
.gal .strip::-webkit-scrollbar{display:none}
.ph,.mac{margin:0;flex:none;scroll-snap-align:center;border-radius:22px;overflow:hidden;border:1px solid var(--card-b);box-shadow:0 30px 60px -30px rgba(0,0,0,.8);background:#000}
.ph{width:min(250px,62vw)} .ph img{width:100%;height:auto}
.mac{width:min(560px,88vw);border-radius:14px} .mac img{width:100%;height:auto}
.app-media{position:relative;min-width:0}
.app-text{min-width:0}
.app-media::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,var(--bg),transparent 8%,transparent 92%,var(--bg));opacity:.9}

/* about */
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:40px}
@media(min-width:720px){.stats{grid-template-columns:repeat(4,1fr)}}
.stat{text-align:center;padding:26px 14px;border-radius:18px;background:var(--card);border:1px solid var(--card-b)}
.stat b{display:block;font-size:40px;font-weight:900;letter-spacing:-.03em;line-height:1}
.stat span{display:block;margin-top:8px;color:var(--fg-2);font-size:13.5px;font-weight:600}
.about p{color:var(--fg-2);text-align:center;max-width:70ch;margin:22px auto 0;font-size:17px}

footer{border-top:1px solid var(--card-b);padding:48px 0 calc(40px + env(safe-area-inset-bottom));text-align:center;color:var(--fg-3);font-size:13.5px}
footer .logo{height:44px;width:auto;border-radius:10px;margin:0 auto 18px}
footer p{margin:4px 0}
.reveal{opacity:0;transform:translateY(18px);transition:opacity .7s var(--ease),transform .7s var(--ease)} .reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important} .reveal{opacity:1;transform:none}}
</style>
</head>
<body>
<canvas id="stars" aria-hidden="true"></canvas><div class="glow" aria-hidden="true"></div>

<nav class="nav" aria-label="Main">
  <a href="#top"><img class="logo" src="brand/logo-dark.jpg" alt="Erezults" data-logo></a>
  <a class="l" href="#top">${t('בית', 'Home')}</a>
  <a class="l" href="#apps">${t('אפליקציות', 'Apps')}</a>
  <a class="l" href="#about">${t('אודות', 'About')}</a>
  <button class="pill" id="lang" type="button" aria-label="Language">${GLOBE}<span lang="he">EN</span><span lang="en">HE</span></button>
  <button class="pill" id="theme" type="button" aria-label="Theme"><span class="only-dark">${SUN}</span><span class="only-light">${MOON}</span><span lang="he"><span class="only-dark">בהיר</span><span class="only-light">כהה</span></span><span lang="en"><span class="only-dark">Light</span><span class="only-light">Dark</span></span></button>
</nav>
<style>html[data-theme="dark"] .only-light,html[data-theme="light"] .only-dark{display:none}</style>

<header class="hero wrap" id="top">
  <span class="badge"><i></i>${t(`${apps.length} אפליקציות ל-iPhone, iPad ו-Mac`, `${apps.length} apps for iPhone, iPad & Mac`)}</span>
  <img class="logo" src="brand/logo-dark.jpg" alt="Erezults" data-logo width="204" height="128">
  <h1 class="grad">${t('אפליקציות שעושות סדר בחיים', 'Apps that put your life in order')}</h1>
  <p>${t('Erezults בונה אפליקציות נייטיב ל-iPhone, ל-iPad ול-Mac: כסף, משפחה, בריאות ופרטיות. עברית מלאה, פרטיות קודם, בלי רעש.', 'Erezults builds native apps for iPhone, iPad and Mac — money, family, health and privacy. Hebrew and English, privacy first, no noise.')}</p>
  <div class="cta">
    <a class="btn grad" href="#apps">${t('לכל האפליקציות', 'Explore the apps')} <span aria-hidden="true">→</span></a>
    <a class="btn ghost" href="#about">${t('אודות', 'About')}</a>
  </div>
  <div class="scroll" aria-hidden="true"><span>⌄</span><span>scroll</span></div>
</header>

<main>
<section class="sec wrap" id="apps">
  <p class="eyebrow">${t('המוצרים שלנו', 'Our apps')}</p>
  <h2 class="h2">${t('האפליקציות', 'The apps')}</h2>
  <p class="sub">${t('כל אפליקציה נבנתה סביב בעיה אחת אמיתית ונפתרה עד הסוף. לחצו על כרטיס לפרטים, לצילומי מסך ולהורדה.', 'Each app is built around one real problem and solves it completely. Tap a card for details, screenshots and download.')}</p>
  <div class="filters" role="group" aria-label="Categories">${filters}</div>
  <div class="grid">${apps.map(gridCard).join('')}</div>
</section>

<section class="wrap" id="details">
${apps.map(detail).join('\n')}
</section>

<section class="sec wrap about" id="about">
  <p class="eyebrow">${t('אודות', 'About us')}</p>
  <h2 class="h2">${tRaw('טכנולוגיה אישית, <span class="grad">בלי פשרות</span>', 'Personal technology, <span class="grad">done right</span>')}</h2>
  <p>${t('Erezults היא סטודיו ישראלי לאפליקציות נייטיב. אנחנו בונים כלים שעוזרים למשפחות ולאנשים לנהל כסף, בריאות, זיכרונות ובית, עם דגש על פרטיות, עיצוב נקי ותמיכה מלאה בעברית ובאנגלית, ב-iPhone, ב-iPad וב-Mac.', 'Erezults is an Israeli studio for native apps. We build tools that help families and individuals manage money, health, memories and home, with a focus on privacy, clean design and full Hebrew and English support, on iPhone, iPad and Mac.')}</p>
  <div class="stats">
    <div class="stat"><b class="grad">${apps.length}</b><span>${t('אפליקציות ב-App Store', 'apps on the App Store')}</span></div>
    <div class="stat"><b class="grad">${macCount}</b><span>${t('זמינות גם ל-Mac', 'also on the Mac')}</span></div>
    <div class="stat"><b class="grad">2</b><span>${t('שפות: עברית ואנגלית', 'languages: Hebrew & English')}</span></div>
    <div class="stat"><b class="grad">100%</b><span>${t('פרטיות קודם', 'privacy first')}</span></div>
  </div>
</section>
</main>

<footer>
  <img class="logo" src="brand/logo-dark.jpg" alt="" data-logo>
  <p>© ${YEAR} Erezults. ${t('כל הזכויות שמורות.', 'All rights reserved.')}</p>
  <p>${t('פותח על ידי ארז כהן · Apple, App Store ו-Mac הם סימנים מסחריים של Apple Inc.', 'Developed by Erez Cohen · Apple, App Store and Mac are trademarks of Apple Inc.')}</p>
</footer>

<script>
(function(){
  var root=document.documentElement, LK='erezults-lang', TK='erezults-theme';
  function lang(l){root.setAttribute('data-lang',l);root.setAttribute('lang',l);root.setAttribute('dir',l==='he'?'rtl':'ltr');try{localStorage.setItem(LK,l)}catch(e){}}
  function theme(th){root.setAttribute('data-theme',th);try{localStorage.setItem(TK,th)}catch(e){}
    document.querySelectorAll('[data-logo]').forEach(function(i){i.src=th==='light'?'brand/logo-light.jpg':'brand/logo-dark.jpg'});
    document.querySelector('meta[name=theme-color]').setAttribute('content',th==='light'?'#fafafc':'#0a0a0f');}
  var sl=null,st=null;try{sl=localStorage.getItem(LK);st=localStorage.getItem(TK)}catch(e){}
  lang(sl||((navigator.language||'').toLowerCase().indexOf('he')===0?'he':'en'));
  theme(st||'dark');
  document.getElementById('lang').addEventListener('click',function(){lang(root.getAttribute('data-lang')==='he'?'en':'he')});
  document.getElementById('theme').addEventListener('click',function(){theme(root.getAttribute('data-theme')==='dark'?'light':'dark')});

  // category filter (grid + detail sections)
  var chips=document.querySelectorAll('.chip');
  chips.forEach(function(c){c.addEventListener('click',function(){
    chips.forEach(function(x){x.classList.toggle('is-on',x===c)}); var k=c.getAttribute('data-cat');
    document.querySelectorAll('.gcard,.app').forEach(function(el){el.hidden=!(k==='all'||el.getAttribute('data-cat')===k)});
  })});
  // hover glow origin
  document.querySelectorAll('.gcard').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%')})});
  // reveal on scroll
  var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
  document.querySelectorAll('.gcard,.app,.stat').forEach(function(el){el.classList.add('reveal');io?io.observe(el):el.classList.add('in')});
  setTimeout(function(){document.querySelectorAll('.reveal:not(.in)').forEach(function(el){el.classList.add('in')})},4000); // safety net

  // starfield
  var cv=document.getElementById('stars'),ctx=cv.getContext('2d'),stars=[],W,H,dpr=Math.min(window.devicePixelRatio||1,2);
  function size(){W=cv.width=innerWidth*dpr;H=cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
    stars=[];var n=Math.min(260,Math.floor(innerWidth*innerHeight/6000));for(var i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.3+.3)*dpr,a:Math.random(),s:Math.random()*.02+.004,v:Math.random()*.08+.02});}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(){ctx.clearRect(0,0,W,H);for(var i=0;i<stars.length;i++){var s=stars[i];if(!reduce){s.a+=s.s;if(s.a>1||s.a<0)s.s=-s.s;s.y-=s.v*dpr;if(s.y<0)s.y=H;}
      ctx.globalAlpha=.25+Math.abs(Math.sin(s.a*Math.PI))*.75;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();}
    ctx.globalAlpha=1;if(!reduce)requestAnimationFrame(draw);}
  size();draw();addEventListener('resize',size);
})();
</script>
</body>
</html>
`;
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
fs.writeFileSync(new URL('./404.html', import.meta.url), html);
console.log(`built index.html (${apps.length} apps, ${(html.length / 1024).toFixed(1)} KB)`);
