import { test, expect } from '@playwright/test'
import { directory, setup, open, product, zone, save, scene, record, exportProduct, inspectGLB } from '../../../scripts/qa/phase3-support.mjs'

test.describe('Independent Phase 3', () => {
  test.setTimeout(180000)
  test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })

  test('workspace initialization corresponds to selected product', async ({ page }) => {
    const events = await setup(page)
    await open(page)
    await page.waitForTimeout(2000)
    const actual = await scene(page)
    await record('initial-workspace', { actual, events })
    await page.screenshot({ path: `${directory}/screenshots/initial-workspace.png` })
    expect(actual.meshes.some(mesh => mesh.name === 'Body_Main')).toBe(true)
  })

  test('catalog geometry, live textures, camera controls and resource cycles', async ({ page }) => {
    const events = await setup(page)
    await open(page)
    const cycles = []
    for (const name of ['Streetwear Oversized Tee', 'Heavyweight Streetwear Hoodie', 'Insulated Thermal Bottle', 'Luxury Retail Box', 'Streetwear Oversized Tee', 'Insulated Thermal Bottle']) {
      const started = Date.now()
      await product(page, name)
      const loaded = await scene(page)
      await page.getByRole('button', { name: 'Artwork', exact: true }).click()
      await page.getByTitle('Rectangle', { exact: true }).click()
      await page.waitForTimeout(1400)
      const artwork = await scene(page)
      const views = []
      for (const view of ['Front', 'Back', 'Left', 'Right']) {
        await page.getByRole('button', { name: new RegExp(`^${view}$`, 'i') }).click()
        await page.waitForTimeout(450)
        views.push({ view, camera: (await scene(page)).camera })
      }
      const fps = await page.evaluate(() => new Promise(resolve => {
        let count = 0, start = performance.now()
        function tick(now) { count++; if (now - start < 1200) requestAnimationFrame(tick); else resolve({ frames: count, durationMs: now - start, fps: count * 1000 / (now - start) }) }
        requestAnimationFrame(tick)
      }))
      cycles.push({ name, durationMs: Date.now() - started, loaded, artwork, views, fps })
      await page.screenshot({ path: `${directory}/screenshots/catalog-${cycles.length}.png` })
      await record('catalog-cycles', { cycles, events })
    }
    expect.soft(cycles[0].loaded.meshes).toHaveLength(4)
    expect.soft(cycles[1].loaded.meshes).toHaveLength(5)
    expect.soft(cycles[2].loaded.meshes).toHaveLength(3)
    expect.soft(new Set(cycles[0].views.map(v => JSON.stringify(v.camera))).size, 'camera presets must actually move camera').toBeGreaterThan(1)
    expect.soft(cycles[0].artwork.meshes[0].materials[0].texture?.hash, 'artwork must reach real mesh').not.toBe(cycles[0].loaded.meshes[0].materials[0].texture?.hash)
  })

  test('real artwork controls, durable layers, UV isolation, export resolutions and BlackBullet', async ({ page }) => {
    test.setTimeout(300000)
    const events = await setup(page)
    await open(page)
    await product(page, 'Streetwear Oversized Tee')
    await page.getByRole('button', { name: 'Artwork', exact: true }).click()
    const png = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64
      const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 64); ctx.fillStyle = '#0000ff'; ctx.fillRect(32, 0, 32, 64)
      return c.toDataURL()
    })
    await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'qa-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
    await page.getByPlaceholder('Text to add...').fill('FRONT MARK')
    await page.getByPlaceholder('Text to add...').press('Enter')
    await page.getByTitle('Rectangle', { exact: true }).click()
    const initial = await save(page)
    const transforms = page.locator('input[type=number]')
    await transforms.nth(0).fill('100'); await transforms.nth(0).press('Tab')
    await transforms.nth(2).fill('220'); await transforms.nth(2).press('Tab')
    await page.locator('input[type=range]').nth(0).fill('45'); await page.locator('input[type=range]').nth(0).dispatchEvent('mouseup')
    await page.locator('input[type=range]').nth(1).fill('0.5'); await page.locator('input[type=range]').nth(1).dispatchEvent('mouseup')
    await page.getByRole('button', { name: 'Layers', exact: true }).click()
    await page.getByTitle('Duplicate layer', { exact: true }).first().click()
    await page.getByTitle('Lock layer', { exact: true }).first().click()
    await page.getByTitle('Unlock layer', { exact: true }).first().click()
    await page.getByTitle('Hide layer', { exact: true }).first().click()
    await page.getByTitle('Show layer', { exact: true }).first().click()
    await page.getByTitle('Delete layer', { exact: true }).first().click()
    const edited = await save(page)
    await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).last().click()
    const undone = await save(page)
    await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).last().click()
    const redone = await save(page)
    await zone(page, 'Back Center')
    await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
    await page.getByPlaceholder('Text to add...').press('Enter')
    await zone(page, 'Left Sleeve')
    await page.getByTitle('Star', { exact: true }).click()
    const final = await save(page)
    const actual = await scene(page)
    await record('artwork-controls', { initial, edited, undone, redone, final, actual, events })
    await page.screenshot({ path: `${directory}/screenshots/artwork-product.png` })
    const exports = []
    for (const res of [1024, 2048, 4096]) {
      const timing = await exportProduct(page, `blackbullet-test-${res}`, res)
      exports.push({ resolution: res, timing, glb: await inspectGLB(`blackbullet-test-${res}`) })
      await record('exports', exports)
    }
    expect.soft(edited.customization.zones.body_front.layers).toHaveLength(3)
    expect.soft(redone.customization.zones).toEqual(edited.customization.zones)
    expect.soft(actual.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture?.hash, 'untouched right sleeve must not share the front/back artwork atlas').not.toBe(actual.meshes.find(m => m.name === 'Body_Main').materials[0].texture?.hash)
  })

  test('UV-ready multipart import preserves original albedo and PBR', async ({ page }) => {
    const events = await setup(page)
    await open(page)
    await page.getByRole('button', { name: 'Library', exact: true }).click()
    await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
    await page.getByText(/Successfully imported/).waitFor()
    await page.waitForTimeout(1800)
    const actual = await scene(page)
    const saved = await save(page)
    await record('multipart-import', { actual, saved, events })
    await page.screenshot({ path: `${directory}/screenshots/multipart-import.png` })
    await exportProduct(page, 'multipart-customizer')
    await inspectGLB('multipart-customizer')
    expect.soft(actual.meshes).toHaveLength(12)
    expect.soft(actual.meshes[0].materials[0].roughness).toBeCloseTo(.65)
    expect.soft(actual.meshes[0].materials[0].texture?.width).toBe(8)
  })
})
