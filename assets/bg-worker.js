// Background remover: WASM fallback in its own worker, so a failed WebGPU run on the page can't break it.
let T = null, seg = null;
self.onmessage = async (e) => {
  const { id, src, models } = e.data;
  try {
    if (!T) {
      T = await import('/vendor/transformers-4.3.1.min.js');
      T.env.backends.onnx.wasm.wasmPaths = '/vendor/ort/';
      if (models) { T.env.allowRemoteModels = false; T.env.allowLocalModels = true; T.env.localModelPath = models; }
    }
    if (!seg) seg = await T.pipeline('background-removal', 'Xenova/modnet', { device: 'wasm', dtype: 'fp32',
      progress_callback: (p) => { if (p.status === 'progress' && p.total) self.postMessage({ id, progress: { file: p.file, loaded: p.loaded, total: p.total } }); } });
    self.postMessage({ id, stage: 'run' });
    let r = await seg(src); r = Array.isArray(r) ? r[0] : r; r = r.rgba ? r.rgba() : r;
    const data = new Uint8ClampedArray(r.data.buffer.slice(r.data.byteOffset, r.data.byteOffset + r.data.byteLength));
    self.postMessage({ id, done: { width: r.width, height: r.height, data } }, [data.buffer]);
  } catch (err) { seg = null; self.postMessage({ id, error: String(err && err.message || err) }); }
};
