import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as THREE from 'three'
import { useEditorStore } from '../../stores/editor-store.ts'
import { createBufferGeometry, registerCustomGeometry } from '../../engine/scene/primitive-factory.ts'
import { buildTopologyFromBufferGeometry, rebuildBufferGeometryFromTopology } from '../../engine/topology/topology-graph.ts'
import { partitionGeometry } from '../../engine/topology/mesh-partition.ts'
import { selectFaceRegion } from '../../engine/topology/face-regions.ts'
import { detectUvIslands, inspectUVDiagnostics } from '../../engine/topology/uv-unwrapper.ts'
import { markUVSeams, packUVIslands } from '../../engine/topology/uv-preparation.ts'
import { pickTopologyElement } from '../../engine/topology/topology-raycaster.ts'
import { inspectGlbContainer } from '../../engine/loaders/glb-integrity.ts'
import { analyzeGlbScene, parseGlbBufferToThree } from '../../engine/generation/generation-validator.ts'
import { inspectGeneratedGlb } from '../../integrations/local-ai/generated-glb-handoff.ts'
import { exportSceneToGLB } from '../../engine/exporters/glb-exporter.ts'
import { captureProject, hydrateProject } from '../../engine/persistence/project-assets.ts'
import '../../engine/processing/mesh-processor.ts'
import { createTShirtScene } from '../../engine/customization/product-catalog.ts'
import { buildThreeSceneFromNodes } from '../../engine/scene/scene-builder.ts'
import { verifyRuntimeContract } from '../../engine/validation/runtime-contract.ts'
import { JobRepository } from '../../server/generation/job-repository.ts'

const geometryFor = node => createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)

test('Completion: concurrent generation job writes retain every independently saved job', async () => {
  const ids = Array.from({ length: 6 }, (_, index) => `completion-concurrent-${process.pid}-${index}`)
  try {
    await Promise.all(ids.map(id => JobRepository.saveJob({ id, providerId: 'local-handoff', status: 'queued', progress: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: 'apparel' })))
    for (const id of ids) assert.equal((await JobRepository.getJob(id))?.id, id)
  } finally { await Promise.all(ids.map(id => JobRepository.deleteJob(id))) }
})
function cube() {
  const store = useEditorStore.getState(); store.resetScene()
  const id = store.addPrimitive('box'); store.selectNode(id)
  return id
}

test('Completion: connected face selection grows one ring and shrinks its boundary', () => {
  const graph = buildTopologyFromBufferGeometry(new THREE.PlaneGeometry(2, 2, 2, 2))
  const grown = selectFaceRegion(graph, [0], 'grow')
  assert.ok(grown.length > 1 && grown.length < graph.faces.size)
  assert.equal(selectFaceRegion(graph, [0], 'connected').length, graph.faces.size)
  assert.deepEqual(selectFaceRegion(graph, [0], 'shrink'), [])
})

test('Completion: partition conserves every triangle, winding, UVs, normals and secondary attributes', () => {
  const geometry = new THREE.BoxGeometry()
  geometry.setAttribute('uv1', geometry.getAttribute('uv').clone())
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 3).fill(0.25), 3))
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(geometry.getAttribute('position').count * 4).fill(2), 4))
  const graph = buildTopologyFromBufferGeometry(geometry)
  const ids = [...graph.faces.keys()]
  const parts = partitionGeometry(geometry, graph, [ids.slice(0, 5), ids.slice(5)])
  for (const name of ['position', 'normal', 'uv', 'uv1', 'color']) {
    const source = geometry.getAttribute(name)
    const expected = Array.from({ length: geometry.index.count }, (_, i) => Array.from({ length: source.itemSize }, (_, c) => source.getComponent(geometry.index.getX(i), c))).flat()
    assert.deepEqual(parts.flatMap(part => Array.from(part.getAttribute(name).array)), expected)
  }
  assert.throws(() => partitionGeometry(geometry, graph, [[0], ids]), /exactly once/)
  assert.throws(() => partitionGeometry(geometry, graph, [ids.slice(1)]), /exactly once/)
  assert.ok(parts.every(part => part.attributes.skinIndex.array instanceof Uint16Array))
  assert.ok(parts.every(part => part.groups.length <= 6))
})

test('Completion: loose-component separation preserves disconnected surfaces without duplication', () => {
  const id = cube(), store = useEditorStore.getState()
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 3, 0, 0, 4, 0, 0, 3, 1, 0], 3))
  geometry.computeVertexNormals()
  registerCustomGeometry('completion-loose', geometry)
  store.updateNode(id, { geometry: { ...useEditorStore.getState().nodes[id].geometry, type: 'custom', customGeometryKey: 'completion-loose' } })
  const parts = store.separateSelectedMesh('components')
  assert.equal(parts.length, 2)
  assert.equal(parts.reduce((sum, part) => sum + geometryFor(useEditorStore.getState().nodes[part]).attributes.position.count, 0), 6)
})

test('Completion: selected separation keeps transforms, materials, visibility and undo/redo', () => {
  const id = cube(), store = useEditorStore.getState()
  store.updateNodeTransform(id, { position: [1, 2, 3], rotation: [0.1, 0.2, 0.3], scale: [-1, 2, 1] })
  store.setSelectedFaces([0, 1])
  const before = structuredClone(useEditorStore.getState().nodes[id])
  const parts = store.separateSelectedMesh()
  assert.equal(parts.length, 2)
  assert.equal(parts.reduce((count, part) => count + useEditorStore.getState().nodes[part].geometry.stats.triangleCount, 0), 12)
  parts.forEach(part => {
    const node = useEditorStore.getState().nodes[part]
    assert.deepEqual(node.transform, before.transform)
    assert.equal(node.materialId, before.materialId)
  })
  store.undo(); assert.deepEqual(useEditorStore.getState().nodes[id], before)
  store.redo(); assert.ok(parts.every(part => useEditorStore.getState().nodes[part]))
})

test('Completion: split by material retains slot assignments after a geometry transaction', () => {
  const id = cube(), store = useEditorStore.getState()
  const material = store.createMaterial('Sleeve')
  store.setSelectedFaces([0, 1]); store.assignMaterialToSelectedFaces(material)
  const parts = store.separateSelectedMesh('materials')
  assert.equal(parts.length, 2)
  const assigned = parts.map(part => geometryFor(useEditorStore.getState().nodes[part]).groups[0].materialIndex)
  assert.deepEqual(assigned.sort(), [0, 1])
  assert.equal(parts.reduce((n, part) => n + useEditorStore.getState().nodes[part].geometry.stats.triangleCount, 0), 12)
})

test('Completion: viewport picking resolves material-sorted faces to stable IDs', () => {
  const geometry = new THREE.PlaneGeometry(), graph = buildTopologyFromBufferGeometry(geometry)
  graph.faces.get(0).materialIndex = 1
  const rebuilt = rebuildBufferGeometryFromTopology(graph)
  const hit = pickTopologyElement(graph, new THREE.Mesh(rebuilt), { faceIndex: 0, point: new THREE.Vector3() }, 'face')
  assert.equal(hit.faceId, 1)
})

test('Completion: explicit seams partition islands and persist in geometry metadata', () => {
  const geometry = new THREE.PlaneGeometry(), graph = buildTopologyFromBufferGeometry(geometry)
  const shared = [...graph.edges.values()].find(edge => edge.faceIds.length === 2)
  markUVSeams(graph, [shared.id], true)
  assert.equal(detectUvIslands(graph).length, 2)
  const rebuilt = rebuildBufferGeometryFromTopology(graph, geometry)
  const reopened = buildTopologyFromBufferGeometry(rebuilt.clone())
  assert.equal(detectUvIslands(reopened).length, 2)
  assert.equal(inspectUVDiagnostics(reopened, rebuilt).hasExplicitSeams, true)
})

test('Completion: packing removes cross-island overlap and supports undo/redo', () => {
  const id = cube(), store = useEditorStore.getState()
  const before = Array.from(geometryFor(useEditorStore.getState().nodes[id]).attributes.uv.array)
  store.packUVIslands()
  const packed = geometryFor(useEditorStore.getState().nodes[id])
  assert.equal(inspectUVDiagnostics(buildTopologyFromBufferGeometry(packed), packed).overlapDetected, false)
  store.undo()
  assert.deepEqual(Array.from(geometryFor(useEditorStore.getState().nodes[id]).attributes.uv.array), before)
  store.redo()
  assert.notDeepEqual(Array.from(geometryFor(useEditorStore.getState().nodes[id]).attributes.uv.array), before)
})

test('Completion: UV edits retain secondary UV attributes', () => {
  const id = cube(), store = useEditorStore.getState(), geometry = geometryFor(useEditorStore.getState().nodes[id]).clone()
  geometry.setAttribute('uv1', geometry.attributes.uv.clone()); registerCustomGeometry('completion-secondary', geometry)
  store.updateNode(id, { geometry: { ...useEditorStore.getState().nodes[id].geometry, type: 'custom', customGeometryKey: 'completion-secondary' } })
  store.transformSelectedUVs(0.1, 0.2)
  const edited = geometryFor(useEditorStore.getState().nodes[id])
  assert.ok(edited.attributes.uv1)
  assert.equal(edited.attributes.uv1.count, edited.attributes.position.count)
})

test('Completion: GLB handoff rejects corrupt length, truncated chunks and non-GLB files', async () => {
  const bytes = fs.readFileSync('docs/fixtures/black-shirt.glb')
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  assert.ok(inspectGlbContainer(buffer).asset)
  assert.throws(() => inspectGlbContainer(buffer.slice(0, -4)), /length/)
  const corrupt = buffer.slice(0); new DataView(corrupt).setUint32(12, 0xffffffff, true)
  assert.throws(() => inspectGlbContainer(corrupt), /chunk/)
  await assert.rejects(inspectGeneratedGlb(new File([buffer], 'invalid.obj')), /\.glb/)
})

test('Completion: front/back names alone never establish BlackBullet runtime compatibility', () => {
  const root = new THREE.Group()
  for (const name of ['shirt_front', 'shirt_back']) { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshStandardMaterial()); mesh.name = name; root.add(mesh) }
  assert.equal(analyzeGlbScene(root).isBlackBulletReady, false)
  root.children[0].geometry.attributes.uv.setXY(0, NaN, 0)
  assert.equal(analyzeGlbScene(root).isCustomizerCompatible, false)
})

test('Completion: registered atlas passes runtime contract; UV drift and forged names fail', () => {
  const imported = createTShirtScene()
  const scene = buildThreeSceneFromNodes(imported.nodes, imported.rootNodeIds, imported.materials)
  assert.equal(verifyRuntimeContract(scene), true)
  const front = scene.getObjectByName('Body_Main')
  front.position.z = -3
  assert.equal(verifyRuntimeContract(scene), false)
  front.position.z = 0
  front.geometry.attributes.uv.setXY(0, 0.99, 0.99)
  assert.equal(verifyRuntimeContract(scene), false)
})

test('Completion: independent slot assignment is undoable and preserves other materials', () => {
  const id = cube(), store = useEditorStore.getState()
  const sleeve = store.createMaterial('Sleeve'), collar = store.createMaterial('Collar')
  store.addMaterialSlot(id, sleeve)
  const before = [...useEditorStore.getState().nodes[id].materialIds]
  store.assignMaterial(id, collar, 1)
  assert.deepEqual(useEditorStore.getState().nodes[id].materialIds, [before[0], collar])
  store.undo(); assert.deepEqual(useEditorStore.getState().nodes[id].materialIds, before)
  store.redo(); assert.equal(useEditorStore.getState().nodes[id].materialIds[1], collar)
})

test('Completion: separated material parts survive save/reopen and GLB export/reimport', async () => {
  cube(); const store = useEditorStore.getState()
  store.setSelectedFaces([0, 1]); const parts = store.separateSelectedMesh()
  const material = store.createMaterial('Independent sleeve', { color: '#00ff00', roughness: 0.8 })
  store.assignMaterial(parts[0], material)
  const state = useEditorStore.getState(), scene = { nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: state.environment }
  const snapshot = await captureProject(scene, { id: 'completion', name: 'Completion', version: '1', createdAt: '', updatedAt: '' })
  const restored = await hydrateProject(snapshot)
  assert.equal(restored.scene.nodes[parts[0]].materialId, material)
  const exported = await exportSceneToGLB(restored.scene.nodes, restored.scene.rootNodeIds, restored.scene.materials)
  const buffer = await exported.blob.arrayBuffer()
  fs.mkdirSync('qa-reports/completion/exports', { recursive: true })
  fs.writeFileSync('qa-reports/completion/exports/separated-roundtrip.glb', Buffer.from(buffer))
  const imported = await parseGlbBufferToThree(buffer)
  const meshes = []; imported.traverse(object => { if (object.isMesh) meshes.push(object) })
  assert.ok(meshes.some(mesh => mesh.material.color.getHexString() === '00ff00'))
  assert.equal(meshes.reduce((n, mesh) => n + (mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3, 0), state.stats.totalTriangles)
})
