# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-durability.spec.mjs >> Phase 3 editable project survives a new browser process with durable image assets
- Location: tests\qa\browser\phase3-durability.spec.mjs:54:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 3
+ Received  + 3

  Array [
-   34,
-   68,
-   102,
+   0,
+   1,
+   1,
    255,
  ]

Call Log:
- Timeout 30000ms exceeded while waiting on the predicate
```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { mkdtemp } from 'node:fs/promises'
  3   | import { tmpdir } from 'node:os'
  4   | import { join } from 'node:path'
  5   | import { directory, setup, open, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'
  6   | 
  7   | test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })
  8   | test.setTimeout(180000)
  9   | 
  10  | test('Phase 3 uploaded PNG JPEG WebP SVG, keyboard protection and malformed input errors', async ({ page }) => {
  11  |   const events = await setup(page)
  12  |   await open(page)
  13  |   await product(page, 'Streetwear Oversized Tee')
  14  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  15  |   const uploader = page.locator('input[type=file][accept*="image"]')
  16  |   for (const mime of ['image/png', 'image/jpeg', 'image/webp']) {
  17  |     const encoded = await page.evaluate(mime => {
  18  |       const c = document.createElement('canvas'); c.width = 64; c.height = 32
  19  |       const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 32); ctx.fillStyle = '#00ff00'; ctx.fillRect(32, 0, 32, 32)
  20  |       return c.toDataURL(mime)
  21  |     }, mime)
  22  |     await uploader.setInputFiles({ name: `qa.${mime.split('/')[1]}`, mimeType: mime, buffer: Buffer.from(encoded.split(',')[1], 'base64') })
  23  |     await page.waitForTimeout(500)
  24  |   }
  25  |   const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>window.__svgExecuted=true</script><rect width="64" height="64" fill="blue" onload="window.__svgExecuted=true"/><foreignObject><div>unsafe</div></foreignObject></svg>'
  26  |   await uploader.setInputFiles({ name: 'sanitized.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  27  |   await page.getByPlaceholder('Text to add...').fill('KEYBOARD TEST')
  28  |   await page.getByPlaceholder('Text to add...').press('Enter')
  29  |   const before = await save(page)
  30  |   await page.getByPlaceholder('Text to add...').focus()
  31  |   await page.keyboard.press('Delete')
  32  |   await page.keyboard.press('Control+d')
  33  |   const protectedInput = await save(page)
  34  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  35  |   await page.keyboard.press('Control+d')
  36  |   const duplicated = await save(page)
  37  |   await uploader.setInputFiles({ name: 'malformed.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') })
  38  |   await page.waitForTimeout(1000)
  39  |   const malformedBody = await page.locator('body').innerText()
  40  |   await uploader.setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg><path invalid') })
  41  |   await page.waitForTimeout(1000)
  42  |   const after = await save(page)
  43  |   await record('uploads-security', { before, protectedInput, duplicated, after, malformedBody, svgExecuted: await page.evaluate(() => !!window.__svgExecuted), events })
  44  |   await page.screenshot({ path: `${directory}/screenshots/uploads-security.png` })
  45  |   expect.soft(before.customization.zones.body_front.layers).toHaveLength(5)
  46  |   expect.soft(protectedInput.customization.zones.body_front.layers).toHaveLength(5)
  47  |   expect.soft(duplicated.customization.zones.body_front.layers).toHaveLength(6)
  48  |   const sanitized = decodeURIComponent(before.customization.zones.body_front.layers.find(l => l.isSvg).src.split(',').slice(1).join(','))
  49  |   expect.soft(sanitized).not.toMatch(/<script|onload=|foreignObject/)
  50  |   expect.soft(malformedBody, 'malformed PNG must report a user-facing error').toMatch(/invalid image|failed to (load|read|upload)|upload failed/i)
  51  |   expect.soft(after.customization.zones.body_front.layers, 'invalid SVG must not create a broken layer').toHaveLength(6)
  52  | })
  53  | 
  54  | test('Phase 3 editable project survives a new browser process with durable image assets', async () => {
  55  |   test.setTimeout(240000)
  56  |   const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-'))
  57  |   const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  58  |   let context = await chromium.launchPersistentContext(profile, options)
  59  |   let events
  60  |   try {
  61  |     let page = context.pages()[0]
  62  |     page.setDefaultTimeout(15000)
  63  |     events = await setup(page)
  64  |     await open(page)
  65  |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  66  |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  67  |     await page.getByText(/Successfully imported/).waitFor()
  68  |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  69  |     const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>'
  70  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  71  |     const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 32; c.getContext('2d').fillRect(0, 0, 32, 32); return c.toDataURL() })
  72  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  73  |     await page.getByPlaceholder('Text to add...').fill('PERSISTENT TEXT')
  74  |     await page.getByPlaceholder('Text to add...').press('Enter')
  75  |     await page.getByRole('button', { name: 'Zones', exact: true }).click()
  76  |     await page.getByRole('button', { name: 'Add Zone', exact: true }).click()
  77  |     await page.getByPlaceholder('Zone Name (e.g. Chest Print)...').fill('QA Durable Zone')
  78  |     await page.getByRole('button', { name: 'Save Zone', exact: true }).click()
  79  |     await page.getByRole('button', { name: 'Material & Finish', exact: true }).click()
  80  |     await page.locator('input[type=color]').first().fill('#224466')
> 81  |     await expect.poll(async () => (await scene(page)).meshes[0]?.materials[0].texture?.corner, { timeout: 30000 }).toEqual([34, 68, 102, 255])
      |                                                                                                                    ^ Error: expect(received).toEqual(expected) // deep equality
  82  |     const before = await save(page)
  83  |     await page.waitForTimeout(1200)
  84  |     const appearanceBefore = await scene(page)
  85  |     await page.screenshot({ path: `${directory}/screenshots/persistence-before.png` })
  86  |     await record('persistence-before', { before, appearanceBefore, profile, events })
  87  |     await context.close()
  88  |     context = await chromium.launchPersistentContext(profile, options)
  89  |     page = context.pages()[0]; page.setDefaultTimeout(15000)
  90  |     const reopenedEvents = await setup(page)
  91  |     await page.goto('http://localhost:3000')
  92  |     await page.getByRole('button', { name: 'File', exact: true }).click()
  93  |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  94  |     await page.getByText('Saved project opened', { exact: true }).waitFor()
  95  |     await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  96  |     await page.waitForTimeout(1500)
  97  |     const appearanceAfter = await scene(page)
  98  |     const after = await save(page)
  99  |     await record('persistence-comparison', { before, after, appearanceBefore, appearanceAfter, profile, events, reopenedEvents })
  100 |     await page.screenshot({ path: `${directory}/screenshots/persistence-after.png` })
  101 |     await exportProduct(page, 'durable-reopened')
  102 |     expect.soft(after.customization.zones).toEqual(before.customization.zones)
  103 |     expect.soft(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
  104 |     expect.soft(after.customization.fabricColor).toBe('#224466')
  105 |   } finally { await context.close() }
  106 | })
  107 | 
```