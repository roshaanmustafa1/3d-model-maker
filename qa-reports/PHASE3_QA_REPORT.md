# Independent Phase 3 QA

Release decision: **FAIL**.

The browser can create editable artwork and export real textured GLBs, but design zones are not isolated, imported appearance is overwritten, and the generated catalog T-shirt does not resolve BlackBullet front/back runtime regions. These are core customization failures.

## Execution and baseline

- Date: 2026-10-24, Asia/Karachi. Raw execution files retain UTC timestamps.
- Existing Next.js server: `http://localhost:3000`. Actual Vue BlackBullet: `http://localhost:5173/customizer`.
- Installed Edge, Playwright, 1440×1000, one worker per invocation, forced ANGLE SwiftShader. No browser/driver download, install, build, or production-asset write.
- Default suite: **39 passed**. Separate original `tests/qa/*.test.mjs`: **38 passed, 3 skipped**. Existing browser suite: **24 passed**, including Phase 2.5 persistence, multipart appearance modes, missing saved assets, resource cleanup and original catalog behavior.
- The original 39 therefore do **not** include the independent engine/browser suites. Original resolution assertions accept the composer's Node-only 1×1 fallback and do not verify dimensions or rendered pixels.
- New defect regressions: **1 passed, 4 failed**. See [raw log](phase3/raw/regressions.log). New browser cases deliberately retain failing assertions; current result files and intermediate harness failures remain separate.
- Consolidated final Phase 3 browser cases: **3 passed, 8 failed** across 11 cases. Passing cases are durable project restart, settled pointer→texture updates, and the UV-ready multipart BlackBullet mode workflow. These are case counts, not counts of individual assertions. [Exact case selection/results](phase3/raw/final-summary.json).

Baseline evidence: [default results](phase3/raw/existing.log), [independent engine results](phase3/raw/engine.log), [24 browser results](phase3/baseline/browser-results.json).

## Verified behavior and failures

| Category | Result | Independent evidence |
|---|---|---|
| Initial workspace | Failed | Tee label, actual `Studio_Cube`; [trace](phase3/raw/initial-workspace.json), [screenshot](phase3/screenshots/initial-workspace.png) |
| Explicit product library | Passed for loading | Tee 4 meshes, hoodie 5, bottle 3, box 1; actual geometry/UV/material snapshots in [cycles](phase3/raw/catalog-cycles.json) |
| Camera controls | Failed | Customizer preset buttons leave camera at `[5,4,7]`; original editor camera tests still pass |
| Upload/editing | Partial | PNG/JPEG/WebP/SVG/text/shapes added through UI; numeric X/width/rotation/opacity, duplicate/delete, lock/visibility controls exercised; [saved layers](phase3/raw/artwork-controls.json), [upload cases](phase3/raw/uploads-security.json) |
| Invalid uploads/security | Failed | Malformed PNG gives no user error; invalid SVG becomes a broken layer; entity-encoded JavaScript URI survives sanitization. No script execution observed |
| UV isolation | Failed | Front/back/left sleeve share the same atlas with untouched right sleeve; right sleeve has zero saved layers yet receives the artwork map |
| 2D/3D shape agreement | Failed for star | With selection handles removed, green-pixel bounds differ by about 148px horizontally and 149px vertically in normalized 1024-space; [bounds](phase3/raw/star-coordinate-comparison.json) |
| Live baking | Partial | Settled pointer test passes: actual mesh texture pixels change; readiness must be awaited. Global material updates destroy original albedo/PBR distinctions |
| Export resolutions | Passed for real output dimensions | Embedded PNGs decoded at 1024², 2048² and 4096²; [exports](phase3/raw/exports.json), [binary inspection](phase3/raw/binary-audit.json) |
| Export/reimport | Failed appearance acceptance | Binary is valid and reimports, but material/zone isolation remains broken; [reimport](phase3/raw/customized-reimport.json) |
| BlackBullet | Failed catalog-product compatibility | Actual new export loaded by non-destructive routing; imported textures present, runtime body region unresolved; [integration report](PHASE3_BLACKBULLET_INTEGRATION.md) |
| Durable editable project | Passed after texture readiness | Imported 12-part GLB, PNG, SVG, text, custom zone, fabric color; new browser process, same temp profile, identical saved layers, materials, geometry and texture hashes; [comparison](phase3/raw/persistence-comparison.json) |
| Undo/redo | Partial | Actual UI delete/undo/redo restores layer counts 3→4→3 and saved state. Node ordering/transform history control passes. Exhaustive texture/history transactions remain unverified |
| Geometry integrity | Passed for tested round trip | Multipart positions/normals/UV/index hashes match source after export. Existing multi-slot geometry regressions pass; customizer still overwrites material appearance |
| Resource/performance | Limited measurement | Six replacement cycles, heap/resource samples, actual pointer/renderer counters and export timings; [performance report](PHASE3_PERFORMANCE.md) |

## Evidence and reproduction

Run from the repository root using the existing Node runtime and local Edge:

```powershell
$env:QA_OUTPUT_DIR='qa-reports/phase3/reproduction'
node scripts/qa/run.mjs browser phase3.spec.mjs
node scripts/qa/run.mjs browser phase3-durability.spec.mjs
node scripts/qa/run.mjs browser phase3-pointer.spec.mjs
node scripts/qa/run.mjs browser phase3-blackbullet.spec.mjs
node --import ./scripts/register-typescript.mjs --test tests/qa/phase3-regressions.test.mjs
node scripts/qa/phase3-binary-audit.mjs
```

Run workflows sequentially: BlackBullet cases consume exports produced by artwork/persistence cases. Required Phase 2.5 fixtures are reused, including the genuine UV-ready 12-mesh garment. The original UV-less `subdivision.glb` is not artwork acceptance evidence.

Screenshots, downloads, sidecars, embedded texture PNGs, saved layer data, logs, JSON results and failed-case Playwright `trace.zip` files are under `phase3/`. Original QA scripts write some Phase 2/2.5 generated evidence to their established paths; their new execution results are separately retained under `phase3/baseline/`.

The original production `subdivision.glb` SHA-256 still matches the recorded Phase 2.5 value: `41917204466a7a872bef865b6dfb4546c380044fd752afdc93700a31a485d0c1`.

## Scope and limitations

No application fixes were applied. Changes are confined to QA scripts/tests/reports and generated evidence. Existing unrelated source changes were preserved. Correct surface isolation requires a coordinated bake/material/UV design change, documented in the bug report.

Unverified acceptance cases: exhaustive pointer resize/rotation handles, every keyboard shortcut, browser layer reordering, exact text typography parity, mirrored UV fixtures, arbitrary island boundary clipping, every multi-slot artwork assignment, all undo/redo operations compared against exported texture pixels, missing individual artwork-asset injection, quota/concurrent-tab failures, long-duration memory behavior, hardware GPU FPS and isolated bake-only timing. These are explicitly outstanding, not passes. No manual testing is needed to establish the present failure decision.

An early persistence comparison captured a stale pre-bake material map. The readiness-aware repetition passed and supersedes that persistence failure; it remains a warning against taking fixed-delay screenshots as settled output. Harness-only selector/time-out failures are retained in intermediate directories and are not counted as product defects.
