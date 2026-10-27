import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
const source = await readFile('qa-reports/exported-models/performance-small.glb')
const jsonSize = source.readUInt32LE(12)
const json = JSON.parse(source.subarray(20, 20 + jsonSize))
let binary = source.subarray(28 + jsonSize)
json.images = []; json.textures = []
for (const [index, colour] of ['#09090b', '#8080ff', '#ffffff'].entries()) {
  const png = await sharp({ create: { width: 8, height: 8, channels: 4, background: colour } }).png().toBuffer()
  const padding = Buffer.alloc((4 - png.length % 4) % 4)
  json.bufferViews.push({ buffer: 0, byteOffset: binary.length, byteLength: png.length })
  json.images.push({ bufferView: json.bufferViews.length - 1, mimeType: 'image/png', name: `qa-map-${index}` })
  json.textures.push({ source: index })
  binary = Buffer.concat([binary, png, padding])
}
json.buffers[0].byteLength = binary.length
json.materials[0].pbrMetallicRoughness.baseColorTexture = { index: 0 }
json.materials[0].pbrMetallicRoughness.metallicRoughnessTexture = { index: 2 }
json.materials[0].normalTexture = { index: 1 }
const jsonBytes = Buffer.from(JSON.stringify(json))
const paddedJSON = Buffer.concat([jsonBytes, Buffer.alloc((4 - jsonBytes.length % 4) % 4, 32)])
const header = Buffer.alloc(20)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4)
header.writeUInt32LE(28 + paddedJSON.length + binary.length, 8)
header.writeUInt32LE(paddedJSON.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
const binaryHeader = Buffer.alloc(8)
binaryHeader.writeUInt32LE(binary.length, 0); binaryHeader.writeUInt32LE(0x004e4942, 4)
await writeFile('qa-reports/exported-models/pbr-textures.glb', Buffer.concat([header, paddedJSON, binaryHeader, binary]))
console.log('Generated GLB fixture with actual embedded base-color, normal and packed roughness/metalness PNGs.')
