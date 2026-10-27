import '../support/file-reader.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { useEditorStore } from '../../stores/editor-store.ts'
import { createBufferGeometry, geometryResourceCount } from '../../engine/scene/primitive-factory.ts'
import { clearTopologyCache } from '../../engine/topology/topology-cache.ts'
import { processThreeObjectHierarchy } from '../../engine/loaders/model-importer.ts'
import { exportSceneToGLB } from '../../engine/exporters/glb-exporter.ts'
import { captureProject, hydrateProject } from '../../engine/persistence/project-assets.ts'
import { syncMeshStandardMaterial } from '../../engine/scene/material-manager.ts'

function fresh() { useEditorStore.getState().resetScene(); clearTopologyCache(); return useEditorStore.getState().selectedNodeId }
function snapshot(id) {
  const node = useEditorStore.getState().nodes[id], def = node.geometry
  const geom = createBufferGeometry(def.type, def.params, def.customGeometryKey)
  return JSON.stringify({ type: def.type, params: def.params, materialId: node.materialId, materialIds: node.materialIds, attributes: Object.fromEntries(Object.keys(geom.attributes).sort().map((key) => [key, Array.from(geom.attributes[key].array)])), index: geom.index && Array.from(geom.index.array), groups: geom.groups, stats: def.stats })
}

test('stabilization: multi-operation geometry/UV/material history restores actual buffers in both directions', () => {
  const id = fresh(), s = useEditorStore.getState()
  const material = s.createMaterial('Black second slot', { color: '#09090b', roughness: 0.65, metalness: 0 })
  s.setSelectedFaces([0, 1])
  const snapshots = [snapshot(id)]
  const operations = [() => s.extrudeSelectedFaces(0.2), () => s.applyUVProjection('box'), () => s.transformSelectedUVs(0.1, 0.2, 0.8, 0.9, 45), () => s.assignMaterialToSelectedFaces(material), () => s.flipSelectedNormals(), () => s.subdivideSelectedFaces()]
  operations.forEach((operation) => { operation(); snapshots.push(snapshot(id)) })
  for (let index = operations.length - 1; index >= 0; index--) { s.undo(); assert.equal(snapshot(id), snapshots[index], `Undo ${index}`) }
  for (let index = 1; index <= operations.length; index++) { s.redo(); assert.equal(snapshot(id), snapshots[index], `Redo ${index}`) }
  const current = useEditorStore.getState()
  return exportSceneToGLB(current.nodes, current.rootNodeIds, current.materials).then((result) => assert.equal(result.verified, true, result.issues.join('\n')))
})

test('stabilization: add, multi-select, delete subtree, undo/redo and duplicate maintain selection invariants', () => {
  const cube = fresh(), s = useEditorStore.getState(), sphere = s.addPrimitive('sphere')
  s.toggleObjectSelection(cube, true)
  assert.deepEqual(new Set(useEditorStore.getState().selectedNodeIds), new Set([cube, sphere]))
  s.deleteNode(cube)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [sphere])
  s.undo()
  assert.ok(useEditorStore.getState().nodes[cube])
  assert.deepEqual(new Set(useEditorStore.getState().selectedNodeIds), new Set([cube, sphere]))
  s.redo()
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [sphere])
  const copy = s.duplicateNode(sphere)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [copy])
  s.undo(); assert.ok(!useEditorStore.getState().nodes[copy])
  s.redo(); assert.deepEqual(useEditorStore.getState().selectedNodeIds, [copy])
})

test('stabilization: additional UV channels and groups survive persisted asset hydration', () => {
  fresh()
  const geometry = new THREE.BoxGeometry()
  geometry.setAttribute('uv1', geometry.attributes.uv.clone())
  geometry.setAttribute('uv2', geometry.attributes.uv.clone())
  const state = processThreeObjectHierarchy(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#09090b' })), 'UV channels')
  const scene = { nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: useEditorStore.getState().environment }
  const metadata = { id: 'channels', name: 'UV channels', version: '1', createdAt: '2026-10-24', updatedAt: '2026-10-24' }
  return captureProject(scene, metadata).then((saved) => hydrateProject(JSON.parse(JSON.stringify(saved)))).then((restored) => {
    const node = restored.scene.nodes[state.rootNodeIds[0]], def = node.geometry
    const actual = createBufferGeometry(def.type, def.params, def.customGeometryKey)
    assert.deepEqual(Array.from(actual.attributes.uv1.array), Array.from(geometry.attributes.uv1.array))
    assert.deepEqual(Array.from(actual.attributes.uv2.array), Array.from(geometry.attributes.uv2.array))
    assert.deepEqual(actual.groups, geometry.groups.map((group) => ({ ...group, materialIndex: 0 })))
    const broken = { document: { schemaVersion: 2, scene }, assets: { object: { type: 'Scene', uuid: 'missing' } } }
    return assert.rejects(hydrateProject(broken), /Missing geometry asset/)
  })
})

test('stabilization: repeated scene replacement releases geometry resources without breaking history', () => {
  fresh()
  for (let index = 0; index < 12; index++) {
    const state = processThreeObjectHierarchy(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()), 'Import cycle')
    const s = useEditorStore.getState()
    s.loadImportedScene(state); s.setSelectedFaces([0, 1]); s.extrudeSelectedFaces(0.2)
    s.undo(); s.redo()
    assert.ok(geometryResourceCount() <= 4)
  }
  useEditorStore.getState().resetScene()
  assert.equal(geometryResourceCount(), 0)
})

test('stabilization: persisted procedural undo snapshot drops obsolete cache references', () => {
  const id = fresh(), s = useEditorStore.getState()
  s.setSelectedFaces([0, 1]); s.extrudeSelectedFaces(0.2); s.undo()
  const state = useEditorStore.getState()
  const previousKey = state.nodes[id].geometry.customGeometryKey
  const expected = Array.from(createBufferGeometry(state.nodes[id].geometry.type, state.nodes[id].geometry.params, previousKey).attributes.position.array)
  const scene = { nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: state.environment }
  const metadata = { id: 'primitive', name: 'Primitive', version: '1', createdAt: '2026-10-24', updatedAt: '2026-10-24' }
  return captureProject(scene, metadata).then((saved) => {
    s.resetScene()
    return hydrateProject(saved)
  }).then((restored) => {
    const def = restored.scene.nodes[id].geometry
    assert.notEqual(def.customGeometryKey, previousKey)
    assert.deepEqual(Array.from(createBufferGeometry(def.type, def.params, def.customGeometryKey).attributes.position.array), expected)
  })
})

test('stabilization: asset serialization preserves non-quantized linear material colors', () => {
  fresh()
  const material = new THREE.MeshStandardMaterial()
  material.color.setRGB(0.123456789, 0.234567891, 0.345678912)
  material.emissive.setRGB(0.012345678, 0.023456789, 0.034567891)
  const imported = processThreeObjectHierarchy(new THREE.Mesh(new THREE.BoxGeometry(), material), 'Precise color')
  useEditorStore.getState().loadImportedScene(imported)
  const state = useEditorStore.getState()
  const scene = { nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: state.environment }
  return captureProject(scene, { id: 'precision', name: 'Precision', version: '1', createdAt: '2026-10-24', updatedAt: '2026-10-24' }).then((saved) => {
    state.resetScene()
    const broken = structuredClone(saved)
    broken.assets.materials = []
    return assert.rejects(hydrateProject(broken), /Missing material asset/).then(() => hydrateProject(JSON.parse(JSON.stringify(saved))))
  }).then((restored) => {
    const actual = syncMeshStandardMaterial(Object.values(restored.scene.materials).find((data) => data.importedMaterialKey))
    assert.deepEqual(actual.color.toArray(), material.color.toArray())
    assert.deepEqual(actual.emissive.toArray(), material.emissive.toArray())
  })
})
