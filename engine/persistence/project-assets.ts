import * as THREE from 'three'
import type { SerializedProject, ProjectMetadata } from '@/types/project'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'
import { createBufferGeometry, registerCustomGeometry, calculateGeometryStats } from '@/engine/scene/primitive-factory'
import { registerImportedMaterial, waitForSceneTextures, disposeMaterial } from '@/engine/scene/material-manager'

export interface ProjectDocument extends SerializedProject {
  schemaVersion: 2
  assetId: string
}
export interface ProjectSnapshot {
  document: ProjectDocument
  assets: THREE.Object3DJSON & {
    geometries?: { uuid: string }[]
    materials?: THREE.MaterialJSON[]
    textures?: { uuid: string; image?: string }[]
    images?: { uuid: string }[]
    linearColors?: Record<string, { color?: number[]; emissive?: number[] }>
  }
}

export function captureProject(scene: SerializedProject['scene'], metadata: ProjectMetadata, customization?: SerializedProject['customization']): Promise<ProjectSnapshot> {
  const root = buildThreeSceneFromNodes(scene.nodes, scene.rootNodeIds, scene.materials, undefined, false)
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const original = object.geometry
      object.geometry = new THREE.BufferGeometry().copy(original)
      original.dispose()
    }
  })
  return waitForSceneTextures(root).then(() => ({
    document: {
      schemaVersion: 2 as const,
      assetId: `${metadata.id}:${THREE.MathUtils.generateUUID()}`,
      metadata: { ...metadata, updatedAt: new Date().toISOString() },
      scene: structuredClone(scene),
      customization: customization ? structuredClone(customization) : undefined,
    },
    assets: (() => {
      const assets = root.toJSON() as ProjectSnapshot['assets']
      assets.linearColors = {}
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material: THREE.MeshStandardMaterial) => {
          assets.linearColors![material.uuid] = { color: material.color?.toArray(), emissive: material.emissive?.toArray() }
        })
      })
      return assets
    })(),
  })).finally(() => {
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      }
    })
  })
}

function sameGeometry(a: THREE.BufferGeometry, b: THREE.BufferGeometry): boolean {
  return JSON.stringify(new THREE.BufferGeometry().copy(a).toJSON().data) === JSON.stringify(new THREE.BufferGeometry().copy(b).toJSON().data)
}

export function hydrateProject(snapshot: ProjectSnapshot): Promise<SerializedProject> {
  if (snapshot.document.schemaVersion !== 2 || !snapshot.assets) return Promise.reject(new Error('Unsupported project version or missing project assets.'))
  const scene = structuredClone(snapshot.document.scene)
  const textures = new Set(snapshot.assets.textures?.map((texture) => texture.uuid))
  const images = new Set(snapshot.assets.images?.map((image) => image.uuid))
  const geometryIds = new Set(snapshot.assets.geometries?.map((geometry) => geometry.uuid))
  const materialIds = new Set(snapshot.assets.materials?.map((material) => material.uuid))
  type AssetNode = { geometry?: string; material?: string | string[]; children?: AssetNode[] }
  const pending: AssetNode[] = [snapshot.assets.object as AssetNode]
  while (pending.length) {
    const object = pending.pop()!
    if (object.geometry && !geometryIds.has(object.geometry)) return Promise.reject(new Error(`Missing geometry asset ${object.geometry}.`))
    const assigned = Array.isArray(object.material) ? object.material : object.material ? [object.material] : []
    for (const id of assigned) if (!materialIds.has(id)) return Promise.reject(new Error(`Missing material asset ${id}.`))
    pending.push(...(object.children || []))
  }
  for (const material of snapshot.assets.materials || []) {
    for (const [slot, value] of Object.entries(material)) {
      if ((slot === 'map' || slot.endsWith('Map')) && typeof value === 'string' && !textures.has(value)) return Promise.reject(new Error(`Missing texture asset ${value} for ${slot}.`))
    }
  }
  for (const texture of snapshot.assets.textures || []) {
    if (typeof texture.image === 'string' && !images.has(texture.image)) return Promise.reject(new Error(`Missing image asset ${texture.image}.`))
  }
  return new THREE.ObjectLoader().parseAsync(snapshot.assets).then((root) => {
    const meshes = new Map<string, THREE.Mesh>()
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      meshes.set(object.userData.nodeId, object)
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material: THREE.MeshStandardMaterial) => {
        const linear = snapshot.assets.linearColors?.[material.uuid]
        if (linear?.color && material.color) material.color.fromArray(linear.color)
        if (linear?.emissive && material.emissive) material.emissive.fromArray(linear.emissive)
      })
    })
    for (const node of Object.values(scene.nodes)) {
      if (node.type !== 'mesh' || !node.geometry) continue
      const mesh = meshes.get(node.id)
      if (!mesh?.geometry.getAttribute('position')) throw new Error(`Missing geometry asset for ${node.name}.`)
      const assigned = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const ids = node.materialIds?.length ? node.materialIds : node.materialId ? [node.materialId] : []
      ids.forEach((id, index) => { if (!scene.materials[id] || !assigned[index]) throw new Error(`Missing material asset ${id}.`) })
    }
    const registered = new Set<string>()
    for (const node of Object.values(scene.nodes)) {
      if (node.type !== 'mesh' || !node.geometry) continue
      const mesh = meshes.get(node.id)
      if (!mesh?.geometry.getAttribute('position')) throw new Error(`Missing geometry asset for ${node.name} (${node.id}).`)
      const geometry = mesh.geometry as THREE.BufferGeometry
      const procedural = node.geometry.type !== 'custom' ? createBufferGeometry(node.geometry.type, node.geometry.params) : null
      const unchangedPrimitive = procedural && sameGeometry(procedural, geometry)
      procedural?.dispose()
      if (!unchangedPrimitive) {
        const key = `hydrated_${snapshot.document.assetId}_${geometry.uuid}`
        registerCustomGeometry(key, geometry)
        node.geometry = { ...node.geometry, type: 'custom', customGeometryKey: key, stats: calculateGeometryStats(geometry) }
      } else {
        node.geometry.customGeometryKey = undefined
        geometry.dispose()
      }
      const assigned = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const ids = node.materialIds?.length ? node.materialIds : node.materialId ? [node.materialId] : []
      ids.forEach((id, index) => {
        const data = scene.materials[id], material = assigned[index]
        if (!data || !material) throw new Error(`Missing material asset ${id} on ${node.name}.`)
        const key = `hydrated_${snapshot.document.assetId}_${id}`
        if (registered.has(id)) return
        registered.add(id)
        disposeMaterial(id)
        registerImportedMaterial(key, material)
        data.importedMaterialKey = key
        data.map = undefined; data.normalMap = undefined; data.roughnessMap = undefined
        data.importedTextureSlots = Object.keys(material).filter((slot) => (material as unknown as Record<string, unknown>)[slot] instanceof THREE.Texture)
      })
    }
    return {
      schemaVersion: 2,
      metadata: snapshot.document.metadata,
      scene,
      customization: snapshot.document.customization ? structuredClone(snapshot.document.customization) : undefined,
    }
  })
}
