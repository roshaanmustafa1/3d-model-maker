# Phase 3 performance and resource observations

Release decision: **FAIL** for functionality; these measurements are limited software-renderer observations.

## Environment

Windows, Node 24.21.0, installed Edge, 1440×1000. Browser launch explicitly requests ANGLE SwiftShader. Actual WebGL trace identifies `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`. CPU is Intel Xeon E5-2687W v2, approximately 24 GiB system RAM. See [execution metadata](phase3/raw/existing-execution.json) and [pointer telemetry](phase3/raw/pointer-drag.json).

Some independent suites overlapped; timings include host contention, development-server overhead and QA readback instrumentation. They are not hardware GPU benchmarks or production performance budgets.

## Actual exported texture output

| Resolution | UI export workflow elapsed | GLB bytes |
|---|---:|---:|
| 1024² | 11,534 ms | 61,232 |
| 2048² | 14,983 ms | 147,800 |
| 4096² | 25,488 ms | 441,152 |

Each PNG's real dimensions and decoded pixels were inspected, not inferred from settings. Elapsed time includes UI click, baking, verified GLB generation, download capture and closing the dialog; **it is not isolated bake duration**. [Raw exports](phase3/raw/exports.json), [binary/pixel audit](phase3/raw/binary-audit.json).

## Repeated replacement samples

| Cycle | Product | Renderer geometries | Textures | JS heap bytes | rAF callbacks/sec |
|---|---|---:|---:|---:|---:|
| 1 | Tee | 24 | 7 | 52,844,478 | 3.41 |
| 2 | Hoodie | 25 | 8 | 46,125,216 | 3.09 |
| 3 | Bottle | 23 | 9 | 66,403,361 | 3.64 |
| 4 | Box | 21 | 10 | 65,185,595 | 4.00 |
| 5 | Tee | 24 | 10 | 98,027,614 | 4.90 |
| 6 | Bottle | 23 | 12 | 70,665,976 | 5.54 |

These are loaded-scene samples after real selection, artwork and camera-button interactions, not empty-scene cleanup counts. Geometries return to the same count for repeated product types. Textures increase; heap fluctuates. This run neither establishes a memory leak nor certifies bounded long-term texture use. Earlier partial samples stopped at ten textures; the completed sixth sample reaches twelve.

The Phase 2.5 original cleanup regression independently passes. Its empty-scene result is a different workload from Phase 3 artwork replacement. [All samples](phase3/raw/catalog-cycles.json).

## Live interaction

Actual pointer dragging changes saved coordinates from `(350,350)` to `(432,391)`, and empty-canvas clicking deselects. The settled pointer→texture test passes. The readiness-aware repetition retains before/after texture hashes, renderer counters and measured workflow duration in [pointer evidence](phase3/raw/pointer-drag.json). This duration includes drag steps, IndexedDB save, texture polling, scene readbacks and deselection; it is not isolated pointer latency. Renderer counter rate and browser rAF throughput measure different things; neither should be relabeled as guaranteed display FPS.

The initial pointer capture preceded texture readiness; a follow-up explicitly waits for the mesh map. Similarly, persistence required waiting for the selected color's actual texture pixels before taking a stable comparison. Fixed waits and the 60 ms debounce do not prove 60 FPS.

## Source risks and remaining measurements

Live baking depends on `materials` and calls `updateMaterial` on every material, which changes that dependency again. It PNG-encodes and reloads a texture instead of directly assigning the composer's CanvasTexture. Composer disposal is absent from the view's lifecycle, and the global decoded-image cache is not bounded. These are source risks, not measured long-term leaks.

Isolated bake-only duration, isolated import duration, percentile interaction latency, complete load→artwork→export→remove stress cycles, GPU allocation after complete Phase 3 teardown, long-duration heap behavior, and hardware-accelerated FPS remain unverified. No performance claim is derived from debounce configuration.
