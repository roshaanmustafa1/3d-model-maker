# Phase 2 independent QA report

## Executive decision: FAIL — fix critical/high defects before Phase 3

Tested 3d-model-maker 0.0.1 on October 24, 2026 (Asia/Karachi). This is the working checkout, not an asserted release tag. Exact source hashes and installed package versions are saved in [environment.json](test-results/environment.json).

The existing suite passes, but independent engine tests and real browser interactions expose selection inconsistency, non-durable geometry persistence, broken geometry/UV history, face-material export failure, incorrect flipped shading normals, and a real downstream BlackBullet color override. Do not proceed to Phase 3 until these release blockers are resolved and the failing regressions pass.

## Recorded counts

| Suite | Passed | Failed | Skipped/unsupported | Total |
|---|---:|---:|---:|---:|
| existing | 30 | 0 | 0 | 30 |
| independentEngine | 17 | 15 | 3 | 35 |
| browser | 17 | 2 | 0 | 19 |
| Total automated tests | 64 | 17 | 3 | 84 |

Skipped tests are unsupported join, bevel and material-duplication actions; they are not passes. Additional manual/unexecuted subcases below are not included in automated test totals. A single test can contain multiple assertions; defect count differs from test count.

Typecheck: PASS (exit 0). Production build: PASS (exit 0). Full command lines, timestamps, exit statuses and logs are under test-results. Engine failures intentionally produce a nonzero exit status.

## Environment and setup

- win32 10.0.19045; Intel(R) Xeon(R) CPU E5-2687W v2 @ 3.40GHz; 23.9 GiB RAM; Node v24.21.0.
- Next 16.4.2; React 19.3.0; Three 0.186.1; R3F 9.8.2; Drei 10.7.9.
- Playwright 1.64.1; installed Edge 155.0.4283.62; 1440×1000 viewport; one worker, no automatic retries.
- WebGL was active. Renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). These browser tests used **software rendering**, not a hardware GPU.
- Existing local Next development server on port 3000 was reused. An attempted new dev server on 3100 exited because the existing server owned the development lock; the user's server was not stopped.
- Previous Chromium-download trouble was avoided by using the installed Edge executable. No browser binary download was needed. Initial sandbox spawn failures required approved subprocess execution.
- Actual BlackBullet server on port 5173 and sibling source were found and tested. No production/backend data was modified.

## Coverage and real evidence

| Category | Result and limits |
|---|---|
| Layout | Side panels have usable measured widths; screenshot shows full editor |
| Selection | Viewport hit, background deselection, Escape, Scene Explorer deselection and camera orbit/pan/zoom pass; adding-primitive/Shift-click synchronization fails |
| Edit mode | Tab, select-all and Escape clearing/exit are browser tested; pointer gestures for every vertex/edge/face and gizmo dragging are not fully certified |
| Shading | All four modes interact correctly; actual Three.js material snapshots preserve color/PBR values and geometry; topology overlay tested |
| Black fabric | #09090B/0.65/0/opacity 1/DoubleSide survives standalone GLB and embedded glTF round-trips; actual BlackBullet replaces it |
| Real geometry | Actual raglan garment round-trip passes; six browser camera captures show real solid surfaces; intentional garment openings are not treated as holes to fill |
| Source quality | subdivision.glb retains black but fails standalone UV/degenerate diagnostics; see asset JSON and compatibility report |
| Topology | Extrude/inset/subdivide, merge/weld/delete/flip forward geometry exports are tested; connected-component separation passes; history and shading-normal failures remain |
| UV | Finite/missing/invalid UV diagnostics, box/planar/cylindrical forward edits and GLB preservation pass; all six UV history regressions fail; real PNG download succeeds |
| Materials | Slot assignment on default cube breaks export and undo; source PBR editing/round-trip supported; material duplicate/rename UI and every slot-removal path are not certified |
| Textures | Real image uploads, browser encode/reload, sRGB/data-map spaces and packed metallic/roughness references tested; decoded embedded PNG pixels independently compared |
| Persistence | Primitive transforms/materials pass serialized store reload; fresh-process edited geometry persistence fails |
| Integration | Actual BlackBullet customizer test fails preservation; complete decal/design placement and production catalog registration remain unverified |
| Performance | Measured 1k/20k/80k meshes; software WebGL FPS and latency have environment limitations, detailed separately |

## Failed test cases

- QA topology merge: geometry, graph, undo, redo and GLB
- QA topology weld: geometry, graph, undo, redo and GLB
- QA topology delete: geometry, graph, undo, redo and GLB
- QA topology flip: geometry, graph, undo, redo and GLB
- QA flip normals updates per-corner shading normals as well as winding
- QA adding a primitive keeps primary and multi-selection IDs synchronized
- QA UV box: finite data, undo/redo and GLB
- QA UV planar: finite data, undo/redo and GLB
- QA UV cylindrical: finite data, undo/redo and GLB
- QA UV translate: actual data changes and undo restores it
- QA UV rotate: actual data changes and undo restores it
- QA UV scale: actual data changes and undo restores it
- QA material slots: assign selected faces, remove slot, valid groups and GLB
- QA material face assignment undo from a primitive restores geometry and slots
- QA persistence: edited/imported geometry bytes survive a fresh process
- advanced QA / Shift click synchronizes multiple Scene Explorer selections
- BlackBullet actual customizer preserves imported black fabric before user color choice

For severity, exact reproduction, source functions and recommended repairs, see [BUG_REPORT.md](BUG_REPORT.md). Source asset problems are distinguished from product bugs. Failures caused by early locator casing, stale labels, a missing Node ProgressEvent adapter and test-only R3F observation were corrected in the harness; they are not counted as product failures. The consolidated final run has no intentionally hidden failures.

## Export/reimport scenarios

- A primitive: existing black-shirt/cube tests and independent embedded glTF black-cotton export.
- B multiple meshes/materials: existing multi-material tests; default-cube face-material workflow separately fails.
- C actual T-shirt: black-raglan_shirt.glb passes; black-subdivision.glb preserves color but fails source geometry/UV requirements.
- D edited topology: forward operation artifacts, including separation, exported and reloaded.
- E edited UV mapping: independent forward projection artifacts and real browser export validation.
- F textured material: textured-browser.glb and pbr-textures-roundtrip.glb, with browser snapshots and actual embedded image comparisons.
- G parent/child transformed hierarchy and H customizable metadata: existing regression tests compare actual reimported scene values.

Artifacts are new test copies in exported-models; original user garments were not overwritten. Export/reimport checks use real GLTFExporter and GLTFLoader, not mocks. Node tests use small browser-API adapters over real bytes where required.

## Screenshot evidence

- [blackbullet-imported-black.png](screenshots/blackbullet-imported-black.png)
- [blackbullet-validation.png](screenshots/blackbullet-validation.png)
- [deselected.png](screenshots/deselected.png)
- [edit-mode.png](screenshots/edit-mode.png)
- [editor-initial.png](screenshots/editor-initial.png)
- [export-dialog.png](screenshots/export-dialog.png)
- [iab-initial.jpg](screenshots/iab-initial.jpg)
- [imported-black-shirt.png](screenshots/imported-black-shirt.png)
- [material-preview.png](screenshots/material-preview.png)
- [normals.png](screenshots/normals.png)
- [real-shirt-back.png](screenshots/real-shirt-back.png)
- [real-shirt-bottom.png](screenshots/real-shirt-bottom.png)
- [real-shirt-front.png](screenshots/real-shirt-front.png)
- [real-shirt-left.png](screenshots/real-shirt-left.png)
- [real-shirt-right.png](screenshots/real-shirt-right.png)
- [real-shirt-top.png](screenshots/real-shirt-top.png)
- [selected.png](screenshots/selected.png)
- [shirt-front.png](screenshots/shirt-front.png)
- [shirt-right.png](screenshots/shirt-right.png)
- [shirt-top.png](screenshots/shirt-top.png)
- [solid.png](screenshots/solid.png)
- [textured-reimport.png](screenshots/textured-reimport.png)
- [topology-overlay.png](screenshots/topology-overlay.png)
- [uv-lab.png](screenshots/uv-lab.png)
- [wireframe.png](screenshots/wireframe.png)

These images came from genuine browser interactions. The initial in-app screenshot is supplementary; the PNG set came from the repeatable Playwright suite. There is no established pixel baseline, so this is a visual evidence suite with interaction/material assertions, not a claim that a prior screenshot baseline matches.

## Changes and reproducibility

Added @playwright/test to package.json/package-lock.json, playwright.qa.config.mjs, tests/qa/, scripts/qa/ and this report directory. Production application logic, existing user models, security/sandbox settings and BlackBullet files were not modified by this QA task. Existing tests were retained.

Run the QA components from the project root:

```powershell
node scripts/qa/run.mjs existing
node scripts/qa/run.mjs engine
node --import ./scripts/register-typescript.mjs scripts/qa/assets-and-performance.mjs
node scripts/qa/texture-fixture.mjs
node scripts/qa/run.mjs browser
node scripts/qa/verify-texture-bytes.mjs
node scripts/qa/run.mjs typecheck
node scripts/qa/run.mjs build
node scripts/qa/summarize.mjs
```

Use installed dependencies and running local development servers. The texture fixture generation uses the existing Next dependency sharp. The test browser path/base URL can be overridden with QA_BROWSER_PATH/QA_BASE_URL. The sibling BlackBullet server and actual garment paths are explicit test-environment requirements.

Remaining coverage gaps include arbitrary model codecs, transparent fabrics, genuine gizmo drags, every edit-selection gesture, full artwork/decal placement and durable texture reopen. Three skipped actions are unsupported rather than environment failures. Fix release blockers, add regressions for those workflows, then repeat QA before Phase 3.
