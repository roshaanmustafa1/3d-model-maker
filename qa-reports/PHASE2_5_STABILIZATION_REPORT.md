# Phase 2.5 stabilization report

Date: October 24, 2026. Existing Model Maker and BlackBullet implementations were updated in place. Original production GLBs were retained.

## Decision

**PASS for the requested application stabilization; CONDITIONAL readiness for Phase 3.** The confirmed application regressions pass, including genuine browser-process persistence and both BlackBullet modes. The original subdivision garment remains unsuitable for UV artwork without a separate asset-authoring task. Hardware GPU performance is not certified by these software-rendered checks.

## Actual results

| Suite | Before pass / fail / skip | After pass / fail / skip |
|---|---|---|
| Existing Node tests | 30 / 0 / 0 | 30 / 0 / 0 |
| Independent engine tests | 17 / 15 / 3 | 38 / 0 / 3 |
| Browser tests | 17 / 2 / 0 | 24 / 0 / 0 |
| Total | 64 / 17 / 3 | **92 / 0 / 3** |

Six engine tests and five browser tests were added. Reruns are not added to totals. The three skips remain unsupported join, bevel, and material duplication actions; they are not passes.

- Model Maker TypeScript: exit 0. Production build: exit 0.
- BlackBullet `npm run build` (`vue-tsc -b && vite build`): exit 0; Vite reports chunks larger than 500 kB.
- Complete browser suite: 24 passed, no retries, 406.8 seconds. A subsequent persistence-only run passed after relocating browser profiles to system temp.
- Existing local development servers on ports 3000 and 5173 were reused. User servers were not stopped.

Evidence: [original QA](PHASE2_QA_REPORT.md), [reproduced baseline engine failures](phase2_5/before/engine.log), [final engine results](phase2_5/final/engine.log), [existing regressions](phase2_5/final/existing.log), [browser results](phase2_5/final-browser/browser-results.json), [browser log](phase2_5/final-browser/browser.log), [TypeScript](phase2_5/final/typecheck-execution.json), [Model Maker build](phase2_5/final/build-execution.json), [BlackBullet build](phase2_5/blackbullet-build.log).

## Root causes and fixes

| Defect | Root cause | Implemented fix and verification |
|---|---|---|
| QA-01 persistence | Documents retained process-local geometry/material keys | Version 2 document plus embedded asset bundle in IndexedDB; atomic document/assets writes and replacement. Serializes hierarchy, IDs, transforms, geometry attributes/index/groups, materials, textures, zone metadata, and project/environment data. Preserves precise linear colors separately from Three JSON hex quantization. Hydration validates geometry/material/texture/image references before installing the scene. Missing assets produce errors. LocalStorage contains metadata only. |
| QA-02/03/05 history | Graph and node/renderer geometry diverged; some redo callbacks mutated current state | Central geometry transactions snapshot actual buffers, graph, geometry definition/statistics, material slots, and topology selection. Actual buffers are compared through extrude, inset, subdivide, merge, weld, deletion, flip, UV projection/transforms, and material assignment undo/redo; a multi-operation sequence is also checked. |
| QA-04 groups/export | Primitive group indices 0–5 were interpreted as six assigned slots | Resolve groups against actual slots; single-material faces resolve to slot 0. Preserve valid imported multi-material groups. Validate export material references, assign/remove slots atomically, and retain undo/redo. Existing round-trip tests check distinct face colors. |
| QA-06 normals | Winding flipped while corner shading normals retained their old direction | Negate existing corner normals with winding changes, preserving hard-edge values. Geometry and GLB regressions pass. |
| QA-09 selection | Actions updated only primary or collection selection | Shared selection action filters live IDs and synchronizes primary, collection, topology selection, and selected statistics. Create, duplicate, delete, import, mesh separation and history paths use it. Node and actual Shift-click browser regressions pass. |
| QA-07 BlackBullet | Catalog runtime material replacement applied to imported PBR appearance | Explicit imported/runtime modes with separate owned material instances, mode-gated color/canvas synchronization, and backward-compatible catalog defaults. Real customizer checks pass. |
| Resource lifecycle | TransformControls primitives were detached without disposal; cached geometry/history ownership was unclear | Dispose detached controls and owned viewport geometry; retain resources referenced by live nodes/history and prune obsolete scene resources. Repeated real cycles now remain bounded. |

The durable browser test imports a textured GLB, extrudes faces, changes UV projection and material color, saves, closes the browser context/process, launches the same persistent profile again, opens the saved project, and compares actual attributes, indices, groups, transforms, PBR values and texture pixels. It then deletes only that test profile's asset bundle and verifies an explicit error without changing the displayed scene. [Comparison](phase2_5/durable-browser-comparison.json), [reopened screenshot](phase2_5/screenshots/durable-reopened.png).

Persistence regressions now exercise the versioned snapshot API instead of manually saving the old key-only localStorage document. Original failures remain recorded. Existing failing regressions were retained. BlackBullet assertions now use the explicit imported mode and additionally compare exact exported linear RGB values; standard rounded sRGB conversion avoids the older consumer Three.js hex truncation of `09090b` to `08080b`.

## BlackBullet compatibility

- Appearance selector exposes **Preserve Imported Appearance** and **Runtime Customization**. `?appearance=imported` selects preservation initially; existing catalog profiles default to runtime.
- Model Maker actually imported and reexported the new multipart textured fixture through its UI. BlackBullet loaded that resulting GLB through its real Vue preview.
- All 12 parts retain black `#09090B`, roughness 0.65, metalness 0, and embedded 8×8 albedo/normal textures in imported mode.
- Runtime color input `#224466` produces canvas pixel `[34,68,102,255]`; canvas materials remain white. Text artwork is added successfully. Geometry attributes remain unchanged. Switching back restores the complete imported material trace.
- The original catalog still loads its MeshBasicMaterial runtime default `#E5E7EB`.
- Read-only browser instrumentation observes actual materials; it does not replace synchronization behavior. Test routing supplies a new Model Maker export without overwriting source GLBs.

Evidence: [material/geometry traces](phase2_5/blackbullet-modes.json), [imported screenshot](phase2_5/screenshots/blackbullet-imported.png), [runtime artwork screenshot](phase2_5/screenshots/blackbullet-runtime.png), [actual exported GLB](phase2_5/fixtures/multipart-pbr-export.glb). Original sibling source backups are under `phase2_5/backups/blackbullet-3d/`.

## Original source asset diagnostics

`blackbullet-3d/src/assets/modals/subdivision.glb` remains unchanged. SHA-256 before/after diagnostic inspection: `41917204466a7a872bef865b6dfb4546c380044fd752afdc93700a31a485d0c1`.

- UV attribute absent; artwork readiness is **false**.
- 1 exactly zero-area source triangle; topology diagnostics count 2 degenerate faces after positional welding/area tolerance. These are different measurements.
- 297 triangles have geometric normals opposing their averaged shading normals.
- Position-welded topology reports 5,053 boundary edges and 1,043 non-manifold edges. Counts depend on welding tolerance and are diagnostics, not a mandate to close garment openings.
- No repair, opening closure, or original-asset overwrite was performed. [Raw diagnostic report](phase2_5/source-asset-diagnostics.json).

## Resource measurements and execution issues

Before control disposal, six browser cycles recorded geometry counts 21, 38, 55, 72, 72, 72. After the fix, all six cycles record **4 geometries and 8 textures**. Heap samples fluctuate with garbage collection; this short run does not establish a long-term heap bound. Twelve Node import/replace/history cycles also keep geometry caches bounded and reset to zero. [Browser measurements](phase2_5/resource-cycles.json).

Edge uses ANGLE SwiftShader with `--use-angle=swiftshader --enable-unsafe-swiftshader`, 1440×1000, one worker. Earlier approximately 3 FPS is a software-renderer observation, not a hardware GPU benchmark. No hardware FPS improvement is claimed.

An initial browser attempt hit a Turbopack error, and a later build identified its cause: Tailwind source scanning reached a locked browser-profile file inside `qa-reports`. QA profiles now use system temp, old profile directories are ignored, and the final build and relocated-profile persistence test pass. An intermediate asset-bundle TypeScript declaration error was corrected; final typecheck/build are green. Intermediate failed logs were retained.

## Exact implementation files

Model Maker paths, relative to its project root:

- `.gitignore`
- `engine/persistence/project-assets.ts` (new), `engine/persistence/indexeddb-projects.ts` (new)
- `engine/topology/geometry-transaction.ts` (new), `engine/topology/topology-cache.ts`, `engine/topology/geometry-operators.ts`
- `engine/scene/selection-state.ts` (new), `engine/scene/scene-transaction.ts` (new), `engine/scene/resource-lifecycle.ts` (new)
- `engine/scene/primitive-factory.ts`, `engine/scene/material-manager.ts`, `engine/scene/scene-builder.ts`
- `engine/exporters/glb-exporter.ts`
- `stores/editor-store.ts`, `stores/project-store.ts`
- `types/editor.ts`, `types/project.ts`
- `components/editor/top-nav.tsx`, `components/editor/editor-layout.tsx`, `components/editor/inspector/geometry-tab.tsx`
- `components/viewport/scene-renderer.tsx`, `components/viewport/transform-gizmo.tsx`

QA/support: `playwright.qa.config.mjs`; `scripts/qa/run.mjs`, `reload-scene.mjs`, `stabilization-fixture.mjs`, `source-asset-diagnostics.mjs`, `apply-blackbullet-modes.mjs`; `tests/qa/engine.test.mjs`, `stabilization.test.mjs`; `tests/qa/browser/blackbullet.spec.mjs`, `appearance-modes.spec.mjs`, `stabilization.spec.mjs`; generated Phase 2.5 evidence and this report. Earlier unrelated working-tree changes are preserved.

BlackBullet paths, relative to its sibling root:

- `src/config/garment-profiles.js`
- `src/views/customizer/index.vue`
- `src/components/customizer/preview/GarmentPreview.vue`
- `src/lib/garment-appearance.js` (new)
- `docs/customizer-models.md`

## Remaining limits and Phase 3 recommendation

Proceed with application work using UV-ready assets and explicit appearance modes. Keep the original subdivision asset outside UV-artwork acceptance until separately authored and revalidated. Existing version 1 documents containing only expired memory keys cannot reconstruct missing binary data; reimport the source and save as version 2. IndexedDB remains browser/origin-local and can be removed by clearing site storage.

Unsupported join/bevel/material duplication, hardware GPU behavior, long-duration memory behavior, exhaustive gizmo pointer gestures, browser quota-failure injection, and concurrent multi-tab saves are not certified here. These limits do not change the passing results of the requested stabilization regressions.
