import * as THREE from 'three'
import { SceneNode, MaterialData } from '@/types/scene'
import { createBufferGeometry } from './primitive-factory'
import { syncMeshStandardMaterial } from './material-manager'

export function buildThreeSceneFromNodes(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  filterNodeId?: string,
  onlyVisible = true
): THREE.Scene {
  const rootGroup = new THREE.Scene()
  rootGroup.name = 'ExportRoot'
  const materialClones = new Map<string, THREE.Material>()
  function cloneMaterial(id: string): THREE.Material {
    if (!materials[id]) throw new Error(`Missing material slot ${id}`)
    let material = materialClones.get(id)
    if (!material) {
      material = syncMeshStandardMaterial(materials[id]).clone()
      materialClones.set(id, material)
    }
    return material
  }

  // Helper to build a single node
  function buildNode(nodeId: string, transformOnly = false): THREE.Object3D | null {
    const node = nodes[nodeId]
    if (!node || (onlyVisible && !node.visible)) return null

    let obj: THREE.Object3D

    if (node.type === 'mesh' && node.geometry && !transformOnly) {
      const geom = createBufferGeometry(
        node.geometry.type,
        node.geometry.params,
        node.geometry.customGeometryKey
      ).clone()

      let mat: THREE.Material | THREE.Material[]
      const activeMatIds = node.materialIds && node.materialIds.length > 0
        ? node.materialIds
        : (node.materialId ? [node.materialId] : [])

      if (activeMatIds.length > 1) {
        mat = activeMatIds.map(cloneMaterial)
      } else if (activeMatIds.length === 1) {
        mat = cloneMaterial(activeMatIds[0])
      } else {
        mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 })
      }

      if (Array.isArray(mat)) {
        if (!geom.groups.length || geom.groups.some((group) => !Number.isInteger(group.materialIndex) || !mat[group.materialIndex ?? -1])) throw new Error(`Invalid material group on ${node.name}.`)
      } else geom.groups.forEach((group) => { group.materialIndex = 0 })

      const mesh = new THREE.Mesh(geom, mat)
      obj = mesh
    } else {
      obj = new THREE.Group()
    }

    obj.name = node.name
    obj.position.set(node.transform.position[0], node.transform.position[1], node.transform.position[2])
    obj.rotation.set(
      THREE.MathUtils.degToRad(node.transform.rotation[0]),
      THREE.MathUtils.degToRad(node.transform.rotation[1]),
      THREE.MathUtils.degToRad(node.transform.rotation[2]),
      node.transform.rotationOrder || 'XYZ'
    )
    obj.scale.set(node.transform.scale[0], node.transform.scale[1], node.transform.scale[2])
    obj.visible = node.visible

    // Attach custom user data for BlackBullet compatibility
    obj.userData = {
      ...node.userData,
      nodeId: node.id,
      semanticTag: node.semanticTag || node.name,
      isCustomizable: node.isCustomizable ?? false,
      customizableZone: node.customizableZone ?? null,
    }

    for (const childId of transformOnly ? [] : node.children) {
      const childObj = buildNode(childId)
      if (childObj) {
        obj.add(childObj)
      }
    }

    return obj
  }

  if (filterNodeId) {
    let selected = buildNode(filterNodeId)
    let parentId = nodes[filterNodeId]?.parentId
    const visited = new Set([filterNodeId])
    while (selected && parentId) {
      if (visited.has(parentId)) throw new Error('Scene hierarchy contains a cycle.')
      visited.add(parentId)
      const parent = buildNode(parentId, true)
      if (!parent) { selected = null; break }
      parent.add(selected)
      selected = parent
      parentId = nodes[parentId]?.parentId
    }
    if (selected) rootGroup.add(selected)
  } else {
    for (const rootId of rootNodeIds) {
      const rootObj = buildNode(rootId)
      if (rootObj) rootGroup.add(rootObj)
    }
  }

  return rootGroup
}
