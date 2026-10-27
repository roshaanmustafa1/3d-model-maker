import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

async function images(path) {
  const bytes = await readFile(path)
  const jsonLength = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength))
  const binary = bytes.subarray(28 + jsonLength)
  return Promise.all(json.images.map(async (image) => {
    const view = json.bufferViews[image.bufferView]
    const encoded = binary.subarray(view.byteOffset, view.byteOffset + view.byteLength)
    const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    return { width: decoded.info.width, height: decoded.info.height, pixelSHA256: createHash('sha256').update(decoded.data).digest('hex') }
  }))
}
const before = await images('qa-reports/exported-models/pbr-textures.glb')
const after = await images('qa-reports/exported-models/pbr-textures-roundtrip.glb')
const verified = before.length === after.length && before.every((a) => after.some((b) => a.width === b.width && a.height === b.height && a.pixelSHA256 === b.pixelSHA256))
await writeFile('qa-reports/test-results/texture-pixel-comparison.json', JSON.stringify({ verified, before, after }, null, 2))
console.log(`Decoded embedded texture pixels preserved: ${verified}; ${before.length} input images, ${after.length} output images`)
process.exitCode = verified ? 0 : 1
