# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 acceptance: actual front/back/sleeve pixels, source factors and reimport
- Location: tests\qa\browser\phase3_5.spec.mjs:14:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: undefined
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
            - generic [ref=e225]: Front Chest
          - generic [ref=e226]:
            - generic [ref=e227]: "Bake Resolution:"
            - generic [ref=e228]: 1024 x 1024
          - generic [ref=e229]:
            - generic [ref=e230]: "UV Status:"
            - generic [ref=e231]: Mapped
        - generic [ref=e235]: UV targets verified
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
        - generic "Render Viewport FPS" [ref=e271]: 4 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e280] [cursor=pointer]
  - alert [ref=e284]
```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { mkdtemp } from 'node:fs/promises'
  3   | import { tmpdir } from 'node:os'
  4   | import { join } from 'node:path'
  5   | import { directory, setup, open, zone, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'
  6   | import { inspectSurfaces } from '../../../scripts/qa/phase3_5-pixels.mjs'
  7   | 
  8   | test.setTimeout(180000)
  9   | test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000) })
  10  | async function ready(page, name = 'Body_Main') {
  11  |   await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === name)?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
  12  | }
  13  | 
  14  | test('Phase 3.5 acceptance: actual front/back/sleeve pixels, source factors and reimport', async ({ page }) => {
  15  |   const events = await setup(page)
  16  |   await open(page)
  17  |   const initial = await scene(page)
> 18  |   expect(initial.meshes.find(m => m.name === 'Body_Main')).toBeTruthy()
      |                                                            ^ Error: expect(received).toBeTruthy()
  19  |   await page.getByRole('button', { name: '3D Modeling Studio', exact: true }).click()
  20  |   const modeling = await scene(page)
  21  |   expect(modeling.meshes.some(m => m.name === 'Studio_Cube')).toBe(true)
  22  |   await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  23  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  24  |   const png = await page.evaluate(() => {
  25  |     const c = document.createElement('canvas'); c.width = c.height = 128
  26  |     const ctx = c.getContext('2d'); ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 64, 128); ctx.fillStyle = 'blue'; ctx.fillRect(64, 0, 64, 128)
  27  |     return c.toDataURL()
  28  |   })
  29  |   await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'isolation-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  30  |   await ready(page)
  31  |   await zone(page, 'Back Center')
  32  |   await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
  33  |   await page.getByPlaceholder('Text to add...').press('Enter')
  34  |   await zone(page, 'Left Sleeve')
  35  |   await page.getByTitle('Star', { exact: true }).click()
  36  |   await ready(page, 'Sleeve_Left')
  37  |   const saved = await save(page), actual = await scene(page)
  38  |   const views = []
  39  |   for (const preset of ['front', 'back', 'left', 'right', 'top', 'perspective', 'Fit Product', 'Reset Camera']) {
  40  |     await page.getByRole('button', { name: preset, exact: true }).click()
  41  |     await page.waitForTimeout(500)
  42  |     views.push({ preset, camera: (await scene(page)).camera })
  43  |     await page.screenshot({ path: `${directory}/screenshots/acceptance-${preset.replaceAll(' ', '-')}.png` })
  44  |   }
  45  |   expect(views[0].camera[2]).toBeGreaterThan(0)
  46  |   expect(views[1].camera[2]).toBeLessThan(0)
  47  |   expect(views[2].camera[0]).toBeLessThan(0)
  48  |   expect(views[3].camera[0]).toBeGreaterThan(0)
  49  |   await exportProduct(page, 'acceptance-isolated')
  50  |   const binary = await inspectSurfaces(`${directory}/exports/acceptance-isolated.glb`)
  51  |   await record('acceptance-isolated', { initial, modeling, actual, saved, views, binary, events })
  52  |   const front = binary.surfaces.find(m => m.partId === 'shirt_front').primitives[0]
  53  |   const back = binary.surfaces.find(m => m.partId === 'shirt_back').primitives[0]
  54  |   const left = binary.surfaces.find(m => m.partId === 'shoulder_left').primitives[0]
  55  |   const right = binary.surfaces.find(m => m.partId === 'shoulder_right').primitives[0]
  56  |   expect(binary.validHeader).toBe(true)
  57  |   expect(front.image.counts.red).toBeGreaterThan(1000); expect(front.image.counts.blue).toBeGreaterThan(1000)
  58  |   expect(front.image.counts.green).toBe(0); expect(back.image.counts.red).toBe(0); expect(back.image.counts.blue).toBe(0)
  59  |   expect(back.image.counts.white).toBeGreaterThan(100)
  60  |   expect(left.image.counts.green).toBeGreaterThan(1000); expect(left.image.counts.red).toBe(0); expect(left.image.counts.blue).toBe(0)
  61  |   expect(right.image).toBeNull()
  62  |   for (const target of [front, back, left]) expect(target.material.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]).toEqual([1, 1, 1, 1])
  63  |   expect(saved.customization.zones.sleeve_right.layers).toHaveLength(0)
  64  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  65  |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/acceptance-isolated.glb`)
  66  |   await page.getByText(/Successfully imported/).waitFor()
  67  |   const reimported = await scene(page)
  68  |   await record('acceptance-reimport', reimported)
  69  |   expect(reimported.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture).toBeUndefined()
  70  |   expect(reimported.meshes.find(m => m.name === 'Body_Main').materials[0].texture.width).toBe(1024)
  71  | })
  72  | 
  73  | test('Phase 3.5 undo/redo updates actual texture and exported pixels', async ({ page }) => {
  74  |   const events = await setup(page)
  75  |   await open(page)
  76  |   await page.getByTitle('Rectangle', { exact: true }).click()
  77  |   await ready(page)
  78  |   const added = await scene(page)
  79  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  80  |   await page.keyboard.press('Control+z')
  81  |   await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture).toBeUndefined()
  82  |   await exportProduct(page, 'undo-empty')
  83  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  84  |   await page.keyboard.press('Control+y')
  85  |   await ready(page)
  86  |   const redone = await scene(page)
  87  |   expect(redone.meshes[0].materials[0].texture.hash).toBe(added.meshes[0].materials[0].texture.hash)
  88  |   await exportProduct(page, 'redo-artwork')
  89  |   const undoneGLB = await inspectSurfaces(`${directory}/exports/undo-empty.glb`)
  90  |   const redoneGLB = await inspectSurfaces(`${directory}/exports/redo-artwork.glb`)
  91  |   await record('undo-redo-pixels', { added, redone, undoneGLB, redoneGLB, events })
  92  |   expect(undoneGLB.images).toHaveLength(0)
  93  |   expect(redoneGLB.images[0].counts.green).toBeGreaterThan(1000)
  94  | })
  95  | 
  96  | test('Phase 3.5 imported source plus editable artwork survives browser process restart', async () => {
  97  |   test.setTimeout(240000)
  98  |   const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-5-'))
  99  |   const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  100 |   let context = await chromium.launchPersistentContext(profile, options)
  101 |   try {
  102 |     let page = context.pages()[0]; page.setDefaultTimeout(15000)
  103 |     await setup(page); await open(page)
  104 |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  105 |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  106 |     await page.getByText(/Successfully imported/).waitFor()
  107 |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  108 |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'durable.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>') })
  109 |     await page.getByPlaceholder('Text to add...').fill('PERSISTENT ARTWORK')
  110 |     await page.getByPlaceholder('Text to add...').press('Enter')
  111 |     const name = (await scene(page)).meshes[0].name
  112 |     await ready(page, name)
  113 |     const before = await save(page), appearanceBefore = await scene(page)
  114 |     await record('persistence-original', { before, appearanceBefore, profile })
  115 |     await context.close()
  116 |     context = await chromium.launchPersistentContext(profile, options)
  117 |     page = context.pages()[0]; page.setDefaultTimeout(15000)
  118 |     await setup(page); await page.goto('http://localhost:3000')
```