# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: completion.spec.mjs >> Completion: material split, undo/redo, UV packing and durable save use actual controls
- Location: tests\qa\browser\completion.spec.mjs:23:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.setInputFiles: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[type=file][accept*=".glb"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: 3D Model Maker STUDIO
        - generic [ref=e12]:
          - button "File" [ref=e13]
          - button "Edit" [ref=e14]
          - button "Add" [ref=e15]
          - button "View" [ref=e16]
          - button "Tools" [ref=e17]
        - generic [ref=e18]:
          - button "Undo (Ctrl+Z)" [disabled] [ref=e19]
          - button "Redo (Ctrl+Y)" [disabled] [ref=e23]
      - generic [ref=e27]:
        - button "3D Studio" [ref=e28]
        - button "Customizer" [ref=e32]
        - button "AI Generator" [ref=e35]
        - button "UV Lab" [ref=e39]
        - button "Validator" [ref=e42]
      - generic [ref=e46]:
        - button "Save" [ref=e47]
        - button "Import" [active] [ref=e52]
        - button "Export GLB" [ref=e56]
    - generic [ref=e61]:
      - generic [ref=e64]:
        - generic [ref=e65]:
          - text: Scene Explorer
          - button "Add" [ref=e66]
        - textbox "Filter meshes..." [ref=e73]
        - generic [ref=e76]:
          - generic [ref=e77]: Studio_Cube
          - generic [ref=e81]:
            - button "Toggle Visibility" [ref=e82]
            - button "Lock Node" [ref=e86]
            - button "Duplicate" [ref=e90]
            - button "Delete" [ref=e94]
      - separator
      - generic [ref=e98]: Initializing Three.js WebGL Engine...
      - separator
      - generic [ref=e106]:
        - generic [ref=e107]:
          - text: Inspector
          - generic [ref=e108]:
            - button [ref=e109]
            - button [ref=e113]
            - button [ref=e117]
            - button [ref=e121]
        - generic [ref=e125]:
          - textbox [ref=e126]: Studio_Cube
          - text: mesh
        - generic [ref=e127]:
          - button "Trans" [ref=e128]
          - button "Geom" [ref=e134]
          - button "Mat" [ref=e138]
          - button "BB" [ref=e145]
          - button "UV" [ref=e149]
          - button "Light" [ref=e152]
        - generic [ref=e160]:
          - generic [ref=e161]:
            - text: Position (X, Y, Z)
            - generic [ref=e162]:
              - generic [ref=e163]:
                - text: X
                - spinbutton [ref=e164]: "0"
              - generic [ref=e165]:
                - text: "Y"
                - spinbutton [ref=e166]: "0.5"
              - generic [ref=e167]:
                - text: Z
                - spinbutton [ref=e168]: "0"
          - generic [ref=e169]:
            - text: Rotation (Degrees)
            - generic [ref=e170]:
              - generic [ref=e171]:
                - text: X
                - spinbutton [ref=e172]: "0"
              - generic [ref=e173]:
                - text: "Y"
                - spinbutton [ref=e174]: "0"
              - generic [ref=e175]:
                - text: Z
                - spinbutton [ref=e176]: "0"
          - generic [ref=e177]:
            - text: Scale
            - generic [ref=e178]:
              - generic [ref=e179]:
                - text: X
                - spinbutton [ref=e180]: "1"
              - generic [ref=e181]:
                - text: "Y"
                - spinbutton [ref=e182]: "1"
              - generic [ref=e183]:
                - text: Z
                - spinbutton [ref=e184]: "1"
          - generic [ref=e185]:
            - button "Reset" [ref=e186]
            - button "Center" [ref=e190]
    - contentinfo [ref=e193]:
      - generic [ref=e194]:
        - generic [ref=e195]: Studio_Cube
        - generic [ref=e196]: Saved
      - generic [ref=e200]:
        - generic "Total Scene Vertices" [ref=e201]: Verts:24
        - generic "Total Scene Triangles / Polygons" [ref=e202]: Tris:12
        - generic "Total Mesh Objects" [ref=e203]: "1"
        - generic "Total PBR Materials" [ref=e207]: "1"
        - generic "Render Viewport FPS" [ref=e214]: 60 FPS
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { mkdir } from 'node:fs/promises'
  3  | import { observeReactScenes } from './observer.mjs'
  4  | 
  5  | test.beforeEach(async ({ page }) => {
  6  |   await mkdir('qa-reports/completion/screenshots', { recursive: true })
  7  |   await page.addInitScript(observeReactScenes)
  8  |   await page.goto('/')
  9  |   await expect(page.getByRole('button', { name: 'Import', exact: true })).toBeVisible()
  10 | })
  11 | 
  12 | test('Completion: local generated GLB inspection and Studio handoff require no generation provider', async ({ page }) => {
  13 |   await page.getByRole('button', { name: /AI Generator|AI Image/i }).click()
  14 |   await expect(page.getByText('Local AI GLB handoff', { exact: true })).toBeVisible()
  15 |   await page.getByLabel('Generated GLB file').setInputFiles('docs/fixtures/black-shirt.glb')
  16 |   await expect(page.getByRole('button', { name: 'Open in Modeling Studio', exact: true })).toBeEnabled()
  17 |   await page.screenshot({ path: 'qa-reports/completion/screenshots/local-handoff.png' })
  18 |   await page.getByRole('button', { name: 'Open in Modeling Studio', exact: true }).click()
  19 |   await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.length)).toBeGreaterThan(0)
  20 |   await expect(page.getByText('AI Image-to-3D Studio & Asset Pipeline')).toHaveCount(0)
  21 | })
  22 | 
  23 | test('Completion: material split, undo/redo, UV packing and durable save use actual controls', async ({ page }) => {
  24 |   await page.getByRole('button', { name: 'Import', exact: true }).click()
> 25 |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase3_5/fixtures/independent-slots.glb')
     |   ^ Error: locator.setInputFiles: Test timeout of 60000ms exceeded.
  26 |   await expect(page.getByRole('heading', { name: 'Import 3D Asset' })).toHaveCount(0)
  27 |   await page.getByText('QA_Material_Slots', { exact: true }).first().click()
  28 |   await page.getByRole('button', { name: 'Geom', exact: true }).click()
  29 |   const before = await page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('QA_Material_Slots')).reduce((sum, mesh) => sum + mesh.triangles, 0))
  30 |   await page.getByRole('button', { name: 'Split by material', exact: true }).click()
  31 |   await expect(page.getByText('QA_Material_Slots_Part1', { exact: true }).first()).toBeVisible()
  32 |   await expect(page.getByText('QA_Material_Slots_Part2', { exact: true }).first()).toBeVisible()
  33 |   await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('QA_Material_Slots')).reduce((sum, mesh) => sum + mesh.triangles, 0))).toBe(before)
  34 |   await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click()
  35 |   await expect(page.getByText('QA_Material_Slots', { exact: true }).first()).toBeVisible()
  36 |   await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).click()
  37 |   await page.getByRole('button', { name: 'UV', exact: true }).click()
  38 |   await page.getByRole('button', { name: 'Pack UV islands', exact: true }).click()
  39 |   await page.screenshot({ path: 'qa-reports/completion/screenshots/split-uv-preparation.png' })
  40 |   await page.getByRole('button', { name: 'Save', exact: true }).click()
  41 |   await expect(page.getByText('Project saved to IndexedDB', { exact: true })).toBeVisible()
  42 |   await page.reload()
  43 |   await page.getByRole('button', { name: 'File', exact: true }).click()
  44 |   await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  45 |   await expect(page.getByText('QA_Material_Slots_Part1', { exact: true }).first()).toBeVisible()
  46 |   await expect(page.getByText('QA_Material_Slots_Part2', { exact: true }).first()).toBeVisible()
  47 | })
  48 | 
```