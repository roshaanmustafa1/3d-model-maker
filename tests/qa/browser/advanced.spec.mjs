import { test, expect } from '@playwright/test'
import { writeFile, readFile } from 'node:fs/promises'
import { observeReactScenes } from './observer.mjs'

test.describe('advanced QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(observeReactScenes)
    await page.goto('/')
    await expect(page.getByRole('button', { name: /^solid$/i })).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.some((m) => m.name === 'Studio_Cube'))).toBe(true)
  })

  test('actual scene selection, material isolation and geometry overlays', async ({ page }) => {
    const before = await page.evaluate(() => window.__qaSnapshot())
    const model = before.meshes.find((m) => m.name === 'Studio_Cube')
    await page.keyboard.press('q')
    await page.keyboard.press('Escape')
    const target = await page.evaluate(() => {
      const mesh = window.__qaSceneObjects().find((object) => object.name === 'Studio_Cube')
      const { camera, gl } = mesh.__r3f.root.getState()
      const point = mesh.position.clone().setFromMatrixPosition(mesh.matrixWorld).project(camera)
      const rect = gl.domElement.getBoundingClientRect()
      return { x: rect.x + (point.x + 1) * rect.width / 2, y: rect.y + (1 - point.y) * rect.height / 2 }
    })
    await page.mouse.click(target.x, target.y)
    await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
    await expect(page.locator('[data-slot="resizable-panel"]').last().locator('input[type="text"]').first()).toHaveValue('Studio_Cube')
    for (const [label, mode] of [['Wireframe', 'wireframe'], ['Normal Shading', 'normal'], ['Material Preview', 'material'], ['Solid Material', 'solid']]) {
      await page.getByRole('button', { name: /^(solid|wireframe|normal|material)$/i }).click()
      await page.getByRole('menuitem', { name: label, exact: true }).click()
      await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].wireframe)).toBe(mode === 'wireframe')
    }
    const after = await page.evaluate(() => window.__qaSnapshot())
    const final = after.meshes.find((m) => m.name === 'Studio_Cube')
    expect(final.materials[0].color).toBe(model.materials[0].color)
    expect(final.materials[0].roughness).toBe(model.materials[0].roughness)
    expect(final.vertices).toBe(model.vertices)
    expect(final.triangles).toBe(model.triangles)
    await page.locator('button').filter({ has: page.locator('svg.lucide-network') }).click()
    await page.screenshot({ path: 'qa-reports/screenshots/topology-overlay.png' })
    await writeFile('qa-reports/test-results/viewport-material-snapshots.json', JSON.stringify({ before, after }, null, 2))
  })

  test('real garment renders black through all six camera presets', async ({ page }) => {
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/black-raglan_shirt.glb')
    await expect(page.getByText('shirt_front', { exact: true })).toBeVisible()
    const snapshots = []
    for (const name of ['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom']) {
      await page.locator('button').filter({ has: page.locator('svg.lucide-compass') }).click()
      await page.getByRole('menuitem', { name: new RegExp(`^${name}( |$)`) }).click()
      await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.filter((m) => m.name.startsWith('shirt_')).length)).toBeGreaterThan(0)
      const snapshot = await page.evaluate(() => window.__qaSnapshot())
      const garment = snapshot.meshes.filter((m) => m.name === 'shirt_front')
      expect(garment[0].materials[0].color).toBe('09090b')
      snapshots.push({ name, camera: snapshot.camera, garment })
      await page.screenshot({ path: `qa-reports/screenshots/real-shirt-${name.toLowerCase()}.png` })
    }
    await writeFile('qa-reports/test-results/real-shirt-camera-snapshots.json', JSON.stringify(snapshots, null, 2))
  })

  test('base-color and normal image uploads survive real browser GLB export/reimport', async ({ page }) => {
    await page.getByRole('button', { name: 'Mat', exact: true }).click()
    const inputs = page.locator('input[type="file"][accept="image/*"]')
    await inputs.nth(0).setInputFiles('qa-reports/exported-models/qa-albedo.png')
    await inputs.nth(1).setInputFiles('qa-reports/exported-models/qa-normal.png')
    await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].map?.width)).toBe(8)
    const before = await page.evaluate(() => window.__qaSnapshot())
    const material = before.meshes.find((m) => m.name === 'Studio_Cube').materials[0]
    expect(material.map.colorSpace).toBe('srgb')
    expect(material.normalMap.colorSpace).toBe('')
    await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
    await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
    await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: /^Download/ }).click()
    await (await pending).saveAs('qa-reports/exported-models/textured-browser.glb')
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/textured-browser.glb')
    await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.materials[0].map?.width)).toBe(8)
    const after = await page.evaluate(() => window.__qaSnapshot())
    expect(after.meshes.find((m) => m.name === 'Studio_Cube').materials[0].normalMap.width).toBe(8)
    await writeFile('qa-reports/test-results/texture-roundtrip.json', JSON.stringify({ before, after }, null, 2))
    await page.screenshot({ path: 'qa-reports/screenshots/textured-reimport.png' })
  })

  test('UV edits survive an export independently of undo', async ({ page }) => {
    const before = await page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube').uv)
    await page.getByRole('button', { name: 'UV Lab', exact: true }).click()
    await page.getByRole('button', { name: /Cylindrical Projection/ }).click()
    await page.getByRole('button', { name: '3D Studio', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube')?.uv?.length)).toBeGreaterThan(0)
    const after = await page.evaluate(() => window.__qaSnapshot().meshes.find((m) => m.name === 'Studio_Cube').uv)
    expect(after).not.toEqual(before)
    await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
    await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
    await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  })

  test('mesh-size rendering FPS and selection latency are measured', async ({ page }) => {
    const results = []
    for (const label of ['small', 'medium', 'large']) {
      const started = performance.now()
      await page.getByRole('button', { name: 'Import', exact: true }).click()
      await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles(`qa-reports/exported-models/performance-${label}.glb`)
      await expect(page.getByText(`QA_${label}`, { exact: true }).first()).toBeVisible()
      const loadMs = performance.now() - started
      const frameTimes = await page.evaluate(() => new Promise((resolve) => {
        const times = []
        function frame(time) { times.push(time); if (times.length < 31) requestAnimationFrame(frame); else resolve(times) }
        requestAnimationFrame(frame)
      }))
      const selectionStart = performance.now()
      await page.getByText(`QA_${label}`, { exact: true }).first().click()
      await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
      results.push({ label, browserImportToVisibleMs: loadMs, sceneExplorerClickToInspectorMs: performance.now() - selectionStart, rafFPS: 30000 / (frameTimes[30] - frameTimes[0]), snapshot: await page.evaluate(() => ({ ...window.__qaSnapshot(), meshes: window.__qaSnapshot().meshes.map(({ uv, ...mesh }) => mesh), heap: performance.memory?.usedJSHeapSize })) })
    }
    await writeFile('qa-reports/test-results/browser-performance.json', JSON.stringify(results, null, 2))
  })

  test('Shift click synchronizes multiple Scene Explorer selections', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).first().click()
    await page.getByRole('menuitem', { name: 'Sphere', exact: true }).click()
    const rows = page.locator('[data-slot="resizable-panel"]').first().locator('div.group')
    const cube = rows.filter({ hasText: 'Studio_Cube' }), sphere = rows.filter({ hasText: 'Sphere_2' })
    await cube.click({ modifiers: ['Shift'] })
    await expect(cube).toHaveClass(/bg-emerald/)
    await expect(sphere).toHaveClass(/bg-emerald/)
    await cube.click({ modifiers: ['Shift'] })
    await expect(cube).not.toHaveClass(/bg-emerald/)
    await expect(sphere).toHaveClass(/bg-emerald/)
  })

  test('imported packed PBR texture channels survive browser GLB export', async ({ page }) => {
    await page.getByRole('button', { name: 'Import', exact: true }).click()
    await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/pbr-textures.glb')
    await expect(page.getByText('QA_small', { exact: true }).first()).toBeVisible()
    const textures = await page.evaluate(() => {
      const mesh = window.__qaSceneObjects().find((object) => object.name === 'QA_small')
      return ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].map((slot) => ({ slot, width: mesh.material[slot]?.image.width, colorSpace: mesh.material[slot]?.colorSpace }))
    })
    expect(textures.map((texture) => texture.width)).toEqual([8, 8, 8, 8])
    expect(textures.map((texture) => texture.colorSpace)).toEqual(['srgb', '', '', ''])
    await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
    await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
    await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: /^Download/ }).click()
    await (await pending).saveAs('qa-reports/exported-models/pbr-textures-roundtrip.glb')
    const bytes = await readFile('qa-reports/exported-models/pbr-textures-roundtrip.glb')
    const metadata = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
    expect(metadata.materials[0].pbrMetallicRoughness.baseColorTexture).toBeDefined()
    expect(metadata.materials[0].pbrMetallicRoughness.metallicRoughnessTexture).toBeDefined()
    expect(metadata.materials[0].normalTexture).toBeDefined()
    await writeFile('qa-reports/test-results/pbr-textures-roundtrip.json', JSON.stringify({ textures, metadata }, null, 2))
  })
})
