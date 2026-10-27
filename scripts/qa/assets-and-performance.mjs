import '../../tests/support/file-reader.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { createHash } from 'node:crypto'
import * as THREE from 'three'
import { processThreeObjectHierarchy, parseGLTF } from '../../engine/loaders/model-importer.ts'
import { exportSceneToGLB } from '../../engine/exporters/glb-exporter.ts'
import { buildTopologyFromBufferGeometry, getTopologyStats } from '../../engine/topology/topology-graph.ts'
import { subdivideFaces } from '../../engine/topology/geometry-operators.ts'
import { useEditorStore } from '../../stores/editor-store.ts'

const output = { measuredAt: new Date().toISOString(), environment: { node: process.version, os: `${os.platform()} ${os.release()}`, cpu: os.cpus()[0]?.model, memoryBytes: os.totalmem() }, performance: [], garments: [] }
for (const [label, width, height] of [['small', 20, 25], ['medium', 100, 100], ['large', 200, 200]]) {
  const start = performance.now(), heapBefore = process.memoryUsage().heapUsed
  const geometry = new THREE.PlaneGeometry(2, 2, width, height)
  const triangles = geometry.index.count / 3
  const material = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.65, metalness: 0, side: THREE.DoubleSide })
  material.name = 'QA Black Cotton'
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = `QA_${label}`
  const state = processThreeObjectHierarchy(mesh, label)
  const importMs = performance.now() - start
  let time = performance.now()
  const graph = buildTopologyFromBufferGeometry(geometry)
  const graphMs = performance.now() - time
  time = performance.now()
  subdivideFaces(graph, [0, 1])
  const subdivideTwoFacesMs = performance.now() - time
  useEditorStore.getState().loadImportedScene(state)
  time = performance.now()
  for (let i = 0; i < 100; i++) { useEditorStore.getState().selectObject(state.rootNodeIds[0]); useEditorStore.getState().clearObjectSelection() }
  const selection100PairsMs = performance.now() - time
  time = performance.now()
  const result = await exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials)
  const exportAndVerifyMs = performance.now() - time
  await writeFile(`qa-reports/exported-models/performance-${label}.glb`, new Uint8Array(await result.blob.arrayBuffer()))
  output.performance.push({ label, triangles, importMs, graphMs, subdivideTwoFacesMs, selection100PairsMs, exportAndVerifyMs, verified: result.verified, issues: result.issues, heapBefore, heapAfter: process.memoryUsage().heapUsed, rss: process.memoryUsage().rss })
  geometry.dispose(); material.dispose()
  console.log(`${label}: ${triangles} triangles, export+verify ${exportAndVerifyMs.toFixed(1)}ms, verified=${result.verified}`)
}
for (const file of ['subdivision.glb', 'raglan_shirt.glb']) {
  const source = new URL(`../../../blackbullet-3d/src/assets/modals/${file}`, import.meta.url)
  const bytes = await readFile(source)
  const started = performance.now()
  const state = await parseGLTF(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), file)
  const sourceMaterials = Object.values(state.materials).map((m) => ({ name: m.name, color: m.color, roughness: m.roughness, metalness: m.metalness, doubleSided: m.doubleSided }))
  for (const material of Object.values(state.materials)) Object.assign(material, { color: '#09090b', roughness: 0.65, metalness: 0, opacity: 1, transparent: false, doubleSided: true })
  const result = await exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials)
  const path = `qa-reports/exported-models/black-${file}`
  await writeFile(path, new Uint8Array(await result.blob.arrayBuffer()))
  const reimported = await parseGLTF(await result.blob.arrayBuffer(), `reimported-${file}`)
  output.garments.push({ file, source: source.pathname, sourceSHA256: createHash('sha256').update(bytes).digest('hex'), sourceMaterials, output: path, verified: result.verified, issues: result.issues, warnings: result.warnings, sourceMeshes: Object.values(state.nodes).filter((n) => n.type === 'mesh').length, reimportedMeshes: Object.values(reimported.nodes).filter((n) => n.type === 'mesh').length, reimportedMaterials: Object.values(reimported.materials).map((m) => ({ name: m.name, color: m.color, roughness: m.roughness, metalness: m.metalness, doubleSided: m.doubleSided })), durationMs: performance.now() - started })
  console.log(`${file}: actual garment roundtrip verified=${result.verified}, issues=${result.issues.length}`)
}
await writeFile('qa-reports/test-results/assets-and-performance.json', JSON.stringify(output, null, 2))
