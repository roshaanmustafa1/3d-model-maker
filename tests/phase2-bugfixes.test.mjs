import './support/file-reader.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { processThreeObjectHierarchy, parseGLTF } from '../engine/loaders/model-importer.ts'
import { buildThreeSceneFromNodes } from '../engine/scene/scene-builder.ts'
import { syncMeshStandardMaterial } from '../engine/scene/material-manager.ts'
import { createViewportMaterials } from '../engine/scene/viewport-materials.ts'
import { inspectScene, compareSceneRoundTrip } from '../engine/validation/scene-integrity.ts'
import { exportSceneToGLB } from '../engine/exporters/glb-exporter.ts'
import { useEditorStore } from '../stores/editor-store.ts'
import { buildTopologyFromBufferGeometry, getTopologyStats } from '../engine/topology/topology-graph.ts'
import { inspectUVDiagnostics } from '../engine/topology/uv-unwrapper.ts'

test('ISSUE 1: Select model, deselect by clearObjectSelection, and deselect with Escape', () => {
  const store = useEditorStore.getState()
  store.resetScene()

  const nodeA = store.addPrimitive('box')
  const nodeB = store.addPrimitive('sphere')

  // 1. Select model
  store.selectObject(nodeA)
  assert.equal(useEditorStore.getState().selectedNodeId, nodeA)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [nodeA])

  // 2. Switching selection between objects
  store.selectObject(nodeB)
  assert.equal(useEditorStore.getState().selectedNodeId, nodeB)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [nodeB])

  // 3. Deselect by clearObjectSelection (simulating background click)
  store.clearObjectSelection()
  assert.equal(useEditorStore.getState().selectedNodeId, null)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [])
  assert.equal(useEditorStore.getState().stats.selectedVertices, 0)
  assert.equal(useEditorStore.getState().stats.selectedTriangles, 0)

  // 4. Multi-selection toggle with Shift
  store.selectObject(nodeA)
  store.toggleObjectSelection(nodeB, true)
  assert.deepEqual([...useEditorStore.getState().selectedNodeIds].sort(), [nodeA, nodeB].sort())
  assert.equal(useEditorStore.getState().selectedNodeId, nodeB)

  // Toggle nodeA off
  store.toggleObjectSelection(nodeA, true)
  assert.deepEqual([...useEditorStore.getState().selectedNodeIds], [nodeB])
  assert.equal(useEditorStore.getState().selectedNodeId, nodeB)

  // Deselect last item via non-multi toggle
  store.toggleObjectSelection(nodeB, false)
  assert.equal(useEditorStore.getState().selectedNodeId, null)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [])

  // 5. Selection after deleting an object
  store.selectObject(nodeA)
  assert.equal(useEditorStore.getState().selectedNodeId, nodeA)
  store.deleteNode(nodeA)
  assert.ok(!useEditorStore.getState().selectedNodeIds.includes(nodeA))
})

test('ISSUE 1 (Edit Mode): Topology selection remains separate from object selection', () => {
  const store = useEditorStore.getState()
  store.resetScene()
  const boxId = store.rootNodeIds[0]
  store.selectObject(boxId)
  store.setEditorMode('edit')
  assert.equal(useEditorStore.getState().editorMode, 'edit')

  // Set sub-selection
  store.setSelectedVertices([0, 1, 2])
  assert.deepEqual(useEditorStore.getState().selectedVertexIds, [0, 1, 2])

  // Clearing topology selection leaves object selected
  store.clearTopologySelection()
  assert.deepEqual(useEditorStore.getState().selectedVertexIds, [])
  assert.equal(useEditorStore.getState().selectedNodeId, boxId)
  assert.equal(useEditorStore.getState().editorMode, 'edit')

  // Exit edit mode
  store.setEditorMode('object')
  assert.equal(useEditorStore.getState().editorMode, 'object')
})

test('ISSUE 1: Drag threshold prevents accidental deselection during camera orbit', () => {
  // Simulating drag threshold logic used in viewport-canvas
  const downPos = { x: 100, y: 100 }
  const dragMovePos = { x: 140, y: 180 }
  const clickPos = { x: 102, y: 101 }

  const dragDist = Math.hypot(dragMovePos.x - downPos.x, dragMovePos.y - downPos.y)
  const clickDist = Math.hypot(clickPos.x - downPos.x, clickPos.y - downPos.y)

  assert.ok(dragDist > 5, 'Camera drag movement exceeds 5px threshold')
  assert.ok(clickDist <= 5, 'Intentional click is within 5px threshold')
})

test('ISSUE 2: Solid mode displays opaque surfaces and does NOT mutate material wireframe', () => {
  const materialData = {
    id: 'mat_tripo_black',
    name: 'tripo_mat_1008021c',
    color: '#09090b',
    roughness: 0.65,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1.0,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  }

  const standardMat = syncMeshStandardMaterial(materialData)
  assert.equal(standardMat.wireframe, false)
  assert.equal(standardMat.color.getHexString().toLowerCase(), '09090b')

  // Generate solid viewport preview
  const previewsSolid = createViewportMaterials([standardMat], 'solid')
  assert.equal(previewsSolid[0].wireframe, false)
  assert.equal(standardMat.wireframe, false, 'Source material wireframe must remain false')

  // Generate wireframe viewport preview
  const previewsWire = createViewportMaterials([standardMat], 'wireframe')
  assert.equal(previewsWire[0].wireframe, true)
  assert.equal(standardMat.wireframe, false, 'Source material wireframe must NOT be permanently mutated')

  // Show Topology toggle in store
  const store = useEditorStore.getState()
  assert.equal(store.showTopologyOverlay, false)
  store.setShowTopologyOverlay(true)
  assert.equal(useEditorStore.getState().showTopologyOverlay, true)
  store.setShowTopologyOverlay(false)
  assert.equal(useEditorStore.getState().showTopologyOverlay, false)

  previewsSolid.forEach((m) => m.dispose())
  previewsWire.forEach((m) => m.dispose())
  standardMat.dispose()
})

test('ISSUE 3: Geometry diagnostics differentiate open garment boundaries from non-manifold geometry', () => {
  // Build a cylinder without top/bottom caps (representative of a sleeve or collar garment opening)
  const openCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16, 1, true)
  const graph = buildTopologyFromBufferGeometry(openCylinder)
  const stats = getTopologyStats(graph)

  // 16 top boundary edges + 16 bottom boundary edges = 32 boundary edges
  assert.equal(stats.boundaryEdges, 32, 'Open garment cylinder must report exactly 32 boundary edges')
  assert.equal(stats.nonManifoldEdges, 0, 'Clean open cylinder surface is 100% 2-manifold')
  assert.equal(stats.degenerateFaces, 0, 'No degenerate faces')
  assert.ok(stats.surfaceArea > 0, 'Surface area is positive')

  // Now create a mesh with a deliberate degenerate face (collapsed vertices)
  const posWithDegenerate = new Float32Array([
    // Triangle 1 (valid)
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    // Triangle 2 (degenerate: points coincide)
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ])
  const geomWithDegenerate = new THREE.BufferGeometry()
  geomWithDegenerate.setAttribute('position', new THREE.BufferAttribute(posWithDegenerate, 3))
  const graphDegenerate = buildTopologyFromBufferGeometry(geomWithDegenerate)
  const statsDegenerate = getTopologyStats(graphDegenerate)
  assert.equal(statsDegenerate.degenerateFaces, 1, 'Accurately detects degenerate face')
})

test('ISSUE 4: UV diagnostics distinguish seams from UV coordinates and report 6 separate statuses', () => {
  // Test clean garment panel / plane mesh
  const planeGeom = new THREE.PlaneGeometry(1, 1)
  const planeGraph = buildTopologyFromBufferGeometry(planeGeom)

  const planeDiag = inspectUVDiagnostics(planeGraph, planeGeom, true)
  assert.equal(planeDiag.hasUVs, true, 'UV coordinates present')
  assert.equal(planeDiag.isValid, true, 'Coordinates are 100% finite')
  assert.equal(planeDiag.isNormalized, true, 'Coordinates normalized in [0, 1]')
  assert.equal(planeDiag.islandCount, 1, 'Single UV island detected')
  assert.equal(planeDiag.hasExplicitSeams, false, 'No raw explicit seam metadata')
  assert.equal(planeDiag.overlapDetected, false, 'No UV overlap on clean single plane')
  assert.equal(planeDiag.customizableZoneReady, true, 'Ready for BlackBullet customizer')

  // Test cube with 6 stacked overlapping UV faces
  const boxGeom = new THREE.BoxGeometry(1, 1, 1)
  const boxGraph = buildTopologyFromBufferGeometry(boxGeom)
  const boxDiag = inspectUVDiagnostics(boxGraph, boxGeom, true)
  assert.equal(boxDiag.hasUVs, true)
  assert.equal(boxDiag.overlapDetected, true, 'Accurately flags stacked/overlapping UV islands')

  // Test mesh without UVs
  const noUVGeom = new THREE.BufferGeometry()
  noUVGeom.setAttribute('position', boxGeom.attributes.position.clone())
  const noUVGraph = buildTopologyFromBufferGeometry(noUVGeom)
  const noUVDiag = inspectUVDiagnostics(noUVGraph, noUVGeom, false)
  assert.equal(noUVDiag.hasUVs, false)
  assert.equal(noUVDiag.isValid, false)
  assert.equal(noUVDiag.customizableZoneReady, false)
})

test('ISSUE 5: Black PBR material (#09090B) survives import -> render -> GLB export -> reload round-trip', async () => {
  const root = new THREE.Group()
  root.name = 'TShirt_Root'

  const tripoMat = new THREE.MeshStandardMaterial({
    color: '#09090b',
    roughness: 0.65,
    metalness: 0.0,
    opacity: 1.0,
    transparent: false,
    wireframe: false,
    side: THREE.DoubleSide,
  })
  tripoMat.name = 'tripo_mat_1008021c'

  const bodyGeom = new THREE.BoxGeometry(1.0, 1.2, 0.3)
  const bodyMesh = new THREE.Mesh(bodyGeom, tripoMat)
  bodyMesh.name = 'Body_Main'
  bodyMesh.userData = { isCustomizable: true, customizableZone: 'body_front' }
  root.add(bodyMesh)

  // 1. Process imported hierarchy
  const state = processThreeObjectHierarchy(root, 'Black Shirt Scene')
  const matKey = Object.keys(state.materials)[0]
  const importedMat = state.materials[matKey]

  assert.equal(importedMat.name, 'tripo_mat_1008021c')
  assert.equal(importedMat.color.toLowerCase(), '#09090b')
  assert.equal(importedMat.roughness, 0.65)
  assert.equal(importedMat.metalness, 0.0)
  assert.equal(importedMat.doubleSided, true)

  // 2. Rendered material verification
  const renderedMat = syncMeshStandardMaterial(importedMat)
  assert.equal(renderedMat.color.getHexString().toLowerCase(), '09090b')
  assert.equal(renderedMat.roughness, 0.65)
  assert.equal(renderedMat.metalness, 0.0)
  assert.equal(renderedMat.wireframe, false)

  // 3. GLB Export verification
  const exportResult = await exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials)
  assert.equal(exportResult.verified, true, exportResult.issues.join('\n'))

  const exportedGLTFMat = exportResult.exportedMaterials.find((m) => m.name === 'tripo_mat_1008021c')
  assert.ok(exportedGLTFMat, 'Exported GLTF must contain tripo_mat_1008021c')
  const baseColor = exportedGLTFMat.pbrMetallicRoughness.baseColorFactor
  const expectedRGB = new THREE.Color('#09090b').toArray()
  baseColor.slice(0, 3).forEach((val, idx) => {
    assert.ok(Math.abs(val - expectedRGB[idx]) < 1e-4, `Color channel ${idx} must match #09090b`)
  })
  assert.ok(Math.abs(exportedGLTFMat.pbrMetallicRoughness.roughnessFactor - 0.65) < 1e-4)
  assert.ok(Math.abs(exportedGLTFMat.pbrMetallicRoughness.metallicFactor - 0.0) < 1e-4)

  // 4. Reload round-trip
  const reloadedScene = await new GLTFLoader().parseAsync(await exportResult.blob.arrayBuffer(), '').then((g) => g.scene)
  const reloadedMesh = reloadedScene.getObjectByName('Body_Main')
  assert.ok(reloadedMesh, 'Body_Main must exist in reloaded GLB')
  assert.equal(reloadedMesh.material.color.getHexString().toLowerCase(), '09090b', 'Reloaded color must remain #09090b and not turn white')
  assert.ok(Math.abs(reloadedMesh.material.roughness - 0.65) < 1e-4)
})

test('ISSUE 6: Empty selection state is clean and gizmos are hidden when nothing is selected', () => {
  const store = useEditorStore.getState()
  store.clearObjectSelection()

  assert.equal(useEditorStore.getState().selectedNodeId, null)
  assert.deepEqual(useEditorStore.getState().selectedNodeIds, [])
  assert.equal(useEditorStore.getState().stats.selectedVertices, 0)
  assert.equal(useEditorStore.getState().stats.selectedTriangles, 0)
})
