import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { record, directory } from './phase3-support.mjs'

async function inspect(path) {
  const bytes = await readFile(path), length = bytes.readUInt32LE(12)
  const gltf = JSON.parse(bytes.subarray(20, 20 + length)), binary = bytes.subarray(28 + length)
  const types = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
  const readers = { 5126: ['readFloatLE', 4], 5125: ['readUInt32LE', 4], 5123: ['readUInt16LE', 2], 5121: ['readUInt8', 1] }
  function attribute(id, valuesOnly = false) {
    const accessor = gltf.accessors[id], view = gltf.bufferViews[accessor.bufferView]
    const [read, size] = readers[accessor.componentType], count = types[accessor.type]
    const values = []
    for (let i = 0; i < accessor.count; i++) for (let j = 0; j < count; j++) values.push(binary[read]((view.byteOffset || 0) + (accessor.byteOffset || 0) + i * (view.byteStride || count * size) + j * size))
    if (valuesOnly) return values
    return { count: accessor.count, components: count, finite: values.every(Number.isFinite), hash: createHash('sha256').update(JSON.stringify(values)).digest('hex'), min: values.reduce((a, b) => Math.min(a, b), Infinity), max: values.reduce((a, b) => Math.max(a, b), -Infinity) }
  }
  const meshes = gltf.meshes.map(mesh => ({ name: mesh.name, primitives: mesh.primitives.map(p => ({ material: p.material, mode: p.mode ?? 4, indices: p.indices === undefined ? undefined : attribute(p.indices), attributes: Object.fromEntries(Object.entries(p.attributes).map(([k, v]) => [k, attribute(v)])) })) }))
  const images = [], rawImages = []
  for (const image of gltf.images || []) {
    const view = gltf.bufferViews[image.bufferView], buffer = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
    const decoded = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const { data, info } = decoded
    rawImages.push(decoded)
    const colors = new Map()
    for (let i = 0; i < data.length; i += 4) {
      const key = Array.from(data.subarray(i, i + 4)).join(',')
      colors.set(key, (colors.get(key) || 0) + 1)
    }
    images.push({ width: info.width, height: info.height, sha256: createHash('sha256').update(data).digest('hex'), colors: [...colors].sort((a, b) => b[1] - a[1]).slice(0, 12), center: Array.from(data.subarray((Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 4, (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 4 + 4)) })
  }
  const surfaceSamples = gltf.meshes.map(mesh => ({ name: mesh.name, primitives: mesh.primitives.map(p => {
    const material = gltf.materials[p.material], texture = gltf.textures?.[material.pbrMetallicRoughness?.baseColorTexture?.index]
    const image = rawImages[texture?.source]
    if (!image || p.attributes.TEXCOORD_0 === undefined) return { material: p.material }
    const uv = attribute(p.attributes.TEXCOORD_0, true), normal = p.attributes.NORMAL === undefined ? null : attribute(p.attributes.NORMAL, true)
    const index = p.indices === undefined ? Array.from({ length: uv.length / 2 }, (_, i) => i) : attribute(p.indices, true)
    const directions = {}
    for (let i = 0; i < index.length; i += 3) {
      const ids = index.slice(i, i + 3), u = ids.reduce((s, id) => s + uv[id * 2], 0) / 3, v = ids.reduce((s, id) => s + uv[id * 2 + 1], 0) / 3
      const x = Math.max(0, Math.min(image.info.width - 1, Math.floor(u * image.info.width))), y = Math.max(0, Math.min(image.info.height - 1, Math.floor(v * image.info.height)))
      const pixel = Array.from(image.data.subarray((y * image.info.width + x) * 4, (y * image.info.width + x) * 4 + 4)).join(',')
      const n = normal && [0, 1, 2].map(axis => ids.reduce((s, id) => s + normal[id * 3 + axis], 0) / 3)
      const axis = n && n.reduce((best, value, j) => Math.abs(value) > Math.abs(n[best]) ? j : best, 0)
      const direction = n ? `${'xyz'[axis]}${n[axis] < 0 ? '-' : '+'}` : 'unknown'
      const samples = directions[direction] ||= { triangles: 0, pixels: {} }
      samples.triangles++; samples.pixels[pixel] = (samples.pixels[pixel] || 0) + 1
    }
    for (const sample of Object.values(directions)) sample.pixels = Object.entries(sample.pixels).sort((a, b) => b[1] - a[1]).slice(0, 8)
    return { material: p.material, sourceImage: texture.source, directions }
  }) }))
  return { path, validHeader: bytes.readUInt32LE(0) === 0x46546c67 && bytes.readUInt32LE(8) === bytes.length, meshes, materials: gltf.materials, images, surfaceSamples }
}
const input = await inspect('qa-reports/phase2_5/fixtures/multipart-textured-input.glb')
const results = [input]
for (const file of await readdir(directory + '/exports')) {
  if (!file.endsWith('.glb')) continue
  const result = await inspect(directory + '/exports/' + file)
  if (file === 'multipart-customizer.glb') result.geometryEqualToInput = JSON.stringify(result.meshes) === JSON.stringify(input.meshes)
  results.push(result)
}
await record('binary-audit', results)
console.log(results.map(r => ({ path: r.path, meshes: r.meshes.length, images: r.images.map(i => [i.width, i.height]), geometryEqualToInput: r.geometryEqualToInput })))
