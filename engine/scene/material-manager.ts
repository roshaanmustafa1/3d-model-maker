import * as THREE from 'three'
import { MaterialData } from '@/types/scene'

const materialInstanceCache = new Map<string, THREE.MeshStandardMaterial>()
const importedMaterials = new Map<string, THREE.MeshStandardMaterial>()

export function registerImportedMaterial(key: string, material: THREE.Material): void {
  importedMaterials.get(key)?.dispose()
  importedMaterials.set(key, material.clone() as THREE.MeshStandardMaterial)
}
const textureCache = new Map<string, THREE.Texture>()
const textureLoads = new Map<string, Promise<void>>()

const textureLoader = new THREE.TextureLoader()

export function getOrCreateTexture(url: string, isDataTexture = false, flipY = true, channel = 0): THREE.Texture {
  const key = `${isDataTexture ? 'data' : 'srgb'}:${flipY}:${channel}:${url}`
  if (textureCache.has(key)) {
    return textureCache.get(key)!
  }

  let resolveLoad: () => void
  let rejectLoad: (error: Error) => void
  const ready = new Promise<void>((resolve, reject) => { resolveLoad = resolve; rejectLoad = reject })
  ready.catch(() => {})
  const texture = textureLoader.load(url, (loaded) => {
    loaded.needsUpdate = true
    resolveLoad()
  }, undefined, () => rejectLoad(new Error('A material texture failed to load; export cannot preserve it.')))
  textureLoads.set(texture.uuid, ready)

  // Color space handling
  if (isDataTexture) {
    texture.colorSpace = THREE.NoColorSpace
  } else {
    texture.colorSpace = THREE.SRGBColorSpace
  }

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.flipY = flipY
  texture.channel = channel

  textureCache.set(key, texture)
  return texture
}

export function waitForSceneTextures(root: THREE.Object3D): Promise<void> {
  const pending = new Set<Promise<void>>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture && textureLoads.has(value.uuid)) pending.add(textureLoads.get(value.uuid)!)
      }
    }
  })
  return Promise.all(pending).then(() => undefined)
}

export function syncMeshStandardMaterial(data: MaterialData): THREE.MeshStandardMaterial {
  let mat = materialInstanceCache.get(data.id)

  if (!mat) {
    if (data.importedMaterialKey && !importedMaterials.has(data.importedMaterialKey)) {
      throw new Error(`Imported material "${data.name}" is unavailable. Reimport the source model.`)
    }
    mat = importedMaterials.get(data.importedMaterialKey || '')?.clone() || new THREE.MeshStandardMaterial()
    materialInstanceCache.set(data.id, mat)
  }

  mat.name = data.name
  const original = importedMaterials.get(data.importedMaterialKey || '')
  if (original?.color && data.color === '#' + original.color.getHexString()) mat.color.copy(original.color)
  else mat.color?.set(data.color)
  mat.roughness = data.roughness
  mat.metalness = data.metalness
  if (original?.emissive && data.emissive === '#' + original.emissive.getHexString()) mat.emissive.copy(original.emissive)
  else mat.emissive?.set(data.emissive)
  mat.emissiveIntensity = data.emissiveIntensity
  mat.opacity = data.opacity
  mat.transparent = data.transparent
  mat.wireframe = false
  mat.side = data.doubleSided ? THREE.DoubleSide : (data.side === THREE.BackSide ? THREE.BackSide : THREE.FrontSide)
  mat.alphaTest = data.alphaTest ?? mat.alphaTest

  // Maps
  if (data.map) {
    mat.map = getOrCreateTexture(data.map, false, data.mapFlipY ?? true, data.mapChannel || 0)
  } else {
    mat.map = data.map === null ? null : original?.map ?? null
  }

  if (data.normalMap) {
    mat.normalMap = getOrCreateTexture(data.normalMap, true)
  } else {
    mat.normalMap = data.normalMap === null ? null : original?.normalMap ?? null
  }

  if (data.roughnessMap) {
    mat.roughnessMap = getOrCreateTexture(data.roughnessMap, true)
  } else {
    mat.roughnessMap = data.roughnessMap === null ? null : original?.roughnessMap ?? null
  }

  mat.needsUpdate = true
  return mat
}

export function disposeMaterial(id: string): void {
  const mat = materialInstanceCache.get(id)
  if (mat) {
    mat.dispose()
    materialInstanceCache.delete(id)
  }
}

export function releaseTransientMaterials(ids: string[]): void {
  ids.forEach(disposeMaterial)
  const used = new Set<THREE.Texture>()
  for (const material of [...materialInstanceCache.values(), ...importedMaterials.values()]) {
    Object.values(material).forEach(value => { if (value instanceof THREE.Texture) used.add(value) })
  }
  for (const [key, texture] of textureCache) if (!used.has(texture)) {
    texture.dispose(); textureCache.delete(key); textureLoads.delete(texture.uuid)
  }
}

export function pruneMaterialResources(materials: Record<string, MaterialData>): void {
  const importedKeys = new Set(Object.values(materials).map((data) => data.importedMaterialKey))
  const discarded: THREE.Material[] = []
  for (const [id, material] of materialInstanceCache) {
    if (!materials[id]) { discarded.push(material); materialInstanceCache.delete(id) }
  }
  for (const [key, material] of importedMaterials) {
    if (!importedKeys.has(key)) { discarded.push(material); importedMaterials.delete(key) }
  }
  const usedTextures = new Set<THREE.Texture>()
  for (const material of [...materialInstanceCache.values(), ...importedMaterials.values()]) {
    Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) usedTextures.add(value) })
  }
  const released = new Set<THREE.Texture>()
  for (const material of discarded) {
    material.dispose()
    Object.values(material).forEach((value) => { if (value instanceof THREE.Texture && !usedTextures.has(value)) released.add(value) })
  }
  for (const [key, texture] of textureCache) {
    if (!usedTextures.has(texture)) { released.add(texture); textureCache.delete(key) }
  }
  released.forEach((texture) => { texture.dispose(); textureLoads.delete(texture.uuid) })
}

export function disposeAllMaterials(): void {
  for (const mat of materialInstanceCache.values()) {
    mat.dispose()
  }
  materialInstanceCache.clear()
  for (const mat of importedMaterials.values()) mat.dispose()
  importedMaterials.clear()

  for (const tex of textureCache.values()) {
    tex.dispose()
  }
  textureCache.clear()
  textureLoads.clear()
}

export const MATERIAL_PRESETS: Record<string, Partial<MaterialData>> = {
  matteBlack: {
    color: '#1a1c20',
    roughness: 0.85,
    metalness: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  },
  glossyPlastic: {
    color: '#0284c7',
    roughness: 0.15,
    metalness: 0.05,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: false,
  },
  brushedMetal: {
    color: '#c0c5ce',
    roughness: 0.35,
    metalness: 0.9,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: false,
  },
  gold: {
    color: '#f59e0b',
    roughness: 0.25,
    metalness: 0.95,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: false,
  },
  whiteCotton: {
    color: '#f8fafc',
    roughness: 0.92,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  },
  darkFleece: {
    color: '#111827',
    roughness: 0.98,
    metalness: 0.0,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  },
  neonEmerald: {
    color: '#10b981',
    roughness: 0.2,
    metalness: 0.1,
    emissive: '#10b981',
    emissiveIntensity: 1.8,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  },
  glass: {
    color: '#e0f2fe',
    roughness: 0.1,
    metalness: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 0.45,
    transparent: true,
    wireframe: false,
    doubleSided: true,
  },
}
