import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { SceneNode, MaterialData, Vector3Array, CustomizableZone } from '@/types/scene'
import { registerCustomGeometry, calculateGeometryStats } from '@/engine/scene/primitive-factory'
import { registerImportedMaterial } from '@/engine/scene/material-manager'
import { inspectGlbContainer } from './glb-integrity'

export interface ImportResult {
  nodes: Record<string, SceneNode>
  rootNodeIds: string[]
  materials: Record<string, MaterialData>
  modelName: string
}

function detectCustomizableZone(name: string): CustomizableZone | undefined {
  const lower = name.toLowerCase()
  if (lower.includes('front') || lower.includes('chest')) return 'body_front'
  if (lower.includes('back')) return 'body_back'
  if (lower.includes('sleeve_l') || lower.includes('left_sleeve') || lower.includes('sleeve.l')) return 'sleeve_left'
  if (lower.includes('sleeve_r') || lower.includes('right_sleeve') || lower.includes('sleeve.r')) return 'sleeve_right'
  if (lower.includes('hood')) return 'hood'
  if (lower.includes('pocket')) return 'pocket_front'
  if (lower.includes('collar') || lower.includes('neck')) return 'collar'
  if (lower.includes('cuff_l') || lower.includes('left_cuff')) return 'cuff_left'
  if (lower.includes('cuff_r') || lower.includes('right_cuff')) return 'cuff_right'
  return undefined
}

export async function importModelFile(file: File): Promise<ImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const buffer = await file.arrayBuffer()
  const modelName = file.name.replace(/\.[^/.]+$/, '')

  switch (extension) {
    case 'glb':
      inspectGlbContainer(buffer)
      return parseGLTF(buffer, modelName)
    case 'gltf':
      return parseGLTF(buffer, modelName)
    case 'obj':
      return parseOBJ(buffer, modelName)
    case 'stl':
      return parseSTL(buffer, modelName)
    default:
      throw new Error(`Unsupported file format .${extension}. Supported: .glb, .gltf, .obj, .stl`)
  }
}

export function parseGLTF(data: ArrayBuffer, modelName: string): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.parse(
      data,
      '',
      (gltf) => {
        try {
          const result = processThreeObjectHierarchy(gltf.scene, modelName, true)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      (error) => {
        reject(new Error(`Failed to parse GLTF/GLB: ${error instanceof Error ? error.message : String(error)}`))
      }
    )
  })
}

export function parseOBJ(data: ArrayBuffer, modelName: string): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    try {
      const text = new TextDecoder().decode(data)
      const loader = new OBJLoader()
      const object = loader.parse(text)
      const result = processThreeObjectHierarchy(object, modelName)
      resolve(result)
    } catch (err) {
      reject(new Error(`Failed to parse OBJ: ${err instanceof Error ? err.message : String(err)}`))
    }
  })
}

export function parseSTL(data: ArrayBuffer, modelName: string): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    try {
      const loader = new STLLoader()
      const geometry = loader.parse(data)
      const material = new THREE.MeshStandardMaterial({ color: '#c0c5ce', roughness: 0.4 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = modelName
      const group = new THREE.Group()
      group.name = `${modelName}_Root`
      group.add(mesh)
      const result = processThreeObjectHierarchy(group, modelName)
      resolve(result)
    } catch (err) {
      reject(new Error(`Failed to parse STL: ${err instanceof Error ? err.message : String(err)}`))
    }
  })
}

export function processThreeObjectHierarchy(rootObject: THREE.Object3D, modelName: string, sceneWrapper = false): ImportResult {
  const nodes: Record<string, SceneNode> = {}
  const rootNodeIds: string[] = []
  const materials: Record<string, MaterialData> = {}

  let nodeIndex = 0
  const materialKeys = new Map<string, string>()

  function traverseNode(obj: THREE.Object3D, parentId: string | null): string {
    const id = `node_${THREE.MathUtils.generateUUID()}`
    nodeIndex++
    const rawName = obj.name || `Object_${nodeIndex}`
    const name = rawName.replace(/[:\/\\?*]/g, '_')

    const pos = obj.position
    const rot = obj.rotation
    const sca = obj.scale

    const position: Vector3Array = [pos.x, pos.y, pos.z]
    const rotation: Vector3Array = [
      THREE.MathUtils.radToDeg(rot.x),
      THREE.MathUtils.radToDeg(rot.y),
      THREE.MathUtils.radToDeg(rot.z),
    ]
    const scale: Vector3Array = [sca.x, sca.y, sca.z]

    let isMesh = false
    let materialId: string | undefined
    let materialIds: string[] | undefined
    let geomDef: SceneNode['geometry']
    const zone = detectCustomizableZone(name)

    if (obj instanceof THREE.Mesh && obj.geometry) {
      isMesh = true
      const customKey = `custom_${id}`
      const cloneGeom = obj.geometry.clone()
      registerCustomGeometry(customKey, cloneGeom)
      const stats = calculateGeometryStats(cloneGeom)

      geomDef = {
        type: 'custom',
        params: {},
        stats,
        customGeometryKey: customKey,
      }

      // Material handling
      materialIds = (Array.isArray(obj.material) ? obj.material : [obj.material]).map((mat) => {
        const existing = materialKeys.get(mat.uuid)
        if (existing) return existing
        const key = `mat_${id}_${materialKeys.size}`
        materialKeys.set(mat.uuid, key)
        registerImportedMaterial(key, mat)
        const colorHex = '#' + (mat.color ? mat.color.getHexString() : 'cccccc')
        const roughness = (mat as THREE.MeshStandardMaterial).roughness ?? 0.5
        const metalness = (mat as THREE.MeshStandardMaterial).metalness ?? 0.1
        const emissiveHex = '#' + ((mat as THREE.MeshStandardMaterial).emissive ? (mat as THREE.MeshStandardMaterial).emissive.getHexString() : '000000')

        materials[key] = {
          id: key,
          importedMaterialKey: key,
          sourceType: mat.type,
          importedTextureSlots: ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].filter((slot) => !!(mat as unknown as Record<string, unknown>)[slot]),
          side: mat.side,
          alphaTest: mat.alphaTest,
          name: mat.name || `${name}_Mat`,
          color: colorHex,
          roughness,
          metalness,
          emissive: emissiveHex,
          emissiveIntensity: (mat as THREE.MeshStandardMaterial).emissiveIntensity ?? 1,
          opacity: mat.opacity ?? 1,
          transparent: mat.transparent ?? false,
          wireframe: mat.wireframe ?? false,
          doubleSided: mat.side === THREE.DoubleSide,
        }
        return key
      })
      materialId = materialIds[0]
    }

    const sceneNode: SceneNode = {
      id,
      name,
      type: isMesh ? 'mesh' : 'group',
      parentId,
      children: [],
      transform: {
        position,
        rotation,
        scale,
        rotationOrder: rot.order,
      },
      geometry: geomDef,
      materialId,
      materialIds,
      userData: { ...obj.userData },
      visible: obj.visible,
      locked: false,
      customizableZone: obj.userData.customizableZone ?? zone,
      isCustomizable: obj.userData.isCustomizable ?? !!zone,
      semanticTag: obj.userData.semanticTag ?? name,
    }

    nodes[id] = sceneNode

    if (parentId) {
      nodes[parentId]?.children.push(id)
    } else {
      rootNodeIds.push(id)
    }

    for (const child of obj.children) {
      traverseNode(child, id)
    }

    return id
  }

  // If root has multiple children and no geometry itself, process directly
  if (sceneWrapper) {
    for (const child of rootObject.children) {
      traverseNode(child, null)
    }
  } else {
    traverseNode(rootObject, null)
  }

  return {
    nodes,
    rootNodeIds,
    materials,
    modelName,
  }
}
