#!/usr/bin/env bash
# Step 2 (ONLY after https://mfaysal.com/free-tools/ is verified live): 301 every uk-calculators.vercel.app URL to mfaysal.com.
# Undo: git checkout vercel.json && vercel deploy --prod --yes
set -euo pipefail; cd "$(dirname "$0")/.."
for u in /free-tools/ /free-tools/background-remover/ /free-tools/vendor/transformers-4.3.1.min.js /free-tools/models/Xenova/modnet/config.json; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "https://mfaysal.com$u"); echo "$u $c"; [ "$c" = 200 ] || { echo "mfaysal.com not ready; aborting"; exit 1; }; done
cp mf/vercel.redirect.json vercel.json && vercel deploy --prod --yes
curl -sI https://uk-calculators.vercel.app/tip-calculator/ | grep -iE '^(HTTP|location)'
