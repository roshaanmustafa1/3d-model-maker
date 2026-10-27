# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-blackbullet.spec.mjs >> Phase 3 customized export reimports into Model Maker with artwork textures
- Location: tests\qa\browser\phase3-blackbullet.spec.mjs:91:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /^solid$/i }) to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "This page couldn’t load" [level=1] [ref=e6]
  - paragraph [ref=e7]: Reload to try again, or go back.
  - generic [ref=e8]:
    - button "Reload" [ref=e10] [cursor=pointer]
    - button "Back" [ref=e11] [cursor=pointer]
```

# Test source

```ts
  1   | import { mkdir, writeFile, readFile } from 'node:fs/promises'
  2   | import { createHash } from 'node:crypto'
  3   | import { expect } from '@playwright/test'
  4   | import { observeReactScenes } from '../../tests/qa/browser/observer.mjs'
  5   | export const directory = process.env.QA_PHASE3_DIR || 'qa-reports/phase3'
  6   | export async function record(name, data) {
  7   |   await mkdir(directory + '/raw', { recursive: true })
  8   |   await writeFile(`${directory}/raw/${name}.json`, JSON.stringify(data, null, 2))
  9   | }
  10  | export async function setup(page) {
  11  |   await mkdir(directory + '/screenshots', { recursive: true })
  12  |   await mkdir(directory + '/exports', { recursive: true })
  13  |   const events = { errors: [], console: [], failedRequests: [], navigations: [], crashes: 0 }
  14  |   page.__qaEvents = events
  15  |   page.on('crash', () => events.crashes++)
  16  |   page.on('framenavigated', frame => { if (frame === page.mainFrame()) events.navigations.push(frame.url()) })
  17  |   page.on('pageerror', error => events.errors.push(error.message))
  18  |   page.on('console', message => {
  19  |     if (['warning', 'error'].includes(message.type()) && events.console.length < 100) events.console.push(message.text())
  20  |   })
  21  |   page.on('requestfailed', request => events.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  22  |   await page.addInitScript(observeReactScenes)
  23  |   return events
  24  | }
  25  | export async function open(page) {
  26  |   await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
> 27  |   await page.getByRole('button', { name: /^solid$/i }).waitFor()
      |                                                        ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  28  |   await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  29  |   await page.getByRole('button', { name: 'Library', exact: true }).waitFor()
  30  |   await expect.poll(() => page.evaluate(() => window.__qaSceneObjects?.().some(object => object.isMesh && object.name === 'Body_Main') || false), { timeout: 30000 }).toBe(true)
  31  | }
  32  | export async function product(page, name) {
  33  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  34  |   await page.getByRole('heading', { name, exact: true }).click()
  35  |   await page.waitForTimeout(1200)
  36  | }
  37  | export async function zone(page, name) {
  38  |   await page.getByRole('button', { name: 'Zones', exact: true }).click()
  39  |   await page.getByText(name, { exact: true }).first().click()
  40  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  41  | }
  42  | export async function save(page) {
  43  |   await page.getByRole('button', { name: 'Save Project', exact: true }).click()
  44  |   await page.getByText('Project saved to IndexedDB persistent storage!', { exact: true }).last().waitFor()
  45  |   await expect(page.getByRole('button', { name: 'Save Project', exact: true })).toBeEnabled()
  46  |   const saved = await page.evaluate(() => new Promise((resolve, reject) => {
  47  |     const request = indexedDB.open('3d-model-maker-assets', 1)
  48  |     request.onsuccess = () => {
  49  |       const db = request.result, transaction = db.transaction('projects', 'readonly')
  50  |       const read = transaction.objectStore('projects').getAll()
  51  |       read.onsuccess = () => { resolve(read.result.at(-1)); db.close() }
  52  |       read.onerror = reject
  53  |     }
  54  |     request.onerror = reject
  55  |   }))
  56  |   await record(`snapshot-${Date.now()}`, saved)
  57  |   return saved
  58  | }
  59  | export async function scene(page) {
  60  |   return page.evaluate(() => {
  61  |     const meshes = window.__qaSceneObjects().filter(object => object.isMesh && object.name && object.geometry?.attributes.uv)
  62  |     const sample = meshes.find(object => object.__r3f?.root)
  63  |     const root = sample?.__r3f.root.getState()
  64  |     function hash(values) {
  65  |       let h = 2166136261
  66  |       for (const v of values) h = Math.imul(h ^ Math.round(v * 1000000), 16777619)
  67  |       return h >>> 0
  68  |     }
  69  |     return {
  70  |       camera: root?.camera.position.toArray(), memory: root && { ...root.gl.info.memory }, heap: performance.memory?.usedJSHeapSize,
  71  |       meshes: meshes.map(mesh => ({
  72  |         name: mesh.name, vertices: mesh.geometry.attributes.position.count,
  73  |         triangles: (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3,
  74  |         attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k, v]) => [k, { count: v.count, hash: hash(v.array) }])),
  75  |         groups: mesh.geometry.groups, matrix: mesh.matrixWorld.toArray(),
  76  |         materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  77  |           const image = material.map?.image
  78  |           let texture
  79  |           if (image?.width) {
  80  |             const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
  81  |             const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
  82  |             const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  83  |             texture = { width: image.width, height: image.height, hash: hash(pixels), colorSpace: material.map.colorSpace, flipY: material.map.flipY,
  84  |               center: Array.from(ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data),
  85  |               corner: Array.from(ctx.getImageData(4, 4, 1, 1).data) }
  86  |           }
  87  |           return { color: material.color?.getHexString(), linear: material.color?.toArray(), roughness: material.roughness, metalness: material.metalness, type: material.type, normalMap: !!material.normalMap, texture }
  88  |         })
  89  |       }))
  90  |     }
  91  |   })
  92  | }
  93  | export async function exportProduct(page, name, resolution = 1024) {
  94  |   await page.getByRole('button', { name: 'Export GLB', exact: true }).last().click()
  95  |   await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
  96  |   const downloads = []
  97  |   const handler = d => downloads.push(d)
  98  |   page.on('download', handler)
  99  |   const started = Date.now()
  100 |   await page.getByRole('button', { name: 'Export GLB Asset', exact: true }).click()
  101 |   try {
  102 |     await page.getByText('GLB Verification Passed', { exact: true }).waitFor({ timeout: 60000 })
  103 |   } catch (error) {
  104 |     await record(`${name}-export-failure`, { url: page.url(), events: page.__qaEvents, body: await page.locator('body').innerText().catch(() => '') })
  105 |     throw error
  106 |   }
  107 |   await page.waitForTimeout(700)
  108 |   for (const download of downloads) {
  109 |     const extension = download.suggestedFilename().endsWith('.json') ? '.json' : '.glb'
  110 |     await download.saveAs(`${directory}/exports/${name}${extension}`)
  111 |   }
  112 |   page.off('download', handler)
  113 |   await page.getByRole('button', { name: 'Close', exact: true }).click()
  114 |   return { durationMs: Date.now() - started, downloads: downloads.map(d => d.suggestedFilename()) }
  115 | }
  116 | export async function inspectGLB(name) {
  117 |   const bytes = await readFile(`${directory}/exports/${name}.glb`)
  118 |   const jsonSize = bytes.readUInt32LE(12)
  119 |   const json = JSON.parse(bytes.subarray(20, 20 + jsonSize))
  120 |   const binary = bytes.subarray(28 + jsonSize)
  121 |   const images = []
  122 |   for (const [i, image] of (json.images || []).entries()) {
  123 |     const view = json.bufferViews[image.bufferView]
  124 |     const png = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
  125 |     await writeFile(`${directory}/exports/${name}-texture-${i}.png`, png)
  126 |     images.push({ mimeType: image.mimeType, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), sha256: createHash('sha256').update(png).digest('hex') })
  127 |   }
```