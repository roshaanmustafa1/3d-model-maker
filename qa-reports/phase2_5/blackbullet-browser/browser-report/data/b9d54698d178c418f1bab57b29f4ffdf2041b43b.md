# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blackbullet.spec.mjs >> BlackBullet actual customizer preserves imported black fabric before user color choice
- Location: tests\qa\browser\blackbullet.spec.mjs:4:1

# Error details

```
Error: Actual BlackBullet runtime material after loading the exported black GLB must remain black until user input

expect(received).toBe(expected) // Object.is equality

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
            - heading "Shirt Customizer" [level=1] [ref=e10]
            - paragraph [ref=e11]: Choose your shirt color and preview in 3D.
        - generic [ref=e12]:
          - text: Appearance
          - combobox "Garment appearance" [ref=e13]:
            - option "Preserve Imported Appearance" [selected]
            - option "Runtime Customization"
        - button [ref=e14] [cursor=pointer]
        - button "Save design" [ref=e15] [cursor=pointer]
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - button "Undo" [disabled]
            - button "Redo" [disabled]
          - complementary [ref=e20]:
            - navigation "Customizer tools" [ref=e21]:
              - button "Select Colors" [pressed] [ref=e22] [cursor=pointer]
              - button "Garment" [ref=e29] [cursor=pointer]
            - generic [ref=e35]:
              - heading "Select Colors" [level=2] [ref=e39]
              - generic [ref=e42]:
                - group "Preset fabric colors" [ref=e43]:
                  - 'button "Black, #111111" [ref=e44] [cursor=pointer]'
                  - 'button "White, #FFFFFF" [ref=e45] [cursor=pointer]'
                  - 'button "Gray, #808080" [ref=e46] [cursor=pointer]'
                  - 'button "Red, #DC2626" [ref=e47] [cursor=pointer]'
                  - 'button "Coral Orange, #F54927" [ref=e48] [cursor=pointer]'
                  - 'button "Orange, #F97316" [ref=e49] [cursor=pointer]'
                  - 'button "Yellow, #FACC15" [ref=e50] [cursor=pointer]'
                  - 'button "Green, #16A34A" [ref=e51] [cursor=pointer]'
                  - 'button "Teal, #0D9488" [ref=e52] [cursor=pointer]'
                  - 'button "Blue, #2563EB" [ref=e53] [cursor=pointer]'
                  - 'button "Purple, #7C3AED" [ref=e54] [cursor=pointer]'
                  - 'button "Pink, #DB2777" [ref=e55] [cursor=pointer]'
                  - 'button "Brown, #92400E" [ref=e56] [cursor=pointer]'
                  - 'button "Beige, #D6C4A8" [ref=e57] [cursor=pointer]'
                  - 'button "Slate Gray, #6B7280" [ref=e58] [cursor=pointer]'
                  - 'button "Navy, #0F172A" [ref=e59] [cursor=pointer]'
                - generic [ref=e60]:
                  - text: HEX Code
                  - generic [ref=e61]:
                    - textbox "HEX Code" [ref=e63]: "#E5E7EB"
                    - generic [ref=e64]: HEX
                    - button "Copy selected HEX color" [ref=e65] [cursor=pointer]
                - slider "Color hue" [ref=e70]: "220"
        - region "Interactive 3D garment viewer" [ref=e72]:
          - complementary [ref=e73]:
            - generic [ref=e74]:
              - generic [ref=e75]: Live 3D
              - generic [ref=e79]:
                - button "Front view" [ref=e80] [cursor=pointer]: F
                - button "Left view" [ref=e81] [cursor=pointer]: L
                - button "Right view" [ref=e82] [cursor=pointer]: R
                - button "Back view" [ref=e83] [cursor=pointer]: B
                - button "Toggle automatic rotation" [pressed] [ref=e84] [cursor=pointer]: Spin
              - region [ref=e85]:
                - paragraph [ref=e86]: Select Area
                - group "Select Area" [ref=e89]:
                  - button "Whole shirt" [pressed] [ref=e90] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { writeFile, readFile } from 'node:fs/promises'
  3  | 
  4  | test('BlackBullet actual customizer preserves imported black fabric before user color choice', async ({ page }) => {
  5  |   const log = { pageErrors: [], console: [], modelRequests: 0, materialModuleInstrumented: false }
  6  |   page.on('pageerror', (error) => log.pageErrors.push(error.message))
  7  |   page.on('console', (message) => { if (['warning', 'error'].includes(message.type())) log.console.push(message.text()) })
  8  |   await page.addInitScript(() => { window.__qaGarmentMaterials = []; window.__qaColourCalls = [] })
  9  |   await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async (route) => {
  10 |     const response = await route.fetch()
  11 |     const source = await response.text()
  12 |     const instrumented = source.replace('return record.mesh.material;', 'window.__qaGarmentMaterials.push(...(Array.isArray(record.mesh.material) ? record.mesh.material : [record.mesh.material])); return record.mesh.material;')
  13 |     log.materialModuleInstrumented = instrumented !== source
  14 |     await route.fulfill({ response, body: instrumented })
  15 |   })
  16 |   await page.route('**/src/assets/modals/subdivision.glb', async (route) => {
  17 |     log.modelRequests++
  18 |     await route.fulfill({ path: 'qa-reports/exported-models/black-subdivision.glb', contentType: 'model/gltf-binary' })
  19 |   })
  20 |   await page.goto('http://localhost:5173/customizer?appearance=imported')
  21 |   await expect.poll(() => page.evaluate(() => window.__qaGarmentMaterials.length), { timeout: 30000 }).toBeGreaterThan(0)
  22 |   expect(await page.evaluate(() => window.__qaColourCalls.length)).toBe(0)
  23 |   const materials = await page.evaluate(() => window.__qaGarmentMaterials.map((material) => ({ type: material.type, linear: material.color.toArray(), srgb: material.color.clone().convertLinearToSRGB().getHexString(), roughness: material.roughness, metalness: material.metalness, map: !!material.map })))
  24 |   const calls = await page.evaluate(() => window.__qaColourCalls)
  25 |   await page.screenshot({ path: 'qa-reports/screenshots/blackbullet-imported-black.png', fullPage: true })
  26 |   const bytes = await readFile('qa-reports/exported-models/black-subdivision.glb')
  27 |   const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
  28 |   await writeFile('qa-reports/test-results/blackbullet-runtime.json', JSON.stringify({ ...log, materials, colorCalls: calls, exportedMaterials: json.materials }, null, 2))
  29 |   expect(log.modelRequests).toBe(1)
  30 |   expect(log.materialModuleInstrumented).toBe(true)
  31 |   expect(log.pageErrors).toEqual([])
> 32 |   expect(materials[0].srgb.toLowerCase(), 'Actual BlackBullet runtime material after loading the exported black GLB must remain black until user input').toBe('09090b')
     |                                                                                                                                                          ^ Error: Actual BlackBullet runtime material after loading the exported black GLB must remain black until user input
  33 | })
  34 | 
```