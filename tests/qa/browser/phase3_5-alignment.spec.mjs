import { test, expect } from '@playwright/test'
import { directory, setup, open, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'

for (const type of ['Rectangle', 'Circle', 'Star', 'Triangle', 'Text', 'Image']) {
  test(`Phase 3.5 canonical ${type} coordinates match preview texture pixels`, async ({ page }) => {
    test.setTimeout(90000); page.setDefaultTimeout(15000)
    await setup(page); await open(page)
    if (type === 'Text') {
      await page.getByPlaceholder('Text to add...').fill('ALIGN TEST')
      await page.getByPlaceholder('Text to add...').press('Enter')
    } else if (type === 'Image') {
      const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d'); ctx.fillStyle = '#10b981'; ctx.fillRect(0, 0, 64, 64); return c.toDataURL() })
      await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'alignment.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
      await page.getByText('Added artwork image to active zone!', { exact: true }).waitFor()
    } else await page.getByTitle(type, { exact: true }).click()
    const inputs = page.locator('input[type=number]')
    for (const [index, value] of ['100', '100', '300', '240'].entries()) { await inputs.nth(index).fill(value); await inputs.nth(index).press('Tab') }
    await page.locator('input[type=range]').first().fill('30')
    await page.locator('input[type=range]').first().dispatchEvent('mouseup')
    await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.width).toBe(1024)
    await page.locator('.konvajs-content').first().click({ position: { x: 10, y: 10 } })
    await page.getByText('No Layer Selected', { exact: true }).waitFor()
    const saved = await save(page)
    await page.waitForTimeout(500)
    const result = await page.evaluate(({ bounds, white }) => {
      const editor = document.querySelector('.konvajs-content canvas')
      const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
      const image = mesh.material.map.image
      const texture = document.createElement('canvas'); texture.width = image.width; texture.height = image.height
      texture.getContext('2d').drawImage(image, 0, 0)
      function measure(canvas) {
        const ctx = canvas.getContext('2d'), data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1, count = 0
        for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4, r = data[i], g = data[i + 1], b = data[i + 2]
          const match = white ? r > 180 && g > 180 && b > 180 : g > 100 && g > r * 2 && g > b * 1.2
          if (data[i + 3] > 100 && match) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); count++ }
        }
        return { minX, minY, maxX, maxY, count }
      }
      const a = measure(editor), b = measure(texture)
      for (const key of ['minX', 'maxX']) { a[key] *= 1024 / editor.width; b[key] = (b[key] / texture.width - bounds.minU) / (bounds.maxU - bounds.minU) * 1024 }
      for (const key of ['minY', 'maxY']) { a[key] *= 1024 / editor.height; b[key] = (b[key] / texture.height - (1 - bounds.maxV)) / (bounds.maxV - bounds.minV) * 1024 }
      return { editor: a, texture: b }
    }, { bounds: saved.customization.zones.body_front.uvBounds, white: type === 'Text' })
    await record(`alignment-${type.toLowerCase()}`, { result, layers: saved.customization.zones.body_front.layers })
    await page.screenshot({ path: `${directory}/screenshots/alignment-${type.toLowerCase()}.png` })
    expect(result.editor.count).toBeGreaterThan(10); expect(result.texture.count).toBeGreaterThan(10)
    for (const key of ['minX', 'maxX', 'minY', 'maxY']) expect(Math.abs(result.editor[key] - result.texture[key])).toBeLessThan(7)
  })
}

test('Phase 3.5 repeated artwork/export/replacement releases GPU allocations', async ({ page }) => {
  test.setTimeout(240000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await open(page)
  const cycles = []
  for (let index = 0; index < 6; index++) {
    const started = Date.now()
    await product(page, 'Streetwear Oversized Tee')
    await page.getByRole('button', { name: 'Artwork', exact: true }).click()
    await page.getByTitle('Rectangle', { exact: true }).click()
    await expect.poll(async () => (await scene(page)).meshes[0]?.materials[0].texture?.width).toBe(1024)
    await exportProduct(page, `cycle-${index}`)
    await page.waitForTimeout(500)
    const current = await scene(page)
    cycles.push({ cycle: index, elapsedMs: Date.now() - started, memory: current.memory, heap: current.heap })
    await record('resource-cycles', { cycles, events })
  }
  expect(new Set(cycles.slice(2).map(cycle => cycle.memory.geometries)).size).toBe(1)
  expect(Math.max(...cycles.slice(2).map(cycle => cycle.memory.textures)) - Math.min(...cycles.slice(2).map(cycle => cycle.memory.textures))).toBeLessThanOrEqual(1)
})
