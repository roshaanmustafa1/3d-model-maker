import test from 'node:test'
import assert from 'node:assert/strict'
import { createTShirtScene, CATALOG_PRODUCTS } from '../../engine/customization/product-catalog.ts'
import { inspectModelForCustomization, detectMeshUVOverlap } from '../../engine/customization/zone-mapper.ts'
import { createBufferGeometry } from '../../engine/scene/primitive-factory.ts'
import { useCustomizerStore } from '../../stores/customizer-store.ts'
import { sanitizeSvgContent } from '../../engine/customization/svg-sanitizer.ts'

test('P3 regression: catalog must warn when its box UV surfaces overlap', () => {
  const scene = createTShirtScene()
  const body = Object.values(scene.nodes).find(n => n.name === 'Body_Main')
  const geometry = createBufferGeometry(body.geometry.type, body.geometry.params, body.geometry.customGeometryKey)
  const detected = detectMeshUVOverlap(geometry)
  assert.equal(detected.hasOverlap, true, 'fixture actually contains overlapping UV charts')
  assert.equal(inspectModelForCustomization(scene.nodes, scene.materials).hasOverlappingUVs, true, 'readiness diagnostics must propagate overlap warning')
})

test('P3 regression: imported front/back UV zones must use authored atlas bounds', () => {
  useCustomizerStore.getState().loadCustomModel('UV shirt', 't-shirt', [{ id: 'front', name: 'shirt_front', customizableZone: 'body_front' }, { id: 'back', name: 'shirt_back', customizableZone: 'body_back' }])
  const zones = Object.values(useCustomizerStore.getState().zones)
  assert.notDeepEqual(zones[0].uvBounds, zones[1].uvBounds, 'independent authored front/back islands cannot both default to the full atlas')
})

test('P3 regression: malformed SVG must be rejected before adding an image layer', () => {
  assert.throws(() => sanitizeSvgContent('<svg><path invalid'), /invalid|malformed/i)
})

test('P3 security: SVG entity-encoded javascript links must be removed', () => {
  const output = sanitizeSvgContent('<svg><a href="&#106;avascript:alert(1)"><text>X</text></a></svg>')
  assert.doesNotMatch(output, /href=/i)
})

test('P3 control: real layer state, ordering and consecutive undo/redo remain valid', () => {
  const store = useCustomizerStore.getState()
  store.loadProduct(CATALOG_PRODUCTS[0].product)
  const base = { name: 'test', type: 'shape', shapeType: 'rectangle', fill: '#ff0000', stroke: '#000000', strokeWidth: 0, x: 10, y: 20, width: 100, height: 80, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, visible: true, locked: false }
  const first = store.addLayer('body_front', base)
  const second = store.addLayer('body_front', { ...base, name: 'second' })
  store.reorderLayers('body_front', 0, 1)
  assert.deepEqual(useCustomizerStore.getState().zones.body_front.layers.map(l => l.id), [second, first])
  store.updateLayer('body_front', first, { x: 55, rotation: 90, opacity: .5 }); store.recordHistory()
  store.undo(); assert.equal(useCustomizerStore.getState().zones.body_front.layers[1].x, 10)
  store.redo(); assert.equal(useCustomizerStore.getState().zones.body_front.layers[1].x, 55)
})
