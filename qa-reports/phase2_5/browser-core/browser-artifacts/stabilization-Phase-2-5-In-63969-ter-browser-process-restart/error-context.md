# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stabilization.spec.mjs >> Phase 2.5 >> IndexedDB reconstructs edited textured geometry after browser process restart
- Location: tests\qa\browser\stabilization.spec.mjs:56:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /^solid$/i })
Expected: visible
Timeout: 12000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: /^solid$/i }) with timeout 12000ms
  - waiting for getByRole('button', { name: /^solid$/i })

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/ 1
  - button "next" [disabled]:
    - img "next"
- link "Next.js 16.4.2 (stale) Turbopack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 16.4.2 (stale) Turbopack
- dialog "Runtime Error":
  - text: Runtime Error
  - button "Copy Error Info":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - button "Attach Node.js inspector":
    - img
  - text: "An unexpected Turbopack error occurred. Please see the output of `next dev` for more details."
  - paragraph: Call Stack 2
  - button "Show 2 ignore-listed frame(s)":
    - text: Show 2 ignore-listed frame(s)
    - img
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- button "Collapse issues badge":
  - img
- alert
```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { writeFile, mkdir, mkdtemp } from 'node:fs/promises'
  3   | import { observeReactScenes } from './observer.mjs'
  4   | 
  5   | const directory = 'qa-reports/phase2_5'
  6   | const launch = { executablePath: process.env.QA_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  7   | async function editor(page) {
  8   |   await page.addInitScript(observeReactScenes)
  9   |   await page.goto('http://localhost:3000')
> 10  |   await expect(page.getByRole('button', { name: /^solid$/i })).toBeVisible()
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  11  | }
  12  | async function importFile(page, file, name) {
  13  |   await page.getByRole('button', { name: 'Import', exact: true }).click()
  14  |   await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles(file)
  15  |   await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  16  | }
  17  | async function exportFile(page, file) {
  18  |   await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  19  |   await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  20  |   await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  21  |   const pending = page.waitForEvent('download')
  22  |   await page.getByRole('button', { name: /^Download/ }).click()
  23  |   await (await pending).saveAs(file)
  24  | }
  25  | async function meshData(page, name = 'QA_small') {
  26  |   return page.evaluate((name) => {
  27  |     const mesh = window.__qaSceneObjects().find((object) => object.name === name)
  28  |     if (!mesh) return null
  29  |     const geometry = mesh.geometry
  30  |     const attributes = Object.fromEntries(Object.keys(geometry.attributes).sort().map((key) => [key, Array.from(geometry.attributes[key].array)]))
  31  |     const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((material) => {
  32  |       const maps = {}
  33  |       for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) {
  34  |         const texture = material[key]
  35  |         if (!texture) continue
  36  |         const canvas = document.createElement('canvas'); canvas.width = texture.image.width; canvas.height = texture.image.height
  37  |         canvas.getContext('2d').drawImage(texture.image, 0, 0)
  38  |         maps[key] = { width: canvas.width, height: canvas.height, colorSpace: texture.colorSpace, pixels: Array.from(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data) }
  39  |       }
  40  |       return { type: material.type, name: material.name, color: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, opacity: material.opacity, side: material.side, maps }
  41  |     })
  42  |     return { attributes, index: geometry.index && Array.from(geometry.index.array), groups: geometry.groups, matrix: mesh.matrixWorld.toArray(), materials }
  43  |   }, name)
  44  | }
  45  | 
  46  | test.describe('Phase 2.5', () => {
  47  |   test.beforeAll(async () => { await mkdir(directory + '/screenshots', { recursive: true }); await mkdir(directory + '/profiles', { recursive: true }) })
  48  | 
  49  |   test('actual Model Maker exports a multi-part black PBR garment with textures', async ({ page }) => {
  50  |     await editor(page)
  51  |     await importFile(page, directory + '/fixtures/multipart-textured-input.glb', 'shirt_front')
  52  |     await exportFile(page, directory + '/fixtures/multipart-pbr-export.glb')
  53  |     await page.screenshot({ path: directory + '/screenshots/multipart-export.png' })
  54  |   })
  55  | 
  56  |   test('IndexedDB reconstructs edited textured geometry after browser process restart', async () => {
  57  |     test.setTimeout(150000)
  58  |     const profile = await mkdtemp(directory + '/profiles/durable-')
  59  |     let context = await chromium.launchPersistentContext(profile, launch)
  60  |     let page = context.pages()[0]
  61  |     await editor(page)
  62  |     await importFile(page, 'qa-reports/exported-models/pbr-textures.glb', 'QA_small')
  63  |     await page.getByRole('button', { name: 'Geom', exact: true }).click()
  64  |     await page.keyboard.press('Tab'); await page.keyboard.press('3'); await page.keyboard.press('a')
  65  |     await page.getByRole('button', { name: 'Extrude Faces', exact: true }).click()
  66  |     await page.keyboard.press('Tab')
  67  |     await page.getByRole('button', { name: 'UV Lab', exact: true }).click()
  68  |     await page.getByRole('button', { name: /Box Projection/ }).click()
  69  |     await page.getByRole('button', { name: '3D Studio', exact: true }).click()
  70  |     await page.getByRole('button', { name: 'Mat', exact: true }).click()
  71  |     await page.locator('input[type="color"]').first().fill('#111111')
  72  |     await expect.poll(async () => (await meshData(page))?.materials[0].color[0]).toBeGreaterThan(0)
  73  |     const before = await meshData(page)
  74  |     await page.getByRole('button', { name: 'Save', exact: true }).click()
  75  |     await expect(page.getByText('Project saved to IndexedDB', { exact: true })).toBeVisible()
  76  |     expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('3d_project_')))).toEqual([])
  77  |     await context.close()
  78  |     context = await chromium.launchPersistentContext(profile, launch)
  79  |     page = context.pages()[0]
  80  |     await editor(page)
  81  |     await page.getByRole('button', { name: 'File', exact: true }).click()
  82  |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  83  |     await expect(page.getByText('Saved project opened', { exact: true })).toBeVisible()
  84  |     await expect.poll(async () => (await meshData(page))?.materials[0].maps.map?.width).toBe(8)
  85  |     const after = await meshData(page)
  86  |     await writeFile(directory + '/durable-browser-comparison.json', JSON.stringify({ before, after, profile }, null, 2))
  87  |     expect(after).toEqual(before)
  88  |     await page.screenshot({ path: directory + '/screenshots/durable-reopened.png' })
  89  |     await page.evaluate(() => new Promise((resolve, reject) => {
  90  |       const request = indexedDB.open('3d-model-maker-assets', 1)
  91  |       request.onsuccess = () => {
  92  |         const db = request.result, transaction = db.transaction(['projects', 'assets'], 'readwrite')
  93  |         const projects = transaction.objectStore('projects').getAll()
  94  |         projects.onsuccess = () => transaction.objectStore('assets').delete(projects.result[0].assetId)
  95  |         transaction.oncomplete = () => { db.close(); resolve() }; transaction.onerror = reject
  96  |       }; request.onerror = reject
  97  |     }))
  98  |     await page.getByRole('button', { name: 'File', exact: true }).click()
  99  |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  100 |     await expect(page.getByText(/Missing project asset bundle/)).toBeVisible()
  101 |     expect(await meshData(page)).toEqual(after)
  102 |     await context.close()
  103 |   })
  104 | 
  105 |   test('repeated real imports/removals retain bounded renderer geometry resources', async ({ page }) => {
  106 |     test.setTimeout(150000)
  107 |     await editor(page)
  108 |     const measurements = []
  109 |     for (let index = 0; index < 6; index++) {
  110 |       await importFile(page, 'qa-reports/exported-models/pbr-textures.glb', 'QA_small')
```