# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 imported source plus editable artwork survives browser process restart
- Location: tests\qa\browser\phase3_5.spec.mjs:96:1

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
  13  |   const events = { errors: [], console: [], failedRequests: [] }
  14  |   page.on('pageerror', error => events.errors.push(error.message))
  15  |   page.on('console', message => {
  16  |     if (['warning', 'error'].includes(message.type()) && events.console.length < 100) events.console.push(message.text())
  17  |   })
  18  |   page.on('requestfailed', request => events.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  19  |   await page.addInitScript(observeReactScenes)
  20  |   return events
  21  | }
  22  | export async function open(page) {
  23  |   await page.goto('http://localhost:3000')
  24  |   await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  25  |   await page.getByRole('button', { name: 'Library', exact: true }).waitFor()
  26  |   await expect.poll(() => page.evaluate(() => window.__qaSceneObjects?.().some(object => object.isMesh && object.name === 'Body_Main') || false), { timeout: 30000 }).toBe(true)
  27  | }
  28  | export async function product(page, name) {
  29  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  30  |   await page.getByRole('heading', { name, exact: true }).click()
  31  |   await page.waitForTimeout(1200)
  32  | }
  33  | export async function zone(page, name) {
  34  |   await page.getByRole('button', { name: 'Zones', exact: true }).click()
  35  |   await page.getByText(name, { exact: true }).first().click()
  36  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  37  | }
  38  | export async function save(page) {
  39  |   await page.getByRole('button', { name: 'Save Project', exact: true }).click()
  40  |   await page.getByText('Project saved to IndexedDB persistent storage!', { exact: true }).last().waitFor()
  41  |   await expect(page.getByRole('button', { name: 'Save Project', exact: true })).toBeEnabled()
  42  |   const saved = await page.evaluate(() => new Promise((resolve, reject) => {
  43  |     const request = indexedDB.open('3d-model-maker-assets', 1)
  44  |     request.onsuccess = () => {
  45  |       const db = request.result, transaction = db.transaction('projects', 'readonly')
  46  |       const read = transaction.objectStore('projects').getAll()
  47  |       read.onsuccess = () => { resolve(read.result.at(-1)); db.close() }
  48  |       read.onerror = reject
  49  |     }
  50  |     request.onerror = reject
  51  |   }))
  52  |   await record(`snapshot-${Date.now()}`, saved)
  53  |   return saved
  54  | }
  55  | export async function scene(page) {
  56  |   return page.evaluate(() => {
  57  |     const meshes = window.__qaSceneObjects().filter(object => object.isMesh && object.name && object.geometry?.attributes.uv)
  58  |     const sample = meshes.find(object => object.__r3f?.root)
  59  |     const root = sample?.__r3f.root.getState()
  60  |     function hash(values) {
  61  |       let h = 2166136261
  62  |       for (const v of values) h = Math.imul(h ^ Math.round(v * 1000000), 16777619)
  63  |       return h >>> 0
  64  |     }
  65  |     return {
  66  |       camera: root?.camera.position.toArray(), memory: root && { ...root.gl.info.memory }, heap: performance.memory?.usedJSHeapSize,
  67  |       meshes: meshes.map(mesh => ({
  68  |         name: mesh.name, vertices: mesh.geometry.attributes.position.count,
  69  |         triangles: (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3,
  70  |         attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k, v]) => [k, { count: v.count, hash: hash(v.array) }])),
  71  |         groups: mesh.geometry.groups, matrix: mesh.matrixWorld.toArray(),
  72  |         materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  73  |           const image = material.map?.image
  74  |           let texture
  75  |           if (image?.width) {
  76  |             const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
  77  |             const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
  78  |             const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  79  |             texture = { width: image.width, height: image.height, hash: hash(pixels), colorSpace: material.map.colorSpace, flipY: material.map.flipY,
  80  |               center: Array.from(ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data),
  81  |               corner: Array.from(ctx.getImageData(4, 4, 1, 1).data) }
  82  |           }
  83  |           return { color: material.color?.getHexString(), linear: material.color?.toArray(), roughness: material.roughness, metalness: material.metalness, type: material.type, normalMap: !!material.normalMap, texture }
  84  |         })
  85  |       }))
  86  |     }
  87  |   })
  88  | }
  89  | export async function exportProduct(page, name, resolution = 1024) {
  90  |   await page.getByRole('button', { name: 'Export GLB', exact: true }).last().click()
  91  |   await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
  92  |   const downloads = []
  93  |   const handler = d => downloads.push(d)
  94  |   page.on('download', handler)
  95  |   const started = Date.now()
> 96  |   await page.getByRole('button', { name: 'Export GLB Asset', exact: true }).click()
      |                                                                    ^ TimeoutError: locator.waitFor: Timeout 60000ms exceeded.
  97  |   await page.getByText('GLB Verification Passed', { exact: true }).waitFor({ timeout: 60000 })
  98  |   await page.waitForTimeout(700)
  99  |   for (const download of downloads) {
  100 |     const extension = download.suggestedFilename().endsWith('.json') ? '.json' : '.glb'
  101 |     await download.saveAs(`${directory}/exports/${name}${extension}`)
  102 |   }
  103 |   page.off('download', handler)
  104 |   await page.getByRole('button', { name: 'Close', exact: true }).click()
  105 |   return { durationMs: Date.now() - started, downloads: downloads.map(d => d.suggestedFilename()) }
  106 | }
  107 | export async function inspectGLB(name) {
  108 |   const bytes = await readFile(`${directory}/exports/${name}.glb`)
  109 |   const jsonSize = bytes.readUInt32LE(12)
  110 |   const json = JSON.parse(bytes.subarray(20, 20 + jsonSize))
  111 |   const binary = bytes.subarray(28 + jsonSize)
  112 |   const images = []
  113 |   for (const [i, image] of (json.images || []).entries()) {
  114 |     const view = json.bufferViews[image.bufferView]
  115 |     const png = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
  116 |     await writeFile(`${directory}/exports/${name}-texture-${i}.png`, png)
  117 |     images.push({ mimeType: image.mimeType, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), sha256: createHash('sha256').update(png).digest('hex') })
  118 |   }
  119 |   const result = { magic: bytes.readUInt32LE(0), version: bytes.readUInt32LE(4), length: bytes.length, declaredLength: bytes.readUInt32LE(8), nodes: json.nodes, meshes: json.meshes, materials: json.materials, accessors: json.accessors, images }
  120 |   await record(name + '-glb', result)
  121 |   return result
  122 | }
  123 | 
```