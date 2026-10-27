# Customization architecture, version 4

`editor-store.materials` and imported material resources are immutable source appearance. `customizer-store.partMaterials` contains explicit overrides keyed by `meshId:materialSlot`. `derived-material-store` owns transient preview material/CanvasTexture pairs. Derived pixels are never written back into source materials or serialized as the editable source.

Every zone has a version-1 target: product ID, mesh ID, material slot, UV channel, UV bounds, composition ID, texture orientation and optional BlackBullet region. Mesh IDs survive project serialization. GLB reimport rebinds target IDs to the imported nodes. Coincident UVs in different composition targets are safe because they receive independent materials; positive-area intersections inside one target require review. Shared edges do not count as overlaps. Registered BlackBullet part targets can declare intentional mirrored sharing within that whole part; this remains a visible warning and is allowed only when all intersections are mirrored. Unknown parts and independent-region conflicts remain blocking. Face selections require authored material separation and are rejected rather than silently painting unselected faces.

## Geometry and BlackBullet contract v1

The existing box torso is partitioned into front, back and side surfaces. Each original triangle appears exactly once. Positions, winding and normals are retained; the boundaries use identical source positions. Front and back are separate meshes/materials, not alternative labels on one overlapping surface.

The shirt contract uses BlackBullet's actual `shirt` profile: `shirt_front`, `shirt_back`, `shoulder_left`, `shoulder_right`, `collar`, `shirt_base`. Front/back UVs use the checked-in BlackBullet shirt manifest: U `.04–.46` and `.54–.96`, top-down V `.04–.94`. Zone bounds express the same region as bottom-up UV bounds. GLB extras carry `partId`, the contract version/profile and the explicit target.

Imported mode displays baked PBR appearance. Runtime mode uses BlackBullet's established front/back canvas regions and independently colored shoulder/collar/base parts. Its existing profile does not provide sleeve artwork editing: baked sleeve art is preserved in imported mode; runtime shoulder colors use the established runtime material replacement. Neither mode silently claims compatibility for unknown regions.

## Coordinates and color

Layers use top-left `(x,y)` in zone-canvas pixels, dimensions in unscaled pixels, degrees clockwise in canvas space, and scale/rotation around that origin. Circle/star local centers are offset by half their dimensions. Image, text and every shape use the same Konva node configuration for editor drawing and texture rendering, including text layout and antialiasing. Texture conversion maps the whole zone canvas into its UV rectangle and clips to that rectangle. GLTF targets use top-down image V and `flipY=false`.

For edited targets, original sRGB albedo samples are converted to linear values, multiplied by the original/overridden linear color factor, then encoded to sRGB before artwork is composited. The derived material factor becomes white, so fabric tint is applied once. Unedited targets retain their exact source material/map references and PBR settings. Normal, roughness and metalness maps remain source-owned; opacity, alpha test and side are retained.

## Persistence and ownership

IndexedDB document/asset transactions remain version 2. The embedded customization document is version 4 and includes source type, workspace, targets, overrides and durable artwork data URLs. Source geometry/materials are captured by the existing asset serializer; previews are regenerated after hydration. Version-3 zones are rebound, and center-origin circle/star positions migrate to the canonical top-left representation. Material damage already baked into a legacy Phase-3 asset cannot be reversed without its original source; migration does not invent missing source appearance.

Modeling/customizer scenes retain independent graph, material and history snapshots. Resource pruning retains inactive workspace assets. Composition owns its CanvasTextures/material clones, disposes replacement output, bounds the decoded artwork cache and never disposes source textures. Export invokes the same composition engine, PNG-encodes only for the export, and releases temporary output in `finally`.

SVG uses a strict XML parser and element/attribute allowlist. DTD/entities, executable elements, handlers, external resources and nonlocal references are rejected/removed. Uploads validate size, signatures, MIME and decoding before creating a layer. Invalid assets produce errors and leave existing layers unchanged.
