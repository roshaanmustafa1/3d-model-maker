import { test, expect, chromium } from '@playwright/test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { directory, setup, open, product, save, scene, record, exportProduct } from '../../../scripts/qa/phase3-support.mjs'

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(12000) })
test.setTimeout(180000)

test('Phase 3 uploaded PNG JPEG WebP SVG, keyboard protection and malformed input errors', async ({ page }) => {
  const events = await setup(page)
  await open(page)
  await product(page, 'Streetwear Oversized Tee')
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  const uploader = page.locator('input[type=file][accept*="image"]')
  for (const mime of ['image/png', 'image/jpeg', 'image/webp']) {
    const encoded = await page.evaluate(mime => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 32
      const ctx = c.getContext('2d'); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 32, 32); ctx.fillStyle = '#00ff00'; ctx.fillRect(32, 0, 32, 32)
      return c.toDataURL(mime)
    }, mime)
    await uploader.setInputFiles({ name: `qa.${mime.split('/')[1]}`, mimeType: mime, buffer: Buffer.from(encoded.split(',')[1], 'base64') })
    await page.waitForTimeout(500)
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>window.__svgExecuted=true</script><rect width="64" height="64" fill="blue" onload="window.__svgExecuted=true"/><foreignObject><div>unsafe</div></foreignObject></svg>'
  await uploader.setInputFiles({ name: 'sanitized.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
  await page.getByPlaceholder('Text to add...').fill('KEYBOARD TEST')
  await page.getByPlaceholder('Text to add...').press('Enter')
  const before = await save(page)
  await page.getByPlaceholder('Text to add...').focus()
  await page.keyboard.press('Delete')
  await page.keyboard.press('Control+d')
  const protectedInput = await save(page)
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  await page.keyboard.press('Control+d')
  const duplicated = await save(page)
  await uploader.setInputFiles({ name: 'malformed.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') })
  await page.waitForTimeout(1000)
  const malformedBody = await page.locator('body').innerText()
  await uploader.setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg><path invalid') })
  await page.waitForTimeout(1000)
  const after = await save(page)
  await record('uploads-security', { before, protectedInput, duplicated, after, malformedBody, svgExecuted: await page.evaluate(() => !!window.__svgExecuted), events })
  await page.screenshot({ path: `${directory}/screenshots/uploads-security.png` })
  expect.soft(before.customization.zones.body_front.layers).toHaveLength(5)
  expect.soft(protectedInput.customization.zones.body_front.layers).toHaveLength(5)
  expect.soft(duplicated.customization.zones.body_front.layers).toHaveLength(6)
  const sanitized = decodeURIComponent(before.customization.zones.body_front.layers.find(l => l.isSvg).src.split(',').slice(1).join(','))
  expect.soft(sanitized).not.toMatch(/<script|onload=|foreignObject/)
  expect.soft(malformedBody, 'malformed PNG must report a user-facing error').toMatch(/invalid image|failed to (load|read|upload)|upload failed/i)
  expect.soft(after.customization.zones.body_front.layers, 'invalid SVG must not create a broken layer').toHaveLength(6)
})

test('Phase 3 editable project survives a new browser process with durable image assets', async () => {
  test.setTimeout(240000)
  const profile = await mkdtemp(join(tmpdir(), 'model-maker-phase3-'))
  const options = { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'], viewport: { width: 1440, height: 1000 } }
  let context = await chromium.launchPersistentContext(profile, options)
  let events
  try {
    let page = context.pages()[0]
    page.setDefaultTimeout(15000)
    events = await setup(page)
    await open(page)
    await page.getByRole('button', { name: 'Library', exact: true }).click()
    await page.locator('input[type=file][accept*=".glb"]').setInputFiles('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
    await page.getByText(/Successfully imported/).waitFor()
    await expect.poll(async () => (await scene(page)).meshes[0]?.materials[0].texture?.width).toBe(8)
    const sourceCorner = await page.evaluate(() => {
      const mesh = window.__qaSceneObjects().find(object => object.isMesh && object.name === 'shirt_front')
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024
      const context = canvas.getContext('2d'); context.drawImage(mesh.material.map.image, 0, 0, 1024, 1024)
      return Array.from(context.getImageData(4, 4, 1, 1).data)
    })
    const linear = value => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }
    const encoded = value => Math.round(255 * (value <= .0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - .055))
    const expectedCorner = sourceCorner.slice(0, 3).map((value, index) => encoded(linear(value) * linear([34, 68, 102][index]))).concat(sourceCorner[3])
    await page.getByRole('button', { name: 'Artwork', exact: true }).click()
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>'
    await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) })
    const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 32; c.getContext('2d').fillRect(0, 0, 32, 32); return c.toDataURL() })
    await page.locator('input[type=file][accept*="image"]').setInputFiles({ name: 'persistent.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') })
    await page.getByPlaceholder('Text to add...').fill('PERSISTENT TEXT')
    await page.getByPlaceholder('Text to add...').press('Enter')
    await page.getByRole('button', { name: 'Zones', exact: true }).click()
    await page.getByRole('button', { name: 'Add Zone', exact: true }).click()
    await page.getByPlaceholder('Zone Name (e.g. Chest Print)...').fill('QA Durable Zone')
    await page.getByRole('button', { name: 'Save Zone', exact: true }).click()
    await page.getByRole('button', { name: 'Material & Finish', exact: true }).click()
    await page.locator('input[type=color]').first().fill('#224466')
    await expect.poll(async () => (await scene(page)).meshes[0]?.materials[0].texture?.corner, { timeout: 30000 }).toEqual(expectedCorner)
    const before = await save(page)
    await page.waitForTimeout(1200)
    const appearanceBefore = await scene(page)
    await page.screenshot({ path: `${directory}/screenshots/persistence-before.png` })
    await record('persistence-before', { before, appearanceBefore, profile, sourceCorner, expectedCorner, events })
    await context.close()
    context = await chromium.launchPersistentContext(profile, options)
    page = context.pages()[0]; page.setDefaultTimeout(15000)
    const reopenedEvents = await setup(page)
    await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await page.getByRole('button', { name: /^solid$/i }).waitFor()
    await page.getByRole('button', { name: 'File', exact: true }).click()
    await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
    await page.getByText('Saved project opened', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Customizer', exact: true }).click()
    await page.waitForTimeout(1500)
    const appearanceAfter = await scene(page)
    const after = await save(page)
    await record('persistence-comparison', { before, after, appearanceBefore, appearanceAfter, profile, events, reopenedEvents })
    await page.screenshot({ path: `${directory}/screenshots/persistence-after.png` })
    await exportProduct(page, 'durable-reopened')
    expect.soft(after.customization.zones).toEqual(before.customization.zones)
    expect.soft(appearanceAfter.meshes).toEqual(appearanceBefore.meshes)
    expect.soft(after.customization.fabricColor).toBe('#224466')
  } finally { await context.close() }
})
