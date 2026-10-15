// Export the site as static files for https://mfaysal.com/free-tools/ (CSP-safe: no inline JS).
// Usage: node mf/export.js <outDir>   -> <outDir>/free-tools/...
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), OUT = path.resolve(process.argv[2] || '/workspace/mf-free-tools-static'), P = '/free-tools';
const SITE = 'https://mfaysal.com', BASE = SITE + P;
cp.execSync('node build.js', { cwd: ROOT, env: { ...process.env, BASE }, stdio: 'ignore' });
const PUB = path.join(ROOT, 'public'), DEST = path.join(OUT, 'free-tools');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(DEST, { recursive: true });
cp.execSync(`cp -a "${PUB}/." "${DEST}/"`);
for (const f of ['0858f933d88844ea9bdfc0115659d50e.txt', 'robots.txt']) fs.rmSync(path.join(DEST, f), { force: true });
for (const f of fs.readdirSync(path.join(__dirname, 'assets'))) fs.copyFileSync(path.join(__dirname, 'assets', f), path.join(DEST, 'assets', f));
const TOP = fs.readdirSync(PUB).filter(n => !/\.txt$/.test(n)).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const reTop = new RegExp(`(["'(=,\\s])\\/(${TOP.join('|')})(?=[\\/"'?#)\\s,]|$)`, 'g');
const fix = s => s.replace(/https:\/\/uk-calculators\.vercel\.app/g, BASE)
  .replace(reTop, `$1${P}/$2`)
  .replace(/(href|action)="\/(#[^"]*)?"/g, (m, a, h) => `${a}="${P}/${h || ''}"`);
const NAV = [['/about', 'About'], ['/skills', 'Skills'], ['/projects', 'Projects'], ['/blog', 'Blog'], [P + '/', 'Free tools'], ['/contact', 'Contact']];
const topbar = cur => `<div class="mfx-bar"><div class="wrap mfx-in"><a class="mfx-brand" href="/" aria-label="MFAYSAL.DEV home"><span class="mfx-mark" aria-hidden="true">&lt;/&gt;</span>MFAYSAL<span>.DEV</span></a><nav class="mfx-links" aria-label="Site">${NAV.map(([h, l]) => `<a href="${h}"${h === P + '/' ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav><button class="mfx-theme" type="button" data-mf-theme aria-label="Toggle light or dark mode">◐</button></div></div>`;
const footer = `<footer class="mfx-foot"><div class="wrap"><p><strong>MFAYSAL.DEV</strong> · Free tools by <a href="/about">Mahir Faysal</a>. Everything runs in your browser; nothing you enter is uploaded.</p><p><a href="/">Home</a> · <a href="/about">About</a> · <a href="/projects">Projects</a> · <a href="/blog">Blog</a> · <a href="${P}/">All free tools</a> · <a href="/contact">Contact</a> · <a href="${P}/sitemap.xml">Sitemap</a></p><p class="hint">UK calculators use official GOV.UK rates and are estimates only, not financial, tax or legal advice.</p></div></footer>`;
const ihash = {}; fs.mkdirSync(path.join(DEST, 'assets', 'i'), { recursive: true });
const extern = code => { const h = crypto.createHash('sha256').update(code).digest('hex').slice(0, 12); if (!ihash[h]) { fs.writeFileSync(path.join(DEST, 'assets', 'i', h + '.js'), code); ihash[h] = 1; } return `<script src="${P}/assets/i/${h}.js"></script>`; };
let pages = 0;
(function walk(d) { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); const st = fs.statSync(f);
  if (st.isDirectory()) { if (!/vendor|models|og|img$/.test(f)) walk(f); continue; }
  if (/\.(js|css|xml|json)$/.test(n) && !/vendor/.test(f)) fs.writeFileSync(f, fix(fs.readFileSync(f, 'utf8')));
  if (!/\.html$/.test(n)) continue;
  let s = fix(fs.readFileSync(f, 'utf8'));
  s = s.replace(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/g, (m, a, code) => extern(code));
  s = s.replace('</head>', `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"><link rel="stylesheet" href="${P}/assets/mf-theme.css"><script src="${P}/assets/mf-theme.js"></script><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml"></head>`);
  s = s.replace(/<body([^>]*)>/, (m, a) => `<body${a}>${topbar()}`);
  s = s.replace(/<footer>[\s\S]*?<\/footer>/, footer);
  s = s.replace(/<nav class="nav" aria-label="Main"><a href="\/free-tools\/">[^<]*<\/a>/, `<nav class="nav" aria-label="Tools"><a href="${P}/">🧰 Free tools</a>`);
  if (/vercel\.app/.test(s)) throw new Error('vercel link left in ' + f);
  fs.writeFileSync(f, s); pages++; } })(DEST);
// hub page wording
const hub = path.join(DEST, 'index.html'); let h = fs.readFileSync(hub, 'utf8');
h = h.replace(/<title>[^<]*<\/title>/, '<title>Free Online Tools – 102 Calculators, Converters, Image &amp; Audio Tools | MFAYSAL.DEV</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="102 free browser tools by Mahir Faysal: AI background remover, UK tax and pay calculators, unit converters, text, image, audio, video and developer tools. No signup, private, nothing uploaded.">')
  .replace('<h1>Free UK Calculators</h1>', '<h1>Free online tools</h1>').replace(/<p>Quick, private and free[^<]*<\/p>/, '<p>102 free tools that run in your browser: an AI background remover, UK tax and pay calculators, unit converters, and text, image, audio, video and developer tools. No signup, and your files never leave your device.</p>');
fs.writeFileSync(hub, h);
// models + licences
cp.execSync(`mkdir -p "${DEST}/models" && cp -a /workspace/mf-models/. "${DEST}/models/"`);
fs.copyFileSync(path.join(__dirname, "htaccess"), path.join(DEST, ".htaccess"));
// leftover root-relative refs check
const bad = cp.execSync(`grep -rEho "(href|src)=\\"/[a-z][^\\"]*\\"" "${DEST}" --include=*.html | grep -vE "\\"/(free-tools/|about|skills|projects|blog|contact|favicon)" | sort -u | head`).toString();
if (bad.trim()) console.log('WARN root links:\n' + bad);
console.log('pages', pages, 'inline scripts ->', Object.keys(ihash).length, 'files; out', DEST);
