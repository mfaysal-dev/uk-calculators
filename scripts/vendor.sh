#!/usr/bin/env bash
# Fetches the third-party runtime files for the background remover into static/vendor (not committed to git).
# Transformers.js (Apache-2.0) and ONNX Runtime Web (MIT), pinned versions.
set -euo pipefail; cd "$(dirname "$0")/.."; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
( cd "$T" && npm pack --silent @huggingface/transformers@4.3.1 onnxruntime-web@1.31.0-dev.20260914-8d85527a0 >/dev/null && for f in *.tgz; do mkdir -p "${f%.tgz}" && tar -xzf "$f" -C "${f%.tgz}"; done )
mkdir -p static/vendor/ort
cp "$T"/huggingface-transformers-*/package/dist/transformers.min.js static/vendor/transformers-4.3.1.min.js
cp "$T"/huggingface-transformers-*/package/LICENSE static/vendor/TRANSFORMERS-LICENSE.txt
for x in asyncify jsep; do cp "$T"/onnxruntime-web-*/package/dist/ort-wasm-simd-threaded.$x.{mjs,wasm} static/vendor/ort/; done
cp "$T"/onnxruntime-web-*/package/LICENSE static/vendor/ort/LICENSE.txt 2>/dev/null || true
echo "vendor files ready"
