# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stabilization.spec.mjs >> Phase 2.5 >> repeated real imports/removals retain bounded renderer geometry resources
- Location: tests\qa\browser\stabilization.spec.mjs:105:3

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 43
Received:    72
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
          - button "Undo (Ctrl+Z)" [ref=e20]
          - button "Redo (Ctrl+Y)" [disabled]
      - generic [ref=e21]:
        - button "3D Studio" [ref=e22] [cursor=pointer]
        - button "Customizer" [ref=e27] [cursor=pointer]
        - button "AI Generator" [ref=e31] [cursor=pointer]
        - button "UV Lab" [ref=e36] [cursor=pointer]
        - button "Validator" [ref=e40] [cursor=pointer]
      - generic [ref=e45]:
        - button "Save" [ref=e46]
        - button "Import" [ref=e47]
        - button "Export GLB" [ref=e48] [cursor=pointer]
    - generic [ref=e50]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]: Scene Explorer
          - button "Add" [ref=e56] [cursor=pointer]
        - textbox "Filter meshes..." [ref=e62]
        - generic [ref=e63]: No objects in scene.Click "+ Add" to create geometry.
      - separator [ref=e65]
      - generic [ref=e69]:
        - generic:
          - generic [ref=e70]:
            - button "Object Mode [Tab]" [ref=e71] [cursor=pointer]:
              - generic [ref=e75]: Object Mode
              - generic [ref=e76]: "[Tab]"
            - button [ref=e78] [cursor=pointer]
            - button [ref=e82] [cursor=pointer]
            - button [ref=e88] [cursor=pointer]
            - button [ref=e92] [cursor=pointer]
            - button "world" [ref=e99]
          - generic [ref=e100]:
            - button "solid" [ref=e101] [cursor=pointer]
            - button [ref=e107] [cursor=pointer]
            - button [ref=e113] [cursor=pointer]
            - button [ref=e118] [cursor=pointer]
            - button [ref=e121] [cursor=pointer]
      - separator [ref=e131]
      - generic [ref=e135]:
        - generic [ref=e136]: Inspector
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e143]: No Object Selected
            - paragraph [ref=e144]: Click an object in the viewport or scene explorer to inspect its transform, mesh, and materials.
          - generic [ref=e145]:
            - text: Environment Lighting
            - generic [ref=e147]:
              - generic [ref=e148]: Studio Lighting & Stage
              - generic [ref=e156]:
                - generic [ref=e157]:
                  - generic [ref=e158]:
                    - generic [ref=e159]: Directional Key Light
                    - generic [ref=e160]: 1.2x
                  - slider [ref=e161]: "1.2"
                - generic [ref=e162]:
                  - generic [ref=e163]:
                    - generic [ref=e164]: Ambient Fill Light
                    - generic [ref=e165]: 0.7x
                  - slider [ref=e166]: "0.7"
              - generic [ref=e167]:
                - generic [ref=e168]:
                  - generic [ref=e169]: Ground Contact Shadows
                  - switch [checked] [ref=e177]
                  - checkbox [checked] [aria-hidden] [ref=e178]
                - generic [ref=e179]:
                  - generic [ref=e180]: Ground Reference Grid
                  - switch [checked] [ref=e184]
                  - checkbox [checked] [aria-hidden] [ref=e185]
                - generic [ref=e186]:
                  - generic [ref=e187]: Coordinate Axes Helper
                  - switch [checked] [ref=e191]
                  - checkbox [checked] [aria-hidden] [ref=e192]
    - contentinfo [ref=e193]:
      - generic [ref=e194]:
        - generic [ref=e195]: No selection
        - generic [ref=e199]: Saved
      - generic [ref=e203]:
        - generic "Total Scene Vertices" [ref=e204]:
          - generic [ref=e205]: "Verts:"
          - generic [ref=e206]: "0"
        - generic "Total Scene Triangles / Polygons" [ref=e208]:
          - generic [ref=e209]: "Tris:"
          - generic [ref=e210]: "0"
        - generic "Total Mesh Objects" [ref=e212]: "0"
        - generic "Total PBR Materials" [ref=e218]: "2"
        - generic "Render Viewport FPS" [ref=e227]: 4 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e236] [cursor=pointer]
  - alert [ref=e240]
```

# Test source

```ts
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
  111 |       await page.getByText('QA_small', { exact: true }).first().click()
  112 |       await page.keyboard.press('Delete')
  113 |       await expect(page.getByText('No objects in scene.', { exact: false })).toBeVisible()
  114 |       await page.keyboard.press('Control+z')
  115 |       await expect(page.getByText('QA_small', { exact: true }).first()).toBeVisible()
  116 |       await page.keyboard.press('Control+y')
  117 |       const sample = await page.evaluate(() => {
  118 |         const object = window.__qaSceneObjects().find((object) => object.__r3f?.root)
  119 |         return { memory: { ...object.__r3f.root.getState().gl.info.memory }, heap: performance.memory?.usedJSHeapSize }
  120 |       })
  121 |       measurements.push(sample)
  122 |     }
  123 |     await writeFile(directory + '/resource-cycles.json', JSON.stringify(measurements, null, 2))
> 124 |     expect(measurements.at(-1).memory.geometries).toBeLessThanOrEqual(measurements[1].memory.geometries + 5)
      |                                                   ^ Error: expect(received).toBeLessThanOrEqual(expected)
  125 |   })
  126 | })
  127 | 
```