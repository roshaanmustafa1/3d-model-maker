# Phase 3.5 customizer stabilization

Release decision: **PASS** for the tested Phase 3.5 scope. Unsupported and uncertified cases are listed below.

Work dates: October 24–25, 2026, Asia/Karachi. This repair updates the existing Model Maker; no replacement application or production GLB was created.

## Architecture and source of truth

- Original geometry, material definitions and imported texture references remain in the editor scene and material manager. Opening Customizer does not recolor or rebake them.
- Version-1 customization targets bind product, mesh, material slot, UV channel/bounds, composition ID, texture orientation and optional BlackBullet part ID. Separate targets receive independent derived materials even when their source material was shared.
- Explicit user finish overrides and editable artwork live in the customizer store. Derived CanvasTextures/material clones live in a separate transient store and never feed back into source materials.
- Preview and export use the same composition engine. Konva node configuration is shared by editor and compositor for images, text, rectangles, circles, stars and triangles.
- Modeling/customizer scenes retain independent graph/material/history snapshots. Resource pruning retains inactive workspace assets. Saves use distinct workspace metadata identities instead of overwriting the other workspace's saved document.

Full contract, coordinate/color convention and migration details: [customization architecture](../docs/customization-targets.md). Exact modified application/dependency/documentation files and hashes: [39-file source manifest](phase3_5/source-manifest.json). QA files are listed separately in that manifest. Existing unrelated source edits were retained.

## Eight original defects

The [Phase 3 audit](PHASE3_QA_REPORT.md) reported **FAIL**: defect Node cases were **1 passed / 4 failed**, and defect browser cases were **3 passed / 8 failed**. The original cases and pre-repair evidence remain available for comparison.

| Defect | Root cause | Repair and evidence |
|---|---|---|
| P3-01 surface bleed | Full-atlas zone defaults and one map assigned globally | Partition the original torso triangles into front, back and side surfaces with separate materials and authored UVs; unwrap sleeve charts; scope composition to mesh/material target. Every original torso triangle, normal and winding is retained exactly once. [Pixel/GLB acceptance](phase3_5/raw/acceptance-isolated.json) |
| P3-02 PBR loss/double tint | Global material mutation and fabric color in both texture and material factor | Preserve original resources, apply explicit target overrides, retain original albedo and normal/PBR/alpha/side properties. Edited albedo is multiplied by its linear color factor, encoded to sRGB and composited; edited material factor is white. Untouched materials retain their source maps. [Imported PBR](phase3_5/raw/multipart-import.json), [independent material slots](phase3_5/raw/independent-material-slots.json) |
| P3-03 missing runtime regions | One torso mesh and incompatible metadata | Exact existing BlackBullet `shirt` part identifiers and manifest UV regions; versioned extras. Unsupported runtime contracts fail explicitly. Actual Vue consumer resolves front/back/base/collar/left/right parts. [Consumer trace](phase3_5/raw/blackbullet-contract.json) |
| P3-04 incorrect initial model | Existing studio cube prevented default-product initialization | Independent scene snapshots; initialize actual configured product when customizer scene is empty. Returning to Studio restores its cube/working scene. [Acceptance/workspace evidence](phase3_5/raw/acceptance-isolated.json) |
| P3-05 camera buttons | Preset state was disconnected from controls | R3F camera controller fits actual product bounds and synchronizes OrbitControls, near/far planes and distance limits. Front/back/left/right/top/perspective/fit/reset commands tested against actual camera positions. [Camera snapshots](phase3_5/raw/acceptance-isolated.json) |
| P3-06 invalid uploads/SVG | Missing decode/error handling and regex-only sanitization | Size/signature/MIME/dimension/decode checks before layer creation; strict XML parser and SVG element/attribute/reference allowlist. Invalid assets report errors without adding broken layers. [Upload evidence](phase3_5/raw/uploads-security.json), [engine regressions](phase3_5/verification-final/engine.log) |
| P3-07 false UV readiness | Warning array never populated | Positive-area triangle intersections, spatial broad phase, material-slot separation, mirrored counts and edge-contact exclusion; scoped export blocking. Registered whole-part mirrored sharing remains a visible warning; unknown/unsafe sharing blocks export. Results cache by geometry/UV/index/group revision and have bounded entries. [Engine cases](phase3_5/verification-final/engine.log) |
| P3-08 shifted artwork | Different shape origins and independent drawing math | Canonical top-left layer origin and shared Konva configuration. Compare actual editor pixels with actual texture pixels after converting the authored UV rectangle back to zone coordinates. [Six-type alignment results](phase3_5/alignment-lifecycle/browser-results.json) |

`@xmldom/xmldom` **0.9.12** is the only added runtime dependency. No Codex security/approval configuration, plugin or production asset was changed. No BlackBullet source modification was necessary: the producer now meets its existing supported shirt contract.

## Real acceptance scenario

The UI loads the actual tee, uploads a red/blue PNG to front, positions artwork, adds `BLACKBULLET TEST` to back, adds a green star to left sleeve, and leaves right sleeve empty. Numeric controls and camera commands are exercised through UI interactions; browser state observations do not replace user actions.

The actual exported GLB has six meshes with complete torso geometry and independent source/derived material assignments. Decoded texture checks require front red/blue without green, back white lettering without red/blue, left green without front logo colors, and no new map on the untouched right sleeve. Edited material factors must be white. Reimport preserves the result.

Evidence: [actual isolated GLB](phase3_5/exports/acceptance-isolated.glb), [sidecar editable layers/targets](phase3_5/exports/acceptance-isolated.json), [decoded pixel counts/material JSON](phase3_5/raw/acceptance-isolated.json), [reimport snapshot](phase3_5/raw/acceptance-reimport.json).

Rendered consumer screenshots: [front](phase3_5/screenshots/contract-front.png), [back](phase3_5/screenshots/contract-back.png), [left](phase3_5/screenshots/contract-left.png), [right](phase3_5/screenshots/contract-right.png), [runtime](phase3_5/screenshots/contract-runtime.png).

## BlackBullet modes

The actual Vue application loads the temporary exported GLB through response routing for its model request. Original production files are not overwritten.

Imported appearance retains baked artwork and its authored material factors. Runtime mode resolves `shirt_front`, `shirt_back`, `shirt_base`, `collar`, `shoulder_left` and `shoulder_right`. Runtime front color `#335577` produces actual canvas pixel `[51,85,119,255]` with a white material factor. Left shoulder color becomes green while right shoulder remains independent. Runtime text is added through the real editor. Switching back restores the imported material/texture trace.

The existing BlackBullet profile supports runtime artwork on front/back and runtime colors on shoulders/base/collar. Baked sleeve artwork is retained in imported mode; runtime shoulder editing uses the existing runtime material replacement. These modes are intentionally distinct. [Actual contract test](phase3_5/blackbullet-contract-current/browser-results.json).

## Persistence, migrations and history

IndexedDB document/assets schema remains version 2. The customization document is version 4: targets, overrides, workspace, source type, durable data URLs and editable transforms are serialized with the original scene assets. Preview output is regenerated after hydration.

Version-3 zones rebind to actual imported nodes; circle/star center-origin coordinates migrate once to the canonical origin. Version-4 coordinates remain unchanged. Existing legacy assets whose material appearance was already destroyed by Phase 3 cannot recover missing original appearance from a migration.

The fresh-process test saves an imported 12-part UV-ready garment, closes Edge, launches the same temporary persistent profile, restores the project, compares full geometry/material/texture hashes and editable data, then exports again. Retained persistence coverage additionally includes PNG/SVG/text/custom-zone/fabric changes. Source albedo tint readiness is checked using the independently calculated source-pixel × selected-linear-factor result, not a flat fill that would discard albedo.

Evidence: [source/derived restart comparison](phase3_5/raw/persistence-stabilized.json), [retained full-project comparison](phase3_5/raw/persistence-comparison.json), [undo/redo exported pixel checks](phase3_5/raw/undo-redo-pixels.json), [restored export](phase3_5/exports/durable-reopened.glb).

## Alignment and resource measurements

Rotated/resized editor-to-texture maximum bound differences in normalized 1024-space were rectangle **0.896px**, circle **1.447px**, star **2.210px**, triangle **0.770px**, text **1.025px**, image **2.055px**. A 7px tolerance accommodates the different raster resolutions and antialiasing. Selection handles were removed before measurement.

Six real artwork/export/replacement cycles recorded **26 renderer geometries and 6 textures at every sample**. Heap measurements are retained and fluctuate; this short run does not establish a long-term heap bound. Preview uses direct CanvasTextures instead of PNG encode/redecode on every edit. Replaced output is disposed; decoded images are bounded to 64 entries; canceled generation results are discarded. Export-only material/PNG texture cache entries are released in `finally`.

Raw results: [resource cycles](phase3_5/raw/resource-cycles.json), [resolution exports/timings](phase3_5/raw/exports.json). These runs use installed Edge with ANGLE SwiftShader at 1440×1000. No hardware GPU or 60 FPS claim is made. Workflow timings include UI, encoding, verified export/download and QA observation; they are not isolated bake benchmarks.

Independent Sharp decoding confirms all three embedded images in each resolution export are exactly **1024×1024**, **2048×2048**, or **4096×4096**, respectively, with valid GLB headers: [decoded resolutions and pixel counts](phase3_5/raw/decoded-resolutions.json).

## Tests and fixture maintenance

| Final selected suite | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Default Node | 39 | 0 | 0 |
| Independent engine, retained defects and new regressions | 54 | 0 | 3 |
| Original browser baseline | 24 | 0 | 0 |
| Retained Phase 3 browser cases | 11 | 0 | 0 |
| New Phase 3.5 browser cases | 12 | 0 | 0 |
| **Total** | **140** | **0** | **3** |

The **47 browser cases** are counted once across selected final runs: [exact cases and counts](phase3_5/raw/final-summary.json). The [baseline command](phase3_5/baseline-sequential-final/browser-results.json) passed 28 cases because filename matching also selected four integration cases; those four are counted under their respective suites, not added to the 24-case baseline. Final focused runs passed [acceptance](phase3_5/acceptance-current/browser-results.json), [BlackBullet](phase3_5/blackbullet-contract-current/browser-results.json), and [six resource cycles](phase3_5/resource-current/browser-results.json).

Skips remain the original unsupported join/bevel/material-duplication features, not Phase 3.5 passes. Model Maker [TypeScript](phase3_5/verification-final/typecheck-execution.json)/[production build](phase3_5/verification-final/build-execution.json) and BlackBullet [vue-tsc/Vite build](phase3_5/blackbullet-build.log) passed. BlackBullet still reports its existing large-chunk warning.

The Phase 3 cases remain in their existing test files. Historical pre-repair versions are retained under [original tests](phase3_5/original-tests/phase3.spec.mjs). Fixture changes are explicit:

- Exact tee/hoodie mesh counts become 6/7 because torso partition adds two surfaces; counts remain exact assertions.
- The overlap regression uses an explicitly overlapping legacy box fixture. All original warning assertions remain.
- Star pixel bounds convert the authored atlas rectangle back into zone coordinates before the same tolerance assertions.
- Imported consumer texture dimensions are compared to the exact input GLB per mesh, preserving untouched 8×8 source maps instead of demanding a global 1024 map.
- Fabric pixel readiness independently multiplies source albedo by the selected linear color factor. Full persisted-layer/appearance comparisons remain.

No failing business assertion was replaced by a pass, and no defect case was removed. Intermediate hot-reload, readiness, host-contention and superseded fixture failures remain in separate directories and are excluded from the final selected-case totals.

## Remaining unsupported or uncertified cases

- Face-selected artwork without authored material/surface separation is explicitly rejected. Polygon masks and automatic garment UV authoring are not supplied by this repair.
- Runtime customization requires the registered front/back contract; other products can use preserved GLB appearance but are not silently declared runtime shirt-compatible.
- Verification covers standard PBR albedo/normal maps and the supplied UV-ready assets. Compressed textures, transformed albedo/cross-UV-channel rebaking and arbitrary production garment authoring are not certified.
- Long-duration memory behavior, hardware GPU FPS, manufacturing dimensions and physical print calibration are not certified.

## Reproduction

Use existing dependencies and installed Edge. Both servers must run at their established ports. Generate the QA-only slot fixture with `node scripts/qa/phase3_5-fixtures.mjs`. Set `QA_PHASE3_DIR=qa-reports/phase3_5` and a dedicated `QA_OUTPUT_DIR` before invoking `node scripts/qa/run.mjs browser ...`.

Run producer/workspace tests before consumer tests that read their GLBs: `phase3.spec.mjs`, `phase3_5.spec.mjs`, durability/pointer/alignment/material cases, then BlackBullet cases. Original five browser files provide the 24-test Phase 2/2.5 baseline. Default and independent engine commands remain `node scripts/qa/run.mjs existing` and `node scripts/qa/run.mjs engine`.
