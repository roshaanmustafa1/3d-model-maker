# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-pointer.spec.mjs >> Phase 3 pointer movement updates layer coordinates and actual texture pixels
- Location: tests\qa\browser\phase3-pointer.spec.mjs:4:1

# Error details

```
TypeError: Cannot read properties of undefined (reading 'hash')
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
            - generic [ref=e192]:
              - button "neutral" [ref=e199]
              - button "soft white" [ref=e200]
              - button "dark" [ref=e201]
              - button "warm" [ref=e202]
            - button "Screenshot" [ref=e203]
        - generic [ref=e204]:
          - generic [ref=e205]:
            - button "Layer Inspector" [ref=e206]
            - button "Material & Finish" [ref=e208]
          - generic [ref=e216]:
            - paragraph [ref=e218]: No Layer Selected
            - paragraph [ref=e219]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e220]:
        - generic [ref=e221]:
          - generic [ref=e222]:
            - generic [ref=e223]: "Zone:"
            - generic [ref=e224]: Front Chest
          - generic [ref=e225]:
            - generic [ref=e226]: "Bake Resolution:"
            - generic [ref=e227]: 1024 x 1024
          - generic [ref=e228]:
            - generic [ref=e229]: "UV Status:"
            - generic [ref=e230]: Mapped
        - generic [ref=e234]:
          - generic [ref=e235]: Saved at 11:24:07 PM
          - generic [ref=e236]: BlackBullet Compatible
    - contentinfo [ref=e237]:
      - generic [ref=e238]:
        - generic [ref=e239]: TShirt_Product
        - generic [ref=e243]: Saved at 11:24:07 PM
      - generic [ref=e247]:
        - generic "Total Scene Vertices" [ref=e248]:
          - generic [ref=e249]: "Verts:"
          - generic [ref=e250]: "306"
        - generic "Total Scene Triangles / Polygons" [ref=e252]:
          - generic [ref=e253]: "Tris:"
          - generic [ref=e254]: "248"
        - generic "Total Mesh Objects" [ref=e256]: "4"
        - generic "Total PBR Materials" [ref=e262]: "2"
        - generic "Render Viewport FPS" [ref=e271]: 3 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e280] [cursor=pointer]
  - alert [ref=e284]
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
  11 |   const before = await save(page), textureBefore = await scene(page)
  12 |   const canvas = page.locator('.konvajs-content').first(), bounds = await canvas.boundingBox()
  13 |   await page.mouse.move(bounds.x + 230, bounds.y + 230)
  14 |   const started = Date.now()
  15 |   const telemetry = await page.evaluate(() => {
  16 |     const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
  17 |     const renderer = mesh.__r3f.root.getState().gl
  18 |     const gl = renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info')
  19 |     return { frame: renderer.info.render.frame, time: performance.now(), gpu: extension && gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) }
  20 |   })
  21 |   await page.mouse.down()
  22 |   await page.mouse.move(bounds.x + 270, bounds.y + 250, { steps: 20 })
  23 |   await page.mouse.up()
  24 |   const after = await save(page)
  25 |   await page.waitForTimeout(1500)
  26 |   const textureAfter = await scene(page)
  27 |   const rendering = await page.evaluate(() => {
  28 |     const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
  29 |     return { frame: mesh.__r3f.root.getState().gl.info.render.frame, time: performance.now() }
  30 |   })
  31 |   await page.mouse.click(bounds.x + 20, bounds.y + 20)
  32 |   const deselected = await page.getByText('No Layer Selected', { exact: true }).isVisible()
  33 |   await record('pointer-drag', { before, after, textureBefore, textureAfter, durationMs: Date.now() - started, telemetry, rendering, rendererFps: (rendering.frame - telemetry.frame) * 1000 / (rendering.time - telemetry.time), deselected, events })
  34 |   await page.screenshot({ path: `${directory}/screenshots/pointer-drag.png` })
  35 |   expect.soft(after.customization.zones.body_front.layers[0].x).not.toBe(before.customization.zones.body_front.layers[0].x)
> 36 |   expect.soft(textureAfter.meshes[0].materials[0].texture.hash).not.toBe(textureBefore.meshes[0].materials[0].texture.hash)
     |                                                                                                                       ^ TypeError: Cannot read properties of undefined (reading 'hash')
  37 |   expect.soft(deselected).toBe(true)
  38 | })
  39 | 
```