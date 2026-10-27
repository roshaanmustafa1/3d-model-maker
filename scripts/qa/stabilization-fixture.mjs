import { readFile, writeFile, mkdir } from 'node:fs/promises'
const root = 'qa-reports/phase2_5/fixtures'
await mkdir(root, { recursive: true })
const bytes = await readFile('qa-reports/exported-models/black-raglan_shirt.glb')
const size = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + size))
let binary = bytes.subarray(28 + size)
json.images = []; json.textures = []
for (const [index, file] of ['qa-albedo.png', 'qa-normal.png'].entries()) {
  const png = await readFile('qa-reports/exported-models/' + file)
  json.bufferViews.push({ buffer: 0, byteOffset: binary.length, byteLength: png.length })
  json.images.push({ bufferView: json.bufferViews.length - 1, mimeType: 'image/png' })
  json.textures.push({ source: index })
  binary = Buffer.concat([binary, png, Buffer.alloc((4 - png.length % 4) % 4)])
}
json.buffers[0].byteLength = binary.length
for (const material of json.materials) {
  material.pbrMetallicRoughness.baseColorTexture = { index: 0 }
  material.normalTexture = { index: 1 }
}
const encoded = Buffer.from(JSON.stringify(json)), padded = Buffer.concat([encoded, Buffer.alloc((4 - encoded.length % 4) % 4, 32)])
const header = Buffer.alloc(20), chunk = Buffer.alloc(8)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + padded.length + binary.length, 8)
header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16)
chunk.writeUInt32LE(binary.length, 0); chunk.writeUInt32LE(0x004e4942, 4)
await writeFile(root + '/multipart-textured-input.glb', Buffer.concat([header, padded, chunk, binary]))
console.log('Prepared multi-part PBR input; the browser test must reexport it through Model Maker.')
