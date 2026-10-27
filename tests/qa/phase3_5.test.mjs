import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createTShirtScene } from '../../engine/customization/product-catalog.ts'
import { createBufferGeometry } from '../../engine/scene/primitive-factory.ts'
import { analyzeUVOverlap } from '../../engine/customization/uv-overlap.ts'
import { bindProduct } from '../../engine/customization/targets.ts'
import { CATALOG_PRODUCTS } from '../../engine/customization/product-catalog.ts'
import { sanitizeSvgContent } from '../../engine/customization/svg-sanitizer.ts'
import { useEditorStore } from '../../stores/editor-store.ts'
import { useCustomizerStore } from '../../stores/customizer-store.ts'
import { validateArtworkFile } from '../../engine/customization/upload-validation.ts'
import { exportCustomizedProductGLB } from '../../engine/customization/customization-exporter.ts'
import { createWaterBottleScene } from '../../engine/customization/product-catalog.ts'

function uvGeometry(uv) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  return geometry
}
test('P3.5 UV analysis excludes coincident edges and finds positive-area mirrored islands', () => {
  assert.equal(analyzeUVOverlap(uvGeometry([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1])).hasOverlap, false)
  const mirrored = analyzeUVOverlap(uvGeometry([0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0]))
  assert.equal(mirrored.hasOverlap, true); assert.equal(mirrored.mirroredCount, 1)
})
test('P3.5 overlapping UVs in different material slots are independently isolated', () => {
  const geometry = uvGeometry([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])
  geometry.addGroup(0, 3, 0); geometry.addGroup(3, 3, 1)
  assert.equal(analyzeUVOverlap(geometry).hasOverlap, true)
  assert.equal(analyzeUVOverlap(geometry, { slot: 0 }).hasOverlap, false)
  assert.equal(analyzeUVOverlap(geometry, { slot: 1 }).hasOverlap, false)
})

test('P3.5 overlap cache invalidates on edited UV attributes and material groups', () => {
  const geometry = uvGeometry([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1])
  assert.equal(analyzeUVOverlap(geometry).hasOverlap, false)
  geometry.attributes.uv.array.set([0, 0, 1, 0, 0, 1], 6)
  geometry.attributes.uv.needsUpdate = true
  assert.equal(analyzeUVOverlap(geometry).hasOverlap, true)
  geometry.addGroup(0, 3, 0); geometry.addGroup(3, 3, 1)
  assert.equal(analyzeUVOverlap(geometry, { slot: 0 }).hasOverlap, false)
  geometry.groups[1].materialIndex = 0
  assert.equal(analyzeUVOverlap(geometry, { slot: 0 }).hasOverlap, true)
})
test('P3.5 torso partition retains every original face, normal and winding exactly once', () => {
  const source = new THREE.BoxGeometry(1.2, 1.5, .28, 4, 4, 2).toNonIndexed()
  function triangles(geometry) {
    const output = []
    for (let i = 0; i < geometry.attributes.position.count; i += 3) output.push([0, 1, 2].flatMap(offset => {
      const index = i + offset
      return [geometry.attributes.position.getX(index), geometry.attributes.position.getY(index), geometry.attributes.position.getZ(index), geometry.attributes.normal.getX(index), geometry.attributes.normal.getY(index), geometry.attributes.normal.getZ(index)]
    }).join(','))
    return output
  }
  const scene = createTShirtScene()
  const parts = Object.values(scene.nodes).filter(node => ['Body_Main', 'Body_Back', 'Body_Sides'].includes(node.name))
  const actual = parts.flatMap(node => triangles(createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)))
  assert.deepEqual(actual.sort(), triangles(source).sort())
  assert.equal(new Set(actual).size, actual.length)
})
test('P3.5 targets resolve exact BlackBullet regions and isolated composition identities', () => {
  const scene = createTShirtScene(), product = bindProduct(CATALOG_PRODUCTS[0].product, scene.nodes)
  assert.equal(product.defaultZones.find(zone => zone.id === 'body_front').target.blackBulletRegion, 'shirt_front')
  assert.equal(product.defaultZones.find(zone => zone.id === 'body_back').target.blackBulletRegion, 'shirt_back')
  assert.equal(new Set(product.defaultZones.map(zone => zone.target.compositionId)).size, 4)
  assert.notDeepEqual(product.defaultZones[0].uvBounds, product.defaultZones[1].uvBounds)
})
test('P3.5 workspace switches retain modeling and customization geometry separately', () => {
  const editor = useEditorStore.getState()
  editor.setActiveWorkspace('editor'); editor.resetScene()
  const before = useEditorStore.getState().nodes
  editor.setActiveWorkspace('customizer')
  const scene = createTShirtScene(); editor.loadImportedScene(scene)
  editor.setActiveWorkspace('editor')
  assert.deepEqual(useEditorStore.getState().nodes, before)
  editor.setActiveWorkspace('customizer')
  assert.deepEqual(useEditorStore.getState().nodes, scene.nodes)
  editor.setActiveWorkspace('editor')
})
test('P3.5 fabric overrides and undo leave original material data unchanged', () => {
  const editor = useEditorStore.getState(), customizer = useCustomizerStore.getState(), scene = createTShirtScene()
  editor.loadImportedScene(scene); customizer.loadProduct(bindProduct(CATALOG_PRODUCTS[0].product, scene.nodes))
  const original = structuredClone(useEditorStore.getState().materials)
  customizer.setFabricColor('#ff0000')
  assert.equal(Object.keys(useCustomizerStore.getState().partMaterials).length, 1)
  assert.deepEqual(useEditorStore.getState().materials, original)
  customizer.undo(); assert.deepEqual(useCustomizerStore.getState().partMaterials, {})
  customizer.redo(); assert.equal(Object.values(useCustomizerStore.getState().partMaterials)[0].color, '#ff0000')
})
test('P3.5 XML sanitizer rejects DTDs and malformed XML and strips external/encoded references', () => {
  assert.throws(() => sanitizeSvgContent('<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///x">]><svg/>'), /Invalid SVG/)
  assert.throws(() => sanitizeSvgContent('<svg><path invalid'), /Invalid SVG/)
  const output = sanitizeSvgContent('<svg><script>x()</script><rect width="10" height="10" onload="x()" fill="url(https://example.invalid/x)"/><image href="https://example.invalid/a"/><a href="&#106;avascript:x()">X</a></svg>')
  assert.doesNotMatch(output, /script|onload|https:|javascript:|<image|<a\b/)
  assert.match(output, /<rect/)
})
test('P3.5 invalid file signatures fail before layer/image creation', async () => {
  await assert.rejects(validateArtworkFile(new File(['not a PNG'], 'broken.png', { type: 'image/png' })), /Invalid image signature/)
})

test('P3.5 legacy circle/star anchors migrate once while version-4 projects remain stable', () => {
  const scene = createTShirtScene(), editor = useEditorStore.getState(), customizer = useCustomizerStore.getState()
  editor.loadImportedScene(scene); customizer.loadProduct(bindProduct(CATALOG_PRODUCTS[0].product, scene.nodes))
  const layer = { name: 'Legacy star', type: 'shape', shapeType: 'star', x: 350, y: 350, width: 300, height: 300, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, visible: true, locked: false, fill: '#10b981', stroke: '#ffffff', strokeWidth: 0 }
  customizer.addLayer('body_front', layer)
  const legacy = customizer.exportProjectData(); legacy.version = 3
  customizer.importProjectData(legacy)
  assert.equal(useCustomizerStore.getState().zones.body_front.layers[0].x, 200)
  const current = customizer.exportProjectData(); assert.equal(current.version, 4)
  customizer.importProjectData(current)
  assert.equal(useCustomizerStore.getState().zones.body_front.layers[0].x, 200)
})

test('P3.5 runtime export rejects products without a registered BlackBullet front/back contract', async () => {
  const scene = createWaterBottleScene(), customizer = useCustomizerStore.getState()
  customizer.loadProduct(bindProduct(CATALOG_PRODUCTS[2].product, scene.nodes))
  const project = customizer.exportProjectData(); project.blackBulletMode = 'runtime-customization'
  await assert.rejects(exportCustomizedProductGLB(scene.nodes, scene.rootNodeIds, scene.materials, project), /No registered BlackBullet/)
})
