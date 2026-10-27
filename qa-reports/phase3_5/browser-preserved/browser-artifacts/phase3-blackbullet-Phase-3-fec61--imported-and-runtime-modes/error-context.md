# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-blackbullet.spec.mjs >> Phase 3 newly customized Model Maker GLB in actual BlackBullet imported and runtime modes
- Location: tests\qa\browser\phase3-blackbullet.spec.mjs:32:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 4
Received length: 6
Received array:  [{"attributes": {"normal": {"count": 192, "first": [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, …]}, "position": {"count": 192, "first": [0.6000000238418579, 0.75, 0.14000000059604645, 0.6000000238418579, 0.375, 0.14000000059604645, 0.6000000238418579, 0.75, -0, 0.6000000238418579, …]}, "uv": {"count": 192, "first": [0, 1, 0, 0.75, 0.5, 1, 0, 0.75, 0.5, 0.75, …]}}, "materials": [{"linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1.2989953931147695, 0, -0.03898155696225994, 0, 0, 1.2995801603274022, 0, 0, 0.03898155696225994, 0, …], "name": "Body_Sides", "partId": "shirt_base"}, {"attributes": {"normal": {"count": 148, "first": [0, -0.9701424837112427, 0.24253562092781067, 0.2510913610458374, -0.9370856881141663, 0.24253562092781067, 0.48507124185562134, -0.8401680588722229, 0.24253562092781067, 0.6859943270683289, …]}, "position": {"count": 148, "first": [0, -0.23999999463558197, 0.03999999910593033, 0.06211657077074051, -0.2318221926689148, 0.03999999910593033, 0.11999999731779099, -0.20784609019756317, 0.03999999910593033, 0.16970562934875488, …]}, "uv": {"count": 148, "first": [0, 1, 0.0416666679084301, 1, 0.0833333358168602, 1, 0.125, 1, 0.1666666716337204, 1, …]}}, "materials": [{"linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1.2989953931147695, 0, -0.03898155696225994, 0, 0, 1.2995801603274022, 0, 0, 0.03898155696225994, 0, …], "name": "Collar_Rib", "partId": "collar"}, {"attributes": {"normal": {"count": 24, "first": [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, …]}, "position": {"count": 24, "first": [0.2750000059604645, 0.22499999403953552, 0.12999999523162842, 0.2750000059604645, 0.22499999403953552, -0.12999999523162842, 0.2750000059604645, -0.22499999403953552, 0.12999999523162842, 0.2750000059604645, …]}, "uv": {"count": 24, "first": [0, 0.5, 0.3333333432674408, 0.5, 0, 0, 0.3333333432674408, 0, 0.3333333432674408, 0.5, …]}}, "materials": [{"linear": [0.009134058699157796, 0.009134058699157796, 0.010960094003125918], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": undefined, "type": "MeshStandardMaterial"}], "matrix": [1.2731019695615304, -0.2581867207667834, -0.038204521130925526, 0, 0.2580705454559788, 1.2736750803624493, -0.007744439835041743, 0, 0.03898155696225994, 0, …], "name": "Sleeve_Right", "partId": "shoulder_right"}, {"attributes": {"normal": {"count": 96, "first": [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, …]}, "position": {"count": 96, "first": [-0.6000000238418579, 0.75, 0.14000000059604645, -0.6000000238418579, 0.375, 0.14000000059604645, -0.30000001192092896, 0.75, 0.14000000059604645, -0.6000000238418579, …]}, "uv": {"count": 96, "first": [0.03999999910593033, 0.03999999910593033, 0.03999999910593033, 0.26499998569488525, 0.14499999582767487, 0.03999999910593033, 0.03999999910593033, 0.26499998569488525, 0.14499999582767487, 0.26499998569488525, …]}}, "materials": [{"linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [24, 24, 27, 255], "flipY": false, "hash": 1666242716, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [1.2989953931147695, 0, -0.03898155696225994, 0, 0, 1.2995801603274022, 0, 0, 0.03898155696225994, 0, …], "name": "Body_Main", "partId": "shirt_front"}, {"attributes": {"normal": {"count": 24, "first": [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, …]}, "position": {"count": 24, "first": [0.2750000059604645, 0.22499999403953552, 0.12999999523162842, 0.2750000059604645, 0.22499999403953552, -0.12999999523162842, 0.2750000059604645, -0.22499999403953552, 0.12999999523162842, 0.2750000059604645, …]}, "uv": {"count": 24, "first": [0, 0.5, 0.3333333432674408, 0.5, 0, 0, 0.3333333432674408, 0, 0.3333333432674408, 0.5, …]}}, "materials": [{"linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [16, 185, 129, 255], "flipY": false, "hash": 2668219409, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [1.2731019695615304, 0.2581867207667834, -0.038204521130925526, 0, -0.2580705454559788, 1.2736750803624493, 0.007744439835041743, 0, 0.03898155696225994, 0, …], "name": "Sleeve_Left", "partId": "shoulder_left"}, {"attributes": {"normal": {"count": 96, "first": [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, …]}, "position": {"count": 96, "first": [0.6000000238418579, 0.75, -0.14000000059604645, 0.6000000238418579, 0.375, -0.14000000059604645, 0.30000001192092896, 0.75, -0.14000000059604645, 0.6000000238418579, …]}, "uv": {"count": 96, "first": [0.5400000214576721, 0.03999999910593033, 0.5400000214576721, 0.26499998569488525, 0.6449999809265137, 0.03999999910593033, 0.5400000214576721, 0.26499998569488525, 0.6449999809265137, 0.26499998569488525, …]}}, "materials": [{"linear": [1, 1, 1], "metalness": 0, "normalMap": false, "roughness": 0.92, "texture": {"center": [24, 24, 27, 255], "flipY": false, "hash": 527411198, "height": 1024, "width": 1024}, "type": "MeshStandardMaterial"}], "matrix": [1.2989953931147695, 0, -0.03898155696225994, 0, 0, 1.2995801603274022, 0, 0, 0.03898155696225994, 0, …], "name": "Body_Back", "partId": "shirt_back"}]
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Notifications alt+T":
    - list
  - main [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "Go back" [ref=e8] [cursor=pointer]
          - generic [ref=e9]:
            - heading "V-neck shirt Customizer" [level=1] [ref=e10]
            - paragraph [ref=e11]: Upload, arrange, and preview in 3D.
        - generic [ref=e12]:
          - text: Appearance
          - combobox "Garment appearance" [ref=e13]:
            - option "Preserve Imported Appearance" [selected]
            - option "Runtime Customization"
        - button [ref=e14] [cursor=pointer]
        - button "Export texture" [ref=e15] [cursor=pointer]
        - button "Save design" [ref=e16] [cursor=pointer]
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - button "Undo" [disabled]
            - button "Redo" [disabled]
          - complementary [ref=e21]:
            - navigation "Customizer tools" [ref=e22]:
              - button "Select Colors" [pressed] [ref=e23] [cursor=pointer]
              - button "Uploads" [ref=e30] [cursor=pointer]
              - button "Text" [ref=e35] [cursor=pointer]
              - button "Garment" [ref=e40] [cursor=pointer]
              - button "Layers" [ref=e46] [cursor=pointer]
            - generic [ref=e51]:
              - heading "Select Colors" [level=2] [ref=e55]
              - generic [ref=e58]:
                - group "Preset fabric colors" [ref=e59]:
                  - 'button "Black, #111111" [ref=e60] [cursor=pointer]'
                  - 'button "White, #FFFFFF" [ref=e61] [cursor=pointer]'
                  - 'button "Gray, #808080" [ref=e62] [cursor=pointer]'
                  - 'button "Red, #DC2626" [ref=e63] [cursor=pointer]'
                  - 'button "Coral Orange, #F54927" [ref=e64] [cursor=pointer]'
                  - 'button "Orange, #F97316" [ref=e65] [cursor=pointer]'
                  - 'button "Yellow, #FACC15" [ref=e66] [cursor=pointer]'
                  - 'button "Green, #16A34A" [ref=e67] [cursor=pointer]'
                  - 'button "Teal, #0D9488" [ref=e68] [cursor=pointer]'
                  - 'button "Blue, #2563EB" [ref=e69] [cursor=pointer]'
                  - 'button "Purple, #7C3AED" [ref=e70] [cursor=pointer]'
                  - 'button "Pink, #DB2777" [ref=e71] [cursor=pointer]'
                  - 'button "Brown, #92400E" [ref=e72] [cursor=pointer]'
                  - 'button "Beige, #D6C4A8" [ref=e73] [cursor=pointer]'
                  - 'button "Slate Gray, #6B7280" [ref=e74] [cursor=pointer]'
                  - 'button "Navy, #0F172A" [ref=e75] [cursor=pointer]'
                - generic [ref=e76]:
                  - text: HEX Code
                  - generic [ref=e77]:
                    - textbox "HEX Code" [ref=e79]: "#E5E7EB"
                    - generic [ref=e80]: HEX
                    - button "Copy selected HEX color" [ref=e81] [cursor=pointer]
                - slider "Color hue" [ref=e86]: "220"
        - region "Interactive 3D garment viewer" [ref=e88]:
          - complementary [ref=e89]:
            - generic [ref=e90]:
              - generic [ref=e91]: Live 3D
              - generic [ref=e95]:
                - button "Front view" [ref=e96] [cursor=pointer]: F
                - button "Left view" [ref=e97] [cursor=pointer]: L
                - button "Right view" [active] [ref=e98] [cursor=pointer]: R
                - button "Back view" [ref=e99] [cursor=pointer]: B
                - button "Toggle automatic rotation" [ref=e100] [cursor=pointer]: Spin
              - region [ref=e101]:
                - paragraph [ref=e102]: Select Area
                - generic [ref=e103]:
                  - button "Previous color regions" [disabled] [ref=e104]
                  - group "Select Area" [ref=e108]:
                    - button "Shirt front" [pressed] [ref=e109] [cursor=pointer]
                    - button "Shirt back" [ref=e111] [cursor=pointer]
                    - button "Shirt base / yoke" [ref=e113] [cursor=pointer]
                    - button "Left shoulder" [ref=e115] [cursor=pointer]
                    - button "Right shoulder" [ref=e117] [cursor=pointer]
                    - button "Left shoulder patch" [ref=e119] [cursor=pointer]
                    - button "Right shoulder patch" [ref=e121] [cursor=pointer]
                    - button "Collar" [ref=e123] [cursor=pointer]
                    - button "Front neck patch" [ref=e125] [cursor=pointer]
                    - button "Back neck patch" [ref=e127] [cursor=pointer]
                    - button "Left hip patch" [ref=e129] [cursor=pointer]
                    - button "Right hip patch" [ref=e131] [cursor=pointer]
                  - button "Next color regions" [ref=e133] [cursor=pointer]
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
> 57  |   expect.soft(imported).toHaveLength(4)
      |                         ^ Error: expect(received).toHaveLength(expected)
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
  100 |   expect.soft(actual.meshes).toHaveLength(4)
  101 |   expect.soft(new Set(actual.meshes.map(m => m.materials[0].texture?.hash)).size).toBeGreaterThan(1)
  102 | })
  103 | 
```