# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.mjs >> Independent Phase 3 >> workspace initialization corresponds to selected product
- Location: tests\qa\browser\phase3.spec.mjs:11:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
        - button "Customizer" [active] [ref=e26] [cursor=pointer]
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
          - generic [ref=e54]: Streetwear Oversized Teet-shirt
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
            - button "Library" [ref=e79]
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
            - generic [ref=e113]: "Active Zone: Front Chest | Canvas: 1024x1024px"
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
            - generic [ref=e223]: Front Chest
          - generic [ref=e224]:
            - generic [ref=e225]: "Bake Resolution:"
            - generic [ref=e226]: 1024 x 1024
          - generic [ref=e227]:
            - generic [ref=e228]: "UV Status:"
            - generic [ref=e229]: Mapped
        - generic [ref=e233]: BlackBullet Compatible
    - contentinfo [ref=e235]:
      - generic [ref=e236]:
        - generic [ref=e237]: Studio_Cube
        - generic [ref=e241]: Saved
      - generic [ref=e245]:
        - generic "Total Scene Vertices" [ref=e246]:
          - generic [ref=e247]: "Verts:"
          - generic [ref=e248]: "24"
        - generic "Total Scene Triangles / Polygons" [ref=e250]:
          - generic [ref=e251]: "Tris:"
          - generic [ref=e252]: "12"
        - generic "Total Mesh Objects" [ref=e254]: "1"
        - generic "Total PBR Materials" [ref=e260]: "1"
        - generic "Render Viewport FPS" [ref=e269]: 3 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e278] [cursor=pointer]
  - alert [ref=e282]
```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { mkdtemp, writeFile } from 'node:fs/promises'
  3   | import { tmpdir } from 'node:os'
  4   | import { join } from 'node:path'
  5   | import { directory, setup, open, product, zone, save, scene, record, exportProduct, inspectGLB } from '../../../scripts/qa/phase3-support.mjs'
  6   | 
  7   | test.describe('Independent Phase 3', () => {
  8   |   test.setTimeout(180000)
  9   |   test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })
  10  | 
  11  |   test('workspace initialization corresponds to selected product', async ({ page }) => {
  12  |     const events = await setup(page)
  13  |     await open(page)
  14  |     await page.waitForTimeout(2000)
  15  |     const actual = await scene(page)
  16  |     await record('initial-workspace', { actual, events })
  17  |     await page.screenshot({ path: `${directory}/screenshots/initial-workspace.png` })
> 18  |     expect(actual.meshes.some(mesh => mesh.name === 'Body_Main')).toBe(true)
      |                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  19  |   })
  20  | 
  21  |   test('catalog geometry, live textures, camera controls and resource cycles', async ({ page }) => {
  22  |     const events = await setup(page)
  23  |     await open(page)
  24  |     const cycles = []
  25  |     for (const name of ['Streetwear Oversized Tee', 'Heavyweight Streetwear Hoodie', 'Insulated Thermal Bottle', 'Luxury Retail Box', 'Streetwear Oversized Tee', 'Insulated Thermal Bottle']) {
  26  |       const started = Date.now()
  27  |       await product(page, name)
  28  |       const loaded = await scene(page)
  29  |       await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  30  |       await page.getByTitle('Rectangle', { exact: true }).click()
  31  |       await page.waitForTimeout(1400)
  32  |       const artwork = await scene(page)
  33  |       const views = []
  34  |       for (const view of ['Front', 'Back', 'Left', 'Right']) {
  35  |         await page.getByRole('button', { name: view, exact: true }).click()
  36  |         await page.waitForTimeout(450)
  37  |         views.push({ view, camera: (await scene(page)).camera })
  38  |       }
  39  |       const fps = await page.evaluate(() => new Promise(resolve => {
  40  |         let count = 0, start = performance.now()
  41  |         function tick(now) { count++; if (now - start < 1200) requestAnimationFrame(tick); else resolve({ frames: count, durationMs: now - start, fps: count * 1000 / (now - start) }) }
  42  |         requestAnimationFrame(tick)
  43  |       }))
  44  |       cycles.push({ name, durationMs: Date.now() - started, loaded, artwork, views, fps })
  45  |       await page.screenshot({ path: `${directory}/screenshots/catalog-${cycles.length}.png` })
  46  |       await record('catalog-cycles', { cycles, events })
  47  |     }
  48  |     expect.soft(cycles[0].loaded.meshes).toHaveLength(4)
  49  |     expect.soft(cycles[1].loaded.meshes).toHaveLength(5)
  50  |     expect.soft(cycles[2].loaded.meshes).toHaveLength(3)
  51  |     expect.soft(new Set(cycles[0].views.map(v => JSON.stringify(v.camera))).size, 'camera presets must actually move camera').toBeGreaterThan(1)
  52  |     expect.soft(cycles[0].artwork.meshes[0].materials[0].texture?.hash, 'artwork must reach real mesh').not.toBe(cycles[0].loaded.meshes[0].materials[0].texture?.hash)
  53  |   })
  54  | 
  55  |   test('real artwork controls, durable layers, UV isolation, export resolutions and BlackBullet', async ({ page }) => {
  56  |     test.setTimeout(300000)
  57  |     const events = await setup(page)
  58  |     await open(page)
  59  |     await product(page, 'Streetwear Oversized Tee')
  60  |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  61  |     const png = await page.evaluate(() => {
  62  |       const c = document.createElement('canvas'); c.width = 64; c.height = 64
  63  |       const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 64); ctx.fillStyle = '#0000ff'; ctx.fillRect(32, 0, 32, 64)
  64  |       return c.toDataURL()
  65  |     })
  66  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'qa-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  67  |     await page.getByPlaceholder('Text to add...').fill('FRONT MARK')
  68  |     await page.getByPlaceholder('Text to add...').press('Enter')
  69  |     await page.getByTitle('Rectangle', { exact: true }).click()
  70  |     const initial = await save(page)
  71  |     const transforms = page.locator('input[type=number]')
  72  |     await transforms.nth(0).fill('100'); await transforms.nth(0).press('Tab')
  73  |     await transforms.nth(2).fill('220'); await transforms.nth(2).press('Tab')
  74  |     await page.locator('input[type=range]').nth(0).fill('45'); await page.locator('input[type=range]').nth(0).dispatchEvent('mouseup')
  75  |     await page.locator('input[type=range]').nth(1).fill('0.5'); await page.locator('input[type=range]').nth(1).dispatchEvent('mouseup')
  76  |     await page.getByRole('button', { name: 'Layers', exact: true }).click()
  77  |     await page.getByTitle('Duplicate layer', { exact: true }).first().click()
  78  |     await page.getByTitle('Lock layer', { exact: true }).first().click()
  79  |     await page.getByTitle('Unlock layer', { exact: true }).first().click()
  80  |     await page.getByTitle('Hide layer', { exact: true }).first().click()
  81  |     await page.getByTitle('Show layer', { exact: true }).first().click()
  82  |     await page.getByTitle('Delete layer', { exact: true }).first().click()
  83  |     const edited = await save(page)
  84  |     await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click()
  85  |     const undone = await save(page)
  86  |     await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).click()
  87  |     const redone = await save(page)
  88  |     await zone(page, 'Back Center')
  89  |     await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
  90  |     await page.getByPlaceholder('Text to add...').press('Enter')
  91  |     await zone(page, 'Left Sleeve')
  92  |     await page.getByTitle('Star', { exact: true }).click()
  93  |     const final = await save(page)
  94  |     const actual = await scene(page)
  95  |     await record('artwork-controls', { initial, edited, undone, redone, final, actual, events })
  96  |     await page.screenshot({ path: `${directory}/screenshots/artwork-product.png` })
  97  |     const exports = []
  98  |     for (const res of [1024, 2048, 4096]) {
  99  |       const timing = await exportProduct(page, `blackbullet-test-${res}`, res)
  100 |       exports.push({ resolution: res, timing, glb: await inspectGLB(`blackbullet-test-${res}`) })
  101 |       await record('exports', exports)
  102 |     }
  103 |     expect.soft(edited.customization.zones.body_front.layers).toHaveLength(3)
  104 |     expect.soft(redone.customization.zones).toEqual(edited.customization.zones)
  105 |     expect.soft(actual.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture?.hash, 'untouched right sleeve must not share the front/back artwork atlas').not.toBe(actual.meshes.find(m => m.name === 'Body_Main').materials[0].texture?.hash)
  106 |   })
  107 | 
  108 |   test('UV-ready multipart import preserves original albedo and PBR', async ({ page }) => {
  109 |     const events = await setup(page)
  110 |     await open(page)
  111 |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  112 |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  113 |     await page.getByText(/Successfully imported/).waitFor()
  114 |     await page.waitForTimeout(1800)
  115 |     const actual = await scene(page)
  116 |     const saved = await save(page)
  117 |     await record('multipart-import', { actual, saved, events })
  118 |     await page.screenshot({ path: `${directory}/screenshots/multipart-import.png` })
```