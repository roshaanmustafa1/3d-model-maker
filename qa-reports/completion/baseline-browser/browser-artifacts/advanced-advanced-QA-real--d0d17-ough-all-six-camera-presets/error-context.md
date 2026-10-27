# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced.spec.mjs >> advanced QA >> real garment renders black through all six camera presets
- Location: tests\qa\browser\advanced.spec.mjs:44:3

# Error details

```
Error: Test timeout of 60000ms exceeded
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
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: Scene Explorer
          - button "Add" [ref=e55] [cursor=pointer]
        - textbox "Filter meshes..." [ref=e61]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64] [cursor=pointer]:
              - generic [ref=e65]:
                - button [ref=e66]
                - generic [ref=e71]: shirt_front_group
                - 'generic "Customizable: body_front" [ref=e72]'
              - generic [ref=e76]:
                - button "Toggle Visibility" [ref=e77]
                - button "Lock Node" [ref=e81]
                - button "Duplicate" [ref=e85]
                - button "Delete" [ref=e89]
            - generic [ref=e95] [cursor=pointer]:
              - generic [ref=e96]:
                - generic [ref=e100]: shirt_front
                - 'generic "Customizable: body_front" [ref=e101]'
              - generic [ref=e105]:
                - button "Toggle Visibility" [ref=e106]
                - button "Lock Node" [ref=e110]
                - button "Duplicate" [ref=e114]
                - button "Delete" [ref=e118]
          - generic [ref=e122]:
            - generic [ref=e123] [cursor=pointer]:
              - generic [ref=e124]:
                - button [ref=e125]
                - generic [ref=e130]: shirt_back_group
                - 'generic "Customizable: body_back" [ref=e131]'
              - generic [ref=e135]:
                - button "Toggle Visibility" [ref=e136]
                - button "Lock Node" [ref=e140]
                - button "Duplicate" [ref=e144]
                - button "Delete" [ref=e148]
            - generic [ref=e154] [cursor=pointer]:
              - generic [ref=e155]:
                - generic [ref=e159]: shirt_back
                - 'generic "Customizable: body_back" [ref=e160]'
              - generic [ref=e164]:
                - button "Toggle Visibility" [ref=e165]
                - button "Lock Node" [ref=e169]
                - button "Duplicate" [ref=e173]
                - button "Delete" [ref=e177]
          - generic [ref=e181]:
            - generic [ref=e182] [cursor=pointer]:
              - generic [ref=e183]:
                - button [ref=e184]
                - generic [ref=e189]: shirt_base_group
              - generic [ref=e190]:
                - button "Toggle Visibility" [ref=e191]
                - button "Lock Node" [ref=e195]
                - button "Duplicate" [ref=e199]
                - button "Delete" [ref=e203]
            - generic [ref=e209] [cursor=pointer]:
              - generic [ref=e210]: shirt_base
              - generic [ref=e215]:
                - button "Toggle Visibility" [ref=e216]
                - button "Lock Node" [ref=e220]
                - button "Duplicate" [ref=e224]
                - button "Delete" [ref=e228]
          - generic [ref=e232]:
            - generic [ref=e233] [cursor=pointer]:
              - generic [ref=e234]:
                - button [ref=e235]
                - generic [ref=e240]: shoulder_left_group
              - generic [ref=e241]:
                - button "Toggle Visibility" [ref=e242]
                - button "Lock Node" [ref=e246]
                - button "Duplicate" [ref=e250]
                - button "Delete" [ref=e254]
            - generic [ref=e260] [cursor=pointer]:
              - generic [ref=e261]: shoulder_left
              - generic [ref=e266]:
                - button "Toggle Visibility" [ref=e267]
                - button "Lock Node" [ref=e271]
                - button "Duplicate" [ref=e275]
                - button "Delete" [ref=e279]
          - generic [ref=e283]:
            - generic [ref=e284] [cursor=pointer]:
              - generic [ref=e285]:
                - button [ref=e286]
                - generic [ref=e291]: shoulder_right_group
              - generic [ref=e292]:
                - button "Toggle Visibility" [ref=e293]
                - button "Lock Node" [ref=e297]
                - button "Duplicate" [ref=e301]
                - button "Delete" [ref=e305]
            - generic [ref=e311] [cursor=pointer]:
              - generic [ref=e312]: shoulder_right
              - generic [ref=e317]:
                - button "Toggle Visibility" [ref=e318]
                - button "Lock Node" [ref=e322]
                - button "Duplicate" [ref=e326]
                - button "Delete" [ref=e330]
          - generic [ref=e334]:
            - generic [ref=e335] [cursor=pointer]:
              - generic [ref=e336]:
                - button [ref=e337]
                - generic [ref=e342]: shoulder_patch_left_group
              - generic [ref=e343]:
                - button "Toggle Visibility" [ref=e344]
                - button "Lock Node" [ref=e348]
                - button "Duplicate" [ref=e352]
                - button "Delete" [ref=e356]
            - generic [ref=e362] [cursor=pointer]:
              - generic [ref=e363]: shoulder_patch_left
              - generic [ref=e368]:
                - button "Toggle Visibility" [ref=e369]
                - button "Lock Node" [ref=e373]
                - button "Duplicate" [ref=e377]
                - button "Delete" [ref=e381]
          - generic [ref=e385]:
            - generic [ref=e386] [cursor=pointer]:
              - generic [ref=e387]:
                - button [ref=e388]
                - generic [ref=e393]: shoulder_patch_right_group
              - generic [ref=e394]:
                - button "Toggle Visibility" [ref=e395]
                - button "Lock Node" [ref=e399]
                - button "Duplicate" [ref=e403]
                - button "Delete" [ref=e407]
            - generic [ref=e413] [cursor=pointer]:
              - generic [ref=e414]: shoulder_patch_right
              - generic [ref=e419]:
                - button "Toggle Visibility" [ref=e420]
                - button "Lock Node" [ref=e424]
                - button "Duplicate" [ref=e428]
                - button "Delete" [ref=e432]
          - generic [ref=e436]:
            - generic [ref=e437] [cursor=pointer]:
              - generic [ref=e438]:
                - button [ref=e439]
                - generic [ref=e444]: collar_group
                - 'generic "Customizable: collar" [ref=e445]'
              - generic [ref=e449]:
                - button "Toggle Visibility" [ref=e450]
                - button "Lock Node" [ref=e454]
                - button "Duplicate" [ref=e458]
                - button "Delete" [ref=e462]
            - generic [ref=e468] [cursor=pointer]:
              - generic [ref=e469]:
                - generic [ref=e473]: collar
                - 'generic "Customizable: collar" [ref=e474]'
              - generic [ref=e478]:
                - button "Toggle Visibility" [ref=e479]
                - button "Lock Node" [ref=e483]
                - button "Duplicate" [ref=e487]
                - button "Delete" [ref=e491]
          - generic [ref=e495]:
            - generic [ref=e496] [cursor=pointer]:
              - generic [ref=e497]:
                - button [ref=e498]
                - generic [ref=e503]: neck_patch_front_group
                - 'generic "Customizable: body_front" [ref=e504]'
              - generic [ref=e508]:
                - button "Toggle Visibility" [ref=e509]
                - button "Lock Node" [ref=e513]
                - button "Duplicate" [ref=e517]
                - button "Delete" [ref=e521]
            - generic [ref=e527] [cursor=pointer]:
              - generic [ref=e528]:
                - generic [ref=e532]: neck_patch_front
                - 'generic "Customizable: body_front" [ref=e533]'
              - generic [ref=e537]:
                - button "Toggle Visibility" [ref=e538]
                - button "Lock Node" [ref=e542]
                - button "Duplicate" [ref=e546]
                - button "Delete" [ref=e550]
          - generic [ref=e554]:
            - generic [ref=e555] [cursor=pointer]:
              - generic [ref=e556]:
                - button [ref=e557]
                - generic [ref=e562]: neck_patch_back_group
                - 'generic "Customizable: body_back" [ref=e563]'
              - generic [ref=e567]:
                - button "Toggle Visibility" [ref=e568]
                - button "Lock Node" [ref=e572]
                - button "Duplicate" [ref=e576]
                - button "Delete" [ref=e580]
            - generic [ref=e586] [cursor=pointer]:
              - generic [ref=e587]:
                - generic [ref=e591]: neck_patch_back
                - 'generic "Customizable: body_back" [ref=e592]'
              - generic [ref=e596]:
                - button "Toggle Visibility" [ref=e597]
                - button "Lock Node" [ref=e601]
                - button "Duplicate" [ref=e605]
                - button "Delete" [ref=e609]
          - generic [ref=e613]:
            - generic [ref=e614] [cursor=pointer]:
              - generic [ref=e615]:
                - button [ref=e616]
                - generic [ref=e621]: side_patch_left_group
              - generic [ref=e622]:
                - button "Toggle Visibility" [ref=e623]
                - button "Lock Node" [ref=e627]
                - button "Duplicate" [ref=e631]
                - button "Delete" [ref=e635]
            - generic [ref=e641] [cursor=pointer]:
              - generic [ref=e642]: side_patch_left
              - generic [ref=e647]:
                - button "Toggle Visibility" [ref=e648]
                - button "Lock Node" [ref=e652]
                - button "Duplicate" [ref=e656]
                - button "Delete" [ref=e660]
          - generic [ref=e664]:
            - generic [ref=e665] [cursor=pointer]:
              - generic [ref=e666]:
                - button [ref=e667]
                - generic [ref=e672]: side_patch_right_group
              - generic [ref=e673]:
                - button "Toggle Visibility" [ref=e674]
                - button "Lock Node" [ref=e678]
                - button "Duplicate" [ref=e682]
                - button "Delete" [ref=e686]
            - generic [ref=e692] [cursor=pointer]:
              - generic [ref=e693]: side_patch_right
              - generic [ref=e698]:
                - button "Toggle Visibility" [ref=e699]
                - button "Lock Node" [ref=e703]
                - button "Duplicate" [ref=e707]
                - button "Delete" [ref=e711]
      - separator [ref=e715]
      - generic [ref=e719]:
        - generic:
          - generic [ref=e720]:
            - button "Object Mode [Tab]" [ref=e721] [cursor=pointer]:
              - generic [ref=e725]: Object Mode
              - generic [ref=e726]: "[Tab]"
            - button [ref=e728] [cursor=pointer]
            - button [ref=e732] [cursor=pointer]
            - button [ref=e738] [cursor=pointer]
            - button [ref=e742] [cursor=pointer]
            - button "world" [ref=e749]
          - generic [ref=e750]:
            - button "solid" [ref=e751] [cursor=pointer]
            - button [ref=e757] [cursor=pointer]
            - button [active] [ref=e763] [cursor=pointer]
            - button [ref=e768] [cursor=pointer]
            - button [ref=e771] [cursor=pointer]
      - separator [ref=e781]
      - generic [ref=e785]:
        - generic [ref=e786]:
          - generic [ref=e787]: Inspector
          - generic [ref=e788]:
            - button [ref=e789]
            - button [ref=e790]
            - button [ref=e791]
            - button [ref=e792]
        - generic [ref=e793]:
          - textbox [ref=e794]: shirt_front_group
          - generic [ref=e795]: group
        - generic [ref=e796]:
          - button "Trans" [ref=e797]
          - button "Geom" [ref=e803]
          - button "Mat" [ref=e807]
          - button "BB" [ref=e814]
          - button "UV" [ref=e818]
          - button "Light" [ref=e821]
        - generic [ref=e829]:
          - generic [ref=e830]:
            - text: Position (X, Y, Z)
            - generic [ref=e831]:
              - generic [ref=e832]:
                - generic [ref=e833]: X
                - spinbutton [ref=e834]: "0"
              - generic [ref=e835]:
                - generic [ref=e836]: "Y"
                - spinbutton [ref=e837]: "0"
              - generic [ref=e838]:
                - generic [ref=e839]: Z
                - spinbutton [ref=e840]: "0"
          - generic [ref=e841]:
            - text: Rotation (Degrees)
            - generic [ref=e842]:
              - generic [ref=e843]:
                - generic [ref=e844]: X
                - spinbutton [ref=e845]: "0"
              - generic [ref=e846]:
                - generic [ref=e847]: "Y"
                - spinbutton [ref=e848]: "0"
              - generic [ref=e849]:
                - generic [ref=e850]: Z
                - spinbutton [ref=e851]: "0"
          - generic [ref=e852]:
            - text: Scale
            - generic [ref=e853]:
              - generic [ref=e854]:
                - generic [ref=e855]: X
                - spinbutton [ref=e856]: "1"
              - generic [ref=e857]:
                - generic [ref=e858]: "Y"
                - spinbutton [ref=e859]: "1"
              - generic [ref=e860]:
                - generic [ref=e861]: Z
                - spinbutton [ref=e862]: "1"
          - generic [ref=e863]:
            - button "Reset" [ref=e864]
            - button "Center" [ref=e865]
    - contentinfo [ref=e866]:
      - generic [ref=e867]:
        - generic [ref=e868]: shirt_front_group
        - generic [ref=e872]: Saved
      - generic [ref=e876]:
        - generic "Total Scene Vertices" [ref=e877]:
          - generic [ref=e878]: "Verts:"
          - generic [ref=e879]: 61,476
        - generic "Total Scene Triangles / Polygons" [ref=e881]:
          - generic [ref=e882]: "Tris:"
          - generic [ref=e883]: 117,632
        - generic "Total Mesh Objects" [ref=e885]: "12"
        - generic "Total PBR Materials" [ref=e891]: "2"
        - generic "Render Viewport FPS" [ref=e900]: 2 FPS
  - region "Notifications alt+T"
  - alert [ref=e904]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { writeFile, readFile } from 'node:fs/promises'
  3   | import { observeReactScenes } from './observer.mjs'
  4   | 
  5   | test.describe('advanced QA', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await page.addInitScript(observeReactScenes)
  8   |     await page.goto('/')
  9   |     await expect(page.getByRole('button', { name: /^solid$/i })).toBeVisible()
  10  |     await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.some((m) => m.name === 'Studio_Cube'))).toBe(true)
  11  |   })
  12  | 
  13  |   test('actual scene selection, material isolation and geometry overlays', async ({ page }) => {
  14  |     const before = await page.evaluate(() => window.__qaSnapshot())
  15  |     const model = before.meshes.find((m) => m.name === 'Studio_Cube')
  16  |     await page.keyboard.press('q')
  17  |     await page.keyboard.press('Escape')
  18  |     const target = await page.evaluate(() => {
  19  |       const mesh = window.__qaSceneObjects().find((object) => object.name === 'Studio_Cube')
  20  |       const { camera, gl } = mesh.__r3f.root.getState()
  21  |       const point = mesh.position.clone().setFromMatrixPosition(mesh.matrixWorld).project(camera)
  22  |       const rect = gl.domElement.getBoundingClientRect()
  23  |       return { x: rect.x + (point.x + 1) * rect.width / 2, y: rect.y + (1 - point.y) * rect.height / 2 }
  24  |     })
  25  |     await page.mouse.click(target.x, target.y)
  26  |     await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
  27  |     await expect(page.locator('[data-slot="resizable-panel"]').last().locator('input[type="text"]').first()).toHaveValue('Studio_Cube')
  28  |     for (const [label, mode] of [['Wireframe', 'wireframe'], ['Normal Shading', 'normal'], ['Material Preview', 'material'], ['Solid Material', 'solid']]) {
  29  |       await page.getByRole('button', { name: /^(solid|wireframe|normal|material)$/i }).click()
  30  |       await page.getByRole('menuitem', { name: label, exact: true }).click()
  31  |       await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].wireframe)).toBe(mode === 'wireframe')
  32  |     }
  33  |     const after = await page.evaluate(() => window.__qaSnapshot())
  34  |     const final = after.meshes.find((m) => m.name === 'Studio_Cube')
  35  |     expect(final.materials[0].color).toBe(model.materials[0].color)
  36  |     expect(final.materials[0].roughness).toBe(model.materials[0].roughness)
  37  |     expect(final.vertices).toBe(model.vertices)
  38  |     expect(final.triangles).toBe(model.triangles)
  39  |     await page.locator('button').filter({ has: page.locator('svg.lucide-network') }).click()
  40  |     await page.screenshot({ path: 'qa-reports/screenshots/topology-overlay.png' })
  41  |     await writeFile('qa-reports/test-results/viewport-material-snapshots.json', JSON.stringify({ before, after }, null, 2))
  42  |   })
  43  | 
  44  |   test('real garment renders black through all six camera presets', async ({ page }) => {
  45  |     await page.getByRole('button', { name: 'Import', exact: true }).click()
  46  |     await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/black-raglan_shirt.glb')
  47  |     await expect(page.getByText('shirt_front', { exact: true })).toBeVisible()
  48  |     const snapshots = []
  49  |     for (const name of ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom']) {
  50  |       await page.locator('button').filter({ has: page.locator('svg.lucide-compass') }).click()
  51  |       await page.getByRole('menuitem', { name: new RegExp(`^${name}( |$)`) }).click()
> 52  |       await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.filter((m) => m.name.startsWith('shirt_')).length)).toBeGreaterThan(0)
      |                                                                                                                                    ^ Error: Test timeout of 60000ms exceeded
  53  |       const snapshot = await page.evaluate(() => window.__qaSnapshot())
  54  |       const garment = snapshot.meshes.filter((m) => m.name === 'shirt_front')
  55  |       expect(garment[0].materials[0].color).toBe('09090b')
  56  |       snapshots.push({ name, camera: snapshot.camera, garment })
  57  |       await page.screenshot({ path: `qa-reports/screenshots/real-shirt-${name.toLowerCase()}.png` })
  58  |     }
  59  |     await writeFile('qa-reports/test-results/real-shirt-camera-snapshots.json', JSON.stringify(snapshots, null, 2))
  60  |   })
  61  | 
  62  |   test('base-color and normal image uploads survive real browser GLB export/reimport', async ({ page }) => {
  63  |     await page.getByRole('button', { name: 'Mat', exact: true }).click()
  64  |     const inputs = page.locator('input[type="file"][accept="image/*"]')
  65  |     await inputs.nth(0).setInputFiles('qa-reports/exported-models/qa-albedo.png')
  66  |     await inputs.nth(1).setInputFiles('qa-reports/exported-models/qa-normal.png')
  67  |     await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].map?.width)).toBe(8)
  68  |     const before = await page.evaluate(() => window.__qaSnapshot())
  69  |     const material = before.meshes.find((m) => m.name === 'Studio_Cube').materials[0]
  70  |     expect(material.map.colorSpace).toBe('srgb')
  71  |     expect(material.normalMap.colorSpace).toBe('')
  72  |     await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  73  |     await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  74  |     await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  75  |     const pending = page.waitForEvent('download')
  76  |     await page.getByRole('button', { name: /^Download/ }).click()
  77  |     await (await pending).saveAs('qa-reports/exported-models/textured-browser.glb')
  78  |     await page.getByRole('button', { name: 'Import', exact: true }).click()
  79  |     await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/textured-browser.glb')
  80  |     await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].map?.width)).toBe(8)
  81  |     const after = await page.evaluate(() => window.__qaSnapshot())
  82  |     expect(after.meshes.find((m) => m.name === 'Studio_Cube').materials[0].normalMap.width).toBe(8)
  83  |     await writeFile('qa-reports/test-results/texture-roundtrip.json', JSON.stringify({ before, after }, null, 2))
  84  |     await page.screenshot({ path: 'qa-reports/screenshots/textured-reimport.png' })
  85  |   })
  86  | 
  87  |   test('UV edits survive an export independently of undo', async ({ page }) => {
  88  |     const before = await page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube').uv)
  89  |     await page.getByRole('button', { name: 'UV Lab', exact: true }).click()
  90  |     await page.getByRole('button', { name: /Cylindrical Projection/ }).click()
  91  |     await page.getByRole('button', { name: '3D Studio', exact: true }).click()
  92  |     await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.uv?.length)).toBeGreaterThan(0)
  93  |     const after = await page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube').uv)
  94  |     expect(after).not.toEqual(before)
  95  |     await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  96  |     await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  97  |     await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  98  |   })
  99  | 
  100 |   test('mesh-size rendering FPS and selection latency are measured', async ({ page }) => {
  101 |     const results = []
  102 |     for (const label of ['small', 'medium', 'large']) {
  103 |       const started = performance.now()
  104 |       await page.getByRole('button', { name: 'Import', exact: true }).click()
  105 |       await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles(`qa-reports/exported-models/performance-${label}.glb`)
  106 |       await expect(page.getByText(`QA_${label}`, { exact: true }).first()).toBeVisible()
  107 |       const loadMs = performance.now() - started
  108 |       const frameTimes = await page.evaluate(() => new Promise((resolve) => {
  109 |         const times = []
  110 |         function frame(time) { times.push(time); if (times.length < 31) requestAnimationFrame(frame); else resolve(times) }
  111 |         requestAnimationFrame(frame)
  112 |       }))
  113 |       const selectionStart = performance.now()
  114 |       await page.getByText(`QA_${label}`, { exact: true }).first().click()
  115 |       await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
  116 |       results.push({ label, browserImportToVisibleMs: loadMs, sceneExplorerClickToInspectorMs: performance.now() - selectionStart, rafFPS: 30000 / (frameTimes[30] - frameTimes[0]), snapshot: await page.evaluate(() => ({ ...window.__qaSnapshot(), meshes: window.__qaSnapshot().meshes.map(({ uv, ...mesh }) => mesh), heap: performance.memory?.usedJSHeapSize })) })
  117 |     }
  118 |     await writeFile('qa-reports/test-results/browser-performance.json', JSON.stringify(results, null, 2))
  119 |   })
  120 | 
  121 |   test('Shift click synchronizes multiple Scene Explorer selections', async ({ page }) => {
  122 |     await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  123 |     await page.getByRole('menuitem', { name: 'Sphere', exact: true }).click()
  124 |     const rows = page.locator('[data-slot="resizable-panel"]').first().locator('div.group')
  125 |     const cube = rows.filter({ hasText: 'Studio_Cube' }), sphere = rows.filter({ hasText: 'Sphere_2' })
  126 |     await cube.click({ modifiers: ['Shift'] })
  127 |     await expect(cube).toHaveClass(/bg-emerald/)
  128 |     await expect(sphere).toHaveClass(/bg-emerald/)
  129 |     await cube.click({ modifiers: ['Shift'] })
  130 |     await expect(cube).not.toHaveClass(/bg-emerald/)
  131 |     await expect(sphere).toHaveClass(/bg-emerald/)
  132 |   })
  133 | 
  134 |   test('imported packed PBR texture channels survive browser GLB export', async ({ page }) => {
  135 |     await page.getByRole('button', { name: 'Import', exact: true }).click()
  136 |     await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/pbr-textures.glb')
  137 |     await expect(page.getByText('QA_small', { exact: true }).first()).toBeVisible()
  138 |     const textures = await page.evaluate(() => {
  139 |       const mesh = window.__qaSceneObjects().find((object) => object.name === 'QA_small')
  140 |       return ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].map((slot) => ({ slot, width: mesh.material[slot]?.image.width, colorSpace: mesh.material[slot]?.colorSpace }))
  141 |     })
  142 |     expect(textures.map((texture) => texture.width)).toEqual([8, 8, 8, 8])
  143 |     expect(textures.map((texture) => texture.colorSpace)).toEqual(['srgb', '', '', ''])
  144 |     await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  145 |     await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  146 |     await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  147 |     const pending = page.waitForEvent('download')
  148 |     await page.getByRole('button', { name: /^Download/ }).click()
  149 |     await (await pending).saveAs('qa-reports/exported-models/pbr-textures-roundtrip.glb')
  150 |     const bytes = await readFile('qa-reports/exported-models/pbr-textures-roundtrip.glb')
  151 |     const metadata = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
  152 |     expect(metadata.materials[0].pbrMetallicRoughness.baseColorTexture).toBeDefined()
```