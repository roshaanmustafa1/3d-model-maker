# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.mjs >> Independent Phase 3 >> real artwork controls, durable layers, UV isolation, export resolutions and BlackBullet
- Location: tests\qa\browser\phase3.spec.mjs:55:3

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Back Center/ })

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
            - button "Zones" [active] [ref=e76]
            - button "Library" [ref=e80]
          - generic [ref=e87]:
            - generic [ref=e88]:
              - generic [ref=e89]: Design Zones (4)
              - button "Add Zone" [ref=e93]
            - generic [ref=e95]:
              - generic [ref=e96] [cursor=pointer]:
                - generic [ref=e97]:
                  - generic [ref=e98]: Front Chest
                  - generic [ref=e99]: "3"
                - generic [ref=e100]:
                  - button "Disable zone" [ref=e101]
                  - button "Delete zone" [ref=e105]
              - generic [ref=e109] [cursor=pointer]:
                - generic [ref=e110]: Back Center
                - generic [ref=e112]:
                  - button "Disable zone" [ref=e113]
                  - button "Delete zone" [ref=e117]
              - generic [ref=e121] [cursor=pointer]:
                - generic [ref=e122]: Left Sleeve
                - generic [ref=e124]:
                  - button "Disable zone" [ref=e125]
                  - button "Delete zone" [ref=e129]
              - generic [ref=e133] [cursor=pointer]:
                - generic [ref=e134]: Right Sleeve
                - generic [ref=e136]:
                  - button "Disable zone" [ref=e137]
                  - button "Delete zone" [ref=e141]
        - generic [ref=e145]:
          - generic [ref=e146]:
            - button "Split View (2D + 3D)" [ref=e147]
            - button "2D Design Canvas" [ref=e148]
            - button "3D Product Preview" [ref=e149]
          - generic [ref=e150]:
            - generic [ref=e151]: "Active Zone: Front Chest | Canvas: 1024x1024px"
            - generic [ref=e158]:
              - generic:
                - generic [ref=e159]:
                  - button "Object Mode [Tab]" [ref=e160] [cursor=pointer]:
                    - generic [ref=e164]: Object Mode
                    - generic [ref=e165]: "[Tab]"
                  - button [ref=e167] [cursor=pointer]
                  - button [ref=e171] [cursor=pointer]
                  - button [ref=e177] [cursor=pointer]
                  - button [ref=e181] [cursor=pointer]
                  - button "world" [ref=e188]
                - generic [ref=e189]:
                  - button "solid" [ref=e190] [cursor=pointer]
                  - button [ref=e196] [cursor=pointer]
                  - button [ref=e202] [cursor=pointer]
                  - button [ref=e207] [cursor=pointer]
                  - button [ref=e210] [cursor=pointer]
          - generic [ref=e221]:
            - generic [ref=e222]:
              - button "perspective" [ref=e223]
              - button "front" [ref=e224]
              - button "back" [ref=e225]
              - button "left" [ref=e226]
              - button "right" [ref=e227]
              - button "top" [ref=e228]
            - generic [ref=e229]:
              - button "neutral" [ref=e236]
              - button "soft white" [ref=e237]
              - button "dark" [ref=e238]
              - button "warm" [ref=e239]
            - button "Screenshot" [ref=e240]
        - generic [ref=e241]:
          - generic [ref=e242]:
            - button "Layer Inspector" [ref=e243]
            - button "Material & Finish" [ref=e245]
          - generic [ref=e253]:
            - paragraph [ref=e255]: No Layer Selected
            - paragraph [ref=e256]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e257]:
        - generic [ref=e258]:
          - generic [ref=e259]:
            - generic [ref=e260]: "Zone:"
            - generic [ref=e261]: Front Chest
          - generic [ref=e262]:
            - generic [ref=e263]: "Bake Resolution:"
            - generic [ref=e264]: 1024 x 1024
          - generic [ref=e265]:
            - generic [ref=e266]: "UV Status:"
            - generic [ref=e267]: Mapped
        - generic [ref=e271]:
          - generic [ref=e272]: Saved at 11:22:56 PM
          - generic [ref=e273]: BlackBullet Compatible
    - contentinfo [ref=e274]:
      - generic [ref=e275]:
        - generic [ref=e276]: TShirt_Product
        - generic [ref=e280]: Saved at 11:22:56 PM
      - generic [ref=e284]:
        - generic "Total Scene Vertices" [ref=e285]:
          - generic [ref=e286]: "Verts:"
          - generic [ref=e287]: "306"
        - generic "Total Scene Triangles / Polygons" [ref=e289]:
          - generic [ref=e290]: "Tris:"
          - generic [ref=e291]: "248"
        - generic "Total Mesh Objects" [ref=e293]: "4"
        - generic "Total PBR Materials" [ref=e299]: "2"
        - generic "Render Viewport FPS" [ref=e308]: 3 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e317] [cursor=pointer]
  - alert [ref=e321]
```

# Test source

```ts
  1   | import { mkdir, writeFile, readFile } from 'node:fs/promises'
  2   | import { createHash } from 'node:crypto'
  3   | import { expect } from '@playwright/test'
  4   | import { observeReactScenes } from '../../tests/qa/browser/observer.mjs'
  5   | export const directory = 'qa-reports/phase3'
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
  26  | }
  27  | export async function product(page, name) {
  28  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  29  |   await page.getByRole('heading', { name, exact: true }).click()
  30  |   await page.waitForTimeout(1200)
  31  | }
  32  | export async function zone(page, name) {
  33  |   await page.getByRole('button', { name: 'Zones', exact: true }).click()
> 34  |   await page.getByRole('button', { name: new RegExp(name) }).click()
      |                                                              ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  35  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  36  | }
  37  | export async function save(page) {
  38  |   await page.getByRole('button', { name: 'Save Project', exact: true }).click()
  39  |   await page.getByText('Project saved to IndexedDB persistent storage!', { exact: true }).last().waitFor()
  40  |   await expect(page.getByRole('button', { name: 'Save Project', exact: true })).toBeEnabled()
  41  |   const saved = await page.evaluate(() => new Promise((resolve, reject) => {
  42  |     const request = indexedDB.open('3d-model-maker-assets', 1)
  43  |     request.onsuccess = () => {
  44  |       const db = request.result, transaction = db.transaction('projects', 'readonly')
  45  |       const read = transaction.objectStore('projects').getAll()
  46  |       read.onsuccess = () => { resolve(read.result.at(-1)); db.close() }
  47  |       read.onerror = reject
  48  |     }
  49  |     request.onerror = reject
  50  |   }))
  51  |   await record(`snapshot-${Date.now()}`, saved)
  52  |   return saved
  53  | }
  54  | export async function scene(page) {
  55  |   return page.evaluate(() => {
  56  |     const meshes = window.__qaSceneObjects().filter(object => object.isMesh && object.name && object.geometry?.attributes.uv)
  57  |     const sample = meshes.find(object => object.__r3f?.root)
  58  |     const root = sample?.__r3f.root.getState()
  59  |     function hash(values) {
  60  |       let h = 2166136261
  61  |       for (const v of values) h = Math.imul(h ^ Math.round(v * 1000000), 16777619)
  62  |       return h >>> 0
  63  |     }
  64  |     return {
  65  |       camera: root?.camera.position.toArray(), memory: root && { ...root.gl.info.memory }, heap: performance.memory?.usedJSHeapSize,
  66  |       meshes: meshes.map(mesh => ({
  67  |         name: mesh.name, vertices: mesh.geometry.attributes.position.count,
  68  |         triangles: (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3,
  69  |         attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k, v]) => [k, { count: v.count, hash: hash(v.array) }])),
  70  |         groups: mesh.geometry.groups, matrix: mesh.matrixWorld.toArray(),
  71  |         materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
  72  |           const image = material.map?.image
  73  |           let texture
  74  |           if (image?.width) {
  75  |             const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
  76  |             const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
  77  |             const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  78  |             texture = { width: image.width, height: image.height, hash: hash(pixels), colorSpace: material.map.colorSpace, flipY: material.map.flipY,
  79  |               center: Array.from(ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data),
  80  |               corner: Array.from(ctx.getImageData(4, 4, 1, 1).data) }
  81  |           }
  82  |           return { color: material.color?.getHexString(), linear: material.color?.toArray(), roughness: material.roughness, metalness: material.metalness, type: material.type, normalMap: !!material.normalMap, texture }
  83  |         })
  84  |       }))
  85  |     }
  86  |   })
  87  | }
  88  | export async function exportProduct(page, name, resolution = 1024) {
  89  |   await page.getByRole('button', { name: 'Export GLB', exact: true }).last().click()
  90  |   await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
  91  |   const downloads = []
  92  |   const handler = d => downloads.push(d)
  93  |   page.on('download', handler)
  94  |   const started = Date.now()
  95  |   await page.getByRole('button', { name: 'Export GLB Asset', exact: true }).click()
  96  |   await page.getByText('GLB Verification Passed', { exact: true }).waitFor({ timeout: 60000 })
  97  |   await page.waitForTimeout(700)
  98  |   for (const download of downloads) {
  99  |     const extension = download.suggestedFilename().endsWith('.json') ? '.json' : '.glb'
  100 |     await download.saveAs(`${directory}/exports/${name}${extension}`)
  101 |   }
  102 |   page.off('download', handler)
  103 |   await page.getByRole('button', { name: 'Close', exact: true }).click()
  104 |   return { durationMs: Date.now() - started, downloads: downloads.map(d => d.suggestedFilename()) }
  105 | }
  106 | export async function inspectGLB(name) {
  107 |   const bytes = await readFile(`${directory}/exports/${name}.glb`)
  108 |   const jsonSize = bytes.readUInt32LE(12)
  109 |   const json = JSON.parse(bytes.subarray(20, 20 + jsonSize))
  110 |   const binary = bytes.subarray(28 + jsonSize)
  111 |   const images = []
  112 |   for (const [i, image] of (json.images || []).entries()) {
  113 |     const view = json.bufferViews[image.bufferView]
  114 |     const png = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
  115 |     await writeFile(`${directory}/exports/${name}-texture-${i}.png`, png)
  116 |     images.push({ mimeType: image.mimeType, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), sha256: createHash('sha256').update(png).digest('hex') })
  117 |   }
  118 |   const result = { magic: bytes.readUInt32LE(0), version: bytes.readUInt32LE(4), length: bytes.length, declaredLength: bytes.readUInt32LE(8), nodes: json.nodes, meshes: json.meshes, materials: json.materials, accessors: json.accessors, images }
  119 |   await record(name + '-glb', result)
  120 |   return result
  121 | }
  122 | 
```