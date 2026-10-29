import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const SCREENS = path.join(ROOT, 'docs/delivery/screens');
const OUT = path.join(ROOT, 'docs/delivery/FitAI-Delivery-and-Future-Scope.html');

function b64(file) {
  const p = path.join(SCREENS, file);
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p).toString('base64');
}

const img = (name, alt) => {
  const data = b64(`${name}.jpeg`);
  if (!data) return `<p class="muted">Screenshot pending: ${alt}</p>`;
  return `<img src="data:image/jpeg;base64,${data}" alt="${alt}" loading="lazy" width="720" height="450">`;
};

const devicePair = (slug, label) => `
<div class="device-grid">
  <figure class="device-frame desktop-frame">${img(`${slug}-desktop`, `${label} on desktop 1440px`)}
  <figcaption>Desktop · 1440px</figcaption></figure>
  <figure class="device-frame mobile-frame">${img(`${slug}-mobile`, `${label} on mobile 390px`)}
  <figcaption>Mobile · 390px</figcaption></figure>
</div>`;

const mvpRows = `
<tr data-status="delivered"><td>4.1</td><td>Email sign up and log in</td><td><span class="status s-delivered">Delivered</span></td><td>/login</td><td>Supabase Auth</td></tr>
<tr data-status="delivered"><td>4.1</td><td>Forgot / reset password</td><td><span class="status s-delivered">Delivered</span></td><td>/login, /reset-password</td><td></td></tr>
<tr data-status="delivered"><td>4.1</td><td>Five-step onboarding with computed targets</td><td><span class="status s-delivered">Delivered</span></td><td>/onboarding</td><td>Mifflin–St Jeor</td></tr>
<tr data-status="delivered"><td>4.1</td><td>Delete account (confirmed)</td><td><span class="status s-delivered">Delivered</span></td><td>/profile</td><td>Server route + service role</td></tr>
<tr data-status="delivered"><td>4.2</td><td>Dashboard rings, weight, sessions</td><td><span class="status s-delivered">Delivered</span></td><td>/dashboard</td><td></td></tr>
<tr data-status="delivered"><td>4.2</td><td>Quick actions and summary navigation</td><td><span class="status s-delivered">Delivered</span></td><td>/dashboard</td><td></td></tr>
<tr data-status="delivered"><td>4.2</td><td>Command palette (Ctrl/Cmd+K)</td><td><span class="status s-delivered">Delivered</span></td><td>Global</td><td></td></tr>
<tr data-status="delivered"><td>4.3</td><td>Weekly workout planner</td><td><span class="status s-delivered">Delivered</span></td><td>/workouts</td><td></td></tr>
<tr data-status="delivered"><td>4.3</td><td>Workout details and add exercise</td><td><span class="status s-delivered">Delivered</span></td><td>/workouts/details</td><td></td></tr>
<tr data-status="delivered"><td>4.3</td><td>Active workout, rest timer, save session</td><td><span class="status s-delivered">Delivered</span></td><td>/workouts/active</td><td>In-progress state local</td></tr>
<tr data-status="delivered"><td>4.3</td><td>Regenerate plan</td><td><span class="status s-delivered">Delivered</span></td><td>/workouts</td><td>Rule-based RPC, not LLM</td></tr>
<tr data-status="delivered"><td>4.4</td><td>Nutrition overview and meal log</td><td><span class="status s-delivered">Delivered</span></td><td>/nutrition</td><td></td></tr>
<tr data-status="delivered"><td>4.4</td><td>Food search and custom foods</td><td><span class="status s-delivered">Delivered</span></td><td>/nutrition/add</td><td></td></tr>
<tr data-status="delivered"><td>4.4</td><td>Nova meal suggestion shortcut</td><td><span class="status s-delivered">Delivered</span></td><td>/nutrition</td><td>Rule-based suggestion</td></tr>
<tr data-status="simulated"><td>4.5</td><td>Nova AI chat replies</td><td><span class="status s-simulated">Simulated</span></td><td>/coach</td><td>src/lib/reply.ts keyword engine; no Gemini</td></tr>
<tr data-status="delivered"><td>4.5</td><td>Progress charts and weight log</td><td><span class="status s-delivered">Delivered</span></td><td>/progress</td><td>Hand-built SVG</td></tr>
<tr data-status="delivered"><td>4.5</td><td>Profile, targets, sounds, feedback entry</td><td><span class="status s-delivered">Delivered</span></td><td>/profile</td><td></td></tr>
<tr data-status="delivered"><td>4.5</td><td>Help center, InfoTips, guided tour</td><td><span class="status s-delivered">Delivered</span></td><td>/help</td><td></td></tr>
<tr data-status="delivered"><td>4.5</td><td>PWA install, offline shell, service worker</td><td><span class="status s-delivered">Delivered</span></td><td>Manifest, /offline</td><td>No push notifications</td></tr>
<tr data-status="partial"><td>4.5</td><td>Real LLM coach (Gemini)</td><td><span class="status s-partial">Not included</span></td><td>—</td><td>Planned Phase 5 / backlog</td></tr>
<tr data-status="partial"><td>4.5</td><td>Push reminders</td><td><span class="status s-partial">Not included</span></td><td>—</td><td>Out of PWA scope</td></tr>
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="FitAI project delivery, demo tour, and future scope — verified against the shipped MVP.">
<title>FitAI — project delivery and future scope</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --bg-app:#0B0B0D;--bg-sidebar:#0F0F12;--surface-card:#151518;--surface-raised:#1C1C21;
  --border-default:#26262C;--border-strong:#383841;--text-primary:#F5F5F7;--text-secondary:#A1A1AD;--text-soft:#D4D4DC;
  --lime:#C6FF3D;--lime-hover:#D8FF73;--on-lime:#0B0B0D;--lime-tint:#1E2410;--violet:#A78BFA;--violet-tint:#1A1626;
  --error:#FF7A7A;--section-gap:96px;--section-gap-m:64px;--radius-card:20px;
  --font-heading:'Sora',system-ui,sans-serif;--font-body:'DM Sans',system-ui,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font-body);font-size:16px;line-height:1.6;color:var(--text-primary);background:var(--bg-app)}
a{color:var(--lime);text-decoration:none}
a:hover{color:var(--lime-hover);text-decoration:underline}
h1,h2,h3{font-family:var(--font-heading);letter-spacing:-0.02em;line-height:1.15;margin:0 0 16px}
h1{font-size:clamp(2rem,4vw,3.25rem);font-weight:800}
h2{font-size:clamp(1.75rem,3vw,2.375rem);font-weight:700}
h3{font-size:1.125rem;font-weight:600}
p{margin:0 0 16px;color:var(--text-soft)}
.muted{color:var(--text-secondary)}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:12px}
.layout{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
nav.toc{position:sticky;top:0;height:100vh;overflow:auto;padding:32px 24px;background:var(--bg-sidebar);border-right:1px solid var(--border-default)}
nav.toc .logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
nav.toc .logo svg{width:36px;height:36px;flex-shrink:0}
nav.toc .logo span{font-family:var(--font-heading);font-weight:700;font-size:1.25rem}
nav.toc ol{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
nav.toc a{display:block;padding:10px 12px;border-radius:999px;color:var(--text-secondary);font-size:14px;border:1px solid transparent}
nav.toc a:hover,nav.toc a.active{color:var(--text-primary);background:var(--surface-card);border-color:var(--border-default)}
main{padding:48px 56px 120px;max-width:1120px}
section{margin-bottom:var(--section-gap);scroll-margin-top:24px}
section.reveal{opacity:0;transform:translateY(12px);transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1)}
section.reveal.visible{opacity:1;transform:none}
.card{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-card);padding:28px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px;margin-top:32px}
.stat{padding:24px;border-radius:var(--radius-card);background:var(--surface-card);border:1px solid var(--border-default)}
.stat .num{font-family:var(--font-heading);font-size:2rem;font-weight:800;color:var(--lime)}
.stat .label{font-size:14px;color:var(--text-secondary)}
.cover{padding:56px 0 24px;border-bottom:1px solid var(--border-default);margin-bottom:var(--section-gap)}
.cover-meta{display:flex;flex-wrap:wrap;gap:12px 24px;font-size:14px;color:var(--text-secondary);margin-top:24px}
.tag{display:inline-block;padding:6px 14px;border-radius:999px;border:1px solid var(--border-strong);font-size:13px;color:var(--text-soft)}
.ai-border{background:linear-gradient(135deg,#C6FF3D88,#8B5CF688);padding:1px;border-radius:var(--radius-card)}
.ai-border>.inner{background:var(--surface-card);border-radius:19px;padding:28px}
.journey{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;margin-top:24px}
.journey-step{flex:1 1 140px;min-width:140px;padding:20px;border-radius:var(--radius-card);background:var(--surface-raised);border:1px solid var(--border-default);position:relative}
.journey-step .n{font-family:var(--font-heading);font-weight:800;color:var(--lime);font-size:1.25rem}
.journey-arrow{align-self:center;color:var(--text-secondary);font-size:1.25rem}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{padding:14px 12px;text-align:left;border-bottom:1px solid var(--border-default);vertical-align:top}
th{color:var(--text-secondary);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.06em}
.status{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--border-default)}
.s-delivered{background:var(--lime-tint);color:var(--lime);border-color:#2F3A12}
.s-partial{background:#2A1416;color:var(--error);border-color:#5A2A2E}
.s-simulated{background:var(--violet-tint);color:var(--violet);border-color:#3B2F63}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}
.filters button{font:inherit;padding:8px 16px;border-radius:999px;border:1px solid var(--border-strong);background:var(--bg-sidebar);color:var(--text-soft);cursor:pointer}
.filters button.active{background:var(--lime);color:var(--on-lime);border-color:var(--lime)}
.device-grid{display:grid;grid-template-columns:1fr 280px;gap:24px;margin:24px 0 40px;align-items:start}
.device-frame{margin:0;background:var(--surface-card);border:1px solid var(--border-default);border-radius:24px;padding:16px;overflow:hidden}
.device-frame img{width:100%;height:auto;display:block;border-radius:12px;border:1px solid var(--border-default)}
.device-frame figcaption{font-size:12px;color:var(--text-secondary);margin-top:10px;text-align:center}
.mobile-frame{max-width:280px;margin-inline:auto}
.tour-block{margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid var(--border-default)}
.tour-block:last-child{border-bottom:none}
.tour-block ul{margin:12px 0;padding-left:20px;color:var(--text-soft)}
.why{margin-top:16px;padding:16px 20px;border-left:3px solid var(--lime);background:var(--surface-raised);border-radius:0 14px 14px 0;color:var(--text-soft)}
.diagram-wrap{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-card);padding:24px;margin:24px 0;overflow:auto}
code,pre{font-family:ui-monospace,monospace;font-size:13px}
pre{background:var(--bg-sidebar);border:1px solid var(--border-default);border-radius:14px;padding:16px 20px;overflow:auto;position:relative}
.copy-btn{position:absolute;top:12px;right:12px;font-size:12px;padding:6px 12px;border-radius:999px;border:1px solid var(--border-strong);background:var(--surface-raised);color:var(--text-soft);cursor:pointer}
.roadmap-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
.roadmap-tabs button{font:inherit;padding:10px 16px;border-radius:999px;border:1px solid var(--border-strong);background:var(--bg-sidebar);color:var(--text-soft);cursor:pointer}
.roadmap-tabs button.active{background:var(--violet-tint);color:var(--violet);border-color:#3B2F63}
.roadmap-panel{display:none}
.roadmap-panel.active{display:block}
.matrix{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--border-default);border-radius:var(--radius-card);overflow:hidden;margin-top:24px}
.matrix div{background:var(--surface-card);padding:20px;font-size:14px}
.matrix .head{background:var(--surface-raised);font-weight:600;color:var(--text-secondary)}
.acc-btn{width:100%;text-align:left;font:inherit;padding:18px 20px;background:var(--surface-card);border:1px solid var(--border-default);border-radius:14px;color:var(--text-primary);cursor:pointer;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.acc-panel{display:none;padding:0 20px 16px;color:var(--text-soft);font-size:15px}
.acc-panel.open{display:block}
.fab{position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:999px;background:var(--lime);color:var(--on-lime);border:none;font-size:20px;cursor:pointer;z-index:50}
.toolbar-top{display:none}
@media(max-width:900px){
  .layout{grid-template-columns:1fr}
  nav.toc{display:none}
  .toolbar-top{display:flex;position:sticky;top:0;z-index:40;background:var(--bg-sidebar);border-bottom:1px solid var(--border-default);padding:12px 16px;gap:8px;overflow:auto}
  .toolbar-top a{font-size:13px;padding:8px 12px;border-radius:999px;border:1px solid var(--border-default);color:var(--text-secondary);white-space:nowrap}
  main{padding:24px 20px 100px}
  section{margin-bottom:var(--section-gap-m)}
  .device-grid{grid-template-columns:1fr}
  .mobile-frame{max-width:100%}
}
@media print{
  :root{--bg-app:#fff;--text-primary:#111;--text-soft:#333;--surface-card:#f5f5f5}
  body{background:#fff;color:#111}
  nav.toc,.toolbar-top,.fab,.filters,.copy-btn{display:none!important}
  main{max-width:100%;padding:0}
  section{page-break-inside:avoid;margin-bottom:48px}
  a{color:#111;text-decoration:underline}
  .status{border:1px solid #999}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  section.reveal{opacity:1;transform:none;transition:none}
}
</style>
</head>
<body>
<div class="toolbar-top" aria-label="Section navigation">
  <a href="#cover">Cover</a><a href="#executive">Summary</a><a href="#mvp">MVP</a><a href="#tour">Tour</a><a href="#roadmap">Roadmap</a>
</div>
<div class="layout">
<nav class="toc" aria-label="Table of contents">
  <div class="logo">
    <svg viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" fill="#0B0B0D"/><path d="M102 89h7l-9 12h7l-1 8 9-12h-7l1-8z" transform="translate(89.6,89.6) scale(13.87)" fill="#C6FF3D"/></svg>
    <span>FitAI</span>
  </div>
  <ol>
    <li><a href="#cover">Cover</a></li>
    <li><a href="#executive">Executive summary</a></li>
    <li><a href="#vision">Vision and problem</a></li>
    <li><a href="#solution">Solution and journey</a></li>
    <li><a href="#mvp">MVP vs delivery</a></li>
    <li><a href="#tour">Screen tour</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#data">Data and security</a></li>
    <li><a href="#quality">Quality and testing</a></li>
    <li><a href="#package">Delivery package</a></li>
    <li><a href="#demo-script">Demo script</a></li>
    <li><a href="#limitations">Limitations</a></li>
    <li><a href="#roadmap">Future scope</a></li>
    <li><a href="#next">Next steps</a></li>
    <li><a href="#appendix">Appendix</a></li>
  </ol>
  <p style="margin-top:24px"><button type="button" id="printBtn" class="tag" style="cursor:pointer;background:transparent;width:100%">Print / save as PDF</button></p>
</nav>
<main>

<section id="cover" class="cover reveal">
  <p class="eyebrow">Handover document</p>
  <h1>FitAI — project delivery and future scope</h1>
  <p style="font-size:1.25rem;color:var(--text-soft);max-width:640px">Your fitness. Your data. Your AI coach.</p>
  <p class="muted">Delivery and future scope · version 1.0 · 29 October 2026</p>
  <div class="cover-meta">
    <span>Team: Gourav Narvariya (lead) · FitAI hackathon squad</span>
    <span>Repo: <a href="https://github.com/gouravN0709/Hackathon-2-Gourav-Narvariya">github.com/gouravN0709/Hackathon-2-Gourav-Narvariya</a></span>
    <span>Live URL: configure on Vercel (not stored in repo)</span>
  </div>
</section>

<section id="executive" class="reveal">
  <p class="eyebrow">Executive summary</p>
  <h2>What we promised vs what shipped</h2>
  <p>The MVP committed to a member-facing web app: auth and onboarding, a data-rich dashboard, workout planner and logger, nutrition tracking, progress analytics, and Nova as an AI coach—all on a premium dark UI with PWA support. That scope is implemented and covered by automated tests. Nova uses a deterministic keyword engine tied to live user data, not a hosted LLM yet. Supabase replaces the original local-only persistence plan while keeping the same screens and copy.</p>
  <div class="stat-grid">
    <div class="stat"><div class="num" data-count="15">0</div><div class="label">Primary screens built</div></div>
    <div class="stat"><div class="num" data-count="10">0</div><div class="label">End-to-end journeys passing</div></div>
    <div class="stat"><div class="num" data-count="169">0</div><div class="label">Automated tests green (unit + E2E)</div></div>
    <div class="stat"><div class="num">100</div><div class="label">Lighthouse scores (perf / a11y / BP / SEO)</div></div>
  </div>
</section>

<section id="vision" class="reveal">
  <p class="eyebrow">Vision and problem</p>
  <h2>Who we are solving for</h2>
  <h3 style="margin-top:32px">Member pain points</h3>
  <div class="card-grid" style="margin-top:16px">
    <div class="card"><h3>No clear plan</h3><p class="muted">Unsure what to train each day or how to progress loads.</p></div>
    <div class="card"><h3>Nutrition guesswork</h3><p class="muted">Hard to hit protein and calories without a simple log.</p></div>
    <div class="card"><h3>Invisible progress</h3><p class="muted">Weight and strength trends live in scattered notes.</p></div>
    <div class="card"><h3>Generic advice</h3><p class="muted">Content that ignores actual workouts and meals.</p></div>
    <div class="card"><h3>Fragmented tools</h3><p class="muted">Separate apps for lifting, food, and chat.</p></div>
    <div class="card"><h3>Motivation drops</h3><p class="muted">No timely, personal nudges when consistency slips.</p></div>
  </div>
  <h3 style="margin-top:40px">Trainer and gym operator pain points</h3>
  <div class="card-grid" style="margin-top:16px">
    <div class="card"><h3>Manual programming</h3><p class="muted">Plans rebuilt from scratch for every client.</p></div>
    <div class="card"><h3>Blind spots</h3><p class="muted">Limited view of who actually trained and ate on plan.</p></div>
    <div class="card"><h3>Churn</h3><p class="muted">Engagement falls when digital touchpoints are weak.</p></div>
    <div class="card"><h3>Commodity floor</h3><p class="muted">Hard to differentiate without connected member data.</p></div>
  </div>
</section>

<section id="solution" class="reveal">
  <p class="eyebrow">Solution</p>
  <h2>Member journey</h2>
  <div class="journey" id="journeyFlow">
    <div class="journey-step"><div class="n">1</div><strong>Set goals</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Onboarding computes targets.</p></div>
    <span class="journey-arrow" aria-hidden="true">→</span>
    <div class="journey-step"><div class="n">2</div><strong>Plan</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Weekly split and details.</p></div>
    <span class="journey-arrow">→</span>
    <div class="journey-step"><div class="n">3</div><strong>Work out</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Live sets, rest timer, save.</p></div>
    <span class="journey-arrow">→</span>
    <div class="journey-step"><div class="n">4</div><strong>Track nutrition</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Search, servings, macros.</p></div>
    <span class="journey-arrow">→</span>
    <div class="journey-step"><div class="n">5</div><strong>Monitor progress</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Charts and goal ring.</p></div>
    <span class="journey-arrow">→</span>
    <div class="journey-step ai-border"><div class="inner"><div class="n" style="color:var(--violet)">6</div><strong>Get AI feedback</strong><p class="muted" style="font-size:14px;margin:8px 0 0">Nova cites your numbers.</p></div></div>
  </div>
</section>

<section id="mvp" class="reveal">
  <p class="eyebrow">Accountability</p>
  <h2>MVP scope vs delivery</h2>
  <p class="muted">Source: docs/DELIVERY_FACTS.md and docs/references/proposal.md §4.</p>
  <div class="filters" role="group" aria-label="Filter by status">
    <button type="button" class="active" data-filter="all">All</button>
    <button type="button" data-filter="delivered">Delivered</button>
    <button type="button" data-filter="partial">Partial / not included</button>
    <button type="button" data-filter="simulated">Simulated</button>
  </div>
  <div style="overflow:auto">
  <table id="mvpTable">
    <thead><tr><th>Area</th><th>Feature</th><th>Status</th><th>In app</th><th>Notes</th></tr></thead>
    <tbody>${mvpRows}</tbody>
  </table>
  </div>
</section>

<section id="tour" class="reveal">
  <p class="eyebrow">Demo tour</p>
  <h2>Screen-by-screen walkthrough</h2>
  <p class="muted">Screenshots: Playwright on production build (login, onboarding, help, offline) and visual-regression baselines at 1440 and 390 px (seeded demo data, frozen date 15 Oct 2026).</p>

  <article class="tour-block" id="tour-login">
    <h3>Login</h3>
    <p>Sign in or create an account with email and password. Validation, password visibility, and forgot-password flow match Brand OS copy.</p>
    ${devicePair('login', 'Login')}
    <ul><li>Switch between log in and sign up without losing email</li><li>Submit with keyboard Enter</li><li>Success screen routes to dashboard or onboarding</li></ul>
    <p class="why"><strong>Why it matters:</strong> Trust starts here—fast auth with clear errors before any data is collected.</p>
  </article>

  <article class="tour-block">
    <h3>Onboarding</h3>
    <p>Five steps capture stats, goal, experience, and diet, then show computed calorie and protein targets before the first dashboard visit.</p>
    ${devicePair('onboarding', 'Onboarding')}
    <ul><li>Boundary validation on age, height, and weight</li><li>Single-select goal and diet cards</li><li>Plan builder animation then dashboard handoff</li></ul>
    <p class="why"><strong>Why it matters:</strong> Every ring and Nova reply later depends on targets set once, correctly.</p>
  </article>

  <article class="tour-block">
    <h3>Dashboard</h3>
    <p>Home screen for today: rings, weight, workout status, and quick actions to food, progress, workout, and coach.</p>
    ${devicePair('dashboard', 'Dashboard')}
    <ul><li>Quick actions deep-link to the right flow</li><li>Seven- and thirty-day weight toggle on desktop</li><li>Command palette from header or Ctrl/Cmd+K</li></ul>
    <p class="why"><strong>Why it matters:</strong> One glance answers “what should I do next?”</p>
  </article>

  <article class="tour-block">
    <h3>AI coach (Nova)</h3>
    <p>Chat with suggested prompts, typing indicator, and a context panel reflecting live workout and nutrition state.</p>
    ${devicePair('coach', 'AI Coach')}
    <ul><li>Prompt chips send curated questions</li><li>Replies stream word-by-word (UI); logic is keyword-based</li><li>Quick links back to dashboard, nutrition, or workouts</li></ul>
    <p class="why"><strong>Why it matters:</strong> Coaching feels personal because numbers come from the member’s own logs—even before a real LLM ships.</p>
  </article>

  <article class="tour-block">
    <h3>Workouts — planner</h3>
    ${devicePair('workouts', 'Workout planner')}
    <ul><li>Week strip with done / planned / rest states</li><li>Regenerate plan (rule-based RPC)</li><li>Custom routines and muscle filters</li></ul>
    <p class="why"><strong>Why it matters:</strong> Structure beats random gym sessions.</p>
  </article>

  <article class="tour-block">
    <h3>Workouts — details and active</h3>
    ${devicePair('workouts-details', 'Workout details')}
    ${devicePair('workouts-active', 'Active workout')}
    <ul><li>Start workout from details</li><li>Rest timer after each set; finish saves session to Supabase</li><li>Volume and minutes roll up to progress and dashboard</li></ul>
    <p class="why"><strong>Why it matters:</strong> Logged sets become charts, PRs, and coach context automatically.</p>
  </article>

  <article class="tour-block">
    <h3>Nutrition and food search</h3>
    ${devicePair('nutrition', 'Nutrition overview')}
    ${devicePair('nutrition-add', 'Food search')}
    <ul><li>Meal tabs and macro split bar</li><li>Search, serving multiplier, custom foods</li><li>Undo toast when removing items</li></ul>
    <p class="why"><strong>Why it matters:</strong> Protein and calorie gaps close only when logging is fast.</p>
  </article>

  <article class="tour-block">
    <h3>Progress</h3>
    ${devicePair('progress', 'Progress')}
    <ul><li>Log weight with validation and undo</li><li>Weight, consistency, calorie trend, top lifts</li><li>Ask Nova about progress prefills coach chat</li></ul>
    <p class="why"><strong>Why it matters:</strong> Trends beat single-day scale noise.</p>
  </article>

  <article class="tour-block">
    <h3>Profile and settings</h3>
    ${devicePair('profile', 'Profile')}
    <ul><li>Edit targets with unsaved-changes guard</li><li>Notifications, interface sounds, install app card</li><li>Feedback modal and demo reset</li></ul>
    <p class="why"><strong>Why it matters:</strong> Members own their targets and how the app talks to them.</p>
  </article>

  <article class="tour-block">
    <h3>Help</h3>
    ${devicePair('help', 'Help center')}
    <ul><li>Searchable topics from src/content/help.ts</li><li>InfoTips on charts and fields</li><li>Five-step coachmark tour on first visits</li></ul>
    <p class="why"><strong>Why it matters:</strong> Reduces support load; every metric is explained in plain language.</p>
  </article>

  <article class="tour-block">
    <h3>Mobile and PWA</h3>
    ${devicePair('offline-pwa', 'Offline fallback')}
    <ul><li>Bottom tab bar below 820 px; profile via avatar</li><li>Install banner after engagement; iOS share-sheet instructions</li><li>Service worker caches shell; offline page when navigation fails</li></ul>
    <p class="why"><strong>Why it matters:</strong> Gyms have dead zones—installable offline shell keeps the product usable.</p>
  </article>
</section>

<section id="architecture" class="reveal">
  <p class="eyebrow">Architecture</p>
  <h2>System overview</h2>
  <div class="diagram-wrap">
  <svg viewBox="0 0 880 320" width="100%" role="img" style="max-width:100%;height:auto" aria-label="Architecture diagram: Next.js client talks to Supabase auth and Postgres with RLS; PWA service worker caches shell; Nova reply engine runs in browser with live store data">
    <rect width="880" height="320" fill="#151518"/>
    <rect x="40" y="40" width="200" height="240" rx="16" fill="#1C1C21" stroke="#383841"/>
    <text x="140" y="72" fill="#F5F5F7" font-family="Sora,sans-serif" font-size="14" text-anchor="middle" font-weight="700">Next.js app</text>
    <text x="140" y="100" fill="#A1A1AD" font-size="11" text-anchor="middle">React 19 · App Router</text>
    <text x="140" y="120" fill="#A1A1AD" font-size="11" text-anchor="middle">Zustand + TanStack Query</text>
    <rect x="70" y="140" width="140" height="36" rx="8" fill="#0F0F12" stroke="#26262C"/><text x="140" y="163" fill="#C6FF3D" font-size="11" text-anchor="middle">UI routes</text>
    <rect x="70" y="186" width="140" height="36" rx="8" fill="#1A1626" stroke="#3B2F63"/><text x="140" y="209" fill="#A78BFA" font-size="11" text-anchor="middle">Nova reply.ts</text>
    <rect x="70" y="232" width="140" height="36" rx="8" fill="#0F0F12" stroke="#26262C"/><text x="140" y="255" fill="#D4D4DC" font-size="11" text-anchor="middle">public/sw.js PWA</text>
    <path d="M240 160 H320" stroke="#383841" stroke-width="2" marker-end="url(#arr)"/>
    <rect x="320" y="80" width="240" height="160" rx="16" fill="#1C1C21" stroke="#383841"/>
    <text x="440" y="112" fill="#F5F5F7" font-family="Sora,sans-serif" font-size="14" text-anchor="middle" font-weight="700">Supabase</text>
    <text x="440" y="140" fill="#A1A1AD" font-size="11" text-anchor="middle">Auth (email/password)</text>
    <text x="440" y="160" fill="#A1A1AD" font-size="11" text-anchor="middle">Postgres + RLS</text>
    <text x="440" y="180" fill="#A1A1AD" font-size="11" text-anchor="middle">RPC regenerate_plan</text>
    <rect x="350" y="200" width="180" height="28" rx="6" fill="#0F0F12" stroke="#26262C"/><text x="440" y="219" fill="#D4D4DC" font-size="10" text-anchor="middle">Catalog: exercises, foods</text>
    <path d="M560 160 H640" stroke="#383841" stroke-width="2"/>
    <rect x="640" y="100" width="200" height="120" rx="16" fill="#1C1C21" stroke="#383841"/>
    <text x="740" y="132" fill="#F5F5F7" font-family="Sora,sans-serif" font-size="14" text-anchor="middle" font-weight="700">Vercel</text>
    <text x="740" y="158" fill="#A1A1AD" font-size="11" text-anchor="middle">SSR / static pages</text>
    <text x="740" y="178" fill="#A1A1AD" font-size="11" text-anchor="middle">/api/account/delete</text>
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#383841"/></marker></defs>
  </svg>
  </div>
  <table>
    <thead><tr><th>Layer</th><th>Proposed</th><th>Delivered</th></tr></thead>
    <tbody>
      <tr><td>Frontend</td><td>Next.js, React, TS, Tailwind</td><td>Next.js 16.4, React 19, Tailwind v4</td></tr>
      <tr><td>Backend</td><td>Supabase</td><td>Migrations 001–004, repos, RLS</td></tr>
      <tr><td>AI</td><td>Google Gemini (server)</td><td>Keyword mock in reply.ts (simulated)</td></tr>
      <tr><td>Charts</td><td>Chart library (optional)</td><td>Hand-built SVG components</td></tr>
      <tr><td>Motion</td><td>Framer Motion / NumberFlow</td><td>CSS transitions + NumberStat (no extra deps)</td></tr>
    </tbody>
  </table>
</section>

<section id="data" class="reveal">
  <p class="eyebrow">Data and security</p>
  <h2>What is stored where</h2>
  <div class="card-grid">
    <div class="card"><h3>Supabase Postgres</h3><p class="muted">Profiles, weight logs, meals, sessions, chat messages, plans, feedback. User-scoped via RLS.</p></div>
    <div class="card"><h3>Browser</h3><p class="muted">Query cache, offline queue, active workout in progress, PWA install dismissal, tour flags in profile settings JSON.</p></div>
    <div class="card"><h3>Catalog tables</h3><p class="muted">Exercises, workouts, foods—read-only for signed-in users; seeded in migration 004.</p></div>
  </div>
  <p style="margin-top:24px"><strong>Privacy:</strong> No third-party analytics in repo. Account delete cascades via service-role API. Help copy is being aligned with Supabase storage (some help topics still mention localStorage-only).</p>
</section>

<section id="quality" class="reveal">
  <p class="eyebrow">Quality</p>
  <h2>Testing and performance</h2>
  <p>From docs/TEST_REPORT.md (2026-10-29): all P0/P1 cases green; release-ready sign-off.</p>
  <table>
    <thead><tr><th>Suite</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>Unit and component (Vitest)</td><td>57 / 57 passed</td></tr>
      <tr><td>Playwright E2E</td><td>112 / 112 passed</td></tr>
      <tr><td>Visual regression</td><td>31 / 31 passed</td></tr>
      <tr><td>Axe WCAG 2.1 AA</td><td>0 critical / serious</td></tr>
      <tr><td>Lighthouse CI (9 routes)</td><td>100 / 100 / 100 / 100 each</td></tr>
      <tr><td>ESLint + TypeScript</td><td>0 errors</td></tr>
    </tbody>
  </table>
  <p class="muted" style="margin-top:16px">Unit line coverage (overall): 51.9% on npm run test:unit:coverage — repo layer covered primarily by E2E against local Supabase. Known issues: local db reset can duplicate catalog seed (migration 004 + seed.sql); demo seed auth may need identity row for manual SQL seed.</p>
</section>

<section id="package" class="reveal">
  <p class="eyebrow">Delivery package</p>
  <h2>What you receive</h2>
  <ul style="color:var(--text-soft);padding-left:20px">
    <li>Git repository with Next.js source, Supabase migrations, and CI workflow</li>
    <li>Documentation: BRAND_OS, BACKEND_PLAN, PWA_PLAN, HELP_PLAN, TEST_REPORT, DEPLOYMENT, DELIVERY_FACTS</li>
    <li>Design baselines in design/screenshots/</li>
    <li>Hosted Supabase project (Fit-Ai) with migrations applied—configure keys in Vercel</li>
    <li>This handover HTML</li>
  </ul>
  <h3 style="margin-top:32px">Run locally</h3>
  <pre><button type="button" class="copy-btn" data-copy>Copy</button><code>npm install
cp .env.example .env.local   # fill from npx supabase status
npx supabase start
npx supabase db reset
npm run db:apply-demo        # local demo only
npm run db:types
npm run dev</code></pre>
  <h3>Deploy</h3>
  <p class="muted">Push migrations with npx supabase db push --linked; set env vars on Vercel; see docs/DEPLOYMENT.md.</p>
  <h3>Required accounts and keys (names only)</h3>
  <pre><button type="button" class="copy-btn" data-copy>Copy</button><code>GITHUB_TOKEN / repo access
VERCEL account + project
SUPABASE project (URL + anon + service role)
GOOGLE_GEMINI_API_KEY (future — not wired in MVP)</code></pre>
  <h3>Environment variables</h3>
  <pre><button type="button" class="copy-btn" data-copy>Copy</button><code>NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION
NEXT_PUBLIC_TODAY</code></pre>
  <p class="muted">Static hosting for this file: npx surge docs/delivery/FitAI-Delivery-and-Future-Scope.html --domain your-name.surge.sh</p>
</section>

<section id="demo-script" class="reveal">
  <p class="eyebrow">Demo script</p>
  <h2>Three to five minute live tour</h2>
  <div class="card">
    <p><strong>0:00 · Introduction</strong> — “FitAI is a member app that turns your own workout and meal logs into a daily plan and a coach that cites your numbers. This is the MVP we shipped for the hackathon.”</p>
    <p><strong>0:30 · Problem</strong> — “Members juggle planners, macros, and generic tips. Trainers and gyms cannot see consistent data. We focused Phase 1 on the member.”</p>
    <p><strong>1:00 · Solution</strong> — “Sign up, five-step onboarding, then one dashboard for today’s workout, rings, and Nova.”</p>
    <p><strong>1:30 · Screen tour</strong> — Follow click path below.</p>
    <p><strong>4:00 · Conclusion</strong> — “MVP is test-green and deploy-ready on Supabase and Vercel. Nova is simulated today; Gemini and trainer tools are on the roadmap.”</p>
  </div>
  <h3 style="margin-top:24px">Click path</h3>
  <ol style="color:var(--text-soft);padding-left:20px">
    <li>/login → demo alex@fitai.app (or sign up) → dashboard</li>
    <li>Dashboard → Start workout → details → active → complete one set → finish (optional short path)</li>
    <li>Dashboard → Nutrition → add food → return</li>
    <li>Coach → tap “Analyze my progress” → read Nova reply</li>
    <li>Progress → log weight → Profile → show install app / feedback</li>
    <li>Ctrl+K → “help” → Help center</li>
  </ol>
</section>

<section id="limitations" class="reveal">
  <p class="eyebrow">Honest limits</p>
  <h2>Known limitations and risks</h2>
  <ul style="color:var(--text-soft);padding-left:20px">
    <li><strong>Nova is simulated</strong> — keyword engine, not Gemini; mitigated by clear UI and Phase 5 backlog.</li>
    <li><strong>No push notifications</strong> — by design in PWA plan; mitigated with in-app reminders toggles for future server push.</li>
    <li><strong>Demo seed fragility</strong> — local-only; catalog duplicate on db reset; mitigated by db:check-catalog-seed and apply-demo.sh guards.</li>
    <li><strong>Help privacy copy</strong> — partially outdated vs Supabase; mitigated by content pass on help.ts.</li>
    <li><strong>Live URL not in repo</strong> — set Vercel production URL before investor demos.</li>
  </ul>
</section>

<section id="roadmap" class="reveal">
  <p class="eyebrow">Future scope</p>
  <h2>Roadmap phases 2–6</h2>
  <div class="roadmap-tabs" role="tablist">
    <button type="button" class="active" data-phase="p2">Phase 2 · Trainer</button>
    <button type="button" data-phase="p3">Phase 3 · Gym admin</button>
    <button type="button" data-phase="p4">Phase 4 · Smart gym</button>
    <button type="button" data-phase="p5">Phase 5 · AI + integrations</button>
    <button type="button" data-phase="p6">Phase 6 · Marketplace</button>
    <button type="button" data-phase="backlog">Near-term backlog</button>
  </div>
  <div id="p2" class="roadmap-panel active card"><h3>Trainer platform</h3><p class="muted">Goals: roster management, assign plans, view client logs. Features: trainer dashboard, client compliance, messaging. Depends on MVP + RBAC. Effort: M. Value: high for PT businesses.</p></div>
  <div id="p3" class="roadmap-panel card"><h3>Gym owner and admin</h3><p class="muted">Goals: engagement analytics, staff roles, branded experience. Depends on Phase 2. Effort: M–L. Value: churn reduction.</p></div>
  <div id="p4" class="roadmap-panel card"><h3>Smart gym</h3><p class="muted">Goals: equipment and check-in data tied to profiles. Depends on hardware partners. Effort: L. Value: premium differentiation.</p></div>
  <div id="p5" class="roadmap-panel card"><h3>Advanced AI and integrations</h3><p class="muted">Goals: Gemini via server routes, weekly AI reports, wearables, push reminders. Depends on secrets + rate limits. Effort: M–L. Value: core moat.</p></div>
  <div id="p6" class="roadmap-panel card"><h3>Marketplace</h3><p class="muted">Goals: sell programs and trainer services in-app. Depends on payments + moderation. Effort: L. Value: new revenue.</p></div>
  <div id="backlog" class="roadmap-panel card"><h3>Near-term backlog</h3><ul class="muted"><li>Real AI coach (Gemini via server)</li><li>Push reminders</li><li>Weekly AI reports</li><li>Offline sync improvements</li><li>Accessibility and performance hardening</li><li>Analytics and feedback loop (server ingest)</li></ul></div>
  <h3 style="margin-top:32px">Prioritization (impact vs effort)</h3>
  <div class="matrix" role="img" aria-label="Impact versus effort matrix">
    <div class="head"></div><div class="head">Low effort</div><div class="head">High effort</div>
    <div class="head">High impact</div><div>Gemini coach, push reminders, feedback API</div><div>Trainer platform, smart gym</div>
    <div class="head">Lower impact</div><div>Help copy sync, catalog seed fix</div><div>Marketplace</div>
  </div>
</section>

<section id="next" class="reveal">
  <p class="eyebrow">Next steps</p>
  <h2>Decisions and 30 / 60 / 90 days</h2>
  <p><strong>Decisions needed:</strong> Confirm Vercel production URL; approve Gemini budget and data policy; prioritize Phase 2 vs Phase 5 AI.</p>
  <ul style="color:var(--text-soft);padding-left:20px">
    <li><strong>30 days:</strong> Wire Gemini server route behind feature flag; server-side feedback ingest; fix catalog seed duplication on db reset.</li>
    <li><strong>60 days:</strong> Push notification provider; weekly email/AI summary; integration test suite in CI.</li>
    <li><strong>90 days:</strong> Trainer MVP discovery; wearable import spike; marketplace feasibility study.</li>
  </ul>
  <p class="muted">Support: run CI on main; rotate Supabase keys via dashboard; never run seed-demo on production.</p>
</section>

<section id="appendix" class="reveal">
  <p class="eyebrow">Appendix</p>
  <h2>Glossary, FAQ, credits</h2>
  <button type="button" class="acc-btn" aria-expanded="false">Glossary (from help center)<span>+</span></button>
  <div class="acc-panel"><p><strong>Progressive overload</strong> — Gradually increase weight, reps, or volume over time.</p><p><strong>BMR and TDEE</strong> — Basal metabolic rate and total daily energy expenditure; FitAI uses Mifflin–St Jeor.</p><p><strong>Hypertrophy</strong> — Muscle growth from training, protein, and rest.</p><p><strong>RIR</strong> — Reps in reserve before technical failure.</p></div>
  <button type="button" class="acc-btn" aria-expanded="false">FAQ<span>+</span></button>
  <div class="acc-panel"><p><strong>When should I weigh myself?</strong> First thing in the morning, before eating; track the 30-day trend.</p><p><strong>Missed a workout?</strong> Continue with the next scheduled day; consistency over months matters.</p><p><strong>Food logging accuracy?</strong> Within ~10% of targets is enough; log main protein and calorie sources.</p></div>
  <button type="button" class="acc-btn" aria-expanded="false">Credits<span>+</span></button>
  <div class="acc-panel"><p>Design and Brand OS: FitAI team. Engineering: Next.js, Supabase, Playwright, Vitest. Fonts: Sora and DM Sans via Google Fonts.</p></div>
  <button type="button" class="acc-btn" aria-expanded="false">Changelog<span>+</span></button>
  <div class="acc-panel"><p>2026-10-29 — Delivery and future scope handover HTML v1.0.</p><p>2026-10-29 — Supabase backend, PWA, help system, full test suites (see git history).</p></div>
</section>

</main>
</div>
<button type="button" class="fab" id="topBtn" aria-label="Back to top">↑</button>
<script>
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = document.querySelectorAll('section.reveal');
  if(!reduced && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((e,i)=>{ if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'), i*40); io.unobserve(e.target);} });
    },{threshold:0.08});
    sections.forEach(s=>io.observe(s));
  } else sections.forEach(s=>s.classList.add('visible'));

  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = +el.dataset.count;
    if(reduced){ el.textContent = target; return; }
    let n=0; const step = Math.max(1, Math.floor(target/40));
    const t = setInterval(()=>{ n+=step; if(n>=target){ n=target; clearInterval(t);} el.textContent=n; }, 30);
  });

  const navLinks = document.querySelectorAll('nav.toc a');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id)); }});
  },{rootMargin:'-40% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(s=>obs.observe(s));

  document.querySelectorAll('.filters button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('#mvpTable tbody tr').forEach(tr=>{
        tr.hidden = f!=='all' && tr.dataset.status!==f;
      });
    });
  });

  document.querySelectorAll('.roadmap-tabs button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.roadmap-tabs button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.roadmap-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.phase).classList.add('active');
    });
  });

  document.querySelectorAll('.acc-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const panel = btn.nextElementSibling;
      const open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.querySelector('span').textContent = open ? '−' : '+';
    });
  });

  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const code = btn.parentElement.querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(()=>{ btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy',1500); });
    });
  });

  document.getElementById('printBtn').onclick = ()=>window.print();
  document.getElementById('topBtn').onclick = ()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
})();
</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
const mb = (fs.statSync(OUT).size / (1024*1024)).toFixed(2);
console.log('Wrote', OUT, mb, 'MB');
