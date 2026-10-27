# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 imported source plus editable artwork survives browser process restart
- Location: tests\qa\browser\phase3_5.spec.mjs:102:1

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('menuitem', { name: /^Open:/ }).first()

```

# Test source

```ts
  26  |   const png = await page.evaluate(() => {
  27  |     const c = document.createElement('canvas'); c.width = c.height = 128
  28  |     const ctx = c.getContext('2d'); ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 64, 128); ctx.fillStyle = 'blue'; ctx.fillRect(64, 0, 64, 128)
  29  |     return c.toDataURL()
  30  |   })
  31  |   await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'isolation-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  32  |   await ready(page)
  33  |   await zone(page, 'Back Center')
  34  |   await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
  35  |   await page.getByPlaceholder('Text to add...').press('Enter')
  36  |   await page.locator('input[type=number]').nth(0).fill('212')
  37  |   await page.locator('input[type=number]').nth(0).press('Tab')
  38  |   await page.locator('input[type=number]').nth(2).fill('600')
  39  |   await page.locator('input[type=number]').nth(2).press('Tab')
  40  |   await zone(page, 'Left Sleeve')
  41  |   await page.getByTitle('Star', { exact: true }).click()
  42  |   await ready(page, 'Sleeve_Left')
  43  |   const saved = await save(page), actual = await scene(page)
  44  |   const views = []
  45  |   for (const preset of ['front', 'back', 'left', 'right', 'top', 'perspective', 'Fit Product', 'Reset Camera']) {
  46  |     await page.getByRole('button', { name: preset, exact: true }).click()
  47  |     await page.waitForTimeout(500)
  48  |     views.push({ preset, camera: (await scene(page)).camera })
  49  |     await page.screenshot({ path: `${directory}/screenshots/acceptance-${preset.replaceAll(' ', '-')}.png` })
  50  |   }
  51  |   expect(views[0].camera[2]).toBeGreaterThan(0)
  52  |   expect(views[1].camera[2]).toBeLessThan(0)
  53  |   expect(views[2].camera[0]).toBeLessThan(0)
  54  |   expect(views[3].camera[0]).toBeGreaterThan(0)
  55  |   await exportProduct(page, 'acceptance-isolated')
  56  |   const binary = await inspectSurfaces(`${directory}/exports/acceptance-isolated.glb`)
  57  |   await record('acceptance-isolated', { initial, modeling, actual, saved, views, binary, events })
  58  |   const front = binary.surfaces.find(m => m.partId === 'shirt_front').primitives[0]
  59  |   const back = binary.surfaces.find(m => m.partId === 'shirt_back').primitives[0]
  60  |   const left = binary.surfaces.find(m => m.partId === 'shoulder_left').primitives[0]
  61  |   const right = binary.surfaces.find(m => m.partId === 'shoulder_right').primitives[0]
  62  |   expect(binary.validHeader).toBe(true)
  63  |   expect(front.image.counts.red).toBeGreaterThan(1000); expect(front.image.counts.blue).toBeGreaterThan(1000)
  64  |   expect(front.image.counts.green).toBe(0); expect(back.image.counts.red).toBe(0); expect(back.image.counts.blue).toBe(0)
  65  |   expect(back.image.counts.white).toBeGreaterThan(100)
  66  |   expect(left.image.counts.green).toBeGreaterThan(1000); expect(left.image.counts.red).toBe(0); expect(left.image.counts.blue).toBe(0)
  67  |   expect(right.image).toBeNull()
  68  |   for (const target of [front, back, left]) expect(target.material.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]).toEqual([1, 1, 1, 1])
  69  |   expect(saved.customization.zones.sleeve_right.layers).toHaveLength(0)
  70  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  71  |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/acceptance-isolated.glb`)
  72  |   await page.getByText(/Successfully imported/).waitFor()
  73  |   const reimported = await scene(page)
  74  |   await record('acceptance-reimport', reimported)
  75  |   expect(reimported.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture).toBeUndefined()
  76  |   expect(reimported.meshes.find(m => m.name === 'Body_Main').materials[0].texture.width).toBe(1024)
  77  | })
  78  | 
  79  | test('Phase 3.5 undo/redo updates actual texture and exported pixels', async ({ page }) => {
  80  |   const events = await setup(page)
  81  |   await open(page)
  82  |   await page.getByTitle('Rectangle', { exact: true }).click()
  83  |   await ready(page)
  84  |   const added = await scene(page)
  85  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  86  |   await page.keyboard.press('Control+z')
  87  |   await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture).toBeUndefined()
  88  |   await exportProduct(page, 'undo-empty')
  89  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  90  |   await page.keyboard.press('Control+y')
  91  |   await ready(page)
  92  |   const redone = await scene(page)
  93  |   expect(redone.meshes[0].materials[0].texture.hash).toBe(added.meshes[0].materials[0].texture.hash)
  94  |   await exportProduct(page, 'redo-artwork')
  95  |   const undoneGLB = await inspectSurfaces(`${directory}/exports/undo-empty.glb`)
  96  |   const redoneGLB = await inspectSurfaces(`${directory}/exports/redo-artwork.glb`)
  97  |   await record('undo-redo-pixels', { added, redone, undoneGLB, redoneGLB, events })
  98  |   expect(undoneGLB.images).toHaveLength(0)
  99  |   expect(redoneGLB.images[0].counts.green).toBeGreaterThan(1000)
  100 | })
  101 | 
  102 | test('Phase 3.5 imported source plus editable artwork survives browser process restart', async () => {
  103 |   test.setTimeout(240000)
  104 |   const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-5-'))
  105 |   const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  106 |   let context = await chromium.launchPersistentContext(profile, options)
  107 |   try {
  108 |     let page = context.pages()[0]; page.setDefaultTimeout(15000)
  109 |     await setup(page); await open(page)
  110 |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  111 |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  112 |     await page.getByText(/Successfully imported/).waitFor()
  113 |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  114 |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'durable.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>') })
  115 |     await page.getByPlaceholder('Text to add...').fill('PERSISTENT ARTWORK')
  116 |     await page.getByPlaceholder('Text to add...').press('Enter')
  117 |     const name = (await scene(page)).meshes[0].name
  118 |     await ready(page, name)
  119 |     const before = await save(page), appearanceBefore = await scene(page)
  120 |     await record('persistence-original', { before, appearanceBefore, profile })
  121 |     await context.close()
  122 |     context = await chromium.launchPersistentContext(profile, options)
  123 |     page = context.pages()[0]; page.setDefaultTimeout(15000)
  124 |     await setup(page); await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  125 |     await page.getByRole('button', { name: 'File', exact: true }).click()
> 126 |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
      |                                                                  ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  127 |     await page.getByText('Saved project opened', { exact: true }).waitFor()
  128 |     await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  129 |     await ready(page, name)
  130 |     const after = await save(page), appearanceAfter = await scene(page)
  131 |     await record('persistence-stabilized', { before, after, appearanceBefore, appearanceAfter, profile })
  132 |     expect(after.customization.zones).toEqual(before.customization.zones)
  133 |     expect(after.customization.partMaterials).toEqual(before.customization.partMaterials)
  134 |     expect(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
  135 |     await exportProduct(page, 'durable-reopened')
  136 |   } finally { await context.close() }
  137 | })
  138 | 
```