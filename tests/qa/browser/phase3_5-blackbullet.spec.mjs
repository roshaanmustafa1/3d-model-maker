import { test, expect } from '@playwright/test'
import { directory, setup, record } from '../../../scripts/qa/phase3-support.mjs'

async function materials(page) {
  return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => {
    const m = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    const image = m.map?.image
    let texture
    if (image?.width) {
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let hash = 2166136261; for (const byte of data) hash = Math.imul(hash ^ byte, 16777619)
      texture = { width: canvas.width, height: canvas.height, hash: hash >>> 0, sample: Array.from(ctx.getImageData(canvas.width * .25, canvas.height * .49, 1, 1).data) }
    }
    return { name: mesh.name, partId, linear: m.color.toArray(), roughness: m.roughness, metalness: m.metalness, texture, uvCount: mesh.geometry.attributes.uv?.count, positionCount: mesh.geometry.attributes.position.count }
  }))
}

test('Phase 3.5 actual BlackBullet resolves regions, preserves import, isolates runtime colors/artwork', async ({ page }) => {
  test.setTimeout(150000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async route => {
    const response = await route.fetch(), source = await response.text()
    expect(source).toContain('return record.mesh.material;')
    await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  })
  let routed = 0
  await page.route('**/src/assets/modals/raglan_shirt.glb', route => { routed++; return route.fulfill({ path: `${directory}/exports/acceptance-isolated.glb`, contentType: 'model/gltf-binary' }) })
  await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(6)
  const spin = page.getByRole('button', { name: 'Toggle automatic rotation', exact: true })
  if (await spin.getAttribute('aria-pressed') === 'true') await spin.click()
  const imported = await materials(page)
  expect(new Set(imported.map(m => m.partId))).toEqual(new Set(['shirt_front', 'shirt_back', 'shirt_base', 'collar', 'shoulder_left', 'shoulder_right']))
  expect(imported.find(m => m.partId === 'shoulder_right').texture).toBeUndefined()
  expect(imported.find(m => m.partId === 'shirt_front').linear).toEqual([1, 1, 1])
  for (const view of ['Front', 'Back', 'Left', 'Right']) {
    await page.getByRole('button', { name: `${view} view`, exact: true }).click()
    await page.waitForTimeout(650)
    await page.screenshot({ path: `${directory}/screenshots/contract-${view.toLowerCase()}.png` })
  }
  await page.getByLabel('Garment appearance').selectOption('runtime')
  await page.getByLabel('HEX Code', { exact: true }).fill('#335577')
  await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  await page.getByRole('button', { name: 'Text', exact: true }).click()
  await page.locator('#custom-text').fill('RUNTIME FRONT')
  await page.getByRole('button', { name: 'Add text', exact: true }).click()
  const frontRuntime = await materials(page)
  expect(frontRuntime.find(m => m.partId === 'shirt_front').linear).toEqual([1, 1, 1])
  expect(frontRuntime.find(m => m.partId === 'shirt_front').texture.sample).toEqual([51, 85, 119, 255])
  await page.getByRole('button', { name: 'Select Colors', exact: true }).click()
  await page.getByRole('button', { name: 'Left shoulder', exact: true }).click()
  await page.getByLabel('HEX Code', { exact: true }).fill('#00ff00')
  await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  const runtime = await materials(page)
  await record('blackbullet-contract', { imported, frontRuntime, runtime, routed, events })
  expect(runtime.find(m => m.partId === 'shoulder_left').linear).toEqual([0, 1, 0])
  expect(runtime.find(m => m.partId === 'shoulder_right').linear).not.toEqual([0, 1, 0])
  await page.screenshot({ path: `${directory}/screenshots/contract-runtime.png` })
  await page.getByLabel('Garment appearance').selectOption('imported')
  const restored = await materials(page)
  expect(restored).toEqual(imported)
  expect(events.errors).toEqual([])
  await record('blackbullet-contract', { imported, frontRuntime, runtime, restored, routed, events })
})
