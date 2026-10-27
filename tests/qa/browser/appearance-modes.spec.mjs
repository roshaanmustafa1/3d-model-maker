import { test, expect } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

async function observe(page) {
  await page.addInitScript(() => { window.__qaAppearanceRecords = new Map() })
  await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    expect(source).toContain('return record.mesh.material;')
    await route.fulfill({ response, body: source.replace('return record.mesh.material;', 'window.__qaAppearanceRecords.set(record.mesh.uuid, record); return record.mesh.material;') })
  })
}
async function materials(page) {
  return page.evaluate(() => [...window.__qaAppearanceRecords.values()].map(({ mesh, partId }) => {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    return { name: mesh.name, partId, type: material.type, linear: material.color.toArray(), srgb: material.color.toArray().map((value) => Math.round(255 * (value <= .0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - .055))).map((value) => value.toString(16).padStart(2, '0')).join(''), roughness: material.roughness, metalness: material.metalness,
      map: material.map?.image?.width || 0, normalMap: material.normalMap?.image?.width || 0,
      geometry: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key, value]) => [key, Array.from(value.array)])) }
  }))
}

test('Phase 2.5 BlackBullet preserves multipart PBR and runtime artwork without double tint', async ({ page }) => {
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await observe(page)
  await page.route('**/src/assets/modals/raglan_shirt.glb', (route) => route.fulfill({ path: 'qa-reports/phase2_5/fixtures/multipart-pbr-export.glb', contentType: 'model/gltf-binary' }))
  await page.goto('http://localhost:5173/customizer?garment=shirt&appearance=imported')
  await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBe(12)
  const imported = await materials(page)
  for (const material of imported) {
    expect(material.srgb).toBe('09090b')
    expect(material.roughness).toBeCloseTo(0.65)
    expect(material.metalness).toBe(0)
    expect(material.map).toBe(8)
    expect(material.normalMap).toBe(8)
  }
  await page.screenshot({ path: 'qa-reports/phase2_5/screenshots/blackbullet-imported.png' })
  await page.getByLabel('Garment appearance').selectOption('runtime')
  await page.getByLabel('HEX Code', { exact: true }).fill('#224466')
  await page.getByLabel('HEX Code', { exact: true }).press('Enter')
  await expect.poll(() => page.evaluate(() => {
    const record = [...window.__qaAppearanceRecords.values()].find((entry) => entry.partId === 'shirt_front')
    const material = Array.isArray(record.mesh.material) ? record.mesh.material[0] : record.mesh.material
    const image = material.map?.image
    return image?.getContext ? { tint: material.color.getHexString(), pixel: Array.from(image.getContext('2d').getImageData(Math.floor(image.width * .25), Math.floor(image.height * .49), 1, 1).data) } : null
  })).toEqual({ tint: 'ffffff', pixel: [34, 68, 102, 255] })
  await page.getByRole('button', { name: 'Text', exact: true }).click()
  await page.locator('#custom-text').fill('QA design')
  await page.getByRole('button', { name: 'Add text', exact: true }).click()
  await expect.poll(async () => (await materials(page)).find((entry) => entry.partId === 'shirt_front')?.srgb).toBe('ffffff')
  const runtime = await materials(page)
  expect(runtime.map((entry) => entry.geometry)).toEqual(imported.map((entry) => entry.geometry))
  await page.screenshot({ path: 'qa-reports/phase2_5/screenshots/blackbullet-runtime.png' })
  await page.getByLabel('Garment appearance').selectOption('imported')
  expect(await materials(page)).toEqual(imported)
  expect(errors).toEqual([])
  await writeFile('qa-reports/phase2_5/blackbullet-modes.json', JSON.stringify({ imported, runtime, errors }))
})

test('Phase 2.5 BlackBullet existing catalog retains runtime default', async ({ page }) => {
  await observe(page)
  await page.goto('http://localhost:5173/customizer')
  await expect(page.getByLabel('Garment appearance')).toHaveValue('runtime')
  await expect.poll(() => page.evaluate(() => window.__qaAppearanceRecords.size), { timeout: 30000 }).toBeGreaterThan(0)
  const result = await materials(page)
  expect(result[0].type).toBe('MeshBasicMaterial')
  expect(result[0].srgb).toBe('e5e7eb')
})
