# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3_5.spec.mjs >> Phase 3.5 undo/redo updates actual texture and exported pixels
- Location: tests\qa\browser\phase3_5.spec.mjs:73:1

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /^1024/ })

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
        - button "Export GLB" [active] [ref=e47] [cursor=pointer]
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
        - generic "Render Viewport FPS" [ref=e272]: 3 FPS
    - generic [ref=e277]:
      - generic [ref=e278]:
        - heading "Export 3D Model" [level=2] [ref=e283]
        - button [ref=e284]
      - generic [ref=e288]:
        - generic [ref=e289]:
          - text: File Name
          - textbox [ref=e290]: model_export
        - generic [ref=e291]:
          - generic [ref=e292]:
            - text: Output Format
            - combobox [ref=e293]:
              - generic [ref=e294]: glb
              - img [aria-hidden]: ▼
            - textbox [aria-hidden] [ref=e295]: glb
          - generic [ref=e296]:
            - text: Compatibility Preset
            - combobox [ref=e297]:
              - generic [ref=e298]: blackbullet
              - img [aria-hidden]: ▼
            - textbox [aria-hidden] [ref=e299]: blackbullet
        - generic [ref=e300]:
          - text: Export Scope
          - generic [ref=e301]:
            - button "Entire Scene (1 roots)" [ref=e302]
            - button "Selected Object Only" [ref=e303]
        - generic [ref=e304]:
          - generic [ref=e305]: Exclude Hidden Objects
          - switch [checked] [ref=e306]
          - checkbox [checked] [aria-hidden] [ref=e307]
      - generic [ref=e308]:
        - button "Cancel" [ref=e309]
        - button "Generate & Verify GLB" [ref=e310]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e316] [cursor=pointer]
  - alert [ref=e320]
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
  26  | }
  27  | export async function product(page, name) {
  28  |   await page.getByRole('button', { name: 'Library', exact: true }).click()
  29  |   await page.getByRole('heading', { name, exact: true }).click()
  30  |   await page.waitForTimeout(1200)
  31  | }
  32  | export async function zone(page, name) {
  33  |   await page.getByRole('button', { name: 'Zones', exact: true }).click()
  34  |   await page.getByText(name, { exact: true }).first().click()
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
> 90  |   await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
      |                                                                          ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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