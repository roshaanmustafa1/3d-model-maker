# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-pointer.spec.mjs >> Phase 3 star has matching 2D canvas and actual 3D texture coordinates
- Location: tests\qa\browser\phase3-pointer.spec.mjs:44:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 5
Received:   169.49599999999998
```

```
Error: expect(received).toBeLessThan(expected)

Expected: < 5
Received:   6.647999999999968
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
            - button "Zones" [ref=e76]
            - button "Library" [ref=e80]
          - generic [ref=e87]:
            - generic [ref=e88]:
              - text: Upload Artwork
              - button "Upload Image or SVG" [ref=e89]
            - generic [ref=e90]:
              - text: Typography
              - generic [ref=e91]:
                - textbox "Text to add..." [ref=e92]: CUSTOM TEXT
                - button [ref=e93]
            - generic [ref=e94]:
              - text: Add Shape
              - generic [ref=e95]:
                - button "Rectangle" [ref=e96]
                - button "Circle" [ref=e99]
                - button "Star" [ref=e102]
                - button "Triangle" [ref=e105]
        - generic [ref=e108]:
          - generic [ref=e109]:
            - button "Split View (2D + 3D)" [ref=e110]
            - button "2D Design Canvas" [ref=e111]
            - button "3D Product Preview" [ref=e112]
          - generic [ref=e113]:
            - generic [ref=e114]: "Active Zone: Front Chest | Canvas: 1024x1024px"
            - generic [ref=e121]:
              - generic:
                - generic [ref=e122]:
                  - button "Object Mode [Tab]" [ref=e123] [cursor=pointer]:
                    - generic [ref=e127]: Object Mode
                    - generic [ref=e128]: "[Tab]"
                  - button [ref=e130] [cursor=pointer]
                  - button [ref=e134] [cursor=pointer]
                  - button [ref=e140] [cursor=pointer]
                  - button [ref=e144] [cursor=pointer]
                  - button "world" [ref=e151]
                - generic [ref=e152]:
                  - button "solid" [ref=e153] [cursor=pointer]
                  - button [ref=e159] [cursor=pointer]
                  - button [ref=e165] [cursor=pointer]
                  - button [ref=e170] [cursor=pointer]
                  - button [ref=e173] [cursor=pointer]
          - generic [ref=e184]:
            - generic [ref=e185]:
              - button "perspective" [ref=e186]
              - button "front" [ref=e187]
              - button "back" [ref=e188]
              - button "left" [ref=e189]
              - button "right" [ref=e190]
              - button "top" [ref=e191]
              - button "Fit Product" [ref=e192]
              - button "Reset Camera" [ref=e193]
            - generic [ref=e194]:
              - button "neutral" [ref=e201]
              - button "soft white" [ref=e202]
              - button "dark" [ref=e203]
              - button "warm" [ref=e204]
            - button "Screenshot" [ref=e205]
        - generic [ref=e206]:
          - generic [ref=e207]:
            - button "Layer Inspector" [ref=e208]
            - button "Material & Finish" [ref=e210]
          - generic [ref=e218]:
            - paragraph [ref=e220]: No Layer Selected
            - paragraph [ref=e221]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e222]:
        - generic [ref=e223]:
          - generic [ref=e224]:
            - generic [ref=e225]: "Zone:"
            - generic [ref=e226]: Front Chest
          - generic [ref=e227]:
            - generic [ref=e228]: "Bake Resolution:"
            - generic [ref=e229]: 1024 x 1024
          - generic [ref=e230]:
            - generic [ref=e231]: "UV Status:"
            - generic [ref=e232]: Mapped
        - generic [ref=e236]: UV targets verified
    - contentinfo [ref=e238]:
      - generic [ref=e239]:
        - generic [ref=e240]: TShirt_Product
        - generic [ref=e244]: Saved
      - generic [ref=e248]:
        - generic "Total Scene Vertices" [ref=e249]:
          - generic [ref=e250]: "Verts:"
          - generic [ref=e251]: "580"
        - generic "Total Scene Triangles / Polygons" [ref=e253]:
          - generic [ref=e254]: "Tris:"
          - generic [ref=e255]: "248"
        - generic "Total Mesh Objects" [ref=e257]: "6"
        - generic "Total PBR Materials" [ref=e263]: "7"
        - generic "Render Viewport FPS" [ref=e272]: 4 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e281] [cursor=pointer]
  - alert [ref=e285]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { directory, setup, open, product, save, scene, record } from '../../../scripts/qa/phase3-support.mjs'
  3  | 
  4  | test('Phase 3 pointer movement updates layer coordinates and actual texture pixels', async ({ page }) => {
  5  |   test.setTimeout(120000); page.setDefaultTimeout(15000)
  6  |   const events = await setup(page)
  7  |   await open(page)
  8  |   await product(page, 'Streetwear Oversized Tee')
  9  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  10 |   await page.getByTitle('Rectangle', { exact: true }).click()
  11 |   await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
  12 |   const before = await save(page), textureBefore = await scene(page)
  13 |   const canvas = page.locator('.konvajs-content').first(), bounds = await canvas.boundingBox()
  14 |   await page.mouse.move(bounds.x + 230, bounds.y + 230)
  15 |   const started = Date.now()
  16 |   const telemetry = await page.evaluate(() => {
  17 |     const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
  18 |     const renderer = mesh.__r3f.root.getState().gl
  19 |     const gl = renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info')
  20 |     return { frame: renderer.info.render.frame, time: performance.now(), gpu: extension && gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) }
  21 |   })
  22 |   await page.mouse.down()
  23 |   await page.mouse.move(bounds.x + 270, bounds.y + 250, { steps: 20 })
  24 |   await page.mouse.up()
  25 |   const after = await save(page)
  26 |   let textureUpdateError
  27 |   try {
  28 |     await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.hash, { timeout: 20000 }).not.toBe(textureBefore.meshes[0].materials[0].texture?.hash)
  29 |   } catch (error) { textureUpdateError = error.message }
  30 |   const textureAfter = await scene(page)
  31 |   const rendering = await page.evaluate(() => {
  32 |     const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
  33 |     return { frame: mesh.__r3f.root.getState().gl.info.render.frame, time: performance.now() }
  34 |   })
  35 |   await page.mouse.click(bounds.x + 20, bounds.y + 20)
  36 |   const deselected = await page.getByText('No Layer Selected', { exact: true }).isVisible()
  37 |   await record('pointer-drag', { before, after, textureBefore, textureAfter, textureUpdateError, durationMs: Date.now() - started, telemetry, rendering, rendererFps: (rendering.frame - telemetry.frame) * 1000 / (rendering.time - telemetry.time), deselected, events })
  38 |   await page.screenshot({ path: `${directory}/screenshots/pointer-drag.png` })
  39 |   expect.soft(after.customization.zones.body_front.layers[0].x).not.toBe(before.customization.zones.body_front.layers[0].x)
  40 |   expect.soft(textureAfter.meshes[0].materials[0].texture?.hash).not.toBe(textureBefore.meshes[0].materials[0].texture?.hash)
  41 |   expect.soft(deselected).toBe(true)
  42 | })
  43 | 
  44 | test('Phase 3 star has matching 2D canvas and actual 3D texture coordinates', async ({ page }) => {
  45 |   test.setTimeout(90000); page.setDefaultTimeout(15000)
  46 |   const events = await setup(page)
  47 |   await open(page)
  48 |   await product(page, 'Streetwear Oversized Tee')
  49 |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  50 |   await page.getByTitle('Star', { exact: true }).click()
  51 |   await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
  52 |   await page.locator('.konvajs-content').first().click({ position: { x: 10, y: 10 } })
  53 |   await page.getByText('No Layer Selected', { exact: true }).waitFor()
  54 |   await page.waitForTimeout(400)
  55 |   const bounds = await page.evaluate(() => {
  56 |     function greenBounds(canvas, scale) {
  57 |       const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
  58 |       let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1
  59 |       for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
  60 |         const i = (y * canvas.width + x) * 4
  61 |         if (data[i] === 16 && data[i + 1] === 185 && data[i + 2] === 129) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y) }
  62 |       }
  63 |       return { minX: minX * scale, minY: minY * scale, maxX: maxX * scale, maxY: maxY * scale }
  64 |     }
  65 |     const editorCanvas = document.querySelector('.konvajs-content canvas')
  66 |     const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
  67 |     const image = mesh.material.map.image
  68 |     const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
  69 |     canvas.getContext('2d').drawImage(image, 0, 0)
  70 |     return { editor: greenBounds(editorCanvas, 1024 / editorCanvas.width), texture: greenBounds(canvas, 1024 / canvas.width) }
  71 |   })
  72 |   await record('star-coordinate-comparison', { bounds, events })
  73 |   await page.screenshot({ path: `${directory}/screenshots/star-coordinate-comparison.png` })
  74 |   expect.soft(Math.abs(bounds.editor.minX - bounds.texture.minX)).toBeLessThan(5)
> 75 |   expect.soft(Math.abs(bounds.editor.minY - bounds.texture.minY)).toBeLessThan(5)
     |                                                                   ^ Error: expect(received).toBeLessThan(expected)
  76 | })
  77 | 
```