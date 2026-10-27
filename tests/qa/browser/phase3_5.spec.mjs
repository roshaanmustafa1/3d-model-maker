import { test, expect, chromium } from '@playwright/test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { directory, setup, open, zone, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'
import { inspectSurfaces } from '../../../scripts/qa/phase3_5-pixels.mjs'

test.setTimeout(180000)
test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000) })
async function ready(page, name = 'Body_Main') {
  await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === name)?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
}

test('Phase 3.5 acceptance: actual front/back/sleeve pixels, source factors and reimport', async ({ page }) => {
  const events = await setup(page)
  await open(page)
  const initial = await scene(page)
  expect(initial.meshes.find(m => m.name === 'Body_Main')).toBeTruthy()
  await page.getByRole('button', { name: '3D Modeling Studio', exact: true }).click()
  await expect.poll(async () => (await scene(page)).meshes.some(m => m.name === 'Studio_Cube')).toBe(true)
  const modeling = await scene(page)
  expect(modeling.meshes.some(m => m.name === 'Studio_Cube')).toBe(true)
  await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  await expect.poll(async () => (await scene(page)).meshes.some(m => m.name === 'Body_Main')).toBe(true)
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const ctx = c.getContext('2d'); ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 64, 128); ctx.fillStyle = 'blue'; ctx.fillRect(64, 0, 64, 128)
    return c.toDataURL()
  })
  await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'isolation-logo.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
  await ready(page)
  await zone(page, 'Back Center')
  await page.getByPlaceholder('Text to add...').fill('BLACKBULLET TEST')
  await page.getByPlaceholder('Text to add...').press('Enter')
  await page.locator('input[type=number]').nth(0).fill('212')
  await page.locator('input[type=number]').nth(0).press('Tab')
  await page.locator('input[type=number]').nth(2).fill('600')
  await page.locator('input[type=number]').nth(2).press('Tab')
  await zone(page, 'Left Sleeve')
  await page.getByTitle('Star', { exact: true }).click()
  await ready(page, 'Sleeve_Left')
  const saved = await save(page), actual = await scene(page)
  const views = []
  for (const preset of ['front', 'back', 'left', 'right', 'top', 'perspective', 'Fit Product', 'Reset Camera']) {
    await page.getByRole('button', { name: preset, exact: true }).click()
    await page.waitForTimeout(500)
    views.push({ preset, camera: (await scene(page)).camera })
    await page.screenshot({ path: `${directory}/screenshots/acceptance-${preset.replaceAll(' ', '-')}.png` })
  }
  expect(views[0].camera[2]).toBeGreaterThan(0)
  expect(views[1].camera[2]).toBeLessThan(0)
  expect(views[2].camera[0]).toBeLessThan(0)
  expect(views[3].camera[0]).toBeGreaterThan(0)
  await exportProduct(page, 'acceptance-isolated')
  const binary = await inspectSurfaces(`${directory}/exports/acceptance-isolated.glb`)
  await record('acceptance-isolated', { initial, modeling, actual, saved, views, binary, events })
  const front = binary.surfaces.find(m => m.partId === 'shirt_front').primitives[0]
  const back = binary.surfaces.find(m => m.partId === 'shirt_back').primitives[0]
  const left = binary.surfaces.find(m => m.partId === 'shoulder_left').primitives[0]
  const right = binary.surfaces.find(m => m.partId === 'shoulder_right').primitives[0]
  expect(binary.validHeader).toBe(true)
  expect(front.image.counts.red).toBeGreaterThan(1000); expect(front.image.counts.blue).toBeGreaterThan(1000)
  expect(front.image.counts.green).toBe(0); expect(back.image.counts.red).toBe(0); expect(back.image.counts.blue).toBe(0)
  expect(back.image.counts.white).toBeGreaterThan(100)
  expect(left.image.counts.green).toBeGreaterThan(1000); expect(left.image.counts.red).toBe(0); expect(left.image.counts.blue).toBe(0)
  expect(right.image).toBeNull()
  for (const target of [front, back, left]) expect(target.material.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]).toEqual([1, 1, 1, 1])
  expect(saved.customization.zones.sleeve_right.layers).toHaveLength(0)
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  await page.locator('input[type=file][accept*=".glb"]').setInputFiles(`${directory}/exports/acceptance-isolated.glb`)
  await page.getByText(/Successfully imported/).waitFor()
  const reimported = await scene(page)
  await record('acceptance-reimport', reimported)
  expect(reimported.meshes.find(m => m.name === 'Sleeve_Right').materials[0].texture).toBeUndefined()
  expect(reimported.meshes.find(m => m.name === 'Body_Main').materials[0].texture.width).toBe(1024)
})

test('Phase 3.5 undo/redo updates actual texture and exported pixels', async ({ page }) => {
  const events = await setup(page)
  await open(page)
  await page.getByTitle('Rectangle', { exact: true }).click()
  await ready(page)
  const added = await scene(page)
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  await page.keyboard.press('Control+z')
  await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture).toBeUndefined()
  await exportProduct(page, 'undo-empty')
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  await page.keyboard.press('Control+y')
  await ready(page)
  const redone = await scene(page)
  expect(redone.meshes[0].materials[0].texture.hash).toBe(added.meshes[0].materials[0].texture.hash)
  await exportProduct(page, 'redo-artwork')
  const undoneGLB = await inspectSurfaces(`${directory}/exports/undo-empty.glb`)
  const redoneGLB = await inspectSurfaces(`${directory}/exports/redo-artwork.glb`)
  await record('undo-redo-pixels', { added, redone, undoneGLB, redoneGLB, events })
  expect(undoneGLB.images).toHaveLength(0)
  expect(redoneGLB.images[0].counts.green).toBeGreaterThan(1000)
})

test('Phase 3.5 imported source plus editable artwork survives browser process restart', async () => {
  test.setTimeout(240000)
  const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-5-'))
  const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  let context = await chromium.launchPersistentContext(profile, options)
  try {
    let page = context.pages()[0]; page.setDefaultTimeout(15000)
    await setup(page); await open(page)
    await page.getByRole('button', { name: 'Library', exact: true }).click()
    await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
    await page.getByText(/Successfully imported/).waitFor()
    await page.getByRole('button', { name: 'Artwork', exact: true }).click()
    await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'durable.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>') })
    await page.getByPlaceholder('Text to add...').fill('PERSISTENT ARTWORK')
    await page.getByPlaceholder('Text to add...').press('Enter')
    const name = (await scene(page)).meshes[0].name
    await ready(page, name)
    const before = await save(page), appearanceBefore = await scene(page)
    await record('persistence-original', { before, appearanceBefore, profile })
    await context.close()
    context = await chromium.launchPersistentContext(profile, options)
    page = context.pages()[0]; page.setDefaultTimeout(15000)
    await setup(page); await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await page.getByRole('button', { name: /^solid$/i }).waitFor()
    await page.getByRole('button', { name: 'File', exact: true }).click()
    await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
    await page.getByText('Saved project opened', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Customizer', exact: true }).click()
    await ready(page, name)
    const after = await save(page), appearanceAfter = await scene(page)
    await record('persistence-stabilized', { before, after, appearanceBefore, appearanceAfter, profile })
    expect(after.customization.zones).toEqual(before.customization.zones)
    expect(after.customization.partMaterials).toEqual(before.customization.partMaterials)
    expect(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
    await exportProduct(page, 'durable-reopened')
  } finally { await context.close() }
})
