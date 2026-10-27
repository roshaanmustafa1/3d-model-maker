import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { expect } from '@playwright/test'
import { observeReactScenes } from '../../tests/qa/browser/observer.mjs'
export const directory = process.env.QA_PHASE3_DIR || 'qa-reports/phase3'
export async function record(name, data) {
  await mkdir(directory + '/raw', { recursive: true })
  await writeFile(`${directory}/raw/${name}.json`, JSON.stringify(data, null, 2))
}
export async function setup(page) {
  await mkdir(directory + '/screenshots', { recursive: true })
  await mkdir(directory + '/exports', { recursive: true })
  const events = { errors: [], console: [], failedRequests: [], navigations: [], crashes: 0 }
  page.__qaEvents = events
  page.on('crash', () => events.crashes++)
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) events.navigations.push(frame.url()) })
  page.on('pageerror', error => events.errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type()) && events.console.length < 100) events.console.push(message.text())
  })
  page.on('requestfailed', request => events.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }))
  await page.addInitScript(observeReactScenes)
  return events
}
export async function open(page) {
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000')
  await page.getByRole('button', { name: /^solid$/i }).waitFor()
  await page.getByRole('button', { name: 'Customizer', exact: true }).click()
  await page.getByRole('button', { name: 'Library', exact: true }).waitFor()
  await expect.poll(() => page.evaluate(() => window.__qaSceneObjects?.().some(object => object.isMesh && object.name === 'Body_Main') || false), { timeout: 30000 }).toBe(true)
}
export async function product(page, name) {
  await page.getByRole('button', { name: 'Library', exact: true }).click()
  await page.getByRole('heading', { name, exact: true }).click()
  await page.waitForTimeout(1200)
}
export async function zone(page, name) {
  await page.getByRole('button', { name: 'Zones', exact: true }).click()
  await page.getByText(name, { exact: true }).first().click()
  await page.getByRole('button', { name: 'Artwork', exact: true }).click()
}
export async function save(page) {
  await page.getByRole('button', { name: 'Save Project', exact: true }).click()
  await page.getByText('Project saved to IndexedDB persistent storage!', { exact: true }).last().waitFor()
  await expect(page.getByRole('button', { name: 'Save Project', exact: true })).toBeEnabled()
  const saved = await page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('3d-model-maker-assets', 1)
    request.onsuccess = () => {
      const db = request.result, transaction = db.transaction('projects', 'readonly')
      const read = transaction.objectStore('projects').getAll()
      read.onsuccess = () => { resolve(read.result.at(-1)); db.close() }
      read.onerror = reject
    }
    request.onerror = reject
  }))
  await record(`snapshot-${Date.now()}`, saved)
  return saved
}
export async function scene(page) {
  return page.evaluate(() => {
    const meshes = window.__qaSceneObjects().filter(object => object.isMesh && object.name && object.geometry?.attributes.uv)
    const sample = meshes.find(object => object.__r3f?.root)
    const root = sample?.__r3f.root.getState()
    function hash(values) {
      let h = 2166136261
      for (const v of values) h = Math.imul(h ^ Math.round(v * 1000000), 16777619)
      return h >>> 0
    }
    return {
      camera: root?.camera.position.toArray(), memory: root && { ...root.gl.info.memory }, heap: performance.memory?.usedJSHeapSize,
      meshes: meshes.map(mesh => ({
        name: mesh.name, vertices: mesh.geometry.attributes.position.count,
        triangles: (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3,
        attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([k, v]) => [k, { count: v.count, hash: hash(v.array) }])),
        groups: mesh.geometry.groups, matrix: mesh.matrixWorld.toArray(),
        materials: (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => {
          const image = material.map?.image
          let texture
          if (image?.width) {
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
            const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
            texture = { width: image.width, height: image.height, hash: hash(pixels), colorSpace: material.map.colorSpace, flipY: material.map.flipY,
              center: Array.from(ctx.getImageData(Math.floor(image.width / 2), Math.floor(image.height / 2), 1, 1).data),
              corner: Array.from(ctx.getImageData(4, 4, 1, 1).data) }
          }
          return { color: material.color?.getHexString(), linear: material.color?.toArray(), roughness: material.roughness, metalness: material.metalness, type: material.type, normalMap: !!material.normalMap, texture }
        })
      }))
    }
  })
}
export async function exportProduct(page, name, resolution = 1024) {
  await page.getByRole('button', { name: 'Export GLB', exact: true }).last().click()
  await page.getByRole('button', { name: new RegExp(`^${resolution}`) }).click()
  const downloads = []
  const handler = d => downloads.push(d)
  page.on('download', handler)
  const started = Date.now()
  await page.getByRole('button', { name: 'Export GLB Asset', exact: true }).click()
  try {
    await page.getByText('GLB Verification Passed', { exact: true }).waitFor({ timeout: 60000 })
  } catch (error) {
    await record(`${name}-export-failure`, { url: page.url(), events: page.__qaEvents, body: await page.locator('body').innerText().catch(() => '') })
    throw error
  }
  await page.waitForTimeout(700)
  for (const download of downloads) {
    const extension = download.suggestedFilename().endsWith('.json') ? '.json' : '.glb'
    await download.saveAs(`${directory}/exports/${name}${extension}`)
  }
  page.off('download', handler)
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  return { durationMs: Date.now() - started, downloads: downloads.map(d => d.suggestedFilename()) }
}
export async function inspectGLB(name) {
  const bytes = await readFile(`${directory}/exports/${name}.glb`)
  const jsonSize = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20, 20 + jsonSize))
  const binary = bytes.subarray(28 + jsonSize)
  const images = []
  for (const [i, image] of (json.images || []).entries()) {
    const view = json.bufferViews[image.bufferView]
    const png = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
    await writeFile(`${directory}/exports/${name}-texture-${i}.png`, png)
    images.push({ mimeType: image.mimeType, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), sha256: createHash('sha256').update(png).digest('hex') })
  }
  const result = { magic: bytes.readUInt32LE(0), version: bytes.readUInt32LE(4), length: bytes.length, declaredLength: bytes.readUInt32LE(8), nodes: json.nodes, meshes: json.meshes, materials: json.materials, accessors: json.accessors, images }
  await record(name + '-glb', result)
  return result
}
