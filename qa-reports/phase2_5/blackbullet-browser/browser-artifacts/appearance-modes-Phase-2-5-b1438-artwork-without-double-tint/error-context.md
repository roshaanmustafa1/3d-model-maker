# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appearance-modes.spec.mjs >> Phase 2.5 BlackBullet preserves multipart PBR and runtime artwork without double tint
- Location: tests\qa\browser\appearance-modes.spec.mjs:22:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "09090b"
Received: "08080b"
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
  1  | import { test, expect } from '@playwright/test'
  2  | import { writeFile } from 'node:fs/promises'
  3  | 
  4  | async function observe(page) {
  5  |   await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  6  |   await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async (route) => {
  7  |     const response = await route.fetch()
  8  |     const source = await response.text()
  9  |     expect(source).toContain('return record.mesh.material;')
  10 |     await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  11 |   })
  12 | }
  13 | async function materials(page) {
  14 |   return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => {
  15 |     const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
  16 |     return { name: mesh.name, partId, type: material.type, srgb: material.color.clone().convertLinearToSRGB().getHexString(), roughness: material.roughness, metalness: material.metalness,
  17 |       map: material.map?.image?.width || 0, normalMap: material.normalMap?.image?.width || 0,
  18 |       geometry: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key, value]) => [key, Array.from(value.array)])) }
  19 |   }))
  20 | }
  21 | 
  22 | test('Phase 2.5 BlackBullet preserves multipart PBR and runtime artwork without double tint', async ({ page }) => {
  23 |   test.setTimeout(120000)
  24 |   const errors = []
  25 |   page.on('pageerror', (error) => errors.push(error.message))
  26 |   await observe(page)
  27 |   await page.route('**/src/assets/modals/raglan_shirt.glb', (route) => route.fulfill({ path: 'qa-reports/phase2_5/fixtures/multipart-pbr-export.glb', contentType: 'model/gltf-binary' }))
  28 |   await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  29 |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(12)
  30 |   const imported = await materials(page)
  31 |   for (const material of imported) {
> 32 |     expect(material.srgb).toBe('09090b')
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  33 |     expect(material.roughness).toBeCloseTo(0.65)
  34 |     expect(material.metalness).toBe(0)
  35 |     expect(material.map).toBe(8)
  36 |     expect(material.normalMap).toBe(8)
  37 |   }
  38 |   await page.screenshot({ path: 'qa-reports/phase2_5/screenshots/blackbullet-imported.png' })
  39 |   await page.getByLabel('Garment appearance').selectOption('runtime')
  40 |   await page.getByLabel('HEX Code', { exact: true }).fill('#224466')
  41 |   await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  42 |   await expect.poll(() => page.evaluate(() => {
  43 |     const record = [...window.__qaAppearanceRecords.values()].find((entry) => entry.partId === 'shirt_front')
  44 |     const material = Array.isArray(record.mesh.material) ? record.mesh.material[0] : record.mesh.material
  45 |     const image = material.map?.image
  46 |     return image?.getContext ? { tint: material.color.getHexString(), pixel: Array.from(image.getContext('2d').getImageData(Math.floor(image.width * .25), Math.floor(image.height * .49), 1, 1).data) } : null
  47 |   })).toEqual({ tint: 'ffffff', pixel: [34, 68, 102, 255] })
  48 |   await page.getByRole('button', { name: 'Text', exact: true }).click()
  49 |   await page.locator('#custom-text').fill('QA design')
  50 |   await page.getByRole('button', { name: 'Add text', exact: true }).click()
  51 |   await expect.poll(async () => (await materials(page)).find((entry) => entry.partId === 'shirt_front')?.srgb).toBe('ffffff')
  52 |   const runtime = await materials(page)
  53 |   expect(runtime.map((entry) => entry.geometry)).toEqual(imported.map((entry) => entry.geometry))
  54 |   await page.screenshot({ path: 'qa-reports/phase2_5/screenshots/blackbullet-runtime.png' })
  55 |   await page.getByLabel('Garment appearance').selectOption('imported')
  56 |   expect(await materials(page)).toEqual(imported)
  57 |   expect(errors).toEqual([])
  58 |   await writeFile('qa-reports/phase2_5/blackbullet-modes.json', JSON.stringify({ imported, runtime, errors }))
  59 | })
  60 | 
  61 | test('Phase 2.5 BlackBullet existing catalog retains runtime default', async ({ page }) => {
  62 |   await observe(page)
  63 |   await page.goto('http://localhost:5173/customizer')
  64 |   await expect(page.getByLabel('Garment appearance')).toHaveValue('runtime')
  65 |   await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBeGreaterThan(0)
  66 |   const result = await materials(page)
  67 |   expect(result[0].type).toBe('MeshBasicMaterial')
  68 |   expect(result[0].srgb).toBe('e5e7eb')
  69 | })
  70 | 
```