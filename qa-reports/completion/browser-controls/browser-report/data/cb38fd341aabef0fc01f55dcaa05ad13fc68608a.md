# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: completion.spec.mjs >> Completion: material split, undo/redo, UV packing and durable save use actual controls
- Location: tests\qa\browser\completion.spec.mjs:24:1

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  getByRole('button', { name: /Assign to Selected Faces/ })
Expected: enabled
Received: disabled
Timeout:  12000ms

Call log:
  - Expect "toBeEnabled" getByRole('button', { name: /Assign to Selected Faces/ }) with timeout 12000ms
  - waiting for getByRole('button', { name: /Assign to Selected Faces/ })
    25 × locator resolved to <button disabled tabindex="0" type="button" data-disabled="" data-slot="button" class="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-de…>Assign to Selected Faces (0)</button>
       - unexpected value "disabled"

```

```yaml
- button "Assign to Selected Faces (0)" [disabled]
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
  10 |   await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.some(mesh => mesh.name === 'Studio_Cube'))).toBe(true)
  11 | })
  12 | 
  13 | test('Completion: local generated GLB inspection and Studio handoff require no generation provider', async ({ page }) => {
  14 |   await page.getByRole('button', { name: /AI Generator|AI Image/i }).click()
  15 |   await expect(page.getByText('Local AI GLB handoff', { exact: true })).toBeVisible()
  16 |   await page.getByLabel('Generated GLB file').setInputFiles('docs/fixtures/black-shirt.glb')
  17 |   await expect(page.getByRole('button', { name: 'Open in Modeling Studio', exact: true })).toBeEnabled()
  18 |   await page.screenshot({ path: 'qa-reports/completion/screenshots/local-handoff.png' })
  19 |   await page.getByRole('button', { name: 'Open in Modeling Studio', exact: true }).click()
  20 |   await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.length)).toBeGreaterThan(0)
  21 |   await expect(page.getByText('AI Image-to-3D Studio & Asset Pipeline')).toHaveCount(0)
  22 | })
  23 | 
  24 | test('Completion: material split, undo/redo, UV packing and durable save use actual controls', async ({ page }) => {
  25 |   await page.getByRole('button', { name: 'Mat', exact: true }).click()
  26 |   await page.getByRole('button', { name: 'Add Slot', exact: true }).click()
  27 |   await page.keyboard.press('Tab'); await page.keyboard.press('3')
  28 |   const target = await page.evaluate(() => {
  29 |     const mesh = window.__qaSceneObjects().find(object => object.name === 'Studio_Cube' && object.isMesh)
  30 |     const { camera, gl } = mesh.__r3f.root.getState(), geometry = mesh.geometry
  31 |     const positions = geometry.attributes.position, indices = geometry.index
  32 |     const corners = [0, 1, 2].map(offset => {
  33 |       const id = indices ? indices.getX(offset) : offset
  34 |       return mesh.position.clone().fromBufferAttribute(positions, id).applyMatrix4(mesh.matrixWorld)
  35 |     })
  36 |     const center = corners[0].add(corners[1]).add(corners[2]).multiplyScalar(1 / 3).project(camera)
  37 |     const rect = gl.domElement.getBoundingClientRect()
  38 |     return { x: rect.x + (center.x + 1) * rect.width / 2, y: rect.y + (1 - center.y) * rect.height / 2 }
  39 |   })
  40 |   await page.mouse.click(target.x, target.y)
> 41 |   await expect(page.getByRole('button', { name: /Assign to Selected Faces/ })).toBeEnabled()
     |                                                                                ^ Error: expect(locator).toBeEnabled() failed
  42 |   await page.getByRole('button', { name: /Assign to Selected Faces/ }).click()
  43 |   await page.getByRole('button', { name: 'Geom', exact: true }).click()
  44 |   const before = await page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('Studio_Cube')).reduce((sum, mesh) => sum + mesh.triangles, 0))
  45 |   await page.getByRole('button', { name: 'Split by material', exact: true }).click()
  46 |   await expect(page.getByText('Studio_Cube_Part1', { exact: true }).first()).toBeVisible()
  47 |   await expect(page.getByText('Studio_Cube_Part2', { exact: true }).first()).toBeVisible()
  48 |   await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('Studio_Cube')).reduce((sum, mesh) => sum + mesh.triangles, 0))).toBe(before)
  49 |   await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click()
  50 |   await expect(page.getByText('Studio_Cube', { exact: true }).first()).toBeVisible()
  51 |   await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).click()
  52 |   await page.getByRole('button', { name: 'UV', exact: true }).click()
  53 |   await page.getByRole('button', { name: 'Pack UV islands', exact: true }).click()
  54 |   await page.screenshot({ path: 'qa-reports/completion/screenshots/split-uv-preparation.png' })
  55 |   await page.getByRole('button', { name: 'Save', exact: true }).click()
  56 |   await expect(page.getByText('Project saved to IndexedDB', { exact: true })).toBeVisible()
  57 |   await page.reload()
  58 |   await page.getByRole('button', { name: 'File', exact: true }).click()
  59 |   await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  60 |   await expect(page.getByText('Studio_Cube_Part1', { exact: true }).first()).toBeVisible()
  61 |   await expect(page.getByText('Studio_Cube_Part2', { exact: true }).first()).toBeVisible()
  62 | })
  63 | 
```