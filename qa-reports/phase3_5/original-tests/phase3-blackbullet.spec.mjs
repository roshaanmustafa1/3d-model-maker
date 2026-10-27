import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { directory, setup, open, record, scene } from '../../../scripts/qa/phase3-support.mjs'

async function observe(page) {
  await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async route => {
    const response = await route.fetch(), source = await response.text()
    expect(source).toContain('return record.mesh.material;')
    await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  })
}
async function trace(page) {
  return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => ({
    name: mesh.name, partId, matrix: mesh.matrixWorld.toArray(),
    attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attr]) => [name, { count: attr.count, first: Array.from(attr.array).slice(0, 12) }])),
    materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
      const image = material.map?.image
      let texture
      if (image?.width) {
        const c = document.createElement('canvas'); c.width = image.width; c.height = image.height
        const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0)
        const data = ctx.getImageData(0, 0, c.width, c.height).data
        let hash = 2166136261; for (const v of data) hash = Math.imul(hash ^ v, 16777619)
        texture = { width: c.width, height: c.height, hash: hash >>> 0, center: Array.from(ctx.getImageData(c.width / 2, c.height / 2, 1, 1).data), flipY: material.map.flipY }
      }
      return { type: material.type, linear: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, texture, normalMap: !!material.normalMap }
    })
  })))
}

test('Phase 3 newly customized Model Maker GLB in actual BlackBullet imported and runtime modes', async ({ page }) => {
  test.setTimeout(150000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  const file = `${directory}/exports/blackbullet-test-1024.glb`
  await readFile(file)
  await observe(page)
  let routed = 0
  await page.route('**/src/assets/modals/raglan_shirt.glb', route => { routed++; return route.fulfill({ path: file, contentType: 'model/gltf-binary' }) })
  await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size)).toBeGreaterThan(0)
  await page.waitForTimeout(1000)
  const imported = await trace(page)
  await record('blackbullet-imported', { routed, imported, events })
  for (const view of ['Front', 'Back', 'Left', 'Right']) {
    const control = page.getByRole('button', { name: `${view} view`, exact: true })
    if (await control.count()) { await control.click(); await page.waitForTimeout(500) }
    await page.screenshot({ path: `${directory}/screenshots/blackbullet-${view.toLowerCase()}.png` })
  }
  await page.getByLabel('Garment appearance').selectOption('runtime')
  const runtime = await trace(page)
  await page.screenshot({ path: `${directory}/screenshots/blackbullet-runtime.png` })
  await page.getByLabel('Garment appearance').selectOption('imported')
  const restored = await trace(page)
  await record('blackbullet-modes', { routed, imported, runtime, restored, events })
  expect.soft(routed).toBe(1)
  expect.soft(imported).toHaveLength(4)
  expect.soft(restored.map(({ matrix, ...entry }) => entry)).toEqual(imported.map(({ matrix, ...entry }) => entry))
  expect.soft(events.errors).toEqual([])
  expect.soft(imported.filter(m => m.partId === 'shirt_front'), 'exported product must resolve a runtime front region').toHaveLength(1)
  expect.soft(imported.filter(m => m.partId === 'shirt_back'), 'exported product must resolve a runtime back region').toHaveLength(1)
})

test('Phase 3 UV-ready customized multipart export supports both BlackBullet appearance modes', async ({ page }) => {
  test.setTimeout(120000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await observe(page)
  await page.route('**/src/assets/modals/raglan_shirt.glb', route => route.fulfill({ path: `${directory}/exports/durable-reopened.glb`, contentType: 'model/gltf-binary' }))
  await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(12)
  await page.waitForTimeout(1000)
  const imported = await trace(page)
  await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-imported.png` })
  await page.getByLabel('Garment appearance').selectOption('runtime')
  await page.getByLabel('HEX Code', { exact: true }).fill('#224466')
  await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  await page.getByRole('button', { name: 'Text', exact: true }).click()
  await page.locator('#custom-text').fill('RUNTIME QA')
  await page.getByRole('button', { name: 'Add text', exact: true }).click()
  await page.waitForTimeout(1000)
  const runtime = await trace(page)
  await page.screenshot({ path: `${directory}/screenshots/blackbullet-multipart-runtime.png` })
  await record('blackbullet-multipart', { imported, runtime, events })
  expect.soft(imported.every(m => m.materials[0].texture?.width === 1024)).toBe(true)
  expect.soft(runtime.find(m => m.partId === 'shirt_front')?.materials[0].linear).toEqual([1, 1, 1])
  expect.soft(events.errors).toEqual([])
})

test('Phase 3 customized export reimports into Model Maker with artwork textures', async ({ page }) => {
  test.setTimeout(90000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await open(page)
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/blackbullet-test-1024.glb`)
  await page.getByText(/Successfully imported/).waitFor()
  await page.waitForTimeout(1400)
  const actual = await scene(page)
  await record('customized-reimport', { actual, events })
  await page.screenshot({ path: `${directory}/screenshots/customized-reimport.png` })
  expect.soft(actual.meshes).toHaveLength(4)
  expect.soft(new Set(actual.meshes.map(m => m.materials[0].texture?.hash)).size).toBeGreaterThan(1)
})
