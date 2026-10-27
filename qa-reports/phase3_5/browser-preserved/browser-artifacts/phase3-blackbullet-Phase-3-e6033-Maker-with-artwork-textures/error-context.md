# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-blackbullet.spec.mjs >> Phase 3 customized export reimports into Model Maker with artwork textures
- Location: tests\qa\browser\phase3-blackbullet.spec.mjs:89:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 4
Received length: 6
Received array:  [{"attributes": {"normal": {"count": 96, "hash": 945753157}, "position": {"count": 96, "hash": 3566146501}, "uv": {"count": 96, "hash": 2801306053}}, "groups": [], "materials": [{"color": "ffffff", "linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [24, 24, 27, 255], "colorSpace": "srgb", "corner": [24, 24, 27, 255], "flipY": false, "hash": 507609477, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Main", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 96, "hash": 2227277637}, "position": {"count": 96, "hash": 3049144261}, "uv": {"count": 96, "hash": 993221189}}, "groups": [], "materials": [{"color": "ffffff", "linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [24, 24, 27, 255], "colorSpace": "srgb", "corner": [24, 24, 27, 255], "flipY": false, "hash": 1287445253, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Back", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 192, "hash": 3761369797}, "position": {"count": 192, "hash": 1775614405}, "uv": {"count": 192, "hash": 3978594501}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Sides", "triangles": 64, "vertices": 192}, {"attributes": {"normal": {"count": 148, "hash": 486780061}, "position": {"count": 148, "hash": 1711725525}, "uv": {"count": 148, "hash": 4024721453}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Collar_Rib", "triangles": 96, "vertices": 148}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 353432229}, "uv": {"count": 24, "hash": 317408261}}, "groups": [], "materials": [{"color": "ffffff", "linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [16, 185, 129, 255], "colorSpace": "srgb", "corner": [24, 24, 27, 255], "flipY": false, "hash": 474133445, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [0.9800665778412416, 0.19866933079506124, 0, 0, -0.19866933079506124, 0.9800665778412416, 0, 0, 0, 0, …], "name": "Sleeve_Left", "triangles": 12, "vertices": 24}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 353432229}, "uv": {"count": 24, "hash": 317408261}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [0.9800665778412416, -0.19866933079506124, 0, 0, 0.19866933079506124, 0.9800665778412416, 0, 0, 0, 0, …], "name": "Sleeve_Right", "triangles": 12, "vertices": 24}]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e11]:
          - text: 3D Model Maker
          - generic [ref=e12]: STUDIO
        - generic [ref=e13]:
          - button "File" [ref=e14] [cursor=pointer]
          - button "Edit" [ref=e15] [cursor=pointer]
          - button "Add" [ref=e16] [cursor=pointer]
          - button "View" [ref=e17] [cursor=pointer]
          - button "Tools" [ref=e18] [cursor=pointer]
        - generic [ref=e19]:
          - button "Undo (Ctrl+Z)" [disabled]
          - button "Redo (Ctrl+Y)" [disabled]
      - generic [ref=e20]:
        - button "3D Studio" [ref=e21] [cursor=pointer]
        - button "Customizer" [ref=e26] [cursor=pointer]
        - button "AI Generator" [ref=e30] [cursor=pointer]
        - button "UV Lab" [ref=e35] [cursor=pointer]
        - button "Validator" [ref=e39] [cursor=pointer]
      - generic [ref=e44]:
        - button "Save" [ref=e45]
        - button "Import" [ref=e46]
        - button "Export GLB" [ref=e47] [cursor=pointer]
    - generic [ref=e49]:
      - generic [ref=e50]:
        - generic [ref=e51]:
          - button "3D Modeling Studio" [ref=e52]
          - generic [ref=e54]: blackbullet-test-1024other
        - generic [ref=e59]:
          - generic [ref=e60]:
            - button "Undo (Ctrl+Z)" [disabled]
            - button "Redo (Ctrl+Y)" [disabled]
          - button "Save Project" [ref=e61]
          - button "Export GLB" [ref=e62]
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - button "Artwork" [ref=e66]
            - button "Layers" [ref=e70]
            - button "Zones" [ref=e75]
            - button "Library" [active] [ref=e79]
          - generic [ref=e86]:
            - generic [ref=e87]:
              - text: Upload Artwork
              - button "Upload Image or SVG" [ref=e88]
            - generic [ref=e89]:
              - text: Typography
              - generic [ref=e90]:
                - textbox "Text to add..." [ref=e91]: CUSTOM TEXT
                - button [ref=e92]
            - generic [ref=e93]:
              - text: Add Shape
              - generic [ref=e94]:
                - button "Rectangle" [ref=e95]
                - button "Circle" [ref=e98]
                - button "Star" [ref=e101]
                - button "Triangle" [ref=e104]
        - generic [ref=e107]:
          - generic [ref=e108]:
            - button "Split View (2D + 3D)" [ref=e109]
            - button "2D Design Canvas" [ref=e110]
            - button "3D Product Preview" [ref=e111]
          - generic [ref=e112]:
            - generic [ref=e113]: "Active Zone: Body_Main | Canvas: 1024x1024px"
            - generic [ref=e120]:
              - generic:
                - generic [ref=e121]:
                  - button "Object Mode [Tab]" [ref=e122] [cursor=pointer]:
                    - generic [ref=e126]: Object Mode
                    - generic [ref=e127]: "[Tab]"
                  - button [ref=e129] [cursor=pointer]
                  - button [ref=e133] [cursor=pointer]
                  - button [ref=e139] [cursor=pointer]
                  - button [ref=e143] [cursor=pointer]
                  - button "world" [ref=e150]
                - generic [ref=e151]:
                  - button "solid" [ref=e152] [cursor=pointer]
                  - button [ref=e158] [cursor=pointer]
                  - button [ref=e164] [cursor=pointer]
                  - button [ref=e169] [cursor=pointer]
                  - button [ref=e172] [cursor=pointer]
          - generic [ref=e183]:
            - generic [ref=e184]:
              - button "perspective" [ref=e185]
              - button "front" [ref=e186]
              - button "back" [ref=e187]
              - button "left" [ref=e188]
              - button "right" [ref=e189]
              - button "top" [ref=e190]
              - button "Fit Product" [ref=e191]
              - button "Reset Camera" [ref=e192]
            - generic [ref=e193]:
              - button "neutral" [ref=e200]
              - button "soft white" [ref=e201]
              - button "dark" [ref=e202]
              - button "warm" [ref=e203]
            - button "Screenshot" [ref=e204]
        - generic [ref=e205]:
          - generic [ref=e206]:
            - button "Layer Inspector" [ref=e207]
            - button "Material & Finish" [ref=e209]
          - generic [ref=e217]:
            - paragraph [ref=e219]: No Layer Selected
            - paragraph [ref=e220]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e221]:
        - generic [ref=e222]:
          - generic [ref=e223]:
            - generic [ref=e224]: "Zone:"
            - generic [ref=e225]: Body_Main
          - generic [ref=e226]:
            - generic [ref=e227]: "Bake Resolution:"
            - generic [ref=e228]: 1024 x 1024
          - generic [ref=e229]:
            - generic [ref=e230]: "UV Status:"
            - generic [ref=e231]: Review required
        - 'generic "Body_Sides / Body_Sides: Artwork can affect another surface. 256 positive-area UV intersections (0 mirrored); shared edges alone are excluded. Collar_Rib / Collar_Rib: Artwork can affect another surface. 872 positive-area UV intersections (0 mirrored); shared edges alone are excluded." [ref=e236]': "Body_Sides / Body_Sides: Artwork can affect another surface. 256 positive-area UV intersections (0 mirrored); shared edges alone are excluded."
    - contentinfo [ref=e237]:
      - generic [ref=e238]:
        - generic [ref=e239]: TShirt_Product
        - generic [ref=e243]: Saved
      - generic [ref=e247]:
        - generic "Total Scene Vertices" [ref=e248]:
          - generic [ref=e249]: "Verts:"
          - generic [ref=e250]: "580"
        - generic "Total Scene Triangles / Polygons" [ref=e252]:
          - generic [ref=e253]: "Tris:"
          - generic [ref=e254]: "248"
        - generic "Total Mesh Objects" [ref=e256]: "6"
        - generic "Total PBR Materials" [ref=e262]: "7"
        - generic "Render Viewport FPS" [ref=e271]: 2 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e280] [cursor=pointer]
  - alert [ref=e284]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { readFile } from 'node:fs/promises'
  3   | import { directory, setup, open, record, scene } from '../../../scripts/qa/phase3-support.mjs'
  4   | 
  5   | async function observe(page) {
  6   |   await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  7   |   await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async route => {
  8   |     const response = await route.fetch(), source = await response.text()
  9   |     expect(source).toContain('return record.mesh.material;')
  10  |     await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  11  |   })
  12  | }
  13  | async function trace(page) {
  14  |   return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => ({
  15  |     name: mesh.name, partId, matrix: mesh.matrixWorld.toArray(),
  16  |     attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attr]) => [name, { count: attr.count, first: Array.from(attr.array).slice(0, 12) }])),
  17  |     materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  18  |       const image = material.map?.image
  19  |       let texture
  20  |       if (image?.width) {
  21  |         const c = document.createElement('canvas'); c.width = image.width; c.height = image.height
  22  |         const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0)
  23  |         const data = ctx.getImageData(0, 0, c.width, c.height).data
  24  |         let hash = 2166136261; for (const v of data) hash = Math.imul(hash ^ v, 16777619)
  25  |         texture = { width: c.width, height: c.height, hash: hash >>> 0, center: Array.from(ctx.getImageData(c.width / 2, c.height / 2, 1, 1).data), flipY: material.map.flipY }
  26  |       }
  27  |       return { type: material.type, linear: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, texture, normalMap: !!material.normalMap }
  28  |     })
  29  |   })))
  30  | }
  31  | 
  32  | test('Phase 3 newly customized Model Maker GLB in actual BlackBullet imported and runtime modes', async ({ page }) => {
  33  |   test.setTimeout(150000); page.setDefaultTimeout(15000)
  34  |   const events = await setup(page)
  35  |   const file = `${directory}/exports/blackbullet-test-1024.glb`
  36  |   await readFile(file)
  37  |   await observe(page)
  38  |   let routed = 0
  39  |   await page.route('**/src/assets/modals/raglan_shirt.glb', route => { routed++; return route.fulfill({ path: file, contentType: 'model/gltf-binary' }) })
  40  |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  41  |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size)).toBeGreaterThan(0)
  42  |   await page.waitForTimeout(1000)
  43  |   const imported = await trace(page)
  44  |   await record('blackbullet-imported', { routed, imported, events })
  45  |   for (const view of ['Front', 'Back', 'Left', 'Right']) {
  46  |     const control = page.getByRole('button', { name: `${view} view`, exact: true })
  47  |     if (await control.count()) { await control.click(); await page.waitForTimeout(500) }
  48  |     await page.screenshot({ path: `${directory}/screenshots/blackbullet-${view.toLowerCase()}.png` })
  49  |   }
  50  |   await page.getByLabel('Garment appearance').selectOption('runtime')
  51  |   const runtime = await trace(page)
  52  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-runtime.png` })
  53  |   await page.getByLabel('Garment appearance').selectOption('imported')
  54  |   const restored = await trace(page)
  55  |   await record('blackbullet-modes', { routed, imported, runtime, restored, events })
  56  |   expect.soft(routed).toBe(1)
  57  |   expect.soft(imported).toHaveLength(4)
  58  |   expect.soft(restored.map(({ matrix, ...entry }) => entry)).toEqual(imported.map(({ matrix, ...entry }) => entry))
  59  |   expect.soft(events.errors).toEqual([])
  60  |   expect.soft(imported.filter(m => m.partId === 'shirt_front'), 'exported product must resolve a runtime front region').toHaveLength(1)
  61  |   expect.soft(imported.filter(m => m.partId === 'shirt_back'), 'exported product must resolve a runtime back region').toHaveLength(1)
  62  | })
  63  | 
  64  | test('Phase 3 UV-ready customized multipart export supports both BlackBullet appearance modes', async ({ page }) => {
  65  |   test.setTimeout(120000); page.setDefaultTimeout(15000)
  66  |   const events = await setup(page)
  67  |   await observe(page)
  68  |   await page.route('**/src/assets/modals/raglan_shirt.glb', route => route.fulfill({ path: `${directory}/exports/durable-reopened.glb`, contentType: 'model/gltf-binary' }))
  69  |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  70  |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(12)
  71  |   await page.waitForTimeout(1000)
  72  |   const imported = await trace(page)
  73  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-imported.png` })
  74  |   await page.getByLabel('Garment appearance').selectOption('runtime')
  75  |   await page.getByLabel('HEX Code', { exact: true }).fill('#224466')
  76  |   await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  77  |   await page.getByRole('button', { name: 'Text', exact: true }).click()
  78  |   await page.locator('#custom-text').fill('RUNTIME QA')
  79  |   await page.getByRole('button', { name: 'Add text', exact: true }).click()
  80  |   await page.waitForTimeout(1000)
  81  |   const runtime = await trace(page)
  82  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-runtime.png` })
  83  |   await record('blackbullet-multipart', { imported, runtime, events })
  84  |   expect.soft(imported.every(m => m.materials[0].texture?.width === 1024)).toBe(true)
  85  |   expect.soft(runtime.find(m => m.partId === 'shirt_front')?.materials[0].linear).toEqual([1, 1, 1])
  86  |   expect.soft(events.errors).toEqual([])
  87  | })
  88  | 
  89  | test('Phase 3 customized export reimports into Model Maker with artwork textures', async ({ page }) => {
  90  |   test.setTimeout(90000); page.setDefaultTimeout(15000)
  91  |   const events = await setup(page)
  92  |   await open(page)
  93  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  94  |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/blackbullet-test-1024.glb`)
  95  |   await page.getByText(/Successfully imported/).waitFor()
  96  |   await page.waitForTimeout(1400)
  97  |   const actual = await scene(page)
  98  |   await record('customized-reimport', { actual, events })
  99  |   await page.screenshot({ path: `${directory}/screenshots/customized-reimport.png` })
> 100 |   expect.soft(actual.meshes).toHaveLength(4)
      |                              ^ Error: expect(received).toHaveLength(expected)
  101 |   expect.soft(new Set(actual.meshes.map(m => m.materials[0].texture?.hash)).size).toBeGreaterThan(1)
  102 | })
  103 | 
```