import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
export async function inspectSurfaces(file) {
  const bytes = await readFile(file), size = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20, 20 + size)), binary = bytes.subarray(28 + size)
  const images = await Promise.all((json.images || []).map(async image => {
    const view = json.bufferViews[image.bufferView]
    const decoded = await sharp(binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const counts = { red: 0, blue: 0, green: 0, white: 0 }
    for (let i = 0; i < decoded.data.length; i += 4) {
      const r = decoded.data[i], g = decoded.data[i + 1], b = decoded.data[i + 2], a = decoded.data[i + 3]
      if (!a) continue
      if (r > 220 && g < 25 && b < 25) counts.red++
      if (b > 220 && r < 25 && g < 25) counts.blue++
      if (g > 150 && r < 35 && b > 90 && b < 160) counts.green++
      if (r > 240 && g > 240 && b > 240) counts.white++
    }
    return { width: decoded.info.width, height: decoded.info.height, counts }
  }))
  const surfaces = json.nodes.filter(node => node.mesh !== undefined).map(node => ({ name: node.name, partId: node.extras?.partId, target: node.extras?.customizationTarget, primitives: json.meshes[node.mesh].primitives.map(primitive => {
    const material = json.materials[primitive.material]
    const image = json.textures?.[material.pbrMetallicRoughness?.baseColorTexture?.index]?.source
    return { material, image: image === undefined ? null : images[image] }
  }) }))
  return { validHeader: bytes.readUInt32LE(0) === 0x46546c67 && bytes.readUInt32LE(8) === bytes.length, surfaces, images }
}
