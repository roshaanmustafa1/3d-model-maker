import { test, expect } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  const logs = { console: [], pageErrors: [], failedRequests: [] }
  page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) logs.console.push({ type: message.type(), text: message.text() }) })
  page.on('pageerror', (error) => logs.pageErrors.push(error.message))
  page.on('requestfailed', (request) => logs.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  page.__qaLogs = logs
  await page.goto('/')
  await expect(page.locator('canvas').first()).toBeVisible()
  await expect(page.getByRole('button', { name: /^solid$/i })).toBeVisible()
})

test.afterEach(async ({ page }, testInfo) => {
  await writeFile(testInfo.outputPath('browser-events.json'), JSON.stringify(page.__qaLogs, null, 2))
})

async function screenshot(page, name) {
  await page.screenshot({ path: `qa-reports/screenshots/${name}.png`, fullPage: true })
}

test('initial editor renders with usable side panels and WebGL', async ({ page, browser }) => {
  const panels = page.locator('[data-slot="resizable-panel"]')
  expect(await panels.nth(0).evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(180)
  expect(await panels.nth(2).evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(220)
  const environment = await page.locator('canvas').first().evaluate((canvas) => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return { webgl: false, userAgent: navigator.userAgent }
    const extension = gl.getExtension('WEBGL_debug_renderer_info')
    return { webgl: true, vendor: extension && gl.getParameter(extension.UNMASKED_VENDOR_WEBGL), renderer: extension && gl.getParameter(extension.UNMASKED_RENDERER_WEBGL), userAgent: navigator.userAgent }
  })
  await writeFile('qa-reports/test-results/browser-environment.json', JSON.stringify({ ...environment, browserVersion: browser.version() }, null, 2))
  expect(environment.webgl).toBe(true)
  await screenshot(page, 'editor-initial')
  expect(page.__qaLogs.pageErrors).toEqual([])
})

test('empty viewport click deselects object and clears inspector', async ({ page }) => {
  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  await page.mouse.click(box.x + box.width - 25, box.y + box.height - 25)
  await expect(page.getByText('No Object Selected', { exact: true })).toBeVisible()
  await screenshot(page, 'deselected')
  await page.getByText('Studio_Cube', { exact: true }).first().click()
  await expect(page.getByRole('textbox', { name: '' }).filter({ visible: true }).last()).toHaveValue('Studio_Cube')
  await screenshot(page, 'selected')
})

test('Escape deselects and Scene Explorer empty space deselects', async ({ page }) => {
  await page.locator('canvas').first().click({ position: { x: 20, y: 100 } })
  await page.getByText('Studio_Cube', { exact: true }).first().click()
  await page.keyboard.press('Escape')
  await expect(page.getByText('No Object Selected', { exact: true })).toBeVisible()
  await page.getByText('Studio_Cube', { exact: true }).first().click()
  const panel = await page.locator('[data-slot="resizable-panel"]').first().boundingBox()
  await page.mouse.click(panel.x + 50, panel.y + panel.height - 50)
  await expect(page.getByText('No Object Selected', { exact: true })).toBeVisible()
})

test('camera orbit, pan and zoom retain object selection', async ({ page }) => {
  const box = await page.locator('canvas').first().boundingBox()
  for (const button of ['left', 'right']) {
    await page.mouse.move(box.x + box.width - 80, box.y + box.height - 80)
    await page.mouse.down({ button })
    await page.mouse.move(box.x + box.width - 180, box.y + box.height - 160, { steps: 12 })
    await page.mouse.up({ button })
    await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
  }
  await page.mouse.wheel(0, 150)
  await expect(page.getByText('No Object Selected', { exact: true })).toHaveCount(0)
})

test('all four shading modes are interactive and render without page errors', async ({ page }) => {
  for (const [label, name] of [['Wireframe', 'wireframe'], ['Normal Shading', 'normals'], ['Material Preview', 'material-preview'], ['Solid Material', 'solid']]) {
    const trigger = page.getByRole('button', { name: /^(Solid|Wireframe|Normal|Material|Material Preview)$/i })
    await trigger.click()
    await page.getByRole('menuitem', { name: label, exact: true }).click()
    await screenshot(page, name)
  }
  expect(page.__qaLogs.pageErrors).toEqual([])
})

test('Edit Mode selection and Escape behavior', async ({ page }) => {
  await page.locator('canvas').first().click({ position: { x: 20, y: 100 } })
  await page.getByText('Studio_Cube', { exact: true }).first().click()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /Edit Mode/ })).toBeVisible()
  await page.keyboard.press('a')
  await screenshot(page, 'edit-mode')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /Edit Mode/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /Object Mode/ })).toBeVisible()
  expect(page.__qaLogs.pageErrors).toEqual([])
})

test('GLB browser import, export and reimport', async ({ page }) => {
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('docs/fixtures/black-shirt.glb')
  await expect(page.getByText('Body_Main', { exact: true })).toBeVisible()
  await screenshot(page, 'imported-black-shirt')
  await page.getByRole('button', { name: 'Export GLB', exact: true }).click()
  await screenshot(page, 'export-dialog')
  await page.getByRole('button', { name: 'Generate & Verify GLB', exact: true }).click()
  await expect(page.getByText(/Round-Trip Verification: PASSED/i)).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /^Download/ }).click()
  const download = await downloadPromise
  await download.saveAs('qa-reports/exported-models/browser-black-shirt.glb')
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('qa-reports/exported-models/browser-black-shirt.glb')
  await expect(page.getByText('Body_Main', { exact: true })).toBeVisible()
  expect(page.__qaLogs.pageErrors).toEqual([])
})

test('front, right and top camera presets work on an imported garment', async ({ page }) => {
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.locator('input[type="file"][accept=".glb,.gltf,.obj,.stl"]').setInputFiles('docs/fixtures/black-shirt.glb')
  await expect(page.getByText('Body_Main', { exact: true })).toBeVisible()
  for (const label of ['Front', 'Right', 'Top']) {
    await page.locator('button').filter({ has: page.locator('svg.lucide-compass') }).click()
    await page.getByRole('menuitem', { name: new RegExp(`^${label} `) }).click()
    await screenshot(page, `shirt-${label.toLowerCase()}`)
  }
})

test('back, left and bottom camera presets are exposed in the viewport UI', async ({ page }) => {
  await page.locator('button').filter({ has: page.locator('svg.lucide-compass') }).click()
  for (const label of ['Back', 'Left', 'Bottom']) await expect(page.getByRole('menuitem', { name: new RegExp(`^${label}`) })).toBeVisible()
})

test('UV Lab displays layout and exports a real PNG', async ({ page }) => {
  await page.getByRole('button', { name: 'UV Lab', exact: true }).click()
  await expect(page.getByRole('button', { name: /Box Projection/ })).toBeVisible()
  await page.getByRole('button', { name: /Box Projection/ }).click()
  await screenshot(page, 'uv-lab')
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export UV PNG', exact: true }).click()
  await (await pending).saveAs('qa-reports/exported-models/uv-layout.png')
  expect(page.__qaLogs.pageErrors).toEqual([])
})

test('BlackBullet validation report is accessible', async ({ page }) => {
  await page.getByRole('button', { name: 'Validator', exact: true }).click()
  await expect(page.getByText(/BlackBullet/i).first()).toBeVisible()
  await screenshot(page, 'blackbullet-validation')
  expect(page.__qaLogs.pageErrors).toEqual([])
})
