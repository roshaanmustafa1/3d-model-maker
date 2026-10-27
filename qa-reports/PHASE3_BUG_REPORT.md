# Phase 3 defects

Release decision: **FAIL**. No production correction was applied during this independent audit.

## P3-01 — P1: Artwork crosses independent surfaces

Reproduce: load Streetwear Oversized Tee; upload a red/blue front PNG; add back text `BLACKBULLET TEST`; add a left-sleeve star; leave right sleeve empty; export.

Actual: all four meshes receive the same full-atlas artwork map. The right-sleeve zone contains zero layers but renders that map. BoxGeometry repeats UV space across faces; every catalog zone also uses full `[0,1]²` bounds. Imported zones similarly default to full bounds. The compositor ignores target mesh/material slot while the live/export paths assign the map globally.

Expected: independent front, back, left and unchanged right surfaces. Severity is functional, not a cosmetic overlap warning.

Modules: `engine/customization/product-catalog.ts`, `zone-mapper.ts`, `texture-composer.ts`, `customization-exporter.ts`; `stores/customizer-store.ts`; `components/customizer/product-customizer-view.tsx`.

Evidence: [actual saved zones and mesh pixels](phase3/raw/artwork-controls.json), [actual GLB](phase3/exports/blackbullet-test-1024.glb), [binary/pixel audit](phase3/raw/binary-audit.json), retained browser assertion in `artwork-final/`.

Decoded GLB triangle-centroid samples on both torso +Z and −Z surfaces include four red and four blue logo samples each. Each sleeve's twelve triangles sample six red and six blue pixels. This links actual embedded pixels to the unintended surfaces, independently of the 2D preview.

## P3-02 — P1: Imported albedo/PBR overwritten and baked texture double tinted

Reproduce: import the existing UV-ready multipart PBR fixture through Customizer Library and export without altering its finish.

Actual: original black `#09090B`, roughness .65 and 8×8 albedo become global `#18181B`, .92 and 1024² atlas. Normal maps remain present, but original albedo is not supplied to the compositor. All materials are assigned fabric roughness/metalness and the same map; export also forces double-sided rendering. Preserve mode writes fabric color both into PNG pixels and the material color, multiplying the fabric tint twice in the standard material shader.

Expected: original per-material color/PBR/maps/side survive unless deliberately edited; baked color has one consistent tinting convention.

Evidence: [runtime materials](phase3/raw/multipart-import.json), [exported material JSON](phase3/raw/multipart-customizer-glb.json), [decoded source/export pixels](phase3/raw/binary-audit.json), [screenshot](phase3/screenshots/multipart-import.png).

## P3-03 — P1: Generated catalog product lacks usable BlackBullet body regions

Reproduce: load the newly exported tee by routing BlackBullet's garment request to `phase3/exports/blackbullet-test-1024.glb`; use imported mode, then runtime mode.

Actual: imported mode receives all four baked maps, but `Body_Main.partId` is null; no `shirt_front`/`shirt_back` record exists. Runtime mode replaces materials and the catalog export loses its baked maps without gaining usable front/back artwork regions. Parsing/Model Maker verification does not detect this mismatch.

Modules: Model Maker export metadata/product geometry; BlackBullet garment profile/part resolution contract. A single body mesh with overlapping front/back UVs cannot satisfy an independent front/back region contract through renaming alone.

Evidence: [actual imported/runtime/restored traces](phase3/raw/blackbullet-modes.json), [screenshots](phase3/screenshots/blackbullet-front.png). Existing catalog runtime-default tests still pass.

## P3-04 — P2: Initial product label differs from actual geometry

Reproduce: fresh browser → Customizer. The label says Streetwear Oversized Tee while the scene contains `Studio_Cube`.

Cause: initialization only generates a product when the editor has zero meshes; the default editor cube prevents it. Explicit Library selection loads the intended product.

Module: `components/customizer/product-customizer-view.tsx`. [Evidence](phase3/raw/initial-workspace.json).

## P3-05 — P2: Customizer camera buttons do not move the camera

Reproduce: load a product, click Front, Back, Left and Right. Camera remains `[5,4,7]` despite control selection/toast changes.

Cause: PreviewControls writes editor camera state, but ViewportCanvas only moves its controls through its local reset callback; it does not subscribe to this preset state.

Modules: `components/customizer/preview-controls.tsx`, `components/viewport/viewport-canvas.tsx`. [Measured views](phase3/raw/catalog-cycles.json). Original editor viewport-camera tests remain passing.

## P3-06 — P2: Invalid upload feedback and SVG validation

Reproduce: upload `not a PNG` as image/png, then `<svg><path invalid` as image/svg+xml.

Actual: PNG produces no user-facing error; malformed SVG is saved as an image layer and cannot render. FileReader/image error callbacks are absent. Texture composition suppresses image failures.

Module: `components/customizer/artwork-toolbar.tsx`, `engine/customization/svg-sanitizer.ts`, `texture-composer.ts`. [UI and saved-data evidence](phase3/raw/uploads-security.json).

Additional sanitizer gap: `href="&#106;avascript:alert(1)"` survives regex sanitation. This violates sanitization expectations; **execution in the current Image/Konva path was not demonstrated**. Straight script/event-handler/foreignObject cases were removed and no uploaded script ran. Use parser-based allowlisting appropriate to SVG image use rather than assuming regex coverage.

## P3-07 — P2: Overlap diagnostics report a false clean result

Reproduce: inspect the generated tee. Geometry overlap helper finds overlapping charts, while readiness diagnostics always return an empty warning list.

Cause: `inspectModelForCustomization` allocates `overlapWarnings` but never inspects geometry or populates it. UI UV presence/compatibility badges therefore do not establish artwork isolation.

Module: `engine/customization/zone-mapper.ts`. [Failing regression](phase3/raw/regressions.log).

## P3-08 — P2: Star position differs between editor and baked texture

Reproduce: load a tee; add a default Star; deselect it to remove transformer handles; compare exact green artwork-pixel bounds in the editor canvas and actual mesh texture.

Actual normalized 1024-space editor bounds: `(212.992,204.8)` to `(485.376,466.944)`. Actual texture bounds: `(361,354)` to `(638,617)`. Position shifts approximately half the 300px layer size.

Cause: round shapes use center-origin positioning in Konva while the compositor adds half the layer dimensions before drawing. Modules: `components/customizer/artwork-canvas.tsx`, `engine/customization/texture-composer.ts`.

Evidence: [raw pixel bounds](phase3/raw/star-coordinate-comparison.json), [screenshot](phase3/screenshots/star-coordinate-comparison.png), [retained regression](phase3/pointer-settled/browser-results.json).

## Architectural correction

Correct isolation requires preserving imported UV/material metadata, authoring non-overlapping printable catalog surfaces, mapping zone targets to specific material slots, and baking each intended surface/material with its original base maps. Material factors, alpha/color-space handling, resource disposal, history/persistence and BlackBullet region metadata must use the same contract. This is a coordinated architecture correction; a blanket per-mesh map assignment or cosmetic warning is insufficient.

Preserved regressions: `tests/qa/phase3-regressions.test.mjs`, `tests/qa/browser/phase3*.spec.mjs`. No assertions were weakened to mark a defective feature passing; superseded selector failures and readiness corrections are documented separately.
