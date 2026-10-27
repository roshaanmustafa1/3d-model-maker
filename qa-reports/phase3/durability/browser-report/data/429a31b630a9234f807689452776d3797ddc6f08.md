# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-durability.spec.mjs >> Phase 3 uploaded PNG JPEG WebP SVG, keyboard protection and malformed input errors
- Location: tests\qa\browser\phase3-durability.spec.mjs:10:1

# Error details

```
Error: malformed PNG must report a user-facing error

expect(received).toMatch(expected)

Expected pattern: /invalid image|failed to (load|read|upload)|upload failed/i
Received string:  "3D Model Maker
STUDIO
File
Edit
Add
View
Tools
3D Studio
Customizer
AI Generator
UV Lab
Validator
Save
Import
Export GLB
3D Modeling Studio
Streetwear Oversized TeeT-SHIRT
Save Project
Export GLB
Artwork
Layers
Zones
Library
UPLOAD ARTWORK
Upload Image or SVG
TYPOGRAPHY
ADD SHAPE
Split View (2D + 3D)
2D Design Canvas
3D Product Preview
Active Zone: Front Chest | Canvas: 1024x1024px
Object Mode
[Tab]
WORLD
Solid
Perspective
Front
Back
Left
Right
Top
Neutral
Soft White
Dark
Warm
Screenshot
Layer Inspector
Material & Finish
LAYER PROPERTIES
TEXT
POSITION & DIMENSIONS
X
Y
W
H
ROTATION: 0°
OPACITY: 100%
TYPOGRAPHY CONTROLS
Sans-Serif
Serif
Monospace
Impact
Georgia
Arial Black
Size
Color
Zone:
Front Chest
Bake Resolution:
1024 x 1024
UV Status:
Mapped
Saved at 11:19:04 PM
BlackBullet Compatible
TShirt_Product_Copy
Saved at 11:19:04 PM
Verts:
612
Tris:
496
8
2
3 FPS
Project saved to IndexedDB persistent storage!"
```

```
Error: invalid SVG must not create a broken layer

expect(received).toHaveLength(expected)

Expected length: 6
Received length: 7
Received array:  [{"assetId": "asset_1792865932514", "height": 250, "id": "layer_1792865932514_dlbym", "locked": false, "name": "qa", "opacity": 1, "originalHeight": 32, "originalWidth": 64, "rotation": 0, "scaleX": 1, "scaleY": 1, "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAAbUlEQVR4AeyVMQ4AIRACif//89rTWG7izF0sKIFBzySzeTK7/wn8MwA4AJEACYAn4ATgAHgJOgEnAE/ACcAB4L0CXbgT6ERoWgJojbdfCehEaFoCaI23XwnoRGhaAmiNt18J6ERoWgJ+b/zl7wIAAP//oSR76gAAAAZJREFUAwABK3/BfgIyFQAAAABJRU5ErkJggg==", "type": "image", "visible": true, "width": 500, "x": 250, "y": 375, "zIndex": 1}, {"assetId": "asset_1792865933608", "height": 250, "id": "layer_1792865933608_cpj0u", "locked": false, "name": "qa", "opacity": 1, "originalHeight": 32, "originalWidth": 64, "rotation": 0, "scaleX": 1, "scaleY": 1, "src": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAgAEADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAcKCf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJ0AQx1TAAWMAiTMeAAjkBbWnAABYwCJMx4AD//Z", "type": "image", "visible": true, "width": 500, "x": 250, "y": 375, "zIndex": 2}, {"assetId": "asset_1792865935063", "height": 250, "id": "layer_1792865935063_gekoi", "locked": false, "name": "qa", "opacity": 1, "originalHeight": 32, "originalWidth": 64, "rotation": 0, "scaleX": 1, "scaleY": 1, "src": "data:image/webp;base64,UklGRkoCAABXRUJQVlA4WAoAAAAgAAAAPwAAHwAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggXAAAABAFAJ0BKkAAIAA+bS6TRqQioaEsCACADYljAMrtjf4B+AGmA/AD9bt4AAdKe0ayVAAA/vCa1xzJx6JKoZPwy/x77LHzMt5TxztWSk/IAY7/Go2c7j5MONlIAAAA", "type": "image", "visible": true, "width": 500, "x": 250, "y": 375, "zIndex": 3}, {"assetId": "asset_1792865935734", "height": 500, "id": "layer_1792865935734_b6wv0", "isSvg": true, "locked": false, "name": "sanitized", "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "src": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22blue%22%2F%3E%3C%2Fsvg%3E", "type": "image", "visible": true, "width": 500, "x": 250, "y": 250, "zIndex": 4}, {"align": "center", "fill": "#ffffff", "fontFamily": "sans-serif", "fontSize": 54, "fontStyle": "normal", "fontWeight": "bold", "height": 80, "id": "layer_1792865936191_ydpiw", "letterSpacing": 0, "lineHeight": 1.2, "locked": false, "name": "Text \"KEYBOARD TES\"", "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "text": "KEYBOARD TEST", "type": "text", "visible": true, "width": 400, "x": 300, "y": 460, "zIndex": 5}, {"align": "center", "fill": "#ffffff", "fontFamily": "sans-serif", "fontSize": 54, "fontStyle": "normal", "fontWeight": "bold", "height": 80, "id": "layer_1792865942303_aovt7", "letterSpacing": 0, "lineHeight": 1.2, "locked": false, "name": "Text \"KEYBOARD TES\" (Copy)", "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "text": "KEYBOARD TEST", "type": "text", "visible": true, "width": 400, "x": 320, "y": 480, "zIndex": 6}, {"assetId": "asset_1792865947168", "height": 500, "id": "layer_1792865947168_qgp2t", "isSvg": true, "locked": false, "name": "invalid", "opacity": 1, "rotation": 0, "scaleX": 1, "scaleY": 1, "src": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20%3E%3Cpath%20invalid", "type": "image", "visible": true, "width": 500, "x": 250, "y": 250, "zIndex": 7}]
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
      - generic [ref=e51]:
        - generic [ref=e52]:
          - button "3D Modeling Studio" [ref=e53]
          - generic [ref=e55]: Streetwear Oversized Teet-shirt
        - generic [ref=e60]:
          - generic [ref=e61]:
            - button "Undo (Ctrl+Z)" [ref=e62]
            - button "Redo (Ctrl+Y)" [disabled]
          - button "Save Project" [ref=e63]
          - button "Export GLB" [ref=e64]
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - button "Artwork" [ref=e68]
            - button "Layers" [ref=e72]
            - button "Zones" [ref=e77]
            - button "Library" [ref=e81]
          - generic [ref=e88]:
            - generic [ref=e89]:
              - text: Upload Artwork
              - button "Upload Image or SVG" [ref=e90]
            - generic [ref=e91]:
              - text: Typography
              - generic [ref=e92]:
                - textbox "Text to add..." [ref=e93]: KEYBOARD TEST
                - button [ref=e94]
            - generic [ref=e95]:
              - text: Add Shape
              - generic [ref=e96]:
                - button "Rectangle" [ref=e97]
                - button "Circle" [ref=e100]
                - button "Star" [ref=e103]
                - button "Triangle" [ref=e106]
        - generic [ref=e109]:
          - generic [ref=e110]:
            - button "Split View (2D + 3D)" [ref=e111]
            - button "2D Design Canvas" [ref=e112]
            - button "3D Product Preview" [ref=e113]
          - generic [ref=e114]:
            - generic [ref=e115]: "Active Zone: Front Chest | Canvas: 1024x1024px"
            - generic [ref=e122]:
              - generic:
                - generic [ref=e123]:
                  - button "Object Mode [Tab]" [ref=e124] [cursor=pointer]:
                    - generic [ref=e128]: Object Mode
                    - generic [ref=e129]: "[Tab]"
                  - button [ref=e131] [cursor=pointer]
                  - button [ref=e135] [cursor=pointer]
                  - button [ref=e141] [cursor=pointer]
                  - button [ref=e145] [cursor=pointer]
                  - button "world" [ref=e152]
                - generic [ref=e153]:
                  - button "solid" [ref=e154] [cursor=pointer]
                  - button [ref=e160] [cursor=pointer]
                  - button [ref=e166] [cursor=pointer]
                  - button [ref=e171] [cursor=pointer]
                  - button [ref=e174] [cursor=pointer]
          - generic [ref=e185]:
            - generic [ref=e186]:
              - button "perspective" [ref=e187]
              - button "front" [ref=e188]
              - button "back" [ref=e189]
              - button "left" [ref=e190]
              - button "right" [ref=e191]
              - button "top" [ref=e192]
            - generic [ref=e193]:
              - button "neutral" [ref=e200]
              - button "soft white" [ref=e201]
              - button "dark" [ref=e202]
              - button "warm" [ref=e203]
            - button "Screenshot" [ref=e204]
        - generic [ref=e205]:
          - generic [ref=e206]:
            - button "Layer Inspector" [ref=e207]
            - button "Material & Finish" [ref=e209]
          - generic [ref=e217]:
            - generic [ref=e218]:
              - generic [ref=e219]: Layer Properties
              - generic [ref=e220]: image
            - generic [ref=e221]:
              - text: Position & Dimensions
              - generic [ref=e222]:
                - generic [ref=e223]:
                  - generic [ref=e224]: X
                  - spinbutton [ref=e225]: "250"
                - generic [ref=e226]:
                  - generic [ref=e227]: "Y"
                  - spinbutton [ref=e228]: "250"
                - generic [ref=e229]:
                  - generic [ref=e230]: W
                  - spinbutton [ref=e231]: "500"
                - generic [ref=e232]:
                  - generic [ref=e233]: H
                  - spinbutton [ref=e234]: "500"
            - generic [ref=e235]:
              - generic [ref=e236]: "Rotation: 0°"
              - slider [ref=e238] [cursor=pointer]: "0"
              - generic [ref=e239]: "Opacity: 100%"
              - slider [ref=e241] [cursor=pointer]: "1"
      - generic [ref=e242]:
        - generic [ref=e243]:
          - generic [ref=e244]:
            - generic [ref=e245]: "Zone:"
            - generic [ref=e246]: Front Chest
          - generic [ref=e247]:
            - generic [ref=e248]: "Bake Resolution:"
            - generic [ref=e249]: 1024 x 1024
          - generic [ref=e250]:
            - generic [ref=e251]: "UV Status:"
            - generic [ref=e252]: Mapped
        - generic [ref=e256]:
          - generic [ref=e257]: Saved at 11:19:08 PM
          - generic [ref=e258]: BlackBullet Compatible
    - contentinfo [ref=e259]:
      - generic [ref=e260]:
        - generic [ref=e261]: TShirt_Product_Copy
        - generic [ref=e265]: Saved at 11:19:08 PM
      - generic [ref=e269]:
        - generic "Total Scene Vertices" [ref=e270]:
          - generic [ref=e271]: "Verts:"
          - generic [ref=e272]: "612"
        - generic "Total Scene Triangles / Polygons" [ref=e274]:
          - generic [ref=e275]: "Tris:"
          - generic [ref=e276]: "496"
        - generic "Total Mesh Objects" [ref=e278]: "8"
        - generic "Total PBR Materials" [ref=e284]: "2"
        - generic "Render Viewport FPS" [ref=e293]: 4 FPS
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e297]:
        - generic [ref=e301]: Project saved to IndexedDB persistent storage!
  - button "Open Next.js Dev Tools" [ref=e308] [cursor=pointer]
  - alert [ref=e312]
```

# Test source

```ts
  1   | import { test, expect, chromium } from '@playwright/test'
  2   | import { mkdtemp } from 'node:fs/promises'
  3   | import { tmpdir } from 'node:os'
  4   | import { join } from 'node:path'
  5   | import { directory, setup, open, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'
  6   | 
  7   | test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })
  8   | test.setTimeout(180000)
  9   | 
  10  | test('Phase 3 uploaded PNG JPEG WebP SVG, keyboard protection and malformed input errors', async ({ page }) => {
  11  |   const events = await setup(page)
  12  |   await open(page)
  13  |   await product(page, 'Streetwear Oversized Tee')
  14  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  15  |   const uploader = page.locator('input[type=file][accept*="image"]')
  16  |   for (const mime of ['image/png', 'image/jpeg', 'image/webp']) {
  17  |     const encoded = await page.evaluate(mime => {
  18  |       const c = document.createElement('canvas'); c.width = 64; c.height = 32
  19  |       const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 32); ctx.fillStyle = '#00ff00'; ctx.fillRect(32, 0, 32, 32)
  20  |       return c.toDataURL(mime)
  21  |     }, mime)
  22  |     await uploader.setInputFiles({ name: `qa.${mime.split('/')[1]}`, mimeType: mime, buffer: Buffer.from(encoded.split(',')[1], 'base64') })
  23  |     await page.waitForTimeout(500)
  24  |   }
  25  |   const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>window.__svgExecuted=true</script><rect width="64" height="64" fill="blue" onload="window.__svgExecuted=true"/><foreignObject><div>unsafe</div></foreignObject></svg>'
  26  |   await uploader.setInputFiles({ name: 'sanitized.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  27  |   await page.getByPlaceholder('Text to add...').fill('KEYBOARD TEST')
  28  |   await page.getByPlaceholder('Text to add...').press('Enter')
  29  |   const before = await save(page)
  30  |   await page.getByPlaceholder('Text to add...').focus()
  31  |   await page.keyboard.press('Delete')
  32  |   await page.keyboard.press('Control+d')
  33  |   const protectedInput = await save(page)
  34  |   await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  35  |   await page.keyboard.press('Control+d')
  36  |   const duplicated = await save(page)
  37  |   await uploader.setInputFiles({ name: 'malformed.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') })
  38  |   await page.waitForTimeout(1000)
  39  |   const malformedBody = await page.locator('body').innerText()
  40  |   await uploader.setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg><path invalid') })
  41  |   await page.waitForTimeout(1000)
  42  |   const after = await save(page)
  43  |   await record('uploads-security', { before, protectedInput, duplicated, after, malformedBody, svgExecuted: await page.evaluate(() => !!window.__svgExecuted), events })
  44  |   await page.screenshot({ path: `${directory}/screenshots/uploads-security.png` })
  45  |   expect.soft(before.customization.zones.body_front.layers).toHaveLength(5)
  46  |   expect.soft(protectedInput.customization.zones.body_front.layers).toHaveLength(5)
  47  |   expect.soft(duplicated.customization.zones.body_front.layers).toHaveLength(6)
  48  |   const sanitized = decodeURIComponent(before.customization.zones.body_front.layers.find(l => l.isSvg).src.split(',').slice(1).join(','))
  49  |   expect.soft(sanitized).not.toMatch(/<script|onload=|foreignObject/)
  50  |   expect.soft(malformedBody, 'malformed PNG must report a user-facing error').toMatch(/invalid image|failed to (load|read|upload)|upload failed/i)
> 51  |   expect.soft(after.customization.zones.body_front.layers, 'invalid SVG must not create a broken layer').toHaveLength(6)
      |                                                                                                          ^ Error: invalid SVG must not create a broken layer
  52  | })
  53  | 
  54  | test('Phase 3 editable project survives a new browser process with durable image assets', async () => {
  55  |   test.setTimeout(240000)
  56  |   const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-'))
  57  |   const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  58  |   let context = await chromium.launchPersistentContext(profile, options)
  59  |   let events
  60  |   try {
  61  |     let page = context.pages()[0]
  62  |     page.setDefaultTimeout(15000)
  63  |     events = await setup(page)
  64  |     await open(page)
  65  |     await page.getByRole('button', { name: 'Library', exact: true }).click()
  66  |     await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
  67  |     await page.getByText(/Successfully imported/).waitFor()
  68  |     await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  69  |     const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>'
  70  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  71  |     const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 32; c.getContext('2d').fillRect(0, 0, 32, 32); return c.toDataURL() })
  72  |     await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  73  |     await page.getByPlaceholder('Text to add...').fill('PERSISTENT TEXT')
  74  |     await page.getByPlaceholder('Text to add...').press('Enter')
  75  |     await page.getByRole('button', { name: 'Zones', exact: true }).click()
  76  |     await page.getByRole('button', { name: 'Add Zone', exact: true }).click()
  77  |     await page.getByPlaceholder('Zone Name (e.g. Chest Print)...').fill('QA Durable Zone')
  78  |     await page.getByRole('button', { name: 'Save Zone', exact: true }).click()
  79  |     await page.getByRole('button', { name: 'Material & Finish', exact: true }).click()
  80  |     await page.locator('input[type=color]').first().fill('#224466')
  81  |     const before = await save(page)
  82  |     await page.waitForTimeout(1200)
  83  |     const appearanceBefore = await scene(page)
  84  |     await page.screenshot({ path: `${directory}/screenshots/persistence-before.png` })
  85  |     await record('persistence-before', { before, appearanceBefore, profile, events })
  86  |     await context.close()
  87  |     context = await chromium.launchPersistentContext(profile, options)
  88  |     page = context.pages()[0]; page.setDefaultTimeout(15000)
  89  |     const reopenedEvents = await setup(page)
  90  |     await page.goto('http://localhost:3000')
  91  |     await page.getByRole('button', { name: 'File', exact: true }).click()
  92  |     await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  93  |     await page.getByText('Saved project opened', { exact: true }).waitFor()
  94  |     await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  95  |     await page.waitForTimeout(1500)
  96  |     const appearanceAfter = await scene(page)
  97  |     const after = await save(page)
  98  |     await record('persistence-comparison', { before, after, appearanceBefore, appearanceAfter, profile, events, reopenedEvents })
  99  |     await page.screenshot({ path: `${directory}/screenshots/persistence-after.png` })
  100 |     await exportProduct(page, 'durable-reopened')
  101 |     expect.soft(after.customization.zones).toEqual(before.customization.zones)
  102 |     expect.soft(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
  103 |     expect.soft(after.customization.fabricColor).toBe('#224466')
  104 |   } finally { await context.close() }
  105 | })
  106 | 
```