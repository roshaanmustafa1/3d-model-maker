# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-blackbullet.spec.mjs >> Phase 3 customized export reimports into Model Maker with artwork textures
- Location: tests\qa\browser\phase3-blackbullet.spec.mjs:64:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 1
Received:   1
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
            - generic [ref=e191]:
              - button "neutral" [ref=e198]
              - button "soft white" [ref=e199]
              - button "dark" [ref=e200]
              - button "warm" [ref=e201]
            - button "Screenshot" [ref=e202]
        - generic [ref=e203]:
          - generic [ref=e204]:
            - button "Layer Inspector" [ref=e205]
            - button "Material & Finish" [ref=e207]
          - generic [ref=e215]:
            - paragraph [ref=e217]: No Layer Selected
            - paragraph [ref=e218]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e219]:
        - generic [ref=e220]:
          - generic [ref=e221]:
            - generic [ref=e222]: "Zone:"
            - generic [ref=e223]: Body_Main
          - generic [ref=e224]:
            - generic [ref=e225]: "Bake Resolution:"
            - generic [ref=e226]: 1024 x 1024
          - generic [ref=e227]:
            - generic [ref=e228]: "UV Status:"
            - generic [ref=e229]: Mapped
        - generic [ref=e233]: BlackBullet Compatible
    - contentinfo [ref=e235]:
      - generic [ref=e236]:
        - generic [ref=e237]: TShirt_Product
        - generic [ref=e241]: Saved
      - generic [ref=e245]:
        - generic "Total Scene Vertices" [ref=e246]:
          - generic [ref=e247]: "Verts:"
          - generic [ref=e248]: "306"
        - generic "Total Scene Triangles / Polygons" [ref=e250]:
          - generic [ref=e251]: "Tris:"
          - generic [ref=e252]: "248"
        - generic "Total Mesh Objects" [ref=e254]: "4"
        - generic "Total PBR Materials" [ref=e260]: "2"
        - generic "Render Viewport FPS" [ref=e269]: 2 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e278] [cursor=pointer]
  - alert [ref=e282]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { readFile } from 'node:fs/promises'
  3  | import { directory, setup, open, record, scene } from '../../../scripts/qa/phase3-support.mjs'
  4  | 
  5  | async function observe(page) {
  6  |   await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  7  |   await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async route => {
  8  |     const response = await route.fetch(), source = await response.text()
  9  |     expect(source).toContain('return record.mesh.material;')
  10 |     await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  11 |   })
  12 | }
  13 | async function trace(page) {
  14 |   return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => ({
  15 |     name: mesh.name, partId, matrix: mesh.matrixWorld.toArray(),
  16 |     attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attr]) => [name, { count: attr.count, first: Array.from(attr.array).slice(0, 12) }])),
  17 |     materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  18 |       const image = material.map?.image
  19 |       let texture
  20 |       if (image?.width) {
  21 |         const c = document.createElement('canvas'); c.width = image.width; c.height = image.height
  22 |         const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0)
  23 |         const data = ctx.getImageData(0, 0, c.width, c.height).data
  24 |         let hash = 2166136261; for (const v of data) hash = Math.imul(hash ^ v, 16777619)
  25 |         texture = { width: c.width, height: c.height, hash: hash >>> 0, center: Array.from(ctx.getImageData(c.width / 2, c.height / 2, 1, 1).data), flipY: material.map.flipY }
  26 |       }
  27 |       return { type: material.type, linear: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, texture, normalMap: !!material.normalMap }
  28 |     })
  29 |   })))
  30 | }
  31 | 
  32 | test('Phase 3 newly customized Model Maker GLB in actual BlackBullet imported and runtime modes', async ({ page }) => {
  33 |   test.setTimeout(150000); page.setDefaultTimeout(15000)
  34 |   const events = await setup(page)
  35 |   const file = `${directory}/exports/blackbullet-test-1024.glb`
  36 |   await readFile(file)
  37 |   await observe(page)
  38 |   let routed = 0
  39 |   await page.route('**/src/assets/modals/raglan_shirt.glb', route => { routed++; return route.fulfill({ path: file, contentType: 'model/gltf-binary' }) })
  40 |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  41 |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size)).toBeGreaterThan(0)
  42 |   await page.waitForTimeout(1000)
  43 |   const imported = await trace(page)
  44 |   await record('blackbullet-imported', { routed, imported, events })
  45 |   for (const view of ['Front', 'Back', 'Left', 'Right']) {
  46 |     const control = page.getByRole('button', { name: `${view} view`, exact: true })
  47 |     if (await control.count()) { await control.click(); await page.waitForTimeout(500) }
  48 |     await page.screenshot({ path: `${directory}/screenshots/blackbullet-${view.toLowerCase()}.png` })
  49 |   }
  50 |   await page.getByLabel('Garment appearance').selectOption('runtime')
  51 |   const runtime = await trace(page)
  52 |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-runtime.png` })
  53 |   await page.getByLabel('Garment appearance').selectOption('imported')
  54 |   const restored = await trace(page)
  55 |   await record('blackbullet-modes', { routed, imported, runtime, restored, events })
  56 |   expect.soft(routed).toBe(1)
  57 |   expect.soft(imported).toHaveLength(4)
  58 |   expect.soft(restored).toEqual(imported)
  59 |   expect.soft(events.errors).toEqual([])
  60 |   expect.soft(imported.filter(m => m.partId === 'shirt_front'), 'exported product must resolve a runtime front region').toHaveLength(1)
  61 |   expect.soft(imported.filter(m => m.partId === 'shirt_back'), 'exported product must resolve a runtime back region').toHaveLength(1)
  62 | })
  63 | 
  64 | test('Phase 3 customized export reimports into Model Maker with artwork textures', async ({ page }) => {
  65 |   test.setTimeout(90000); page.setDefaultTimeout(15000)
  66 |   const events = await setup(page)
  67 |   await open(page)
  68 |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  69 |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/blackbullet-test-1024.glb`)
  70 |   await page.getByText(/Successfully imported/).waitFor()
  71 |   await page.waitForTimeout(1400)
  72 |   const actual = await scene(page)
  73 |   await record('customized-reimport', { actual, events })
  74 |   await page.screenshot({ path: `${directory}/screenshots/customized-reimport.png` })
  75 |   expect.soft(actual.meshes).toHaveLength(4)
> 76 |   expect.soft(new Set(actual.meshes.map(m => m.materials[0].texture?.hash)).size).toBeGreaterThan(1)
     |                                                                                   ^ Error: expect(received).toBeGreaterThan(expected)
  77 | })
  78 | 
```