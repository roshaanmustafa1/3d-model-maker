# Phase 2 defect report

All issues below were reproduced with actual engine calls or browser interactions. Failing regression tests remain failing; no product logic was changed to obtain a pass.

## QA-01 — Critical: saved edited geometry is lost across processes

- Reproduce: create a cube; select faces 0/1; extrude 0.5; serialize the project scene; start a fresh Node process; reconstruct that scene using the real scene builder.
- Actual: the custom geometry cache is empty. `createBufferGeometry` falls through to its default primitive, silently producing an unedited cube. Saved projects contain geometry keys rather than geometry bytes. Imported source materials also depend on an in-memory cache and may raise a reimport error after a fresh session.
- Expected: saved imported/edited geometry, UVs and material resources survive reopening.
- Source: `stores/project-store.ts:saveCurrentProject`, `engine/scene/primitive-factory.ts:createBufferGeometry`, `engine/scene/material-manager.ts:syncMeshStandardMaterial`.
- Evidence: `test-results/persistence-scene.json`, `test-results/persistence-fresh-process.log`, `engine.xml` test “QA persistence: edited/imported geometry bytes survive a fresh process”.
- Recommendation: persist actual geometry attributes/index/groups and material/texture resources, hydrate them before installing the scene, and fail explicitly on missing resources. Test the full reopen workflow. A complete durable asset implementation exceeds a safe QA-only patch.

## QA-02 — High: UV history changes the graph but not rendered/exported geometry

- Reproduce: fresh cube → apply box/planar/cylindrical projection or translate/rotate/scale UVs → capture actual BufferGeometry → Undo.
- Actual: UV data remains edited. The history callbacks restore topology cache entries without restoring the node's geometry type/key and relevant BufferGeometry. Redo similarly does not establish a complete geometry state.
- Expected: actual geometry used by both renderer and exporter returns to the before/after state.
- Source: `stores/editor-store.ts:applyUVProjection`, `transformSelectedUVs`.
- Evidence: six failed UV history cases in `test-results/engine.xml`; independent forward UV GLB exports pass, establishing that the history layer is the failing path.
- Recommendation: snapshot and restore graph, geometry resource, node geometry definition and stats together in both history directions.

## QA-03 — High: merge/weld/delete redo and flip history restore incorrect geometry

- Reproduce: on a primitive cube perform merge vertices, distance weld or delete a face → Undo → Redo. Separately flip faces and Undo.
- Actual: merge/weld/delete redo retains the unedited geometry state. Flip undo leaves the edited BufferGeometry. Several callbacks update a geometry key/cache without restoring `geometry.type`, or restore only the graph cache.
- Expected: renderer/exporter use the same geometry state restored by history.
- Source: `stores/editor-store.ts:mergeSelectedVertices`, `deleteSelectedTopologyElements`, `flipSelectedNormals`.
- Evidence: failed topology history cases in `test-results/engine.xml`; corresponding independent forward operations and GLB round-trips pass.
- Recommendation: centralize geometry history snapshots/restoration, including primitive-to-custom transitions. Verify consecutive operations as well as one undo/redo pair.

## QA-04 — High: assigning face materials on the default cube breaks GLB export

- Reproduce: create a second material → select cube faces 0/1 → assign that material → export GLB.
- Actual: exporter throws `Cannot read properties of undefined (reading 'normalMap')`. BoxGeometry has six default face groups (material indices 0–5); the topology builder treats them as six real material slots even when the mesh has one assigned material. After adding a second slot, remaining groups reference nonexistent slots.
- Expected: every group references an existing assigned material, with the single-material cube initially using material slot 0 for all faces.
- Source: `engine/topology/topology-graph.ts:getMaterialIndexForTriangle`, `stores/editor-store.ts:assignMaterialToSelectedFaces`, `engine/scene/scene-builder.ts`.
- Evidence: “QA material slots: assign selected faces, remove slot, valid groups and GLB” fails in `test-results/engine.xml`.
- Recommendation: normalize material indices against actual mesh assignments when constructing editable topology, preserve valid imported arrays, and reject invalid group indices before invoking GLTFExporter.

## QA-05 — High: face-material undo leaves the edited geometry/groups

- Reproduce: assign a new material to one face of a primitive cube → Undo → compare actual index/groups/UV buffers.
- Actual: old slots are restored but the node still references the rebuilt custom geometry/groups, which can have invalid slot indices.
- Expected: geometry and material slots return together to their original state.
- Source: `stores/editor-store.ts:assignMaterialToSelectedFaces` history callbacks.
- Evidence: “QA material face assignment undo from a primitive restores geometry and slots” in `test-results/engine.xml`.
- Recommendation: restore the full geometry definition, including type, key, params and stats, alongside slot assignments.

## QA-06 — High: Flip Normals leaves shading normals pointing the old way

- Reproduce: build cube topology → save a face corner normal → flip that face → compare its corner normal.
- Actual: triangle winding and `face.normal` change, but existing `face.corners[].normal` do not. Rebuilding prefers the corner normals, so the resulting shading normals oppose the flipped surface.
- Expected: both winding and shading normals reverse.
- Source: `engine/topology/geometry-operators.ts:flipTopologyNormals`, `engine/topology/topology-graph.ts:rebuildBufferGeometryFromTopology`.
- Evidence: dedicated corner-normal regression fails in `test-results/engine.xml`.
- Recommendation: negate affected corner normals and preserve custom smoothing semantics; test actual rebuilt normal buffers and history.

## QA-07 — High: real BlackBullet replaces black PBR fabric before user input

- Reproduce: run the actual existing BlackBullet customizer on port 5173; substitute its garment GLB network response with the exported `black-subdivision.glb`; leave all controls untouched.
- Actual: input GLB contains #09090B, roughness 0.65, metalness 0 and doubleSided true. Actual runtime fabric becomes MeshBasicMaterial with sRGB #E5E7EB. The trace records a call to `setGarmentColour(..., '#E5E7EB')` before any user choice. Roughness/metalness are no longer PBR properties on that replacement material.
- Expected under this QA request: retain imported appearance until an explicit user choice.
- Source in sibling `blackbullet-3d`: `src/components/customizer/preview/GarmentPreview.vue:setupModel`, `syncPartColours`; `src/lib/garment-preview-material.js`; `src/config/garment-profiles.js`; `src/composables/useCustomizerEditor.js`.
- Evidence: `test-results/blackbullet-runtime.json`, failing genuine browser integration test, `screenshots/blackbullet-imported-black.png`.
- Recommendation: resolve the contract explicitly. Current BlackBullet documentation deliberately requests material-free assets and runtime default colors. Add an imported-appearance mode or initialize colors from loaded materials; do not silently apply defaults. This cross-project policy change was not applied during QA.

## QA-08 — Source asset quality: subdivision.glb is unsuitable for UV artwork as-is

- Real source file: sibling `blackbullet-3d/src/assets/modals/subdivision.glb`.
- Actual: missing UV attribute, one degenerate triangle and 297 triangles with normals opposing winding. These are present in the source; black color itself survives the round-trip.
- Impact: UV-based artwork placement cannot be certified. The current BlackBullet default intentionally runs mesh-color mode with artwork controls disabled, so missing UVs do not by themselves establish a defect in that color-only workflow.
- Evidence: `test-results/assets-and-performance.json`; source hashes distinguish the exact tested asset.
- Recommendation: repair a copy in the authoring pipeline if this asset must support UV customization. Do not fill intentional collar/sleeve/hem boundaries automatically.

## Unsupported / not certified

Join meshes, edge bevel and material duplication have no corresponding editor-store actions and are explicitly skipped in the automated inventory. Gizmo dragging, pointer picking of every edit sub-element, arbitrary asset codecs, transparent textured garments, and full artwork/decal placement need further coverage. Material-slot removal following the failing cube face-assignment workflow is blocked by the earlier export defect. No unexecuted case is counted as a pass.

## QA-09 — High: adding a primitive leaves primary and multi-selection out of sync

- Reproduce in the actual browser: default selected cube → Add → Sphere → Shift-click the cube in Scene Explorer.
- Actual: adding Sphere updates `selectedNodeId` but leaves `selectedNodeIds` pointing at the cube. Shift-clicking the cube removes that stale selection and clears the primary selection; the sphere is not retained. Both rows appear selected before the Shift-click even though the actual selection arrays disagree.
- Expected: adding the sphere establishes `[sphereId]` as the selected ID list; Shift-clicking cube then selects both.
- Source: `stores/editor-store.ts:addPrimitive`, including its redo callback. Other object-creation actions should be audited for the same invariant.
- Evidence: genuine browser “Shift click synchronizes multiple Scene Explorer selections”, its screenshot/trace in `test-results/browser-artifacts`, and the focused engine selection invariant test.
- Recommendation: centralize primary/multi-selection updates and update selected stats on every creation/duplication/delete/history path. Test adding an object while an older object is selected.
