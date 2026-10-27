# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 imported source plus editable artwork survives browser process restart
- Location: tests\qa\browser\phase3_5.spec.mjs:98:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 60000ms exceeded.
Call log:
  - waiting for getByText('GLB Verification Passed', { exact: true }) to be visible

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
  26  |   await page.goto('http://localhost:3000')
  27  |   await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  28  |   await page.getByRole('button', { name: 'Library', exact: true }).waitFor()
  29  |   await expect.poll(() => page.evaluate(() => window.__qaSceneObjects?.().some(object => object.isMesh && object.name === 'Body_Main') || false), { timeout: 30000 }).toBe(true)
  30  | }
  31  | export async function product(page, name) {
  32  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  33  |   await page.getByRole('heading', { name, exact: true }).click()
  34  |   await page.waitForTimeout(1200)
  35  | }
  36  | export async function zone(page, name) {
  37  |   await page.getByRole('button', { name: 'Zones', exact: true }).click()
  38  |   await page.getByText(name, { exact: true }).first().click()
  39  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  40  | }
  41  | export async function save(page) {
  42  |   await page.getByRole('button', { name: 'Save Project', exact: true }).click()
  43  |   await page.getByText('Project saved to IndexedDB persistent storage!', { exact: true }).last().waitFor()
  44  |   await expect(page.getByRole('button', { name: 'Save Project', exact: true })).toBeEnabled()
  45  |   const saved = await page.evaluate(() => new Promise((resolve, reject) => {
  46  |     const request = indexedDB.open('3d-model-maker-assets', 1)
  47  |     request.onsuccess = () => {
  48  |       const db = request.result, transaction = db.transaction('projects', 'readonly')
  49  |       const read = transaction.objectStore('projects').getAll()
  50  |       read.onsuccess = () => { resolve(read.result.at(-1)); db.close() }
  51  |       read.onerror = reject
  52  |     }
  53  |     request.onerror = reject
  54  |   }))
  55  |   await record(`snapshot-${Date.now()}`, saved)
  56  |   return saved
  57  | }
  58  | export async function scene(page) {
  59  |   return page.evaluate(() => {
  60  |     const meshes = window.__qaSceneObjects().filter(object => object.isMesh && object.name && object.geometry?.attributes.uv)
  61  |     const sample = meshes.find(object => object.__r3f?.root)
  62  |     const root = sample?.__r3f.root.getState()
  63  |     function hash(values) {
  64  |       let h = 2166136261
  65  |       for (const v of values) h = Math.imul(h ^ Math.round(v * 1000000), 16777619)
  66  |       return h >>> 0
  67  |     }
  68  |     return {
  69  |       camera: root?.camera.position.toArray(), memory: root && { ...root.gl.info.memory }, heap: performance.memory?.usedJSHeapSize,
  70  |       meshes: meshes.map(mesh => ({
  71  |         name: mesh.name, vertices: mesh.geometry.attributes.position.count,
  72  |         triangles: (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3,
  73  |         attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k, v]) => [k, { count: v.count, hash: hash(v.array) }])),
  74  |         groups: mesh.geometry.groups, matrix: mesh.matrixWorld.toArray(),
  75  |         materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  76  |           const image = material.map?.image
  77  |           let texture
  78  |           if (image?.width) {
  79  |             const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
  80  |             const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
  81  |             const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  82  |             texture = { width: image.width, height: image.height, hash: hash(pixels), colorSpace: material.map.colorSpace, flipY: material.map.flipY,
  83  |               center: Array.from(ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data),
  84  |               corner: Array.from(ctx.getImageData(4, 4, 1, 1).data) }
  85  |           }
  86  |           return { color: material.color?.getHexString(), linear: material.color?.toArray(), roughness: material.roughness, metalness: material.metalness, type: material.type, normalMap: !!material.normalMap, texture }
  87  |         })
  88  |       }))
  89  |     }
  90  |   })
  91  | }
  92  | export async function exportProduct(page, name, resolution = 1024) {
  93  |   await page.getByRole('button', { name: 'Export GLB', exact: true }).last().click()
  94  |   await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
  95  |   const downloads = []
  96  |   const handler = d => downloads.push(d)
  97  |   page.on('download', handler)
  98  |   const started = Date.now()
  99  |   await page.getByRole('button', { name: 'Export GLB Asset', exact: true }).click()
  100 |   try {
> 101 |     await page.getByText('GLB Verification Passed', { exact: true }).waitFor({ timeout: 60000 })
      |                                                                      ^ TimeoutError: locator.waitFor: Timeout 60000ms exceeded.
  102 |   } catch (error) {
  103 |     await record(`${name}-export-failure`, { url: page.url(), events: page.__qaEvents, body: await page.locator('body').innerText().catch(() => '') })
  104 |     throw error
  105 |   }
  106 |   await page.waitForTimeout(700)
  107 |   for (const download of downloads) {
  108 |     const extension = download.suggestedFilename().endsWith('.json') ? '.json' : '.glb'
  109 |     await download.saveAs(`${directory}/exports/${name}${extension}`)
  110 |   }
  111 |   page.off('download', handler)
  112 |   await page.getByRole('button', { name: 'Close', exact: true }).click()
  113 |   return { durationMs: Date.now() - started, downloads: downloads.map(d => d.suggestedFilename()) }
  114 | }
  115 | export async function inspectGLB(name) {
  116 |   const bytes = await readFile(`${directory}/exports/${name}.glb`)
  117 |   const jsonSize = bytes.readUInt32LE(12)
  118 |   const json = JSON.parse(bytes.subarray(20, 20 + jsonSize))
  119 |   const binary = bytes.subarray(28 + jsonSize)
  120 |   const images = []
  121 |   for (const [i, image] of (json.images || []).entries()) {
  122 |     const view = json.bufferViews[image.bufferView]
  123 |     const png = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
  124 |     await writeFile(`${directory}/exports/${name}-texture-${i}.png`, png)
  125 |     images.push({ mimeType: image.mimeType, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), sha256: createHash('sha256').update(png).digest('hex') })
  126 |   }
  127 |   const result = { magic: bytes.readUInt32LE(0), version: bytes.readUInt32LE(4), length: bytes.length, declaredLength: bytes.readUInt32LE(8), nodes: json.nodes, meshes: json.meshes, materials: json.materials, accessors: json.accessors, images }
  128 |   await record(name + '-glb', result)
  129 |   return result
  130 | }
  131 | 
```