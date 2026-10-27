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
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Split by material', exact: true })

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
        - generic [ref=e63]:
          - generic [ref=e64] [cursor=pointer]:
            - generic [ref=e65]:
              - button [ref=e66]
              - generic [ref=e71]: Object_1
            - generic [ref=e72]:
              - button "Toggle Visibility" [ref=e73]
              - button "Lock Node" [ref=e77]
              - button "Duplicate" [ref=e81]
              - button "Delete" [ref=e85]
          - generic [ref=e90]:
            - generic [ref=e91] [cursor=pointer]:
              - generic [ref=e92]:
                - button [ref=e93]
                - generic [ref=e98]: QA_Material_Slots
              - generic [ref=e99]:
                - button "Toggle Visibility" [ref=e100]
                - button "Lock Node" [ref=e104]
                - button "Duplicate" [ref=e108]
                - button "Delete" [ref=e112]
            - generic [ref=e116]:
              - generic [ref=e118] [cursor=pointer]:
                - generic [ref=e119]: mesh_0
                - generic [ref=e124]:
                  - button "Toggle Visibility" [ref=e125]
                  - button "Lock Node" [ref=e129]
                  - button "Duplicate" [ref=e133]
                  - button "Delete" [ref=e137]
              - generic [ref=e142] [cursor=pointer]:
                - generic [ref=e143]: mesh_0_1
                - generic [ref=e148]:
                  - button "Toggle Visibility" [ref=e149]
                  - button "Lock Node" [ref=e153]
                  - button "Duplicate" [ref=e157]
                  - button "Delete" [ref=e161]
      - separator [ref=e165]
      - generic [ref=e169]:
        - generic:
          - generic [ref=e170]:
            - button "Object Mode [Tab]" [ref=e171] [cursor=pointer]:
              - generic [ref=e175]: Object Mode
              - generic [ref=e176]: "[Tab]"
            - button [ref=e178] [cursor=pointer]
            - button [ref=e182] [cursor=pointer]
            - button [ref=e188] [cursor=pointer]
            - button [ref=e192] [cursor=pointer]
            - button "world" [ref=e199]
          - generic [ref=e200]:
            - button "solid" [ref=e201] [cursor=pointer]
            - button [ref=e207] [cursor=pointer]
            - button [ref=e213] [cursor=pointer]
            - button [ref=e218] [cursor=pointer]
            - button [ref=e221] [cursor=pointer]
      - separator [ref=e231]
      - generic [ref=e235]:
        - generic [ref=e236]:
          - generic [ref=e237]: Inspector
          - generic [ref=e238]:
            - button [ref=e239]
            - button [ref=e240]
            - button [ref=e241]
            - button [ref=e242]
        - generic [ref=e243]:
          - textbox [ref=e244]: QA_Material_Slots
          - generic [ref=e245]: group
        - generic [ref=e246]:
          - button "Trans" [ref=e247]
          - button "Geom" [active] [ref=e253]
          - button "Mat" [ref=e257]
          - button "BB" [ref=e264]
          - button "UV" [ref=e268]
          - button "Light" [ref=e271]
        - generic [ref=e278]: Selected object is a group or has no mesh geometry.
    - contentinfo [ref=e280]:
      - generic [ref=e281]:
        - generic [ref=e282]: QA_Material_Slots
        - generic [ref=e286]: Saved
      - generic [ref=e290]:
        - generic "Total Scene Vertices" [ref=e291]:
          - generic [ref=e292]: "Verts:"
          - generic [ref=e293]: "24"
        - generic "Total Scene Triangles / Polygons" [ref=e295]:
          - generic [ref=e296]: "Tris:"
          - generic [ref=e297]: "4"
        - generic "Total Mesh Objects" [ref=e299]: "2"
        - generic "Total PBR Materials" [ref=e305]: "3"
        - generic "Render Viewport FPS" [ref=e314]: 4 FPS
  - region "Notifications alt+T"
  - alert [ref=e318]
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
  25 |   await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase3_5/fixtures/independent-slots.glb')
  26 |   await expect(page.getByRole('heading', { name: 'Import 3D Asset' })).toHaveCount(0)
  27 |   await page.getByText('QA_Material_Slots', { exact: true }).first().click()
  28 |   await page.getByRole('button', { name: 'Geom', exact: true }).click()
  29 |   const before = await page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('QA_Material_Slots')).reduce((sum, mesh) => sum + mesh.triangles, 0))
> 30 |   await page.getByRole('button', { name: 'Split by material', exact: true }).click()
     |                                                                              ^ Error: locator.click: Test timeout of 60000ms exceeded.
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