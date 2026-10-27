# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.mjs >> Independent Phase 3 >> real artwork controls, durable layers, UV isolation, export resolutions and BlackBullet
- Location: tests\qa\browser\phase3.spec.mjs:55:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByTitle('Undo (Ctrl+Z)', { exact: true }) resolved to 2 elements:
    1) <button disabled tabindex="0" type="button" data-disabled="" data-slot="button" title="Undo (Ctrl+Z)" class="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destruct…>…</button> aka getByRole('banner').getByRole('button', { name: 'Undo (Ctrl+Z)' })
    2) <button tabindex="0" type="button" data-slot="button" title="Undo (Ctrl+Z)" class="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:b…>…</button> aka getByRole('button', { name: 'Undo (Ctrl+Z)' }).nth(1)

Call log:
  - waiting for getByTitle('Undo (Ctrl+Z)', { exact: true })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - generic [ref=e54]: Streetwear Oversized Teet-shirt
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
              - generic [ref=e89]: Active Layers (3)
              - generic [ref=e94]: Front Chest
            - generic [ref=e95]:
              - generic [ref=e96] [cursor=pointer]:
                - generic [ref=e97]: Rectangle Shape
                - generic [ref=e102]:
                  - generic [ref=e103]:
                    - button [disabled] [ref=e104]
                    - button [ref=e107]
                  - button "Lock layer" [ref=e110]
                  - button "Hide layer" [ref=e114]
                  - button "Duplicate layer" [ref=e118]
                  - button "Delete layer" [ref=e122]
              - generic [ref=e126] [cursor=pointer]:
                - generic [ref=e127]: Text "FRONT MARK"
                - generic [ref=e132]:
                  - generic [ref=e133]:
                    - button [ref=e134]
                    - button [ref=e137]
                  - button "Lock layer" [ref=e140]
                  - button "Hide layer" [ref=e144]
                  - button "Duplicate layer" [ref=e148]
                  - button "Delete layer" [ref=e152]
              - generic [ref=e156] [cursor=pointer]:
                - generic [ref=e157]: qa-logo
                - generic [ref=e164]:
                  - generic [ref=e165]:
                    - button [ref=e166]
                    - button [disabled] [ref=e169]
                  - button "Lock layer" [ref=e172]
                  - button "Hide layer" [ref=e176]
                  - button "Duplicate layer" [ref=e180]
                  - button "Delete layer" [ref=e184]
        - generic [ref=e188]:
          - generic [ref=e189]:
            - button "Split View (2D + 3D)" [ref=e190]
            - button "2D Design Canvas" [ref=e191]
            - button "3D Product Preview" [ref=e192]
          - generic [ref=e193]:
            - generic [ref=e194]: "Active Zone: Front Chest | Canvas: 1024x1024px"
            - generic [ref=e201]:
              - generic:
                - generic [ref=e202]:
                  - button "Object Mode [Tab]" [ref=e203] [cursor=pointer]:
                    - generic [ref=e207]: Object Mode
                    - generic [ref=e208]: "[Tab]"
                  - button [ref=e210] [cursor=pointer]
                  - button [ref=e214] [cursor=pointer]
                  - button [ref=e220] [cursor=pointer]
                  - button [ref=e224] [cursor=pointer]
                  - button "world" [ref=e231]
                - generic [ref=e232]:
                  - button "solid" [ref=e233] [cursor=pointer]
                  - button [ref=e239] [cursor=pointer]
                  - button [ref=e245] [cursor=pointer]
                  - button [ref=e250] [cursor=pointer]
                  - button [ref=e253] [cursor=pointer]
          - generic [ref=e264]:
            - generic [ref=e265]:
              - button "perspective" [ref=e266]
              - button "front" [ref=e267]
              - button "back" [ref=e268]
              - button "left" [ref=e269]
              - button "right" [ref=e270]
              - button "top" [ref=e271]
            - generic [ref=e272]:
              - button "neutral" [ref=e279]
              - button "soft white" [ref=e280]
              - button "dark" [ref=e281]
              - button "warm" [ref=e282]
            - button "Screenshot" [ref=e283]
        - generic [ref=e284]:
          - generic [ref=e285]:
            - button "Layer Inspector" [ref=e286]
            - button "Material & Finish" [ref=e288]
          - generic [ref=e296]:
            - paragraph [ref=e298]: No Layer Selected
            - paragraph [ref=e299]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e300]:
        - generic [ref=e301]:
          - generic [ref=e302]:
            - generic [ref=e303]: "Zone:"
            - generic [ref=e304]: Front Chest
          - generic [ref=e305]:
            - generic [ref=e306]: "Bake Resolution:"
            - generic [ref=e307]: 1024 x 1024
          - generic [ref=e308]:
            - generic [ref=e309]: "UV Status:"
            - generic [ref=e310]: Mapped
        - generic [ref=e314]:
          - generic [ref=e315]: Saved at 11:17:16 PM
          - generic [ref=e316]: BlackBullet Compatible
    - contentinfo [ref=e317]:
      - generic [ref=e318]:
        - generic [ref=e319]: TShirt_Product
        - generic [ref=e323]: Saved at 11:17:16 PM
      - generic [ref=e327]:
        - generic "Total Scene Vertices" [ref=e328]:
          - generic [ref=e329]: "Verts:"
          - generic [ref=e330]: "306"
        - generic "Total Scene Triangles / Polygons" [ref=e332]:
          - generic [ref=e333]: "Tris:"
          - generic [ref=e334]: "248"
        - generic "Total Mesh Objects" [ref=e336]: "4"
        - generic "Total PBR Materials" [ref=e342]: "2"
        - generic "Render Viewport FPS" [ref=e351]: 7 FPS
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e355]:
        - generic [ref=e359]: Project saved to IndexedDB persistent storage!
  - button "Open Next.js Dev Tools" [ref=e366] [cursor=pointer]
  - alert [ref=e370]
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
  18  |     expect(actual.meshes.some(mesh => mesh.name === 'Body_Main')).toBe(true)
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
> 84  |     await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click()
      |                                                             ^ Error: locator.click: Error: strict mode violation: getByTitle('Undo (Ctrl+Z)', { exact: true }) resolved to 2 elements:
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
  119 |     await exportProduct(page, 'multipart-customizer')
  120 |     await inspectGLB('multipart-customizer')
  121 |     expect.soft(actual.meshes).toHaveLength(12)
  122 |     expect.soft(actual.meshes[0].materials[0].roughness).toBeCloseTo(.65)
  123 |     expect.soft(actual.meshes[0].materials[0].texture?.width).toBe(8)
  124 |   })
  125 | })
  126 | 
```