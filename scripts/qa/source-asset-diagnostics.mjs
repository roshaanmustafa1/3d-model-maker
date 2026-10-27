import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { buildTopologyFromBufferGeometry, getTopologyStats } from '../../engine/topology/topology-graph.ts'

const source = '../blackbullet-3d/src/assets/modals/subdivision.glb'
const bytes = readFileSync(source)
const hash = () => createHash('sha256').update(readFileSync(source)).digest('hex')
const before = hash()
const loaded = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
const meshes = []
loaded.scene.traverse((mesh) => {
  if (!mesh.isMesh) return
  const geometry = mesh.geometry, position = geometry.attributes.position, normal = geometry.attributes.normal
  let opposingNormals = 0, zeroAreaTriangles = 0
  const a = new THREE.Vector3(), b = a.clone(), c = a.clone(), cross = a.clone(), average = a.clone(), n = a.clone()
  const count = geometry.index?.count || position.count
  for (let offset = 0; offset < count; offset += 3) {
    const ids = [0, 1, 2].map((step) => geometry.index ? geometry.index.getX(offset + step) : offset + step)
    a.fromBufferAttribute(position, ids[0]); b.fromBufferAttribute(position, ids[1]); c.fromBufferAttribute(position, ids[2])
    cross.crossVectors(b.sub(a), c.sub(a))
    if (cross.lengthSq() === 0) zeroAreaTriangles++
    if (normal && cross.lengthSq() > 1e-20) {
      average.set(0, 0, 0)
      ids.forEach((id) => average.add(n.fromBufferAttribute(normal, id)))
      if (cross.dot(average) < 0) opposingNormals++
    }
  }
  meshes.push({ name: mesh.name, missingUV: !geometry.attributes.uv, opposingNormals, zeroAreaTriangles, ...getTopologyStats(buildTopologyFromBufferGeometry(geometry)) })
})
writeFileSync('qa-reports/phase2_5/source-asset-diagnostics.json', JSON.stringify({ source, sha256Before: before, sha256After: hash(), modified: before !== hash(), meshes, artworkReady: false, note: 'Original retained. Missing UVs prevent atlas artwork readiness; boundary edges can represent intentional garment openings.' }, null, 2))
