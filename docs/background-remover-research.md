# AI Background Remover — Engineering Research

## Status

Implemented in `apps/web/src/app/tools/background-remover/` with a fully
client-side pipeline. This document captures the research that drove the
implementation, the decisions taken, and the open follow-ups.

## Goal

Give users a one-click "remove background" tool that runs entirely in the
browser (privacy-first), supports a fast and a high-quality model, and lets
users fine-tune the cut-out (feather, halo removal, de-fringing) before
downloading PNG/WebP with a transparent or solid background.

## Candidates evaluated

| Engine | License | Runtime | Verdict |
| --- | --- | --- | --- |
| rembg ONNX models (u2netp, isnet) | MIT | onnxruntime-web (WASM) | **Selected** |
| BiRefNet | AGPL-3.0 | onnxruntime-web | Rejected — AGPL for a free tool page, heavy 1024 input memory |
| `@imgly/background-removal` | AGPL-3.0 | WASM bundle | Rejected — license, large bundle, less control |

### Why rembg models in-browser

- Models are MIT-licensed and widely deployed (production-proven).
- `u2netp` (320×320 input, ~4.5 MB) is fast enough for real-time-ish use on
  mid-range devices.
- `isnet-general-use` (1024×1024 input, ~170 MB) gives the sharpest edges on
  hair/fur/complex subjects.
- ONNX gives a stable interchange format that onnxruntime-web can run via
  WebAssembly without any native install.

### Why not BiRefNet / @imgly

- Both are AGPL-3.0. Deploying AGPL code behind a public SaaS requires open
  sourcing the service; not acceptable for this project.
- BiRefNet at 1024 input competes with isnet for memory but with a worse
  licensing story.
- @imgly bundles a WASM runtime that is less transparent about download size
  and versioning than raw ONNX + onnxruntime-web.

## Model download strategy

- `u2netp.onnx` (~4.5 MB) ships in `public/models/` and is committed — the
  fast path works offline/out-of-the-box.
- `isnet-general-use.onnx` (~170 MB) is **not** committed. The library falls
  back to the upstream GitHub release
  (`https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx`)
  and caches the downloaded buffer in the Cache Storage API.
- Local attempts to pre-download isnet on this machine were abandoned:
  the GitHub redirect hop stalls, signed CDN URLs expire mid-download, and
  mirror hosts return 404/401. The on-demand browser download with progress
  reporting is the reliable path.
- A 0-byte placeholder for `isnet` is harmful (the fetch succeeds with an
  empty body and poisons the cache), so the file is simply absent; a missing
  local file 404s and the loader falls through to `remoteUrl`.

## Architecture

- `config.ts` — model registry (id, input size, mean/std normalization,
  local source, remote fallback, size hint).
- `cache.ts` — Cache Storage wrapper + `fetchWithProgress` (streaming read,
  progress callback, `Blob` assembly).
- `engine.ts` — onnxruntime-web session creation and single-image inference
  with normalized NCHW input.
- `worker.ts` — Web Worker wrapper so model download + inference do not block
  the main thread.
- `pipeline.ts` — pure functions: letterboxing, resize (bilinear), RGBA→NCHW
  normalization, min/max mask normalization, bilinear mask crop,
  mask→alpha, feather, erode (halo), color defringe, and final RGBA apply.
- `index.ts` — public API (`removeBackground`), worker protocol, progress
  aggregation.

### UI

- `apps/web/src/app/tools/background-remover/page.tsx` — drag & drop, model
  cards (fast/quality), sliders (feather/halo/defringe, 0–8 step 0.5),
  transparent/solid background toggle with color picker, checkerboard
  preview, PNG/WebP download, and a progress bar that distinguishes
  model download from inference. Inputs are capped at 5000px with
  high-quality downscale; re-runs debounce at 350 ms.
- The fast model runs by default; quality model explains its one-time
  ~170 MB download in the UI copy.
- i18n is complete for en/ar/fr/es/pt (see `dictionary.ts` + the five
  dictionaries). The FAQ and long description stay in English, matching the
  existing convention used by `thumbnail-maker`.

## Testing

- `apps/web/src/__tests__/background-remover.test.ts` — 22 unit tests over
  the pure pipeline functions (letterbox, resize, NCHW transform, min/max
  normalization, mask crop, alpha, feather, erode, defringe, apply).
- Tests caught a real bug: `cropMaskBilinear` used the crop rect width as the
  row stride instead of the full mask width; the signature now takes the mask
  width explicitly.
- Suite status: 11 files / 138 tests passing; typecheck and lint clean;
  `next build` succeeds with the page statically generated
  (`○ /tools/background-remover`).

### Browser end-to-end (verified via Chrome CDP)

Two real bugs were found and fixed during headless E2E:

1. **Worker responses dropped the request id.** `worker.ts` replied
   `{type:'ready'}` / `{type:'result'}` / `{type:'error'}` without echoing the
   `id` the main thread sent, while `WorkerBridge.onmessage` in `index.ts`
   ignores any message without a numeric `id`. The `init` promise therefore
   never resolved and the UI stalled at the first progress tick. Fix: echo
   `msg.id` in every worker reply. (Blob-created test workers are unreliable
   in this CDP environment; real-URL workers match the app path and reproduce
   the bug cleanly.)
2. **WebGPU EP cannot run u2netp.** `InferenceSession.create` succeeds with
   `executionProviders:['webgpu']`, but `session.run` throws
   `using ceil() in shape computation is not yet supported for MaxPool`
   (u2netp contains `MaxPool` ops with `ceil_mode=1` and dynamic spatial
   dims). The WASM EP runs the same graph successfully. Fix: `detectEpList`
   now returns `["wasm"]` only. Verified with a worker-level combo test:
   webgpu/all fails, wasm/all succeeds (320×320 input → 102400-float mask).

Verified flow: model download with progress (0→1), session creation
(`ep: "wasm"`), inference, post-processing, and a rendered result image with
the "Ready" badge. Alpha-channel inspection on a synthetic "person" image:
77% of pixels fully transparent (background removed), head and body retained
with their exact RGB colors, soft anti-aliased edges (≈5% semi-transparent).

## Deployment notes (Vercel)

- `public/ort/` (onnxruntime-web WASM) and `public/models/u2netp.onnx` are
  served as static assets — no serverless compute needed.
- isnet downloads from the GitHub release directly in the browser; the
  release URL must stay up (it is pinned to the rembg `v0.0.0` asset).
- Browsers with Cache Storage will retain the model between sessions.

## Follow-ups

- Pre-warm / prefetch the isnet download on the settings/high-quality card
  hover so the one-time cost is less visible.
- Add memory guards for very large source images (JSEP/WASM thread limits).
- Reconsider a self-hosted CDN mirror for isnet if GitHub release download
  rate becomes a bottleneck.
- Measure inference times across devices and surface a rough ETA in the UI.
