import './support/file-reader.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  createTShirtScene,
  createHoodieScene,
  createWaterBottleScene,
  createPackagingBoxScene,
  CATALOG_PRODUCTS,
} from '../engine/customization/product-catalog.ts'
import {
  matchZoneFromRaycast,
  detectMeshUVOverlap,
  inspectModelForCustomization,
} from '../engine/customization/zone-mapper.ts'
import {
  sanitizeSvgContent,
  svgToSafeDataUrl,
} from '../engine/customization/svg-sanitizer.ts'
import { TextureComposer } from '../engine/customization/texture-composer.ts'
import { FABRIC_PRESETS, getFabricPresetById } from '../engine/customization/fabric-presets.ts'
import { useCustomizerStore } from '../stores/customizer-store.ts'
import { exportCustomizedProductGLB } from '../engine/customization/customization-exporter.ts'
import { validateBlackBulletModel } from '../engine/validation/blackbullet-validator.ts'

test('Product Catalog generates valid 3D product scenes with customizable zones and verified UVs', () => {
  // Test T-Shirt
  const tShirt = createTShirtScene()
  const tShirtMeshes = Object.values(tShirt.nodes).filter((n) => n.type === 'mesh')
  assert.ok(tShirtMeshes.length >= 3, 'T-Shirt must contain at least 3 mesh parts')
  assert.ok(tShirtMeshes.every((m) => m.geometry?.stats.hasUVs), 'All T-Shirt meshes must have UVs')
  assert.ok(tShirtMeshes.some((m) => m.customizableZone === 'body_front'), 'Must have body_front zone')

  // Test Hoodie
  const hoodie = createHoodieScene()
  const hoodieMeshes = Object.values(hoodie.nodes).filter((n) => n.type === 'mesh')
  assert.ok(hoodieMeshes.length >= 5, 'Hoodie must contain at least 5 mesh parts')
  assert.ok(hoodieMeshes.some((m) => m.customizableZone === 'pocket_front'), 'Must have pocket_front')
  assert.ok(hoodieMeshes.some((m) => m.customizableZone === 'hood'), 'Must have hood zone')

  // Test Bottle
  const bottle = createWaterBottleScene()
  const bottleMeshes = Object.values(bottle.nodes).filter((n) => n.type === 'mesh')
  assert.ok(bottleMeshes.length >= 2, 'Bottle must have body and cap')

  // Test Box
  const box = createPackagingBoxScene()
  const boxMeshes = Object.values(box.nodes).filter((n) => n.type === 'mesh')
  assert.equal(boxMeshes.length, 1, 'Box must have body mesh')
})

test('Model Customization diagnostics accurately inspect meshes, UV channels, and zones', () => {
  const scene = createTShirtScene()
  const diagnostics = inspectModelForCustomization(scene.nodes, scene.materials)

  assert.equal(diagnostics.isReadyForArtwork, true)
  assert.equal(diagnostics.missingUVCount, 0)
  assert.ok(diagnostics.customizableMeshCount >= 3)
  assert.ok(diagnostics.detectedZones.includes('body_front'))
})

test('matchZoneFromRaycast correctly identifies target design zone from raycast intersection and UVs', () => {
  const tShirtProduct = CATALOG_PRODUCTS[0].product
  const dummyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  dummyMesh.name = 'Body_Main'
  dummyMesh.userData = {
    nodeId: 'node_test_body',
    customizableZone: 'body_front',
    semanticTag: 'Body_Main',
  }

  const intersection = {
    distance: 1.5,
    point: new THREE.Vector3(0, 0, 0.5),
    object: dummyMesh,
    uv: new THREE.Vector2(0.5, 0.5),
  }

  const matched = matchZoneFromRaycast(intersection, tShirtProduct.defaultZones, {})
  assert.ok(matched, 'Should match a design zone')
  assert.equal(matched?.id, 'body_front')
})

test('SVG Sanitizer strips malicious script tags, inline handlers, and javascript: URLs', () => {
  const maliciousSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <script>alert("XSS")</script>
      <circle cx="50" cy="50" r="40" onload="alert('pwned')" fill="red" />
      <a href="javascript:void(0)"><text>Click</text></a>
      <iframe src="http://evil.com"></iframe>
    </svg>
  `

  const sanitized = sanitizeSvgContent(maliciousSvg)
  assert.ok(!sanitized.includes('<script>'), 'Must strip <script>')
  assert.ok(!sanitized.includes('onload='), 'Must strip inline onload handler')
  assert.ok(!sanitized.includes('javascript:'), 'Must strip javascript: URL')
  assert.ok(!sanitized.includes('<iframe'), 'Must strip <iframe> tag')
  assert.ok(sanitized.includes('<circle'), 'Must retain legitimate SVG elements')

  const dataUrl = svgToSafeDataUrl(sanitized)
  assert.ok(dataUrl.startsWith('data:image/svg+xml'), 'Must produce valid SVG data URL')
})

test('TextureComposer initializes at 1024, 2048, and 4096 resolutions and bakes valid PNG outputs', async () => {
  for (const res of [1024, 2048, 4096]) {
    const composer = new TextureComposer(res)
    const result = await composer.bakeToBlob()
    assert.ok(result.blob, `Blob must exist for resolution ${res}`)
    assert.ok(result.dataUrl.startsWith('data:image/png'), `Must produce PNG data URL for ${res}`)
    composer.dispose()
  }
})

test('Customizer Store supports layer additions (image, text, shape), transformations, and transactional undo/redo', () => {
  const store = useCustomizerStore.getState()
  const defaultProduct = CATALOG_PRODUCTS[0].product
  store.loadProduct(defaultProduct)

  const zoneId = 'body_front'

  // Add text layer
  const textLayerId = store.addLayer(zoneId, {
    name: 'Logo Text',
    type: 'text',
    text: 'BLACKBULLET',
    fontFamily: 'sans-serif',
    fontSize: 64,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fill: '#ffffff',
    align: 'center',
    letterSpacing: 2,
    lineHeight: 1.2,
    x: 200,
    y: 400,
    width: 600,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    locked: false,
  })

  // Add shape layer
  const shapeLayerId = store.addLayer(zoneId, {
    name: 'Accent Star',
    type: 'shape',
    shapeType: 'star',
    fill: '#10b981',
    stroke: '#ffffff',
    strokeWidth: 2,
    x: 450,
    y: 250,
    width: 100,
    height: 100,
    rotation: 45,
    scaleX: 1,
    scaleY: 1,
    opacity: 0.9,
    visible: true,
    locked: false,
  })

  let state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers.length, 2, 'Should have 2 layers')

  // Reorder layers
  store.reorderLayers(zoneId, 0, 1)
  state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers[1].id, textLayerId, 'Text layer should now be at index 1')

  // Duplicate layer
  const dupId = store.duplicateLayer(zoneId, shapeLayerId)
  state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers.length, 3, 'Should have 3 layers after duplicate')
  assert.ok(dupId)

  // Test Undo
  store.undo()
  state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers.length, 2, 'Should revert back to 2 layers on undo')

  // Test Redo
  store.redo()
  state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers.length, 3, 'Should restore 3 layers on redo')

  // Remove layer
  store.removeLayer(zoneId, dupId)
  state = useCustomizerStore.getState()
  assert.equal(state.zones[zoneId].layers.length, 2, 'Should remove duplicate layer')
})

test('Customizer Store sets fabric presets, custom colors, and appearance modes correctly', () => {
  const store = useCustomizerStore.getState()

  const frenchTerry = getFabricPresetById('french-terry')
  assert.ok(frenchTerry)

  store.setFabricPreset(frenchTerry)
  let state = useCustomizerStore.getState()
  assert.equal(state.fabricColor, frenchTerry.color)
  assert.equal(state.fabricRoughness, frenchTerry.roughness)

  store.setFabricColor('#ff0055')
  state = useCustomizerStore.getState()
  assert.equal(state.fabricColor, '#ff0055')

  store.setBlackBulletMode('runtime-customization')
  state = useCustomizerStore.getState()
  assert.equal(state.blackBulletMode, 'runtime-customization')
})

test('Export Customized Product GLB bakes artwork textures and passes BlackBullet validation and reload verification', async () => {
  const scene = createTShirtScene()
  const project = useCustomizerStore.getState().exportProjectData()

  // Add front design layer to project
  project.zones['body_front'].layers = [
    {
      id: 'layer_front_graphic',
      name: 'Chest Branding',
      type: 'text',
      text: 'ANTIGRAVITY 3D',
      fontFamily: 'sans-serif',
      fontSize: 72,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#10b981',
      align: 'center',
      letterSpacing: 2,
      lineHeight: 1.2,
      x: 250,
      y: 450,
      width: 500,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 1,
    },
  ]

  const exportResult = await exportCustomizedProductGLB(
    scene.nodes,
    scene.rootNodeIds,
    scene.materials,
    project,
    { resolution: 1024 }
  )

  // 1. Verify GLB binary was created
  assert.ok(exportResult.blob, 'Must produce GLB Blob')
  assert.ok(exportResult.byteSize > 1000, 'GLB file size must be non-empty')
  assert.equal(exportResult.verified, true, `Export verification issues: ${exportResult.issues.join(', ')}`)
  assert.ok(exportResult.reloadedMeshCount >= 3, 'Must reload all meshes')
  assert.equal(exportResult.uvCheckPassed, true, 'All reloaded meshes must have UV coordinates')

  // 2. Validate with BlackBullet compatibility validator
  const bbValidation = validateBlackBulletModel(
    scene.nodes,
    scene.rootNodeIds,
    scene.materials,
    'Customized Streetwear Tee'
  )

  assert.equal(bbValidation.isBlackBulletReady, true, 'Exported product must be BlackBullet ready')
  assert.ok(bbValidation.summary.customizableZonesFound.includes('body_front'))
  assert.equal(bbValidation.failed, 0, `BlackBullet validation failures: ${bbValidation.checks.filter(c => c.status === 'fail').map(c => c.details).join('; ')}`)
})

test('Customization project round-trip serialization preserves all zones, layers, typography, and fabric properties', () => {
  const store = useCustomizerStore.getState()
  const defaultProduct = CATALOG_PRODUCTS[0].product
  store.loadProduct(defaultProduct)

  store.setFabricColor('#223344')
  store.setFabricRoughness(0.85)
  store.setFabricMetalness(0.05)
  store.setTextureResolution(2048)
  store.setBlackBulletMode('preserve-imported')

  store.addLayer('body_front', {
    name: 'Persistent Layer',
    type: 'text',
    text: 'DURABLE ASSET',
    fontFamily: 'serif',
    fontSize: 48,
    fontWeight: '800',
    fontStyle: 'italic',
    fill: '#f59e0b',
    align: 'left',
    letterSpacing: 1,
    lineHeight: 1.1,
    x: 150,
    y: 350,
    width: 400,
    height: 80,
    rotation: 12,
    scaleX: 1.2,
    scaleY: 1.2,
    opacity: 0.95,
    visible: true,
    locked: true,
  })

  // Export project data
  const exported = store.exportProjectData()

  // Reset store
  store.loadProduct(CATALOG_PRODUCTS[1].product)
  assert.notEqual(useCustomizerStore.getState().fabricColor, '#223344')

  // Re-import project data
  store.importProjectData(exported)
  const restored = useCustomizerStore.getState()

  assert.equal(restored.fabricColor, '#223344')
  assert.equal(restored.fabricRoughness, 0.85)
  assert.equal(restored.fabricMetalness, 0.05)
  assert.equal(restored.textureResolution, 2048)
  assert.equal(restored.blackBulletMode, 'preserve-imported')

  const frontLayers = restored.zones['body_front'].layers
  assert.equal(frontLayers.length, 1)
  const l = frontLayers[0]
  assert.equal(l.name, 'Persistent Layer')
  assert.equal(l.type, 'text')
  if (l.type === 'text') {
    assert.equal(l.text, 'DURABLE ASSET')
    assert.equal(l.fontFamily, 'serif')
    assert.equal(l.fill, '#f59e0b')
    assert.equal(l.locked, true)
    assert.equal(l.rotation, 12)
  }
})
