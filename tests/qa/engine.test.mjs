import '../support/file-reader.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { writeFileSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { useEditorStore } from '../../stores/editor-store.ts'
import { useProjectStore } from '../../stores/project-store.ts'
import { createBufferGeometry } from '../../engine/scene/primitive-factory.ts'
import { clearTopologyCache } from '../../engine/topology/topology-cache.ts'
import { buildTopologyFromBufferGeometry, getTopologyStats } from '../../engine/topology/topology-graph.ts'
import { inspectUVDiagnostics } from '../../engine/topology/uv-unwrapper.ts'
import { exportSceneToGLB } from '../../engine/exporters/glb-exporter.ts'
import { parseGLTF } from '../../engine/loaders/model-importer.ts'
import { buildThreeSceneFromNodes } from '../../engine/scene/scene-builder.ts'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { processThreeObjectHierarchy } from '../../engine/loaders/model-importer.ts'
import { flipTopologyNormals } from '../../engine/topology/geometry-operators.ts'
import { captureProject, hydrateProject } from '../../engine/persistence/project-assets.ts'

globalThis.ProgressEvent ??= class ProgressEvent extends Event {
  constructor(type, properties = {}) { super(type); Object.assign(this, properties) }
}

function fresh() {
  clearTopologyCache()
  const store = useEditorStore.getState()
  store.resetScene()
  store.setEditorMode('object')
  store.clearTopologySelection()
  return useEditorStore.getState().selectedNodeId
}
function geometry(id) {
  const def = useEditorStore.getState().nodes[id].geometry
  return createBufferGeometry(def.type, def.params, def.customGeometryKey)
}
function data(id) {
  const geom = geometry(id)
  return JSON.stringify({ positions: Array.from(geom.attributes.position.array), index: geom.index && Array.from(geom.index.array), uv: geom.attributes.uv && Array.from(geom.attributes.uv.array), groups: geom.groups })
}
function integrity(id) {
  const graph = buildTopologyFromBufferGeometry(geometry(id))
  for (const face of graph.faces.values()) {
    assert.ok(face.vertexIds.every((vertex) => graph.vertices.has(vertex)))
    assert.ok(face.edgeIds.every((edge) => graph.edges.has(edge)))
  }
  assert.equal(getTopologyStats(graph).degenerateFaces, 0)
  assert.ok(Array.from(geometry(id).attributes.position.array).every(Number.isFinite))
}
function roundtrip(name, binary = true) {
  const state = useEditorStore.getState()
  return exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials, undefined, { binary }).then((result) => {
    return result.blob.arrayBuffer().then((buffer) => {
      writeFileSync(`qa-reports/exported-models/${name}.${binary ? 'glb' : 'gltf'}`, new Uint8Array(buffer))
      writeFileSync(`qa-reports/test-results/${name}-validation.json`, JSON.stringify({ ...result, blob: undefined }, null, 2))
      assert.equal(result.verified, true, result.issues.join('\n'))
      return parseGLTF(buffer, name)
    })
  })
}

const topologyCases = [
  ['extrude', (s) => s.setSelectedFaces([0, 1]), (s) => s.extrudeSelectedFaces(0.3)],
  ['inset', (s) => s.setSelectedFaces([0]), (s) => s.insetSelectedFaces(0.2, 0.1)],
  ['subdivide', (s) => s.setSelectedFaces([0, 1]), (s) => s.subdivideSelectedFaces()],
  ['merge', (s) => s.setSelectedVertices([0, 1]), (s) => s.mergeSelectedVertices('center')],
  ['weld', (s) => s.setSelectedVertices([0, 1]), (s) => s.mergeSelectedVertices('distance', 1.01)],
  ['delete', (s) => { s.setSelectionSubMode('face'); s.setSelectedFaces([0]) }, (s) => s.deleteSelectedTopologyElements()],
  ['flip', (s) => s.setSelectedFaces([0, 1]), (s) => s.flipSelectedNormals()],
]
for (const [name, prepare, run] of topologyCases) {
  test(`QA forward ${name}: changed geometry remains exportable before history actions`, () => {
    const id = fresh(), s = useEditorStore.getState(), before = data(id)
    s.setEditorMode('edit'); prepare(s); run(s)
    assert.notEqual(data(id), before)
    integrity(id)
    return roundtrip(`forward-${name}`)
  })
  test(`QA topology ${name}: geometry, graph, undo, redo and GLB`, () => {
    const id = fresh(), s = useEditorStore.getState()
    s.setEditorMode('edit')
    prepare(s)
    const before = data(id), material = useEditorStore.getState().nodes[id].materialId
    run(s)
    const after = data(id)
    assert.notEqual(after, before, 'Operation must change real geometry')
    integrity(id)
    assert.equal(useEditorStore.getState().nodes[id].materialId, material)
    s.undo()
    assert.equal(data(id), before, 'Undo must restore rendered/exported geometry')
    s.redo()
    assert.equal(data(id), after, 'Redo must restore edited geometry')
    return roundtrip(`topology-${name}`)
  })
}

test('QA flip normals updates per-corner shading normals as well as winding', () => {
  const graph = buildTopologyFromBufferGeometry(new THREE.BoxGeometry())
  const normal = [...graph.faces.get(0).corners[0].normal]
  flipTopologyNormals(graph, [0])
  const flipped = graph.faces.get(0).corners[0].normal
  assert.ok(flipped.reduce((sum, value, i) => sum + value * normal[i], 0) < 0, 'Corner normals still point in the original direction after flipping the face')
})

test('QA adding a primitive keeps primary and multi-selection IDs synchronized', () => {
  fresh()
  const added = useEditorStore.getState().addPrimitive('sphere')
  const state = useEditorStore.getState()
  assert.equal(state.selectedNodeId, added)
  assert.deepEqual(state.selectedNodeIds, [added], 'New primitive becomes primary selection but stale selectedNodeIds still reference the previous object')
})

test('QA connected component separation: geometry, history and GLB', () => {
  fresh()
  const geometry = mergeGeometries([new THREE.BoxGeometry(), new THREE.BoxGeometry().translate(3, 0, 0)])
  const state = processThreeObjectHierarchy(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()), 'Disconnected boxes')
  const s = useEditorStore.getState()
  s.loadImportedScene(state)
  const original = Object.keys(state.nodes).length
  const ids = s.separateSelectedMesh('components')
  assert.equal(ids.length, 2)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [ids[0]])
  ids.forEach(integrity)
  s.undo()
  assert.equal(Object.keys(useEditorStore.getState().nodes).length, original)
  assert.ok(useEditorStore.getState().selectedNodeIds.includes(useEditorStore.getState().selectedNodeId))
  s.redo()
  assert.equal(Object.values(useEditorStore.getState().nodes).filter((n) => n.type === 'mesh').length, 2)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [ids[0]])
  return roundtrip('separated-components')
})

for (const projection of ['box', 'planar', 'cylindrical']) {
  test(`QA forward UV ${projection}: edited data survives GLB independently of undo`, () => {
    const id = fresh(), s = useEditorStore.getState(), before = data(id)
    s.applyUVProjection(projection, 'z')
    assert.notEqual(data(id), before)
    return roundtrip(`forward-uv-${projection}`)
  })
}

for (const projection of ['box', 'planar', 'cylindrical']) {
  test(`QA UV ${projection}: finite data, undo/redo and GLB`, () => {
    const id = fresh(), s = useEditorStore.getState(), before = data(id)
    s.applyUVProjection(projection, 'z')
    const after = data(id)
    assert.notEqual(after, before)
    assert.ok(Array.from(geometry(id).attributes.uv.array).every(Number.isFinite))
    s.undo()
    assert.equal(data(id), before, 'UV projection undo must restore actual BufferGeometry')
    s.redo()
    assert.equal(data(id), after)
    return roundtrip(`uv-${projection}`)
  })
}

for (const [name, args] of [['translate', [0.1, 0.2]], ['rotate', [0, 0, 1, 1, 45]], ['scale', [0, 0, 0.5, 0.75]]]) {
  test(`QA UV ${name}: actual data changes and undo restores it`, () => {
    const id = fresh(), s = useEditorStore.getState(), before = data(id)
    s.transformSelectedUVs(...args)
    const after = data(id)
    assert.notEqual(after, before)
    assert.ok(Array.from(geometry(id).attributes.uv.array).every(Number.isFinite))
    s.undo()
    assert.equal(data(id), before)
    s.redo()
    assert.equal(data(id), after)
    return roundtrip(`uv-${name}`)
  })
}

test('QA material slots: assign selected faces, remove slot, valid groups and GLB', () => {
  const id = fresh(), s = useEditorStore.getState()
  const mat = s.createMaterial('QA Black Fabric', { color: '#09090b', roughness: 0.65, metalness: 0, doubleSided: true })
  s.setSelectedFaces([0, 1])
  s.assignMaterialToSelectedFaces(mat)
  assert.equal(useEditorStore.getState().nodes[id].materialIds.length, 2)
  assert.ok(geometry(id).groups.some((group) => group.materialIndex === 1))
  return roundtrip('face-material').then(() => {
    s.removeMaterialSlot(id, 1)
    const slots = useEditorStore.getState().nodes[id].materialIds
    assert.equal(slots.length, 1)
    assert.ok(geometry(id).groups.every((group) => group.materialIndex < slots.length))
    return roundtrip('removed-material-slot')
  })
})

test('QA material face assignment undo from a primitive restores geometry and slots', () => {
  const id = fresh(), s = useEditorStore.getState(), before = data(id)
  const mat = s.createMaterial('Second fabric', { color: '#09090b' })
  s.setSelectedFaces([0])
  s.assignMaterialToSelectedFaces(mat)
  s.undo()
  assert.equal(data(id), before)
  return roundtrip('material-assignment-undo')
})

test('QA GLTF embedded JSON export reloads with black fabric and customization metadata', () => {
  const id = fresh(), s = useEditorStore.getState()
  const mat = s.createMaterial('QA Black Cotton', { color: '#09090b', roughness: 0.65, metalness: 0, opacity: 1, doubleSided: true })
  s.assignMaterial(id, mat)
  s.updateNode(id, { isCustomizable: true, customizableZone: 'body_front' })
  return roundtrip('black-cotton-json', false).then((imported) => {
    const fabric = Object.values(imported.materials)[0]
    assert.equal(fabric.color, '#09090b')
    assert.equal(fabric.roughness, 0.65)
    assert.equal(fabric.metalness, 0)
    assert.equal(fabric.doubleSided, true)
    assert.equal(Object.values(imported.nodes).find((node) => node.type === 'mesh').customizableZone, 'body_front')
  })
})

test('QA UV diagnostics rejects non-finite coordinates and distinguishes missing UVs', () => {
  const geom = new THREE.PlaneGeometry()
  geom.attributes.uv.setX(0, NaN)
  const invalid = inspectUVDiagnostics(buildTopologyFromBufferGeometry(geom), geom, true)
  assert.equal(invalid.isValid, false)
  assert.equal(invalid.customizableZoneReady, false)
  geom.deleteAttribute('uv')
  assert.equal(inspectUVDiagnostics(buildTopologyFromBufferGeometry(geom), geom, false).hasUVs, false)
})

test('QA persistence: supported primitive transforms and materials survive JSON save/load', () => {
  const id = fresh(), s = useEditorStore.getState()
  s.updateNodeTransform(id, { position: [1, 2, 3], scale: [1, 2, 0.5] })
  const mat = s.createMaterial('Saved Black', { color: '#09090b', roughness: 0.65, metalness: 0 })
  s.assignMaterial(id, mat)
  const state = useEditorStore.getState()
  return captureProject({ nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: state.environment }, useProjectStore.getState().currentProject)
    .then((snapshot) => { s.resetScene(); return hydrateProject(JSON.parse(JSON.stringify(snapshot))) }).then((serialized) => {
      useProjectStore.getState().loadProjectFromData(serialized)
      assert.deepEqual(useEditorStore.getState().nodes[id].transform.position, [1, 2, 3])
      assert.equal(useEditorStore.getState().materials[mat].color, '#09090b')
    })
})

test('QA persistence: edited/imported geometry bytes survive a fresh process', () => {
  const id = fresh(), s = useEditorStore.getState()
  s.setSelectedFaces([0, 1]); s.extrudeSelectedFaces(0.5)
  const current = useEditorStore.getState()
  const path = 'qa-reports/test-results/persistence-scene.json'
  return captureProject({ nodes: current.nodes, rootNodeIds: current.rootNodeIds, materials: current.materials, environment: current.environment }, useProjectStore.getState().currentProject).then((snapshot) => {
  writeFileSync(path, JSON.stringify({ snapshot, expected: data(id), id }))
  const child = spawnSync(process.execPath, ['--import', './scripts/register-typescript.mjs', './scripts/qa/reload-scene.mjs', path], { encoding: 'utf8' })
  writeFileSync('qa-reports/test-results/persistence-fresh-process.log', child.stdout + child.stderr)
  assert.equal(child.status, 0, child.stdout + child.stderr)
  })
})

for (const feature of ['joinMeshes', 'bevelSelectedEdges', 'duplicateMaterial']) {
  test(`QA unsupported feature inventory: ${feature}`, { skip: typeof useEditorStore.getState()[feature] !== 'function' ? `${feature} is not implemented in the editor store` : false }, () => {
    assert.equal(typeof useEditorStore.getState()[feature], 'function')
  })
}
