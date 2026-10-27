# Model Maker core completion audit

Date: 2026-10-25 (Asia/Karachi). Status: **core improvements verified; not production-ready**.

This audit inspects the existing application. The previous Phase 4 report's 151 passes and Phase 3.5's 140 passes are historical claims, not current-run counts. No production GLB or BlackBullet source was replaced.

## Prioritized completion checklist

| Priority | Capability | Audited state / action |
| --- | --- | --- |
| P0 | Preserve triangle ownership during separation | Implemented exact partition validation: every face appears once. Selected faces, loose components and material groups supported. Source attributes, winding, local transforms, parent, material slots and visibility retained. |
| P0 | Reliable viewport face picking | Fixed triangle-index mapping after material sorting and disabled raycasting on edit overlays. Connected, grow and shrink controls added. |
| P0 | BlackBullet runtime gate | Replaced front/back substring acceptance with explicit contract version/profile, unique regions, real material slots, canonical atlas containment, actual world-space front/back depth and winding orientation, and positive-area UV-intersection checks. Generation, Validator and runtime export enforce the shared gate. |
| P0 | Independent part/material workflow | Existing source/override/derived architecture retained. Added slot-specific, undoable material reassignment; New material acts on the active slot. Separating parts invalidates inherited target/region bindings so users must define new zones. |
| P0 | Receive MacBook-generated assets | Implemented provider-independent local GLB file adapter and inspection UI. Validates container/chunk integrity, embedded resources, geometry, transforms and UVs. Studio opens valid assets; local handoff blocks Customizer when UVs are invalid/missing or overlap. |
| P1 | UV chart inspection and targeting | Existing island count/preview and transforms retained. Added material-slot and island selection targets in UV Lab. |
| P1 | Seams and packing | Explicit edge seam marking/clearing and deterministic square-grid packing added with geometry history. Seam coordinates persist in project geometry metadata. Packing preserves island shape; it cannot remove intersections inside a chart. |
| P1 | UV validity/overlap diagnosis | Inspector now uses actual positive-area triangle intersections rather than island bounding-box overlap. |
| P1 | Blender processing | Existing worker was disconnected from processing. Connected it and added a local-file preparation endpoint. Updated normals API, degree/radian handling, object selection and triangle counts. Existing UVs are retained when generating missing UVs. Successful Blender execution remains unverified on this host. |
| P1 | Save/reopen and export/reimport | Existing durable assets and verified exporters retained. New engine coverage exercises separated parts, independent materials and generated GLB round-trip. Browser verification recorded below. |
| P2 | Guided workflow | Existing identity/layout retained. Added a persistent ordered workflow guide, actionable mesh/UV warnings and local handoff recommendations. Automatic per-step completion tracking remains unsupported. |
| P2 | Automatic semantic garment separation | Unsupported. Existing analyzer combines names and spatial candidates; this is not verified automatic front/back/sleeve reconstruction. Manual face identification, separation and renaming are required. |
| P2 | General DCC-quality unwrap/rebake | Unsupported in-browser. Projections exist; seam-driven Blender unwrap, texture rebaking after arbitrary UV changes, stretch optimization and dense garment certification remain incomplete. |
| P2 | Remote MacBook transport | File handoff is implemented. Network job creation, progress, authentication, retries and service discovery require the real service contract. No fake service was added. |

## Existing working and partial features

Existing engine suites cover topology editing, transforms, material slots, customization layers, target isolation, source PBR preservation, durable asset serialization and exporter round-trip checks. Existing customization export supports Preserve Imported Appearance and Runtime Customization; only the latter requires the shirt runtime contract.

Existing viewport picking, selected separation, projections, transforms and face-material assignment were real implementations rather than placeholders, but the audit identified the picking/index defects above. Separation previously rebuilt only position/normal/UV0 data and could silently lose secondary attributes; it now partitions the source geometry directly.

Phase 4's `TripoProvider` remains an unsupported adapter stub. The fixture provider returns pre-existing files and does not generate a model from its input image. Existing preset descriptions overstated decimation, orientation normalization and semantic zone preparation; descriptions were shortened to reflect implemented behavior. Automatic decimation and verified semantic remapping remain unsupported.

Concurrent engine/browser QA exposed a shared `jobs.json.tmp` rename race. Generation job mutations now use a cross-process file lock and unique temporary files. A concurrent-write regression verifies that independently saved jobs survive. A crashed writer can leave a lock; recovery requires checking the recorded PID before removing it.

## Verification and evidence

Engine suite: **118 passed, 3 skipped, 0 failed** (121 tests). Browser suite: **50 unique cases passed** across staged runs and targeted retries, including all 48 existing cases and 2 new cases. **168 unique passes combined**, with 3 engine skips. The skips are `joinMeshes`, `bevelSelectedEdges`, and `duplicateMaterial`. **15 new engine regressions** and **2 new browser regressions** were added. TypeScript and production build passed; the build retains 2 dynamic-filesystem tracing warnings.

These are deduplicated latest results, not a claim that one uninterrupted browser command passed all 50 cases. [Machine-readable results](completion/verification-summary.json) include every staged run's counts and the final result source for each unique case. The final engine run is [logged here](completion-engine.log); [TypeScript](completion-typecheck.log) and [build](completion-build.log) have separate logs.

Logs are kept under `qa-reports/completion-*.log`, with isolated browser artifacts under `completion/`. Tests used isolated ports because port 3000 was already occupied. Browser suites now honor `QA_BASE_URL`; process-restart helpers wait for an interactive viewport before clicking menus. No assertion was removed or relaxed. The six-view screenshot timeout passed when rerun alone with a 180-second test budget; the process-restart case passed after its hydration wait was corrected. One filename filter also matched extra consumer files with the wrong fixture directory, and a reimport attempt hit a stale server during rebuilding. Correct asset routing, a fresh server and targeted reruns passed. All earlier failed attempts remain available; they are not counted as additional coverage.

| Browser coverage | Final unique cases | Evidence |
| --- | ---: | --- |
| Existing editor and stabilization | 21 | [Initial run](completion/baseline-browser/browser-results.json), [targeted retry](completion/final-smoke/browser-results.json) |
| Phase 3.5, AI pipeline and new completion cases | 14 | [Staged run](completion/final-browser/browser-results.json), [restart retry](completion/final-smoke/browser-results.json), [final build confirmation](completion/final-confirmation/browser-results.json) |
| Actual BlackBullet region contract | 1 | [Final confirmation](completion/final-confirmation/browser-results.json) |
| Legacy producer, uploads, pointer and durability | 8 | [Results](completion/legacy-producer-browser/browser-results.json) |
| Existing appearance modes and imported fabric | 3 | [Results](completion/appearance-browser/browser-results.json); only these 3 intended cases count in this row |
| Legacy consumer and GLB reimport | 3 | [Consumer results](completion/legacy-consumer-browser/browser-results.json), [reimport retry](completion/final-confirmation/browser-results.json) |

New engine regression coverage includes:

- Connected/grow/shrink face selection.
- Selected, disconnected-component and material-group separation.
- Exact triangle/attribute conservation, preserved normals, UV0/UV1, winding and integer skin-index storage.
- Transform/material preservation and separation undo/redo.
- Stable viewport IDs after material sorting.
- Seam chart boundaries and persisted geometry metadata.
- Packing, UV edits and geometry undo/redo.
- Corrupt GLB containers and invalid handoff extensions.
- Rejection of name-only runtime claims and actual atlas drift.
- Independent material-slot reassignment with undo/redo.
- Asset serialization, hydration and separated material GLB export/reimport.
- Concurrent durable generation-job writes without lost independent jobs.

Round-trip asset: [separated-roundtrip.glb](completion/exports/separated-roundtrip.glb). This generated QA asset is separate from production models.

[Binary evidence and SHA-256 hashes](completion/glb-evidence.json): the separated round-trip contains 3 meshes/3 primitives/24 triangles; the front/back/sleeve acceptance export and the new 1024px legacy export each contain 6 meshes/6 primitives/248 triangles. All primitives have normals and UV0, and all declared GLB lengths match. Browser suites verify embedded texture pixels and reimport independently of these container metrics.

Browser screenshots: [local GLB handoff](completion/screenshots/local-handoff.png), [separated parts and UV preparation](completion/screenshots/split-uv-preparation.png), [front/back/sleeve acceptance](completion/phase3_5/screenshots/acceptance-perspective.png).

BlackBullet integration: **1 passed**, using the actual Vue application and the newly exported [acceptance GLB](completion/phase3_5/exports/acceptance-isolated.glb). The case verifies imported appearance, runtime colors and independently routed artwork regions. Evidence: [browser results](completion/blackbullet-browser/browser-results.json), [contract trace](completion/phase3_5/raw/blackbullet-contract.json), [runtime screenshot](completion/phase3_5/screenshots/contract-runtime.png). [Before/after SHA-256 checks](completion/production-asset-preservation.json) confirm that the tested production garment GLBs were unchanged by this consumer run.

## Known limitations and unverified workflows

- No successful Blender processing evidence without an installed/configured Blender executable. The API returns an actionable failure instead of claiming a fallback unwrap succeeded.
- Project seam metadata does not yet implement a GLB-to-Blender seam-transfer contract. The worker performs Smart UV Project for missing UV channels, not a seam-driven garment unwrap.
- Packing/projection/UV transforms preserve texture files but do not rebake their pixels. Texture placement changes; textured assets need a controlled Blender rebake to preserve appearance.
- UV packing uses equal cells, not an optimal area/texel-density solver. Marking a seam partitions chart traversal but does not itself unwrap geometry.
- Morph-target topology editing is rejected to avoid silently dropping animation data. Local AI handoff requires a static export for skinned models. Full rig/animation editing is unsupported.
- Coincident positions can be welded by the existing topology graph. Ambiguous coincident layers require manual inspection; separation is not a certified solution for arbitrary layered cloth scans.
- General Phase 4 Customizer compatibility still describes loadability; per-target artwork isolation is checked by the established composition/export pipeline. The new local handoff adds an overlap blocker before opening the Customizer.
- The Blender endpoint follows the existing local app deployment model. Public deployment still needs authenticated processing, concurrency control and workload limits.
- Existing skipped tests represent unsupported features and are not counted as passes. No regression assertion was weakened.
- Generation storage is a serialized local JSON repository, not a distributed job queue. A crashed writer may require manual stale-lock recovery; multiple hosts need a transactional shared database/queue.
- Server-side processing of textured/compressed generated GLBs is not certified by the untextured generation fixtures. Standard embedded PBR texture preservation is covered by the browser import/export suites; remote generated garments still need representative acceptance assets.

## Changed source areas

- `engine/topology/`, `types/topology.ts`, `stores/editor-store.ts`: region selection, attribute-preserving partitions, compact material groups, stable picking, seams, UV history and slot assignment.
- `engine/loaders/`, `integrations/local-ai/`, `components/generator/local-glb-handoff.tsx`: file integrity and provider-independent generated-asset handoff.
- `engine/validation/runtime-contract.ts`, generation/BlackBullet validators and `engine/customization/customization-exporter.ts`: shared runtime gates.
- `engine/processing/mesh-processor.ts`, `server/blender/`, Blender preparation/job-processing routes: geometry clone isolation, repaired material groups, real worker invocation and missing-UV preparation.
- `server/generation/job-repository.ts`: serialized atomic job mutations.
- Existing inspector, viewport, generator and UV components plus small preparation/target components: controls, workflow guide, accurate warnings and fixture labeling.
- `tests/qa/completion.test.mjs`, `tests/qa/browser/completion.spec.mjs`: new coverage. Existing QA helpers/specs changed only for correct buffer bounds, configurable URLs and hydration waits.

No dependencies were installed. No application project was replaced, no production GLB was overwritten, and Codex/security configuration was not modified.

## Remaining MacBook AI integration requirements

Agree the real service protocol: job IDs/status/cancellation, artifact retrieval, authentication, network reachability, limits, timeouts/retries and ownership. Require self-contained GLB 2.0 with embedded images/buffers, static meshes, valid indices/normals, explicit units/orientation and original PBR data. Prefer separate part identifiers and non-overlapping material-specific UVs. Supply actual generated garments for dense geometry, texture fidelity and failure-path acceptance tests. Neither Meshy credentials nor a simulated generation provider is required by the implemented file handoff.

## Completion criteria still open

The existing browser regression set and actual BlackBullet consumer have passed as described above. Still required: verify Blender with representative textured garments; implement/certify seam unwrap and texture rebaking; validate remote MacBook transport and realistic generated garments. Production readiness must wait for these workflows and the unsupported capabilities above.
