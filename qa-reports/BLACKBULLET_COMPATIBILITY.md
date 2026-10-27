# BlackBullet compatibility

## Decision: FAIL for imported material preservation

BlackBullet source and its running local customizer **were available** at the sibling `C:/Users/Roshaan's Pc/Documents/Projects/blackbullet-3d` and `http://localhost:5173/customizer`. This supersedes the earlier conversation's unavailable-source limitation.

The test used its real Vue application, Three.js r135 GLTFLoader and preview code. Playwright substituted only the binary response for `src/assets/modals/subdivision.glb` with a new exported test copy. Read-only trace statements were inserted into the served preview-material module to observe actual material creation/color calls; no BlackBullet source or assets were edited.

| Stage | Recorded result |
|---|---|
| 3D Model Maker GLB | Linear baseColorFactor corresponds to #09090B; roughness 0.65; metalness 0; opacity 1; doubleSided true |
| Fresh Model Maker reimport | #09090B, roughness 0.65, metalness 0 and DoubleSide retained |
| Actual BlackBullet preview | New MeshBasicMaterial; runtime sRGB #E5E7EB; initialization calls `setGarmentColour('#E5E7EB')` |
| User color action before observation | None |

The exact input factors, actual runtime colors, call trace and page errors are in `test-results/blackbullet-runtime.json`. The screenshot `screenshots/blackbullet-imported-black.png` shows the actual light garment after loading the black test GLB.

## Contract conflict

BlackBullet's tracked `docs/customizer-models.md` intentionally requires material-free exported garments and says the app supplies runtime colors/artwork. `garment-profiles.js` initializes the default body to #E5E7EB. `setupModel` may replace imported materials with the neutral preview material; `syncPartColours` then applies those defaults. For canvas-textured parts, a white material tint is intentional because the canvas contains the colors/artwork; this must be distinguished from losing imported appearance.

Preserving imported PBR fabric as required by this QA request needs an explicit compatibility mode or initialization change. It cannot be certified simply by changing GLTFExporter. The actual standalone GLB factors are correct.

## Standalone asset evidence

- `exported-models/black-raglan_shirt.glb`: real 12-mesh garment; material, UV, normal, hierarchy and transform round-trip passes. Actual browser front/back/left/right/top/bottom captures are under `screenshots/real-shirt-*.png`.
- `exported-models/black-subdivision.glb`: real garment retains black fabric, but the source lacks UVs, contains a degenerate triangle and has opposing normal/winding diagnostics. The validator correctly does not mark it verified.
- Scenario A cube, B multiple materials, D edited topology, E edited UVs, G transformed hierarchy and H customization metadata have real exported/reloaded evidence from the existing and independent suites. Scenario F browser image encoding and packed metallic/roughness maps is reported separately in the final browser results.
- Existing same-session cache behavior is not durable project persistence; see QA-01.

## Remaining integration checks: BLOCKED / unverified

Full artwork/decal placement on exported Model Maker assets, production catalog model registration, and all garment-specific part/atlas mappings were not executed. The default BlackBullet mesh-color mode deliberately disables artwork. Before broader certification, agree on imported-material versus runtime-color policy, provide the target garment profile/atlas and exercise both front/back artwork, independent part coloring, scale/orientation, undo, and design save/reopen. Backend/production data was not modified.

Required project files are already accessible; this is a workflow/contract and test-coverage gap, not a claim that BlackBullet source is missing.
