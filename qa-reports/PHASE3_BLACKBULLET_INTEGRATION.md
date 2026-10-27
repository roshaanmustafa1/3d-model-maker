# Phase 3 BlackBullet integration

Release decision: **FAIL**.

## Genuine workflow executed

The actual Model Maker UI created a black catalog tee with a distinguishable red/blue PNG logo, front text, back `BLACKBULLET TEST`, and a green left-sleeve star. Saved right-sleeve layer count is zero. Numeric transforms, opacity and layer operations were applied through controls, not direct store mutations.

The UI exported new 1024²/2048²/4096² GLBs plus editable JSON sidecars. Binary headers, embedded textures and geometry data were inspected. The 1024 export reimported through Model Maker's UI, then loaded in the real Vue customizer at port 5173 via a Playwright response override for `raglan_shirt.glb`. No production GLB was overwritten.

Evidence: [actual export](phase3/exports/blackbullet-test-1024.glb), [saved artwork](phase3/raw/artwork-controls.json), [binary/pixel inspection](phase3/raw/binary-audit.json), [runtime traces](phase3/raw/blackbullet-modes.json), [reimport](phase3/raw/customized-reimport.json).

## Preserve Imported Appearance

All four actual runtime meshes load the baked 1024² texture. BlackBullet's GLTFLoader uses `flipY=false`; the actual imported texture contains the green artwork center pixel `[16,185,129,255]`. Original exported linear material factors are retained. Mode restoration must compare materials/geometry independently of deliberate view rotation, since world matrices change while the garment turns.

This confirms loading, not correct product customization. All parts receive the same atlas, including the unchanged right sleeve. The exported material factor already contains a fabric tint despite the PNG containing fabric color. Baked artwork is darkened and surface isolation is incorrect before BlackBullet receives the model. BlackBullet preserving this defective export does not repair it.

Screenshots: [front](phase3/screenshots/blackbullet-front.png), [back](phase3/screenshots/blackbullet-back.png), [left](phase3/screenshots/blackbullet-left.png), [right](phase3/screenshots/blackbullet-right.png).

## Runtime Customization

The generated tee's `Body_Main` has no resolved runtime part ID and no `shirt_front`/`shirt_back` record. Runtime mode substitutes MeshBasicMaterial/white factors and removes the baked maps for this product. Existing baked artwork is therefore only retained by imported mode in the tested catalog export. These modes are not interchangeable, and runtime compatibility for this generated tee fails.

Evidence: [runtime screenshot](phase3/screenshots/blackbullet-runtime.png), [material traces](phase3/raw/blackbullet-modes.json). The established original-catalog runtime default and original multipart color/text workflow passed in the 24-test baseline.

## UV-ready multipart garment

The genuine 12-part UV-ready fixture from Phase 2.5 was also imported, customized with PNG/SVG/text/custom-zone/fabric changes, saved across a new browser process, and exported again. This is separate from the original UV-less subdivision asset. The fresh [durable export](phase3/exports/durable-reopened.glb) is exercised in the final integration suite for imported material maps and runtime color/text behavior.

Final case results: **one passed, two failed**. The genuine UV-ready multipart case passes: 12 imported meshes retain their exported 1024² maps, and runtime front color/text controls use a white material factor. The generated catalog product fails region resolution and its reimport fails surface-isolation acceptance. [BlackBullet results](phase3/blackbullet-final/browser-results.json), [multipart traces](phase3/raw/blackbullet-multipart.json), [imported screenshot](phase3/screenshots/blackbullet-multipart-imported.png), [runtime screenshot](phase3/screenshots/blackbullet-multipart-runtime.png).

The source fixture's round-trip geometry is preserved, but customizer global albedo/PBR replacement and full-atlas imported zone defaults remain defects. Success of BlackBullet's established region contract for its own garment does not certify the generated catalog tee.

## Limits

No production integration fix or source-asset editing was performed. Distinct per-part finish editing is not exposed by the global Fabric panel. Exhaustive artwork readability/orientation on every face, mirrored fixtures, arbitrary atlas layouts and every runtime material slot remain uncertified. Failed-case traces and raw logs are retained; parsing success is not a compatibility decision.
