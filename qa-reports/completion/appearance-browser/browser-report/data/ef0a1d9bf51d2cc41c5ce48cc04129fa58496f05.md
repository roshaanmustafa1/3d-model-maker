# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-blackbullet.spec.mjs >> Phase 3 UV-ready customized multipart export supports both BlackBullet appearance modes
- Location: tests\qa\browser\phase3-blackbullet.spec.mjs:65:1

# Error details

```
TimeoutError: locator.selectOption: Timeout 15000ms exceeded.
Call log:
  - waiting for getByLabel('Garment appearance')

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
                - button "Right view" [ref=e98] [cursor=pointer]: R
                - button "Back view" [ref=e99] [cursor=pointer]: B
                - button "Toggle automatic rotation" [pressed] [ref=e100] [cursor=pointer]: Spin
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
  4   | import { inspectSurfaces } from '../../../scripts/qa/phase3_5-pixels.mjs'
  5   | 
  6   | async function observe(page) {
  7   |   await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  8   |   await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async route => {
  9   |     const response = await route.fetch(), source = await response.text()
  10  |     expect(source).toContain('return record.mesh.material;')
  11  |     await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  12  |   })
  13  | }
  14  | async function trace(page) {
  15  |   return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => ({
  16  |     name: mesh.name, partId, matrix: mesh.matrixWorld.toArray(),
  17  |     attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attr]) => [name, { count: attr.count, first: Array.from(attr.array).slice(0, 12) }])),
  18  |     materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  19  |       const image = material.map?.image
  20  |       let texture
  21  |       if (image?.width) {
  22  |         const c = document.createElement('canvas'); c.width = image.width; c.height = image.height
  23  |         const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0)
  24  |         const data = ctx.getImageData(0, 0, c.width, c.height).data
  25  |         let hash = 2166136261; for (const v of data) hash = Math.imul(hash ^ v, 16777619)
  26  |         texture = { width: c.width, height: c.height, hash: hash >>> 0, center: Array.from(ctx.getImageData(c.width / 2, c.height / 2, 1, 1).data), flipY: material.map.flipY }
  27  |       }
  28  |       return { type: material.type, linear: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, texture, normalMap: !!material.normalMap }
  29  |     })
  30  |   })))
  31  | }
  32  | 
  33  | test('Phase 3 newly customized Model Maker GLB in actual BlackBullet imported and runtime modes', async ({ page }) => {
  34  |   test.setTimeout(150000); page.setDefaultTimeout(15000)
  35  |   const events = await setup(page)
  36  |   const file = `${directory}/exports/blackbullet-test-1024.glb`
  37  |   await readFile(file)
  38  |   await observe(page)
  39  |   let routed = 0
  40  |   await page.route('**/src/assets/modals/raglan_shirt.glb', route => { routed++; return route.fulfill({ path: file, contentType: 'model/gltf-binary' }) })
  41  |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  42  |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size)).toBeGreaterThan(0)
  43  |   await page.waitForTimeout(1000)
  44  |   const imported = await trace(page)
  45  |   await record('blackbullet-imported', { routed, imported, events })
  46  |   for (const view of ['Front', 'Back', 'Left', 'Right']) {
  47  |     const control = page.getByRole('button', { name: `${view} view`, exact: true })
  48  |     if (await control.count()) { await control.click(); await page.waitForTimeout(500) }
  49  |     await page.screenshot({ path: `${directory}/screenshots/blackbullet-${view.toLowerCase()}.png` })
  50  |   }
  51  |   await page.getByLabel('Garment appearance').selectOption('runtime')
  52  |   const runtime = await trace(page)
  53  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-runtime.png` })
  54  |   await page.getByLabel('Garment appearance').selectOption('imported')
  55  |   const restored = await trace(page)
  56  |   await record('blackbullet-modes', { routed, imported, runtime, restored, events })
  57  |   expect.soft(routed).toBe(1)
  58  |   expect.soft(imported).toHaveLength(6)
  59  |   expect.soft(restored.map(({ matrix, ...entry }) => entry)).toEqual(imported.map(({ matrix, ...entry }) => entry))
  60  |   expect.soft(events.errors).toEqual([])
  61  |   expect.soft(imported.filter(m => m.partId === 'shirt_front'), 'exported product must resolve a runtime front region').toHaveLength(1)
  62  |   expect.soft(imported.filter(m => m.partId === 'shirt_back'), 'exported product must resolve a runtime back region').toHaveLength(1)
  63  | })
  64  | 
  65  | test('Phase 3 UV-ready customized multipart export supports both BlackBullet appearance modes', async ({ page }) => {
  66  |   test.setTimeout(120000); page.setDefaultTimeout(15000)
  67  |   const events = await setup(page)
  68  |   await observe(page)
  69  |   await page.route('**/src/assets/modals/raglan_shirt.glb', route => route.fulfill({ path: `${directory}/exports/durable-reopened.glb`, contentType: 'model/gltf-binary' }))
  70  |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  71  |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(12)
  72  |   await page.waitForTimeout(1000)
  73  |   const imported = await trace(page)
  74  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-imported.png` })
> 75  |   await page.getByLabel('Garment appearance').selectOption('runtime')
      |                                               ^ TimeoutError: locator.selectOption: Timeout 15000ms exceeded.
  76  |   await page.getByLabel('HEX Code', { exact: true }).fill('#224466')
  77  |   await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  78  |   await page.getByRole('button', { name: 'Text', exact: true }).click()
  79  |   await page.locator('#custom-text').fill('RUNTIME QA')
  80  |   await page.getByRole('button', { name: 'Add text', exact: true }).click()
  81  |   await page.waitForTimeout(1000)
  82  |   const runtime = await trace(page)
  83  |   await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-runtime.png` })
  84  |   await record('blackbullet-multipart', { imported, runtime, events })
  85  |   const exported = await inspectSurfaces(`${directory}/exports/durable-reopened.glb`)
  86  |   for (const mesh of imported) expect.soft(mesh.materials[0].texture?.width).toBe(exported.surfaces.find(surface => surface.name === mesh.name).primitives[0].image?.width)
  87  |   expect.soft(runtime.find(m => m.partId === 'shirt_front')?.materials[0].linear).toEqual([1, 1, 1])
  88  |   expect.soft(events.errors).toEqual([])
  89  | })
  90  | 
  91  | test('Phase 3 customized export reimports into Model Maker with artwork textures', async ({ page }) => {
  92  |   test.setTimeout(90000); page.setDefaultTimeout(15000)
  93  |   const events = await setup(page)
  94  |   await open(page)
  95  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  96  |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/blackbullet-test-1024.glb`)
  97  |   await page.getByText(/Successfully imported/).waitFor()
  98  |   await page.waitForTimeout(1400)
  99  |   const actual = await scene(page)
  100 |   await record('customized-reimport', { actual, events })
  101 |   await page.screenshot({ path: `${directory}/screenshots/customized-reimport.png` })
  102 |   expect.soft(actual.meshes).toHaveLength(6)
  103 |   expect.soft(new Set(actual.meshes.map(m => m.materials[0].texture?.hash)).size).toBeGreaterThan(1)
  104 | })
  105 | 
```