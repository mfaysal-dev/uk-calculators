# mf-free-tools static v1: 102 tools at https://mfaysal.com/free-tools/<slug>/

All tools are plain static files in `public/free-tools/`. Apache/LiteSpeed serves real files and folders before the PHP router (`public/.htaccess` uses `!-f`/`!-d`), so no PHP, route or database changes are needed. The hub is `/free-tools/` (search plus category filter), the sitemap is `/free-tools/sitemap.xml`, and every canonical URL and internal link uses mfaysal.com/free-tools/. Nothing links to vercel.app.

## Upload (cPanel File Manager → home folder ~)
- mf-free-tools-v1-core.tar.gz: pages, CSS/JS, OG images and scripts
- mf-free-tools-v1-vendor.tar.gz: Transformers.js + ONNX Runtime WebAssembly (the AI engine)
- mf-free-tools-v1-models.tar.gz.part-00, part-01: MODNet (Apache-2.0) and BiRefNet-lite (MIT) models, split to stay under upload limits

## Deploy (cPanel Terminal)
    cd ~ && tar xzf mf-free-tools-v1-core.tar.gz && cd mf-free-tools && bash deploy.sh --dry-run && bash deploy.sh

deploy.sh:
1. Stages everything in public/free-tools.new-*, verifies SHA-256 checksums of all files, then swaps the folder in.
2. Moves any old free-tools folder to free-tools.bak-20261015fs.
3. Adds the sitemap line to public/robots.txt (backed up), if robots.txt is a real file.
4. Smoke-tests the pages, the AI files, a 404 check, CSP/Permissions-Policy headers and the main site. It rolls back automatically on failure.

Options: `SKIP_AI=1` (deploys without the AI files; the background remover won't work), `RELINK=1` (also rewrites uk-calculators.vercel.app links in app/views/*.php to /free-tools/, with backups), `ROBOTS=0`, `SMOKE=0`.
Rollback: `bash ~/mf-free-tools/restore.sh`

## Headers (free-tools/.htaccess, applies only under /free-tools/)
- CSP: same-origin only, plus Google Fonts. Adds `'wasm-unsafe-eval'` (WebAssembly AI) and `worker-src 'self' blob:`. There are no inline scripts; JSON-LD is data, not executed.
- Permissions-Policy: `camera=(self), microphone=(self), display-capture=(self)`, because the site default `camera=(), microphone=()` would block the mic, webcam and recorder tools. The browser still asks the user.
- Long cache for .wasm/.mjs/.onnx; 10 minutes for HTML.

## Updating later
In the uk-calculators repo, run `bash mf/package.sh`, re-upload the core tarball and re-run deploy.sh. The vendor and models tarballs only change when the AI engine changes.
