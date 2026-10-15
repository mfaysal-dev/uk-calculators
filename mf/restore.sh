#!/usr/bin/env bash
# Roll back mf-free-tools static v1 using manifest-20261015fs.txt.
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TAG="bak-20261015fs"; MAN="$PKG/manifest-20261015fs.txt"
[ -f "$MAN" ] || { echo "No manifest; nothing to restore."; exit 0; }
while read -r kind p; do case "$kind" in
  BAK) [ -e "$p.$TAG" ] && cp -p "$p.$TAG" "$p" && echo "restored $p";;
  NEWDIR) [ -d "$p" ] && rm -rf "$p.removed-$TAG" && mv "$p" "$p.removed-$TAG" && echo "moved new $p aside -> $p.removed-$TAG (delete it when happy)";;
  DIR) live="${p%.$TAG}"; [ -d "$p" ] && { rm -rf "$live.removed-$TAG"; [ -d "$live" ] && mv "$live" "$live.removed-$TAG"; mv "$p" "$live" && echo "restored previous $live"; };;
esac; done < <(tac "$MAN")
mv "$MAN" "$MAN.restored-$(date +%s)"; echo "Rollback done."
