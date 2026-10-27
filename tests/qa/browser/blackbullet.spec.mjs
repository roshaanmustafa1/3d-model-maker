import { test, expect } from '@playwright/test'
import { writeFile, readFile } from 'node:fs/promises'

test('BlackBullet actual customizer preserves imported black fabric before user color choice', async ({ page }) => {
  const log = { pageErrors: [], console: [], modelRequests: 0, materialModuleInstrumented: false }
  page.on('pageerror', (error) => log.pageErrors.push(error.message))
  page.on('console', (message) => { if (['warning', 'error'].includes(message.type())) log.console.push(message.text()) })
  await page.addInitScript(() => { window.__qaGarmentMaterials = []; window.__qaColourCalls = [] })
  await page.route(/\/src\/lib\/garment-appearance\.js(?:\?.*)?$/, async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    const instrumented = source.replace('return record.mesh.material;', 'window.__qaGarmentMaterials.push(...(Array.isArray(record.mesh.material) ? record.mesh.material : [record.mesh.material])); return record.mesh.material;')
    log.materialModuleInstrumented = instrumented !== source
    await route.fulfill({ response, body: instrumented })
  })
  await page.route('**/src/assets/modals/subdivision.glb', async (route) => {
    log.modelRequests++
    await route.fulfill({ path: 'qa-reports/exported-models/black-subdivision.glb', contentType: 'model/gltf-binary' })
  })
  await page.goto('http://localhost:5173/customizer?appearance=imported')
  await expect.poll(() => page.evaluate(() => window.__qaGarmentMaterials.length), { timeout: 30000 }).toBeGreaterThan(0)
  expect(await page.evaluate(() => window.__qaColourCalls.length)).toBe(0)
  const materials = await page.evaluate(() => window.__qaGarmentMaterials.map((material) => ({ type: material.type, linear: material.color.toArray(), srgb: material.color.toArray().map((value) => Math.round(255 * (value <= .0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - .055))).map((value) => value.toString(16).padStart(2, '0')).join(''), roughness: material.roughness, metalness: material.metalness, map: !!material.map })))
  const calls = await page.evaluate(() => window.__qaColourCalls)
  await page.screenshot({ path: 'qa-reports/screenshots/blackbullet-imported-black.png', fullPage: true })
  const bytes = await readFile('qa-reports/exported-models/black-subdivision.glb')
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
  await writeFile('qa-reports/test-results/blackbullet-runtime.json', JSON.stringify({ ...log, materials, colorCalls: calls, exportedMaterials: json.materials }, null, 2))
  expect(log.modelRequests).toBe(1)
  expect(log.materialModuleInstrumented).toBe(true)
  expect(log.pageErrors).toEqual([])
  expect(materials[0].linear).toEqual(json.materials[0].pbrMetallicRoughness.baseColorFactor.slice(0, 3))
  expect(materials[0].srgb.toLowerCase(), 'Actual BlackBullet runtime material after loading the exported black GLB must remain black until user input').toBe('09090b')
})
