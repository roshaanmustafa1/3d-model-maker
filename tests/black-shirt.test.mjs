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

import { blackShirt } from './support/black-shirt.mjs'

const build = (state) => buildThreeSceneFromNodes(state.nodes, state.rootNodeIds, state.materials)
const exportState = (state) => exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials)
const reload = (buffer) => new GLTFLoader().parseAsync(buffer, '').then((gltf) => gltf.scene)

test('black T-shirt GLB import → editor → export preserves fabric, hierarchy, normals, UVs and transforms', () => {
  const state = blackShirt()
  return exportState(state).then((first) => {
    assert.equal(first.verified, true, first.issues.join('\n'))
    assert.equal(first.reloadedMeshCount, 3)
    const material = first.exportedMaterials.find((entry) => entry.name === 'Matte Black Cotton')
    const factor = new THREE.Color('#111111').toArray()
    material.pbrMetallicRoughness.baseColorFactor.slice(0, 3).forEach((value, index) => assert.ok(Math.abs(value - factor[index]) < 1e-6))
    assert.equal(material.pbrMetallicRoughness.roughnessFactor, 0.85)
    assert.equal(material.pbrMetallicRoughness.metallicFactor, 0)
    return first.blob.arrayBuffer()
  }).then((buffer) => parseGLTF(buffer, 'Imported Black T-shirt')).then((imported) => {
    assert.equal(Object.values(imported.nodes).filter((node) => node.type === 'mesh').length, 3)
    assert.equal(Object.values(imported.materials)[0].color, '#111111')
    return exportState(imported).then((second) => {
      assert.equal(second.verified, true, second.issues.join('\n'))
      return second.blob.arrayBuffer()
    }).then(reload).then((scene) => {
      assert.deepEqual(compareSceneRoundTrip(build(imported), scene).errors, [])
      assert.deepEqual(inspectScene(scene).errors, [])
    })
  })
})

test('all viewport modes preserve every material slot and never mutate source materials or geometry', () => {
  const state = blackShirt()
  const data = Object.values(state.materials)[0]
  data.wireframe = true
  const source = syncMeshStandardMaterial(data)
  const texture = new THREE.Texture()
  texture.colorSpace = THREE.SRGBColorSpace
  source.map = texture
  for (const mode of ['solid', 'wireframe', 'material', 'normal', 'solid']) {
    const previews = createViewportMaterials([source, source], mode)
    assert.equal(previews.length, 2)
    assert.equal(previews[0].wireframe, mode === 'wireframe')
    assert.equal(source.wireframe, false)
    assert.equal(source.color.getHexString(), '111111')
    assert.equal(source.map, texture)
    previews.forEach((material) => material.dispose())
  }
})

test('multi-material groups retain their distinct colors and remain triangle primitives', () => {
  const root = new THREE.Group()
  root.name = 'Shirt'
  const a = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.85, metalness: 0 })
  const b = new THREE.MeshStandardMaterial({ color: '#225588', roughness: 0.7 })
  a.name = 'Black'; b.name = 'Blue'
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), [a, b])
  mesh.name = 'Body_Main'
  mesh.geometry.groups.forEach((group, index) => { group.materialIndex = index % 2 })
  root.add(mesh)
  const state = processThreeObjectHierarchy(root, 'Multi-material shirt')
  const rebuilt = build(state).getObjectByName('Body_Main')
  assert.equal(rebuilt.material.length, 2)
  return exportState(state).then((result) => {
    assert.equal(result.verified, true, result.issues.join('\n'))
    assert.equal(result.reloadedMeshCount, 6)
    assert.equal(result.exportedMaterials.length, 2)
  })
})

test('imported texture references, physical material class, alpha and side survive reconstruction', () => {
  const material = new THREE.MeshPhysicalMaterial({ color: '#111111', roughness: 0.85, metalness: 0, clearcoat: 0.4, alphaTest: 0.3, side: THREE.DoubleSide })
  material.map = new THREE.Texture()
  material.map.colorSpace = THREE.SRGBColorSpace
  material.normalMap = new THREE.Texture()
  material.roughnessMap = new THREE.Texture()
  material.metalnessMap = material.roughnessMap
  material.map.offset.set(0.2, 0.3)
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material)
  const state = processThreeObjectHierarchy(mesh, 'Textured shirt')
  const rebuilt = build(state).children[0].material
  assert.equal(rebuilt.type, material.type)
  for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) assert.equal(rebuilt[key], material[key])
  assert.equal(rebuilt.alphaTest, 0.3)
  assert.equal(rebuilt.side, THREE.DoubleSide)
  assert.equal(rebuilt.clearcoat, 0.4)
})

test('validator detects material, geometry, transform and hierarchy corruption', () => {
  const state = blackShirt()
  const source = build(state), changed = build(state)
  changed.getObjectByName('Body_Main').material.color.set('#ffffff')
  changed.getObjectByName('Sleeve_Left').position.x += 1
  changed.attach(changed.getObjectByName('Sleeve_Right'))
  const errors = compareSceneRoundTrip(source, changed).errors.join('\n')
  assert.match(errors, /color changed/)
  assert.match(errors, /transform changed/)
  assert.match(errors, /hierarchy changed/)
  const mesh = changed.getObjectByName('Body_Main')
  mesh.scale.x = -1
  mesh.material.wireframe = true
  mesh.geometry.deleteAttribute('uv')
  mesh.geometry.index.setX(1, mesh.geometry.index.getX(0))
  const report = inspectScene(changed)
  assert.match(report.errors.join('\n'), /wireframe/)
  assert.match(report.errors.join('\n'), /missing uv/)
  assert.match(report.errors.join('\n'), /degenerate/)
  assert.match(report.warnings.join('\n'), /negative world determinant/)
})

test('mirrored transforms remain consistent and produce warnings without blanket DoubleSide', () => {
  const state = blackShirt()
  state.nodes[state.rootNodeIds[0]].transform.scale[0] = -1
  return exportState(state).then((result) => {
    assert.equal(result.verified, true, result.issues.join('\n'))
    assert.match(result.warnings.join('\n'), /negative world determinant/)
    assert.ok(result.exportedMaterials.every((material) => material.doubleSided !== true))
  })
})

test('solid surfaces are intersectable from six directions and a full horizontal orbit', () => {
  const scene = build(blackShirt())
  scene.updateMatrixWorld(true)
  const body = scene.getObjectByName('Body_Main')
  const center = body.getWorldPosition(new THREE.Vector3())
  const directions = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)]
  for (let degrees = 0; degrees < 360; degrees += 15) {
    const radians = THREE.MathUtils.degToRad(degrees)
    directions.push(new THREE.Vector3(Math.sin(radians), 0, Math.cos(radians)))
  }
  for (const direction of directions) {
    const origin = center.clone().addScaledVector(direction, 5)
    const ray = new THREE.Raycaster(origin, center.clone().sub(origin).normalize())
    const hits = ray.intersectObject(body)
    assert.ok(hits.length > 0, `Missing surface along ${direction.toArray()}`)
    const originalSide = body.material.side
    body.material.side = THREE.DoubleSide
    assert.ok(ray.intersectObject(body).length >= hits.length)
    body.material.side = originalSide
  }
  assert.equal(body.material.side, THREE.FrontSide)
})

test('selected export retains ancestor transforms without unrelated siblings', () => {
  const state = blackShirt()
  const body = Object.values(state.nodes).find((node) => node.name === 'Body_Main')
  const full = build(state)
  const selected = buildThreeSceneFromNodes(state.nodes, state.rootNodeIds, state.materials, body.id)
  full.updateMatrixWorld(true); selected.updateMatrixWorld(true)
  assert.ok(full.getObjectByName('Body_Main').matrixWorld.equals(selected.getObjectByName('Body_Main').matrixWorld))
  assert.equal(selected.getObjectByName('Sleeve_Left'), undefined)
  return exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials, body.id).then((result) => assert.equal(result.verified, true, result.issues.join('\n')))
})

test('material edits retain precise linear colors and can explicitly remove imported textures', () => {
  const original = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, opacity: 0.6, transparent: false })
  original.color.setRGB(0.0058, 0.0061, 0.0072)
  original.map = new THREE.Texture()
  const state = processThreeObjectHierarchy(new THREE.Mesh(new THREE.BoxGeometry(), original), 'Precise fabric')
  const data = Object.values(state.materials)[0]
  const material = syncMeshStandardMaterial(data)
  assert.deepEqual(material.color.toArray(), original.color.toArray())
  assert.equal(material.transparent, false)
  data.map = null
  assert.equal(syncMeshStandardMaterial(data).map, null)
  data.map = undefined
  assert.equal(syncMeshStandardMaterial(data).map, original.map)
})
