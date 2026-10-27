import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { observeReactScenes } from './observer.mjs'

test.beforeEach(async ({ page }) => {
  await mkdir('qa-reports/completion/screenshots', { recursive: true })
  await page.addInitScript(observeReactScenes)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Import', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.some(mesh => mesh.name === 'Studio_Cube'))).toBe(true)
})

test('Completion: local generated GLB inspection and Studio handoff require no generation provider', async ({ page }) => {
  await page.getByRole('button', { name: /AI Generator|AI Image/i }).click()
  await expect(page.getByText('Local AI GLB handoff', { exact: true })).toBeVisible()
  await page.getByLabel('Generated GLB file').setInputFiles('docs/fixtures/black-shirt.glb')
  await expect(page.getByRole('button', { name: 'Open in Modeling Studio', exact: true })).toBeEnabled()
  await page.screenshot({ path: 'qa-reports/completion/screenshots/local-handoff.png' })
  await page.getByRole('button', { name: 'Open in Modeling Studio', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.length)).toBeGreaterThan(0)
  await expect(page.getByText('AI Image-to-3D Studio & Asset Pipeline')).toHaveCount(0)
})

test('Completion: material split, undo/redo, UV packing and durable save use actual controls', async ({ page }) => {
  await page.getByRole('button', { name: 'Mat', exact: true }).click()
  await page.getByRole('button', { name: 'Add Slot', exact: true }).click()
  await page.keyboard.press('Tab'); await page.keyboard.press('3')
  const target = await page.evaluate(() => {
    const mesh = window.__qaSceneObjects().find(object => object.name === 'Studio_Cube' && object.isMesh)
    const { camera, gl } = mesh.__r3f.root.getState(), geometry = mesh.geometry
    const positions = geometry.attributes.position, indices = geometry.index
    const corners = [0, 1, 2].map(offset => {
      const id = indices ? indices.getX(offset) : offset
      return mesh.position.clone().fromBufferAttribute(positions, id).applyMatrix4(mesh.matrixWorld)
    })
    const center = corners[0].add(corners[1]).add(corners[2]).multiplyScalar(1 / 3).project(camera)
    const rect = gl.domElement.getBoundingClientRect()
    return { x: rect.x + (center.x + 1) * rect.width / 2, y: rect.y + (1 - center.y) * rect.height / 2 }
  })
  await page.mouse.click(target.x, target.y)
  await expect(page.getByRole('button', { name: /Assign to Selected Faces/ })).toBeEnabled()
  await page.getByRole('button', { name: /Assign to Selected Faces/ }).click()
  await page.getByRole('button', { name: 'Geom', exact: true }).click()
  const before = await page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('Studio_Cube')).reduce((sum, mesh) => sum + mesh.triangles, 0))
  await page.getByRole('button', { name: 'Split by material', exact: true }).click()
  await expect(page.getByText('Studio_Cube_Part1', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Studio_Cube_Part2', { exact: true }).first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__qaSnapshot().meshes.filter(mesh => mesh.name.startsWith('Studio_Cube')).reduce((sum, mesh) => sum + mesh.triangles, 0))).toBe(before)
  await page.getByTitle('Undo (Ctrl+Z)', { exact: true }).click()
  await expect(page.getByText('Studio_Cube', { exact: true }).first()).toBeVisible()
  await page.getByTitle('Redo (Ctrl+Y)', { exact: true }).click()
  await page.getByRole('button', { name: 'UV', exact: true }).click()
  await page.getByRole('button', { name: 'Pack UV islands', exact: true }).click()
  await page.screenshot({ path: 'qa-reports/completion/screenshots/split-uv-preparation.png' })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Project saved to IndexedDB', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'File', exact: true }).click()
  await page.getByRole('menuitem', { name: /^Open:/ }).first().click()
  await expect(page.getByText('Studio_Cube_Part1', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Studio_Cube_Part2', { exact: true }).first()).toBeVisible()
})
