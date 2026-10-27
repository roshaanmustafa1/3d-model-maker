# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 acceptance: actual front/back/sleeve pixels, source factors and reimport
- Location: tests\qa\browser\phase3_5.spec.mjs:14:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: Scene Explorer
          - button "Add" [ref=e55] [cursor=pointer]
        - textbox "Filter meshes..." [ref=e61]
        - generic [ref=e64] [cursor=pointer]:
          - generic [ref=e65]: Studio_Cube
          - generic [ref=e70]:
            - button "Toggle Visibility" [ref=e71]
            - button "Lock Node" [ref=e75]
            - button "Duplicate" [ref=e79]
            - button "Delete" [ref=e83]
      - separator [ref=e87]
      - generic [ref=e91]:
        - generic:
          - generic [ref=e92]:
            - button "Object Mode [Tab]" [ref=e93] [cursor=pointer]:
              - generic [ref=e97]: Object Mode
              - generic [ref=e98]: "[Tab]"
            - button [ref=e100] [cursor=pointer]
            - button [ref=e104] [cursor=pointer]
            - button [ref=e110] [cursor=pointer]
            - button [ref=e114] [cursor=pointer]
            - button "world" [ref=e121]
          - generic [ref=e122]:
            - button "solid" [ref=e123] [cursor=pointer]
            - button [ref=e129] [cursor=pointer]
            - button [ref=e135] [cursor=pointer]
            - button [ref=e140] [cursor=pointer]
            - button [ref=e143] [cursor=pointer]
      - separator [ref=e153]
      - generic [ref=e157]:
        - generic [ref=e158]:
          - generic [ref=e159]: Inspector
          - generic [ref=e160]:
            - button [ref=e161]
            - button [ref=e162]
            - button [ref=e163]
            - button [ref=e164]
        - generic [ref=e165]:
          - textbox [ref=e166]: Studio_Cube
          - generic [ref=e167]: mesh
        - generic [ref=e168]:
          - button "Trans" [ref=e169]
          - button "Geom" [ref=e175]
          - button "Mat" [ref=e179]
          - button "BB" [ref=e186]
          - button "UV" [ref=e190]
          - button "Light" [ref=e193]
        - generic [ref=e201]:
          - generic [ref=e202]:
            - text: Position (X, Y, Z)
            - generic [ref=e203]:
              - generic [ref=e204]:
                - generic [ref=e205]: X
                - spinbutton [ref=e206]: "0"
              - generic [ref=e207]:
                - generic [ref=e208]: "Y"
                - spinbutton [ref=e209]: "0.5"
              - generic [ref=e210]:
                - generic [ref=e211]: Z
                - spinbutton [ref=e212]: "0"
          - generic [ref=e213]:
            - text: Rotation (Degrees)
            - generic [ref=e214]:
              - generic [ref=e215]:
                - generic [ref=e216]: X
                - spinbutton [ref=e217]: "0"
              - generic [ref=e218]:
                - generic [ref=e219]: "Y"
                - spinbutton [ref=e220]: "0"
              - generic [ref=e221]:
                - generic [ref=e222]: Z
                - spinbutton [ref=e223]: "0"
          - generic [ref=e224]:
            - text: Scale
            - generic [ref=e225]:
              - generic [ref=e226]:
                - generic [ref=e227]: X
                - spinbutton [ref=e228]: "1"
              - generic [ref=e229]:
                - generic [ref=e230]: "Y"
                - spinbutton [ref=e231]: "1"
              - generic [ref=e232]:
                - generic [ref=e233]: Z
                - spinbutton [ref=e234]: "1"
          - generic [ref=e235]:
            - button "Reset" [ref=e236]
            - button "Center" [ref=e237]
    - contentinfo [ref=e238]:
      - generic [ref=e239]:
        - generic [ref=e240]: Studio_Cube
        - generic [ref=e244]: Saved
      - generic [ref=e248]:
        - generic "Total Scene Vertices" [ref=e249]:
          - generic [ref=e250]: "Verts:"
          - generic [ref=e251]: "24"
        - generic "Total Scene Triangles / Polygons" [ref=e253]:
          - generic [ref=e254]: "Tris:"
          - generic [ref=e255]: "12"
        - generic "Total Mesh Objects" [ref=e257]: "1"
        - generic "Total PBR Materials" [ref=e263]: "1"
        - generic "Render Viewport FPS" [ref=e272]: 5 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e281] [cursor=pointer]
  - alert [ref=e285]
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
  18  |   expect(initial.meshes.find(m => m.name === 'Body_Main')).toBeTruthy()
  19  |   await page.getByRole('button', { name: '3D Modeling Studio', exact: true }).click()
  20  |   const modeling = await scene(page)
> 21  |   expect(modeling.meshes.some(m => m.name === 'Studio_Cube')).toBe(true)
      |                                                               ^ Error: expect(received).toBe(expected) // Object.is equality
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
  119 |     await page.getByRole('button', { name: 'File', exact: true }).click()
  120 |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  121 |     await page.getByText('Saved project opened', { exact: true }).waitFor()
```