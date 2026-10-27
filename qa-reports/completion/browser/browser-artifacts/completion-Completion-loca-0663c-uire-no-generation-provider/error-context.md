# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: completion.spec.mjs >> Completion: local generated GLB inspection and Studio handoff require no generation provider
- Location: tests\qa\browser\completion.spec.mjs:12:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Local AI GLB handoff', { exact: true })
Expected: visible
Timeout: 12000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Local AI GLB handoff', { exact: true }) with timeout 12000ms
  - waiting for getByText('Local AI GLB handoff', { exact: true })

```

```yaml
- banner:
  - text: 3D Model Maker STUDIO
  - button "File"
  - button "Edit"
  - button "Add"
  - button "View"
  - button "Tools"
  - button "Undo (Ctrl+Z)" [disabled]
  - button "Redo (Ctrl+Y)" [disabled]
  - button "3D Studio"
  - button "Customizer"
  - button "AI Generator"
  - button "UV Lab"
  - button "Validator"
  - button "Save"
  - button "Import"
  - button "Export GLB"
- text: Scene Explorer
- button "Add"
- textbox "Filter meshes..."
- text: Studio_Cube
- button "Toggle Visibility"
- button "Lock Node"
- button "Duplicate"
- button "Delete"
- separator
- text: Initializing Three.js WebGL Engine...
- separator
- text: Inspector
- button
- button
- button
- button
- textbox: Studio_Cube
- text: mesh
- button "Trans"
- button "Geom"
- button "Mat"
- button "BB"
- button "UV"
- button "Light"
- text: Position (X, Y, Z) X
- spinbutton: "0"
- text: "Y"
- spinbutton: "0.5"
- text: Z
- spinbutton: "0"
- text: Rotation (Degrees) X
- spinbutton: "0"
- text: "Y"
- spinbutton: "0"
- text: Z
- spinbutton: "0"
- text: Scale X
- spinbutton: "1"
- text: "Y"
- spinbutton: "1"
- text: Z
- spinbutton: "1"
- button "Reset"
- button "Center"
- contentinfo: Studio_Cube Saved Verts:24 Tris:12 1 1 60 FPS
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
> 14 |   await expect(page.getByText('Local AI GLB handoff', { exact: true })).toBeVisible()
     |                                                                         ^ Error: expect(locator).toBeVisible() failed
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