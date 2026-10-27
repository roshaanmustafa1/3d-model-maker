import { test, expect, chromium } from '@playwright/test'
import { writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { observeReactScenes } from './observer.mjs'

const directory = 'qa-reports/phase2_5'
const launch = { executablePath: process.env.QA_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
async function editor(page) {
  await page.addInitScript(observeReactScenes)
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await expect(page.getByRole('button', { name: /^solid$/i })).toBeVisible()
}
async function importFile(page, file, name) {
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles(file)
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
}
async function exportFile(page, file) {
  await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  await expect(page.getByText(/Round-Trip Verification: PASSED/)).toBeVisible()
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: /^Download/ }).click()
  await (await pending).saveAs(file)
}
async function meshData(page, name = 'QA_small') {
  return page.evaluate((name) => {
    const mesh = window.__qaSceneObjects().find((object) => object.name === name)
    if (!mesh) return null
    const geometry = mesh.geometry
    const attributes = Object.fromEntries(Object.keys(geometry.attributes).sort().map((key) => [key, Array.from(geometry.attributes[key].array)]))
    const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((material) => {
      const maps = {}
      for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) {
        const texture = material[key]
        if (!texture) continue
        const canvas = document.createElement('canvas'); canvas.width = texture.image.width; canvas.height = texture.image.height
        canvas.getContext('2d').drawImage(texture.image, 0, 0)
        maps[key] = { width: canvas.width, height: canvas.height, colorSpace: texture.colorSpace, pixels: Array.from(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data) }
      }
      return { type: material.type, name: material.name, color: material.color.toArray(), roughness: material.roughness, metalness: material.metalness, opacity: material.opacity, side: material.side, maps }
    })
    return { attributes, index: geometry.index && Array.from(geometry.index.array), groups: geometry.groups, matrix: mesh.matrixWorld.toArray(), materials }
  }, name)
}

test.describe('Phase 2.5', () => {
  test.beforeAll(async () => { await mkdir(directory + '/screenshots', { recursive: true }); await mkdir(directory + '/profiles', { recursive: true }) })

  test('actual Model Maker exports a multi-part black PBR garment with textures', async ({ page }) => {
    await editor(page)
    await importFile(page, directory + '/fixtures/multipart-textured-input.glb', 'shirt_front')
    await exportFile(page, directory + '/fixtures/multipart-pbr-export.glb')
    await page.screenshot({ path: directory + '/screenshots/multipart-export.png' })
  })

  test('IndexedDB reconstructs edited textured geometry after browser process restart', async () => {
    test.setTimeout(150000)
    const profile = await mkdtemp(join(tmpdir(), '3d-model-maker-qa-'))
    let context = await chromium.launchPersistentContext(profile, launch)
    try {
    let page = context.pages()[0]
    await editor(page)
    await importFile(page, 'qa-reports/exported-models/pbr-textures.glb', 'QA_small')
    await page.getByRole('button', { name: 'Geom', exact: true }).click()
    await page.keyboard.press('Tab'); await page.keyboard.press('3'); await page.keyboard.press('a')
    await page.getByRole('button', { name: 'Extrude Faces', exact: true }).click()
    await page.keyboard.press('Tab')
    await page.getByRole('button', { name: 'UV Lab', exact: true }).click()
    await page.getByRole('button', { name: /Box Projection/ }).click()
    await page.getByRole('button', { name: '3D Studio', exact: true }).click()
    await page.getByRole('button', { name: 'Mat', exact: true }).click()
    await page.locator('input[type="color"]').first().fill('#111111')
    await expect.poll(async () => (await meshData(page))?.materials[0].color[0]).toBeGreaterThan(0)
    const before = await meshData(page)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Project saved to IndexedDB', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('3d_project_')))).toEqual([])
    await context.close()
    context = await chromium.launchPersistentContext(profile, launch)
    page = context.pages()[0]
    await editor(page)
    await page.getByRole('button', { name: 'File', exact: true }).click()
    await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
    await expect(page.getByText('Saved project opened', { exact: true })).toBeVisible()
    await expect.poll(async () => (await meshData(page))?.materials[0].maps.map?.width).toBe(8)
    const after = await meshData(page)
    await writeFile(directory + '/durable-browser-comparison.json', JSON.stringify({ before, after, profile }, null, 2))
    expect(after).toEqual(before)
    await page.screenshot({ path: directory + '/screenshots/durable-reopened.png' })
    await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('3d-model-maker-assets', 1)
      request.onsuccess = () => {
        const db = request.result, transaction = db.transaction(['projects', 'assets'], 'readwrite')
        const projects = transaction.objectStore('projects').getAll()
        projects.onsuccess = () => transaction.objectStore('assets').delete(projects.result[0].assetId)
        transaction.oncomplete = () => { db.close(); resolve() }; transaction.onerror = reject
      }; request.onerror = reject
    }))
    await page.getByRole('button', { name: 'File', exact: true }).click()
    await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
    await expect(page.getByText(/Missing project asset bundle/)).toBeVisible()
    expect(await meshData(page)).toEqual(after)
    await context.close()
    } finally { await context.close() }
  })

  test('repeated real imports/removals retain bounded renderer geometry resources', async ({ page }) => {
    test.setTimeout(150000)
    await editor(page)
    const measurements = []
    for (let index = 0; index < 6; index++) {
      await importFile(page, 'qa-reports/exported-models/pbr-textures.glb', 'QA_small')
      await page.getByText('QA_small', { exact: true }).first().click()
      await page.keyboard.press('Delete')
      await expect(page.getByText('No objects in scene.', { exact: false })).toBeVisible()
      await page.keyboard.press('Control+z')
      await expect(page.getByText('QA_small', { exact: true }).first()).toBeVisible()
      await page.keyboard.press('Control+y')
      const sample = await page.evaluate(() => {
        const object = window.__qaSceneObjects().find((object) => object.__r3f?.root)
        return { memory: { ...object.__r3f.root.getState().gl.info.memory }, heap: performance.memory?.usedJSHeapSize }
      })
      measurements.push(sample)
    }
    await writeFile(directory + '/resource-cycles.json', JSON.stringify(measurements, null, 2))
    expect(measurements.at(-1).memory.geometries).toBeLessThanOrEqual(measurements[1].memory.geometries + 5)
  })
})
