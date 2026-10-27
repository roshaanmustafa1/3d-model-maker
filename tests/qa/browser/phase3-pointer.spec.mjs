import { test, expect } from '@playwright/test'
import { directory, setup, open, product, save, scene, record } from '../../../scripts/qa/phase3-support.mjs'

test('Phase 3 pointer movement updates layer coordinates and actual texture pixels', async ({ page }) => {
  test.setTimeout(120000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await open(page)
  await product(page, 'Streetwear Oversized Tee')
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  await page.getByTitle('Rectangle', { exact: true }).click()
  await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
  const before = await save(page), textureBefore = await scene(page)
  const canvas = page.locator('.konvajs-content').first(), bounds = await canvas.boundingBox()
  await page.mouse.move(bounds.x + 230, bounds.y + 230)
  const started = Date.now()
  const telemetry = await page.evaluate(() => {
    const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
    const renderer = mesh.__r3f.root.getState().gl
    const gl = renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info')
    return { frame: renderer.info.render.frame, time: performance.now(), gpu: extension && gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) }
  })
  await page.mouse.down()
  await page.mouse.move(bounds.x + 270, bounds.y + 250, { steps: 20 })
  await page.mouse.up()
  const after = await save(page)
  let textureUpdateError
  try {
    await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.hash, { timeout: 20000 }).not.toBe(textureBefore.meshes[0].materials[0].texture?.hash)
  } catch (error) { textureUpdateError = error.message }
  const textureAfter = await scene(page)
  const rendering = await page.evaluate(() => {
    const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
    return { frame: mesh.__r3f.root.getState().gl.info.render.frame, time: performance.now() }
  })
  await page.mouse.click(bounds.x + 20, bounds.y + 20)
  const deselected = await page.getByText('No Layer Selected', { exact: true }).isVisible()
  await record('pointer-drag', { before, after, textureBefore, textureAfter, textureUpdateError, durationMs: Date.now() - started, telemetry, rendering, rendererFps: (rendering.frame - telemetry.frame) * 1000 / (rendering.time - telemetry.time), deselected, events })
  await page.screenshot({ path: `${directory}/screenshots/pointer-drag.png` })
  expect.soft(after.customization.zones.body_front.layers[0].x).not.toBe(before.customization.zones.body_front.layers[0].x)
  expect.soft(textureAfter.meshes[0].materials[0].texture?.hash).not.toBe(textureBefore.meshes[0].materials[0].texture?.hash)
  expect.soft(deselected).toBe(true)
})

test('Phase 3 star has matching 2D canvas and actual 3D texture coordinates', async ({ page }) => {
  test.setTimeout(90000); page.setDefaultTimeout(15000)
  const events = await setup(page)
  await open(page)
  await product(page, 'Streetwear Oversized Tee')
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
  await page.getByTitle('Star', { exact: true }).click()
  await expect.poll(async () => (await scene(page)).meshes.find(m => m.name === 'Body_Main')?.materials[0].texture?.width, { timeout: 30000 }).toBe(1024)
  await page.locator('.konvajs-content').first().click({ position: { x: 10, y: 10 } })
  await page.getByText('No Layer Selected', { exact: true }).waitFor()
  await page.waitForTimeout(400)
  const project = await save(page)
  const bounds = await page.evaluate(zoneBounds => {
    function greenBounds(canvas, scale) {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4
        if (data[i] === 16 && data[i + 1] === 185 && data[i + 2] === 129) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y) }
      }
      return { minX: minX * scale, minY: minY * scale, maxX: maxX * scale, maxY: maxY * scale }
    }
    const editorCanvas = document.querySelector('.konvajs-content canvas')
    const mesh = window.__qaSceneObjects().find(o => o.isMesh && o.name === 'Body_Main')
    const image = mesh.material.map.image
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
    canvas.getContext('2d').drawImage(image, 0, 0)
    const texture = greenBounds(canvas, 1024 / canvas.width)
    for (const key of ['minX', 'maxX']) texture[key] = (texture[key] - zoneBounds.minU * 1024) / (zoneBounds.maxU - zoneBounds.minU)
    for (const key of ['minY', 'maxY']) texture[key] = (texture[key] - (1 - zoneBounds.maxV) * 1024) / (zoneBounds.maxV - zoneBounds.minV)
    return { editor: greenBounds(editorCanvas, 1024 / editorCanvas.width), texture }
  }, project.customization.zones.body_front.uvBounds)
  await record('star-coordinate-comparison', { bounds, events })
  await page.screenshot({ path: `${directory}/screenshots/star-coordinate-comparison.png` })
  expect.soft(Math.abs(bounds.editor.minX - bounds.texture.minX)).toBeLessThan(5)
  expect.soft(Math.abs(bounds.editor.minY - bounds.texture.minY)).toBeLessThan(5)
})
