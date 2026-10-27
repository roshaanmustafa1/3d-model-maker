# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.mjs >> Independent Phase 3 >> catalog geometry, live textures, camera controls and resource cycles
- Location: tests\qa\browser\phase3.spec.mjs:18:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 4
Received length: 6
Received array:  [{"attributes": {"normal": {"count": 96, "hash": 945753157}, "position": {"count": 96, "hash": 3566146501}, "uv": {"count": 96, "hash": 2801306053}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Main", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 96, "hash": 2227277637}, "position": {"count": 96, "hash": 3049144261}, "uv": {"count": 96, "hash": 993221189}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Back", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 192, "hash": 3761369797}, "position": {"count": 192, "hash": 1775614405}, "uv": {"count": 192, "hash": 3978594501}}, "groups": [], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Sides", "triangles": 64, "vertices": 192}, {"attributes": {"normal": {"count": 148, "hash": 486780061}, "position": {"count": 148, "hash": 1711725525}, "uv": {"count": 148, "hash": 4024721453}}, "groups": [{"count": 144, "materialIndex": 0, "start": 0}, {"count": 72, "materialIndex": 1, "start": 144}, {"count": 72, "materialIndex": 2, "start": 216}], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Collar_Rib", "triangles": 96, "vertices": 148}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 353432229}, "uv": {"count": 24, "hash": 317408261}}, "groups": [{"count": 6, "materialIndex": 0, "start": 0}, {"count": 6, "materialIndex": 1, "start": 6}, {"count": 6, "materialIndex": 2, "start": 12}, {"count": 6, "materialIndex": 3, "start": 18}, {"count": 6, "materialIndex": 4, "start": 24}, {"count": 6, "materialIndex": 5, "start": 30}], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [0.9800665778412416, 0.19866933079506124, 0, 0, -0.19866933079506124, 0.9800665778412416, 0, 0, 0, 0, …], "name": "Sleeve_Left", "triangles": 12, "vertices": 24}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 353432229}, "uv": {"count": 24, "hash": 317408261}}, "groups": [{"count": 6, "materialIndex": 0, "start": 0}, {"count": 6, "materialIndex": 1, "start": 6}, {"count": 6, "materialIndex": 2, "start": 12}, {"count": 6, "materialIndex": 3, "start": 18}, {"count": 6, "materialIndex": 4, "start": 24}, {"count": 6, "materialIndex": 5, "start": 30}], "materials": [{"color": "18181b", "linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [0.9800665778412416, -0.19866933079506124, 0, 0, 0.19866933079506124, 0.9800665778412416, 0, 0, 0, 0, …], "name": "Sleeve_Right", "triangles": 12, "vertices": 24}]
```

```
Error: expect(received).toHaveLength(expected)

Expected length: 5
Received length: 7
Received array:  [{"attributes": {"normal": {"count": 96, "hash": 945753157}, "position": {"count": 96, "hash": 4060727749}, "uv": {"count": 96, "hash": 2801306053}}, "groups": [], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Main", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 96, "hash": 2227277637}, "position": {"count": 96, "hash": 1229669829}, "uv": {"count": 96, "hash": 993221189}}, "groups": [], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Back", "triangles": 32, "vertices": 96}, {"attributes": {"normal": {"count": 192, "hash": 3761369797}, "position": {"count": 192, "hash": 2137202949}, "uv": {"count": 192, "hash": 3978594501}}, "groups": [], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Body_Sides", "triangles": 64, "vertices": 192}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 3122472997}, "uv": {"count": 24, "hash": 317408261}}, "groups": [{"count": 6, "materialIndex": 0, "start": 0}, {"count": 6, "materialIndex": 1, "start": 6}, {"count": 6, "materialIndex": 2, "start": 12}, {"count": 6, "materialIndex": 3, "start": 18}, {"count": 6, "materialIndex": 4, "start": 24}, {"count": 6, "materialIndex": 5, "start": 30}], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, …], "name": "Pocket_Pouch", "triangles": 12, "vertices": 24}, {"attributes": {"normal": {"count": 289, "hash": 1686133457}, "position": {"count": 289, "hash": 2561907639}, "uv": {"count": 289, "hash": 2738206625}}, "groups": [], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, …], "name": "Hood", "triangles": 480, "vertices": 289}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 2673144485}, "uv": {"count": 24, "hash": 317408261}}, "groups": [{"count": 6, "materialIndex": 0, "start": 0}, {"count": 6, "materialIndex": 1, "start": 6}, {"count": 6, "materialIndex": 2, "start": 12}, {"count": 6, "materialIndex": 3, "start": 18}, {"count": 6, "materialIndex": 4, "start": 24}, {"count": 6, "materialIndex": 5, "start": 30}], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [0.9689124217106447, 0.24740395925452294, 0, 0, -0.24740395925452294, 0.9689124217106447, 0, 0, 0, 0, …], "name": "Sleeve_Left", "triangles": 12, "vertices": 24}, {"attributes": {"normal": {"count": 24, "hash": 3184214117}, "position": {"count": 24, "hash": 2673144485}, "uv": {"count": 24, "hash": 317408261}}, "groups": [{"count": 6, "materialIndex": 0, "start": 0}, {"count": 6, "materialIndex": 1, "start": 6}, {"count": 6, "materialIndex": 2, "start": 12}, {"count": 6, "materialIndex": 3, "start": 18}, {"count": 6, "materialIndex": 4, "start": 24}, {"count": 6, "materialIndex": 5, "start": 30}], "materials": [{"color": "27272a", "linear": [0.02028856305209031, 0.02028856305209031, 0.023153366173251363], "metalness": 0, "normalMap": false, "roughness": 0.96, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [0.9689124217106447, -0.24740395925452294, 0, 0, 0.24740395925452294, 0.9689124217106447, 0, 0, 0, 0, …], "name": "Sleeve_Right", "triangles": 12, "vertices": 24}]
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
          - generic [ref=e54]: Insulated Thermal Bottlebottle
        - generic [ref=e59]:
          - generic [ref=e60]:
            - button "Undo (Ctrl+Z)" [ref=e61]
            - button "Redo (Ctrl+Y)" [disabled]
          - button "Save Project" [ref=e62]
          - button "Export GLB" [ref=e63]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - button "Artwork" [ref=e67]
            - button "Layers" [ref=e71]
            - button "Zones" [ref=e76]
            - button "Library" [ref=e80]
          - generic [ref=e87]:
            - generic [ref=e88]:
              - text: Upload Artwork
              - button "Upload Image or SVG" [ref=e89]
            - generic [ref=e90]:
              - text: Typography
              - generic [ref=e91]:
                - textbox "Text to add..." [ref=e92]: CUSTOM TEXT
                - button [ref=e93]
            - generic [ref=e94]:
              - text: Add Shape
              - generic [ref=e95]:
                - button "Rectangle" [ref=e96]
                - button "Circle" [ref=e99]
                - button "Star" [ref=e102]
                - button "Triangle" [ref=e105]
        - generic [ref=e108]:
          - generic [ref=e109]:
            - button "Split View (2D + 3D)" [ref=e110]
            - button "2D Design Canvas" [ref=e111]
            - button "3D Product Preview" [ref=e112]
          - generic [ref=e113]:
            - generic [ref=e114]: "Active Zone: Full Body Wrap | Canvas: 1024x1024px"
            - generic [ref=e121]:
              - generic:
                - generic [ref=e122]:
                  - button "Object Mode [Tab]" [ref=e123] [cursor=pointer]:
                    - generic [ref=e127]: Object Mode
                    - generic [ref=e128]: "[Tab]"
                  - button [ref=e130] [cursor=pointer]
                  - button [ref=e134] [cursor=pointer]
                  - button [ref=e140] [cursor=pointer]
                  - button [ref=e144] [cursor=pointer]
                  - button "world" [ref=e151]
                - generic [ref=e152]:
                  - button "solid" [ref=e153] [cursor=pointer]
                  - button [ref=e159] [cursor=pointer]
                  - button [ref=e165] [cursor=pointer]
                  - button [ref=e170] [cursor=pointer]
                  - button [ref=e173] [cursor=pointer]
          - generic [ref=e184]:
            - generic [ref=e185]:
              - button "perspective" [ref=e186]
              - button "front" [ref=e187]
              - button "back" [ref=e188]
              - button "left" [ref=e189]
              - button "right" [active] [ref=e190]
              - button "top" [ref=e191]
              - button "Fit Product" [ref=e192]
              - button "Reset Camera" [ref=e193]
            - generic [ref=e194]:
              - button "neutral" [ref=e201]
              - button "soft white" [ref=e202]
              - button "dark" [ref=e203]
              - button "warm" [ref=e204]
            - button "Screenshot" [ref=e205]
        - generic [ref=e206]:
          - generic [ref=e207]:
            - button "Layer Inspector" [ref=e208]
            - button "Material & Finish" [ref=e210]
          - generic [ref=e218]:
            - generic [ref=e219]:
              - generic [ref=e220]: Layer Properties
              - generic [ref=e221]: shape
            - generic [ref=e222]:
              - text: Position & Dimensions
              - generic [ref=e223]:
                - generic [ref=e224]:
                  - generic [ref=e225]: X
                  - spinbutton [ref=e226]: "350"
                - generic [ref=e227]:
                  - generic [ref=e228]: "Y"
                  - spinbutton [ref=e229]: "350"
                - generic [ref=e230]:
                  - generic [ref=e231]: W
                  - spinbutton [ref=e232]: "300"
                - generic [ref=e233]:
                  - generic [ref=e234]: H
                  - spinbutton [ref=e235]: "300"
            - generic [ref=e236]:
              - generic [ref=e237]: "Rotation: 0°"
              - slider [ref=e239] [cursor=pointer]: "0"
              - generic [ref=e240]: "Opacity: 100%"
              - slider [ref=e242] [cursor=pointer]: "1"
            - generic [ref=e243]:
              - text: Shape Styling
              - generic [ref=e244]:
                - generic [ref=e245]: Fill Color
                - textbox [ref=e246] [cursor=pointer]: "#10b981"
              - generic [ref=e247]:
                - generic [ref=e248]: Stroke Color
                - textbox [ref=e249] [cursor=pointer]: "#ffffff"
              - generic [ref=e250]:
                - generic [ref=e251]:
                  - generic [ref=e252]: Stroke Width
                  - generic [ref=e253]: 2px
                - slider [ref=e254] [cursor=pointer]: "2"
      - generic [ref=e255]:
        - generic [ref=e256]:
          - generic [ref=e257]:
            - generic [ref=e258]: "Zone:"
            - generic [ref=e259]: Full Body Wrap
          - generic [ref=e260]:
            - generic [ref=e261]: "Bake Resolution:"
            - generic [ref=e262]: 1024 x 1024
          - generic [ref=e263]:
            - generic [ref=e264]: "UV Status:"
            - generic [ref=e265]: Mapped
        - generic [ref=e269]: UV targets verified
    - contentinfo [ref=e271]:
      - generic [ref=e272]:
        - generic [ref=e273]: WaterBottle_Product
        - generic [ref=e277]: Saved
      - generic [ref=e281]:
        - generic "Total Scene Vertices" [ref=e282]:
          - generic [ref=e283]: "Verts:"
          - generic [ref=e284]: "588"
        - generic "Total Scene Triangles / Polygons" [ref=e286]:
          - generic [ref=e287]: "Tris:"
          - generic [ref=e288]: "384"
        - generic "Total Mesh Objects" [ref=e290]: "3"
        - generic "Total PBR Materials" [ref=e296]: "3"
        - generic "Render Viewport FPS" [ref=e305]: 4 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e314] [cursor=pointer]
  - alert [ref=e318]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { directory, setup, open, product, zone, save, scene, record, exportProduct, inspectGLB } from '../../../scripts/qa/phase3-support.mjs'
  3   | 
  4   | test.describe('Independent Phase 3', () => {
  5   |   test.setTimeout(180000)
  6   |   test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })
  7   | 
  8   |   test('workspace initialization corresponds to selected product', async ({ page }) => {
  9   |     const events = await setup(page)
  10  |     await open(page)
  11  |     await page.waitForTimeout(2000)
  12  |     const actual = await scene(page)
  13  |     await record('initial-workspace', { actual, events })
  14  |     await page.screenshot({ path: `${directory}/screenshots/initial-workspace.png` })
  15  |     expect(actual.meshes.some(mesh => mesh.name === 'Body_Main')).toBe(true)
  16  |   })
  17  | 
  18  |   test('catalog geometry, live textures, camera controls and resource cycles', async ({ page }) => {
  19  |     const events = await setup(page)
  20  |     await open(page)
  21  |     const cycles = []
  22  |     for (const name of ['Streetwear Oversized Tee', 'Heavyweight Streetwear Hoodie', 'Insulated Thermal Bottle', 'Luxury Retail Box', 'Streetwear Oversized Tee', 'Insulated Thermal Bottle']) {
  23  |       const started = Date.now()
  24  |       await product(page, name)
  25  |       const loaded = await scene(page)
  26  |       await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  27  |       await page.getByTitle('Rectangle', { exact: true }).click()
  28  |       await page.waitForTimeout(1400)
  29  |       const artwork = await scene(page)
  30  |       const views = []
  31  |       for (const view of ['Front', 'Back', 'Left', 'Right']) {
  32  |         await page.getByRole('button', { name: new RegExp(`^${view}$`, 'i') }).click()
  33  |         await page.waitForTimeout(450)
  34  |         views.push({ view, camera: (await scene(page)).camera })
  35  |       }
  36  |       const fps = await page.evaluate(() => new Promise(resolve => {
  37  |         let count = 0, start = performance.now()
  38  |         function tick(now) { count++; if (now - start < 1200) requestAnimationFrame(tick); else resolve({ frames: count, durationMs: now - start, fps: count * 1000 / (now - start) }) }
  39  |         requestAnimationFrame(tick)
  40  |       }))
  41  |       cycles.push({ name, durationMs: Date.now() - started, loaded, artwork, views, fps })
  42  |       await page.screenshot({ path: `${directory}/screenshots/catalog-${cycles.length}.png` })
  43  |       await record('catalog-cycles', { cycles, events })
  44  |     }
  45  |     expect.soft(cycles[0].loaded.meshes).toHaveLength(4)
> 46  |     expect.soft(cycles[1].loaded.meshes).toHaveLength(5)
      |                                          ^ Error: expect(received).toHaveLength(expected)
  47  |     expect.soft(cycles[2].loaded.meshes).toHaveLength(3)
  48  |     expect.soft(new Set(cycles[0].views.map(v => JSON.stringify(v.camera))).size, 'camera presets must actually move camera').toBeGreaterThan(1)
  49  |     expect.soft(cycles[0].artwork.meshes[0].materials[0].texture?.hash, 'artwork must reach real mesh').not.toBe(cycles[0].loaded.meshes[0].materials[0].texture?.hash)
  50  |   })
  51  | 
  52  |   test('real artwork controls, durable layers, UV isolation, export resolutions and BlackBullet', async ({ page }) => {
  53  |     test.setTimeout(300000)
  54  |     const events = await setup(page)
  55  |     await open(page)
  56  |     await product(page, 'Streetwear Oversized Tee')
  57  |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  58  |     const png = await page.evaluate(() => {
  59  |       const c = document.createElement('canvas'); c.width = 64; c.height = 64
  60  |       const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 64); ctx.fillStyle = '#0000ff'; ctx.fillRect(32, 0, 32, 64)
  61  |       return c.toDataURL()
  62  |     })
  63  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'qa-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  64  |     await page.getByPlaceholder('Text to add...').fill('FRONT MARK')
  65  |     await page.getByPlaceholder('Text to add...').press('Enter')
  66  |     await page.getByTitle('Rectangle', { exact: true }).click()
  67  |     const initial = await save(page)
  68  |     const transforms = page.locator('input[type=number]')
  69  |     await transforms.nth(0).fill('100'); await transforms.nth(0).press('Tab')
  70  |     await transforms.nth(2).fill('220'); await transforms.nth(2).press('Tab')
  71  |     await page.locator('input[type=range]').nth(0).fill('45'); await page.locator('input[type=range]').nth(0).dispatchEvent('mouseup')
  72  |     await page.locator('input[type=range]').nth(1).fill('0.5'); await page.locator('input[type=range]').nth(1).dispatchEvent('mouseup')
  73  |     await page.getByRole('button', { name: 'Layers', exact: true }).click()
  74  |     await page.getByTitle('Duplicate layer', { exact: true }).first().click()
  75  |     await page.getByTitle('Lock layer', { exact: true }).first().click()
  76  |     await page.getByTitle('Unlock layer', { exact: true }).first().click()
  77  |     await page.getByTitle('Hide layer', { exact: true }).first().click()
  78  |     await page.getByTitle('Show layer', { exact: true }).first().click()
  79  |     await page.getByTitle('Delete layer', { exact: true }).first().click()
  80  |     const edited = await save(page)
  81  |     await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).last().click()
  82  |     const undone = await save(page)
  83  |     await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).last().click()
  84  |     const redone = await save(page)
  85  |     await zone(page, 'Back Center')
  86  |     await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
  87  |     await page.getByPlaceholder('Text to add...').press('Enter')
  88  |     await zone(page, 'Left Sleeve')
  89  |     await page.getByTitle('Star', { exact: true }).click()
  90  |     const final = await save(page)
  91  |     const actual = await scene(page)
  92  |     await record('artwork-controls', { initial, edited, undone, redone, final, actual, events })
  93  |     await page.screenshot({ path: `${directory}/screenshots/artwork-product.png` })
  94  |     const exports = []
  95  |     for (const res of [1024, 2048, 4096]) {
  96  |       const timing = await exportProduct(page, `blackbullet-test-${res}`, res)
  97  |       exports.push({ resolution: res, timing, glb: await inspectGLB(`blackbullet-test-${res}`) })
  98  |       await record('exports', exports)
  99  |     }
  100 |     expect.soft(edited.customization.zones.body_front.layers).toHaveLength(3)
  101 |     expect.soft(redone.customization.zones).toEqual(edited.customization.zones)
  102 |     expect.soft(actual.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture?.hash, 'untouched right sleeve must not share the front/back artwork atlas').not.toBe(actual.meshes.find(m => m.name === 'Body_Main').materials[0].texture?.hash)
  103 |   })
  104 | 
  105 |   test('UV-ready multipart import preserves original albedo and PBR', async ({ page }) => {
  106 |     const events = await setup(page)
  107 |     await open(page)
  108 |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  109 |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  110 |     await page.getByText(/Successfully imported/).waitFor()
  111 |     await page.waitForTimeout(1800)
  112 |     const actual = await scene(page)
  113 |     const saved = await save(page)
  114 |     await record('multipart-import', { actual, saved, events })
  115 |     await page.screenshot({ path: `${directory}/screenshots/multipart-import.png` })
  116 |     await exportProduct(page, 'multipart-customizer')
  117 |     await inspectGLB('multipart-customizer')
  118 |     expect.soft(actual.meshes).toHaveLength(12)
  119 |     expect.soft(actual.meshes[0].materials[0].roughness).toBeCloseTo(.65)
  120 |     expect.soft(actual.meshes[0].materials[0].texture?.width).toBe(8)
  121 |   })
  122 | })
  123 | 
```