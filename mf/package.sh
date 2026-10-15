#!/usr/bin/env bash
# Build the cPanel packages into /workspace/mf-free-tools-pkg
set -euo pipefail; cd "$(dirname "$0")/.."
S=/workspace/mf-free-tools-static; O=/workspace/mf-free-tools-pkg; P=$O/mf-free-tools
node mf/export.js $S
rm -rf $O; mkdir -p $P
(cd $S/free-tools && find . -type f ! -name '.htaccess' -print0 | sort -z | xargs -0 sha256sum > $P/SHA256SUMS; sha256sum ./.htaccess >> $P/SHA256SUMS)
(cd $S && tar cf - --exclude=free-tools/vendor --exclude=free-tools/models free-tools) | tar xf - -C $P
cp mf/deploy.sh mf/restore.sh mf/README.md $P/
(cd $O && tar czf mf-free-tools-v1-core.tar.gz mf-free-tools)
(cd $S/free-tools && tar czf $O/mf-free-tools-v1-vendor.tar.gz vendor && tar cz models | split -b 80M -d -a 2 - $O/mf-free-tools-v1-models.tar.gz.part-)
rm -rf $P; (cd $O && sha256sum mf-free-tools-v1-* > UPLOAD-SHA256SUMS.txt); ls -la $O
