import * as THREE from 'three'
import { CustomizableProduct, DesignZone, ProductCategory } from '@/types/customization'
import { SceneNode, MaterialData } from '@/types/scene'
import { processThreeObjectHierarchy, ImportResult } from '@/engine/loaders/model-importer'
import { isolatedBoxUVs, isolatedCylinderUVs, splitTorso } from './catalog-surfaces'

export interface CatalogProductDefinition {
  product: CustomizableProduct
  generateScene: () => ImportResult
}

export function createTShirtScene(): ImportResult {
  const root = new THREE.Group()
  root.name = 'TShirt_Product'

  const fabric = new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.92,
    metalness: 0.0,
  })
  fabric.name = 'Combed Cotton'

  // Main Torso
  const bodyGeo = new THREE.BoxGeometry(1.2, 1.5, 0.28, 4, 4, 2)
  root.add(...splitTorso(bodyGeo, fabric))

  // Collar / Neck Rib
  const collarGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.08, 24)
  collarGeo.rotateX(Math.PI / 2)
  const collarMesh = new THREE.Mesh(collarGeo, fabric)
  collarMesh.name = 'Collar_Rib'
  collarMesh.position.set(0, 0.76, 0)
  collarMesh.userData = {
    partId: 'collar',
    isCustomizable: false,
    semanticTag: 'Collar_Rib',
  }
  root.add(collarMesh)

  // Left Sleeve
  const sleeveLGeo = new THREE.BoxGeometry(0.55, 0.45, 0.26)
  isolatedBoxUVs(sleeveLGeo)
  const sleeveL = new THREE.Mesh(sleeveLGeo, fabric.clone())
  sleeveL.name = 'Sleeve_Left'
  sleeveL.position.set(-0.84, 0.52, 0)
  sleeveL.rotation.set(0, 0, 0.2)
  sleeveL.userData = {
    partId: 'shoulder_left',
    isCustomizable: true,
    customizableZone: 'sleeve_left',
    semanticTag: 'Sleeve_Left',
  }
  root.add(sleeveL)

  // Right Sleeve
  const sleeveRGeo = new THREE.BoxGeometry(0.55, 0.45, 0.26)
  isolatedBoxUVs(sleeveRGeo)
  const sleeveR = new THREE.Mesh(sleeveRGeo, fabric.clone())
  sleeveR.name = 'Sleeve_Right'
  sleeveR.position.set(0.84, 0.52, 0)
  sleeveR.rotation.set(0, 0, -0.2)
  sleeveR.userData = {
    partId: 'shoulder_right',
    isCustomizable: true,
    customizableZone: 'sleeve_right',
    semanticTag: 'Sleeve_Right',
  }
  root.add(sleeveR)

  return processThreeObjectHierarchy(root, 'Streetwear Oversized Tee')
}

export function createHoodieScene(): ImportResult {
  const root = new THREE.Group()
  root.name = 'Hoodie_Product'

  const fleece = new THREE.MeshStandardMaterial({
    color: '#27272a',
    roughness: 0.96,
    metalness: 0.0,
  })
  fleece.name = 'Heavy Fleece'

  // Main Torso
  const bodyGeo = new THREE.BoxGeometry(1.3, 1.6, 0.35, 4, 4, 2)
  root.add(...splitTorso(bodyGeo, fleece))

  // Kangaroo Pouch
  const pouchGeo = new THREE.BoxGeometry(0.75, 0.45, 0.08)
  isolatedBoxUVs(pouchGeo)
  const pouchMesh = new THREE.Mesh(pouchGeo, fleece)
  pouchMesh.name = 'Pocket_Pouch'
  pouchMesh.position.set(0, -0.3, 0.19)
  pouchMesh.userData = {
    isCustomizable: true,
    customizableZone: 'pocket_front',
    semanticTag: 'Pocket_Pouch',
  }
  root.add(pouchMesh)

  // Hood
  const hoodGeo = new THREE.SphereGeometry(0.42, 16, 16)
  const hoodMesh = new THREE.Mesh(hoodGeo, fleece)
  hoodMesh.name = 'Hood'
  hoodMesh.position.set(0, 0.95, -0.05)
  hoodMesh.scale.set(1.0, 1.2, 1.1)
  hoodMesh.userData = {
    isCustomizable: true,
    customizableZone: 'hood',
    semanticTag: 'Hood',
  }
  root.add(hoodMesh)

  // Left Sleeve
  const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.3), fleece)
  isolatedBoxUVs(sleeveL.geometry)
  sleeveL.name = 'Sleeve_Left'
  sleeveL.position.set(-0.92, 0.52, 0)
  sleeveL.rotation.set(0, 0, 0.25)
  sleeveL.userData = {
    isCustomizable: true,
    customizableZone: 'sleeve_left',
    semanticTag: 'Sleeve_Left',
  }
  root.add(sleeveL)

  // Right Sleeve
  const sleeveR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.3), fleece)
  isolatedBoxUVs(sleeveR.geometry)
  sleeveR.name = 'Sleeve_Right'
  sleeveR.position.set(0.92, 0.52, 0)
  sleeveR.rotation.set(0, 0, -0.25)
  sleeveR.userData = {
    isCustomizable: true,
    customizableZone: 'sleeve_right',
    semanticTag: 'Sleeve_Right',
  }
  root.add(sleeveR)

  return processThreeObjectHierarchy(root, 'Heavyweight Streetwear Hoodie')
}

export function createWaterBottleScene(): ImportResult {
  const root = new THREE.Group()
  root.name = 'WaterBottle_Product'

  const metalMat = new THREE.MeshStandardMaterial({
    color: '#e4e4e7',
    roughness: 0.28,
    metalness: 0.88,
  })
  metalMat.name = 'Brushed Stainless'

  const capMat = new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.6,
    metalness: 0.1,
  })
  capMat.name = 'Poly Cap'

  // Bottle Body
  const bottleGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.8, 32)
  isolatedCylinderUVs(bottleGeo)
  const bottleMesh = new THREE.Mesh(bottleGeo, metalMat)
  bottleMesh.name = 'Bottle_Body'
  bottleMesh.position.set(0, 0, 0)
  bottleMesh.userData = {
    customizationTarget: { uvBounds: { minU: 0, maxU: .8, minV: 0, maxV: 1 } },
    isCustomizable: true,
    customizableZone: 'body_front',
    semanticTag: 'Bottle_Body',
  }
  root.add(bottleMesh)

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.2, 0.36, 0.3, 32)
  const neckMesh = new THREE.Mesh(neckGeo, metalMat)
  neckMesh.name = 'Bottle_Neck'
  neckMesh.position.set(0, 1.0, 0)
  neckMesh.userData = { isCustomizable: false }
  root.add(neckMesh)

  // Cap
  const capGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.25, 32)
  const capMesh = new THREE.Mesh(capGeo, capMat)
  capMesh.name = 'Bottle_Cap'
  capMesh.position.set(0, 1.25, 0)
  capMesh.userData = { isCustomizable: false }
  root.add(capMesh)

  return processThreeObjectHierarchy(root, 'Insulated Thermal Bottle')
}

export function createPackagingBoxScene(): ImportResult {
  const root = new THREE.Group()
  root.name = 'PackagingBox_Product'

  const cardboardMat = new THREE.MeshStandardMaterial({
    color: '#d4d4d8',
    roughness: 0.82,
    metalness: 0.0,
  })
  cardboardMat.name = 'Kraft Cardboard'

  const boxGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2)
  isolatedBoxUVs(boxGeo)
  const boxMesh = new THREE.Mesh(boxGeo, cardboardMat)
  boxMesh.name = 'Package_Box'
  boxMesh.position.set(0, 0, 0)
  boxMesh.userData = {
    isCustomizable: true,
    customizableZone: 'body_front',
    semanticTag: 'Package_Box',
  }
  root.add(boxMesh)

  return processThreeObjectHierarchy(root, 'Luxury Retail Box')
}

export const CATALOG_PRODUCTS: CatalogProductDefinition[] = [
  {
    product: {
      id: 't-shirt-oversized',
      name: 'Streetwear Oversized Tee',
      category: 't-shirt',
      thumbnailUrl: '',
      sourceType: 'preset',
      defaultFabricPreset: 'cotton-heavyweight',
      description: 'Heavyweight boxy drop-shoulder silhouette with front, back, and sleeve print zones.',
      defaultZones: [
        {
          id: 'body_front',
          name: 'Front Chest',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
          recommendedDimensions: { width: 350, height: 450, unit: 'mm' },
        },
        {
          id: 'body_back',
          name: 'Back Center',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
          recommendedDimensions: { width: 380, height: 480, unit: 'mm' },
        },
        {
          id: 'sleeve_left',
          name: 'Left Sleeve',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
          recommendedDimensions: { width: 100, height: 100, unit: 'mm' },
        },
        {
          id: 'sleeve_right',
          name: 'Right Sleeve',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
          recommendedDimensions: { width: 100, height: 100, unit: 'mm' },
        },
      ],
    },
    generateScene: createTShirtScene,
  },
  {
    product: {
      id: 'hoodie-heavyweight',
      name: 'Heavyweight Streetwear Hoodie',
      category: 'hoodie',
      thumbnailUrl: '',
      sourceType: 'preset',
      defaultFabricPreset: 'fleece-400gsm',
      description: '400 GSM brushed fleece with double-layer hood, front kangaroo pouch, and sleeve graphics.',
      defaultZones: [
        {
          id: 'body_front',
          name: 'Front Chest',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
        {
          id: 'body_back',
          name: 'Back Center',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
        {
          id: 'pocket_front',
          name: 'Kangaroo Pouch',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
        {
          id: 'hood',
          name: 'Hood Center',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
        {
          id: 'sleeve_left',
          name: 'Left Sleeve',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
        {
          id: 'sleeve_right',
          name: 'Right Sleeve',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
      ],
    },
    generateScene: createHoodieScene,
  },
  {
    product: {
      id: 'water-bottle-stainless',
      name: 'Insulated Thermal Bottle',
      category: 'bottle',
      thumbnailUrl: '',
      sourceType: 'preset',
      defaultFabricPreset: 'brushed-aluminum',
      description: 'Double-wall vacuum insulated stainless steel water bottle with 360 wrap placement.',
      defaultZones: [
        {
          id: 'body_front',
          name: 'Full Body Wrap',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
      ],
    },
    generateScene: createWaterBottleScene,
  },
  {
    product: {
      id: 'packaging-box-kraft',
      name: 'Luxury Retail Box',
      category: 'box',
      thumbnailUrl: '',
      sourceType: 'preset',
      defaultFabricPreset: 'duck-canvas',
      description: 'Rigid setup box with customizable top lid and side panels.',
      defaultZones: [
        {
          id: 'body_front',
          name: 'Top Lid & Sides',
          targetMeshNodeId: '',
          materialSlotIndex: 0,
          uvBounds: { minU: 0.0, maxU: 1.0, minV: 0.0, maxV: 1.0 },
          canvasWidth: 1024,
          canvasHeight: 1024,
          layers: [],
          enabled: true,
        },
      ],
    },
    generateScene: createPackagingBoxScene,
  },
]
