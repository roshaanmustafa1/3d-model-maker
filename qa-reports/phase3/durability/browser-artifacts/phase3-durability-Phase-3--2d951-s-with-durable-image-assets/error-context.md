# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3-durability.spec.mjs >> Phase 3 editable project survives a new browser process with durable image assets
- Location: tests\qa\browser\phase3-durability.spec.mjs:54:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 48
+ Received  + 48

@@ -33,17 +33,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -104,17 +104,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -175,17 +175,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -246,17 +246,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -317,17 +317,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -388,17 +388,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -459,17 +459,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -530,17 +530,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -601,17 +601,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -672,17 +672,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -743,17 +743,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
@@ -814,17 +814,17 @@
              255,
              255,
            ],
            "colorSpace": "srgb",
            "corner": Array [
-             24,
-             24,
-             27,
+             34,
+             68,
+             102,
              255,
            ],
            "flipY": true,
-           "hash": 765444549,
+           "hash": 3523801797,
            "height": 1024,
            "width": 1024,
          },
          "type": "MeshStandardMaterial",
        },
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
          - generic [ref=e54]: multipart-textured-inputother
        - generic [ref=e59]:
          - generic [ref=e60]:
            - button "Undo (Ctrl+Z)" [disabled]
            - button "Redo (Ctrl+Y)" [disabled]
          - button "Save Project" [ref=e61]
          - button "Export GLB" [ref=e62]
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - button "Artwork" [ref=e66]
            - button "Layers" [ref=e70]
            - button "Zones" [ref=e75]
            - button "Library" [ref=e79]
          - generic [ref=e86]:
            - generic [ref=e87]:
              - text: Upload Artwork
              - button "Upload Image or SVG" [ref=e88]
            - generic [ref=e89]:
              - text: Typography
              - generic [ref=e90]:
                - textbox "Text to add..." [ref=e91]: CUSTOM TEXT
                - button [ref=e92]
            - generic [ref=e93]:
              - text: Add Shape
              - generic [ref=e94]:
                - button "Rectangle" [ref=e95]
                - button "Circle" [ref=e98]
                - button "Star" [ref=e101]
                - button "Triangle" [ref=e104]
        - generic [ref=e107]:
          - generic [ref=e108]:
            - button "Split View (2D + 3D)" [ref=e109]
            - button "2D Design Canvas" [ref=e110]
            - button "3D Product Preview" [ref=e111]
          - generic [ref=e112]:
            - generic [ref=e113]: "Active Zone: QA Durable Zone | Canvas: 1024x1024px"
            - generic [ref=e120]:
              - generic:
                - generic [ref=e121]:
                  - button "Object Mode [Tab]" [ref=e122] [cursor=pointer]:
                    - generic [ref=e126]: Object Mode
                    - generic [ref=e127]: "[Tab]"
                  - button [ref=e129] [cursor=pointer]
                  - button [ref=e133] [cursor=pointer]
                  - button [ref=e139] [cursor=pointer]
                  - button [ref=e143] [cursor=pointer]
                  - button "world" [ref=e150]
                - generic [ref=e151]:
                  - button "solid" [ref=e152] [cursor=pointer]
                  - button [ref=e158] [cursor=pointer]
                  - button [ref=e164] [cursor=pointer]
                  - button [ref=e169] [cursor=pointer]
                  - button [ref=e172] [cursor=pointer]
          - generic [ref=e183]:
            - generic [ref=e184]:
              - button "perspective" [ref=e185]
              - button "front" [ref=e186]
              - button "back" [ref=e187]
              - button "left" [ref=e188]
              - button "right" [ref=e189]
              - button "top" [ref=e190]
            - generic [ref=e191]:
              - button "neutral" [ref=e198]
              - button "soft white" [ref=e199]
              - button "dark" [ref=e200]
              - button "warm" [ref=e201]
            - button "Screenshot" [ref=e202]
        - generic [ref=e203]:
          - generic [ref=e204]:
            - button "Layer Inspector" [ref=e205]
            - button "Material & Finish" [ref=e207]
          - generic [ref=e215]:
            - paragraph [ref=e217]: No Layer Selected
            - paragraph [ref=e218]: Click an element on the canvas or select a layer from the list to edit its properties.
      - generic [ref=e219]:
        - generic [ref=e220]:
          - generic [ref=e221]:
            - generic [ref=e222]: "Zone:"
            - generic [ref=e223]: QA Durable Zone
          - generic [ref=e224]:
            - generic [ref=e225]: "Bake Resolution:"
            - generic [ref=e226]: 1024 x 1024
          - generic [ref=e227]:
            - generic [ref=e228]: "UV Status:"
            - generic [ref=e229]: Mapped
        - generic [ref=e233]:
          - generic [ref=e234]: Saved at 11:20:40 PM
          - generic [ref=e235]: BlackBullet Compatible
    - contentinfo [ref=e236]:
      - generic [ref=e237]:
        - generic [ref=e238]: shirt_front_group
        - generic [ref=e242]: Saved at 11:20:40 PM
      - generic [ref=e246]:
        - generic "Total Scene Vertices" [ref=e247]:
          - generic [ref=e248]: "Verts:"
          - generic [ref=e249]: 61,476
        - generic "Total Scene Triangles / Polygons" [ref=e251]:
          - generic [ref=e252]: "Tris:"
          - generic [ref=e253]: 117,632
        - generic "Total Mesh Objects" [ref=e255]: "12"
        - generic "Total PBR Materials" [ref=e261]: "2"
        - generic "Render Viewport FPS" [ref=e270]: 1 FPS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e279] [cursor=pointer]
  - alert [ref=e283]
```

# Test source

```ts
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
  51  |   expect.soft(after.customization.zones.body_front.layers, 'invalid SVG must not create a broken layer').toHaveLength(6)
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
> 102 |     expect.soft(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
      |                                         ^ Error: expect(received).toEqual(expected) // deep equality
  103 |     expect.soft(after.customization.fabricColor).toBe('#224466')
  104 |   } finally { await context.close() }
  105 | })
  106 | 
```