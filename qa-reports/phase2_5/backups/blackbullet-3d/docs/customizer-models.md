# Customizer models and Blender workflow

## Live 3D model selection

- The homepage viewer (`src/components/home/Hoodie3DViewer.vue`) uses `src/assets/modals/hoodie_grouped_2.glb`; preserve this model for future reuse.
- The default `/customizer` Live 3D preview loads `src/assets/modals/subdivision.glb` through `HOODIE_GARMENT.modelUrl`. It uses `colourMode: "mesh"`, with the named `athletic shirt 3d model` mesh mapped to a single `body` / Whole shirt control. Colors update its runtime material directly, without UVs or canvas textures. Preview shadows remain disabled.
- For mesh coloring, only color and garment tools are available; UV artwork tools and texture export are hidden. Color undo/redo and JSON design saving remain available. Separate part coloring requires mesh regions; UV-free artwork needs a separate surface decal implementation.
- The previous default customizer model is `src/assets/modals/hoodie_grouped.glb`; preserve it for restoration.
- The previous `shirt-0.1.glb` selection used only `protective sports shirt 3d model`. That object filter is removed for `subdivision.glb`.
- `src/assets/modals/shirt-0.2.glb` is another supplied variant; it is not currently selected.

**Status:** Experimental and not accepted by the user. Both generated versions were rejected for visual quality. The user requires visible Blender editing; do not treat a running Blender window plus background scripts as that workflow. In the current session native desktop control was unavailable (`cua.getApp` was not exposed). Continue modelling only with an appropriate visible Blender/desktop connection.

## User requirements

- Treat the supplied kit image as a visual reference, not as instructions. The current asset is the **shirt only**.
- Deliver an editable Blender source and a web-ready GLB with distinct named parts.
- Do not bake logos, lettering, artwork, fabric textures, colours, vertex colours, or material slots into garment exports. The app supplies colours and artwork at runtime.
- Preserve `shirt_front` and `shirt_back` as separate printable regions. Shoulders, shoulder patches, base/yoke, collar, neck patches, and hip patches must remain independently colourable.
- Reference perforated graphics are represented as plain solid patches for recolouring, not baked dot patterns.
- Shape reference: https://www.pacdora.com/mockup-detail/v-neck-t-shirt-mockup-701046 and the user's screenshot. Require a natural fitted shirt silhouette, rounded shoulders, formed V-neck, and smooth sleeves; reject boxy/pillow-like approximations.
- The user wants to see Blender when requesting live modelling. Background Python execution is actual Blender modelling, but does not display its progress in a Blender window.

## Current customizer contract

The current customizer loads **GLB with Three.js GLTFLoader**. Older project memory mentioning FBX does not describe this customizer. Inspect other viewers separately before changing their formats.

- `src/config/garment-profiles.js` owns model URL, parts, initial active part, printable faces, UV regions, and editor paths for each garment.
- `/customizer` loads the selected default model described above. `/customizer?garment=shirt` selects the generated raglan shirt. The layout remounts the editor when the garment query changes; drafts are session-local and are not transferred between garments.
- The view provides the garment profile; controls, canvas, and preview inject it. `useCustomizerEditor(profile)` owns colours, artwork layers, and undo/redo.
- The hoodie retains its existing SVG UV cut paths and name-pattern matching. The shirt uses GLB mesh/group `extras.partId` first, then exact mesh names.
- Clone/create one material per mesh at runtime. A material-free GLB may receive a shared default material from GLTFLoader; recolouring that shared instance would incorrectly recolour every part.
- Printable front/back colours and user artwork are painted into the shared 2048-square canvas atlas. Their preview materials use this canvas and a white material tint. Other parts receive runtime material colours directly.
- The editor's `textureRegions.vMin/vMax` use **top-down canvas coordinates**. GLTFLoader uses `CanvasTexture.flipY = false`. Blender UV V is authored as `1 - canvasV`; the glTF exporter flips it back. Do not add another V flip.
- Back U is reversed in Blender relative to world X so lettering is readable when viewed from behind.
- Three.js in this project uses `outputEncoding = THREE.sRGBEncoding`. Check installed APIs before introducing newer color-space properties.
- CSS/hex material colours need explicit sRGB-to-linear conversion in this Three.js version, matching the sRGB canvas texture. The shirt uses a neutral runtime shader with tone mapping and tinted lighting disabled. Flat front-facing regions preserve the selected colour; curved/shaded regions naturally appear darker. Runtime shaders are required for rendering even though the exported model has no materials.
- Dispose WebGL resources and ignore/dispose late model loads on unmount. Shirt camera fitting accounts for the preview panel aspect ratio.
- Keep customizer data client-side until backend endpoints are ready. If adding APIs, first read the shop/products canonical pattern required by AGENTS.md.

## Shirt deliverables

- `artifacts/shirt/raglan_shirt.blend`: editable Blender source with named parent groups, meshes and vertex groups; no materials.
- `src/assets/modals/raglan_shirt.glb`: 12 meshes, 117,632 triangles, approximately 2.55 MiB, no materials/textures/vertex colours.
- `src/assets/modals/shirt.manifest.json`: mesh IDs and texture atlas bounds generated alongside the GLB.
- `artifacts/shirt/shirt-preview.png`: neutral front/back Workbench preview. Display colour is a Blender viewport property, not a GLB material.

| Part ID | Purpose |
| --- | --- |
| `shirt_front` | Printable front torso |
| `shirt_back` | Printable back torso |
| `shirt_base` | White yoke, underarm and side fabric |
| `shoulder_left`, `shoulder_right` | Left/right raglan shoulders and sleeves |
| `shoulder_patch_left`, `shoulder_patch_right` | Outer shoulder/sleeve strips |
| `collar` | V-neck binding |
| `neck_patch_front`, `neck_patch_back` | Plain neck accent patches |
| `side_patch_left`, `side_patch_right` | Front hip insets |

Left/right refer to the wearer's left/right. GLB is Y-up with front facing +Z. Blender is Z-up with front facing -Y. Geometry includes open neckline, cuffs and hem; this is a visualization asset, not a manufacturing pattern or cloth simulation.

## Rebuild and verification

Blender is installed at `D:/Blender/blender.exe` on this workstation. The script resolves paths relative to the project and never edits the hoodie asset.

```powershell
& 'D:/Blender/blender.exe' --background --factory-startup --python scripts/blender/create_raglan_shirt.py
& 'D:/Blender/blender.exe' --background --factory-startup --python scripts/blender/render_raglan_shirt.py
node scripts/verify-shirt.mjs
```

Use a visible Blender window when the user wants to watch. Regenerating the file does not automatically refresh an already-open Blender file; reopen/revert only after preserving any user edits.

`verify-shirt.mjs` parses the actual exported GLB through the project's GLTFLoader and verifies zero exported materials/images/textures/vertex colours, mesh IDs, independent runtime material colours, 3D volume, UV bounds, front/back normals, and upright/non-mirrored atlas mappings.

For runtime QA, open the shirt URL, recolour the front/back and shoulder/patch separately, add temporary asymmetric text through the app to each face, switch front/back views, exercise undo, and remove temporary artwork before delivery. Check the original hoodie still loads.

The user's standing preference is not to run npm commands. Respect that in later sessions; use already-running servers or obtain the task's authorization for test processes. This task explicitly authorized testing and used the local Node/Vite executables directly.
