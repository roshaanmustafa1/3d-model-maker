import * as THREE from 'three'
import { CustomizationProject, TextureResolution } from '@/types/customization'
import { SceneNode, MaterialData } from '@/types/scene'
import { composeMaterials, disposeComposedTargets } from './material-composition'
import { bindZones } from './targets'
import { BLACKBULLET_CONTRACT } from './blackbullet-contract'
import { inspectModelForCustomization } from './zone-mapper'
import { releaseTransientMaterials } from '@/engine/scene/material-manager'
import { exportSceneToGLB, ExportVerificationResult } from '@/engine/exporters/glb-exporter'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'
import { disposeScene } from '@/engine/scene/resource-lifecycle'
import { verifyRuntimeContract } from '@/engine/validation/runtime-contract'

export interface CustomizerExportResult extends ExportVerificationResult {
  projectData: CustomizationProject
  bakedTextureResolution: number
}

export async function exportCustomizedProductGLB(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  project: CustomizationProject,
  options?: {
    resolution?: TextureResolution
    includeSidecarJson?: boolean
  }
): Promise<CustomizerExportResult> {
  const resolution = options?.resolution || project.textureResolution || 1024

  const bound = { ...project, zones: bindZones(project.zones, project.productId, nodes) }
  if (project.blackBulletMode === 'runtime-customization') {
    const regions = new Set(Object.values(bound.zones).map(zone => zone.target?.blackBulletRegion))
    if (!regions.has('shirt_front') || !regions.has('shirt_back')) throw new Error('No registered BlackBullet front/back region contract. Use Preserve Imported Appearance for this product.')
  }
  const editedZones = Object.values(bound.zones).filter(zone => zone.enabled && zone.layers.length)
  if (editedZones.length) {
    const diagnostics = inspectModelForCustomization(nodes, materials, editedZones)
    if (!diagnostics.isReadyForArtwork) throw new Error('Unsafe artwork targets: ' + (diagnostics.overlapWarnings.join('; ') || 'missing UV coordinates'))
  }
  const derived = await composeMaterials(nodes, materials, bound, resolution)
  const exportMaterials = { ...materials }
  const exportNodes = structuredClone(nodes)
  const transientIds: string[] = []
  try {
    for (const target of derived) {
      const id = target.source.id + '__custom_' + target.nodeId + '_' + target.slot
      transientIds.push(id)
      const baked = await target.composer!.bakeToBlob()
      exportMaterials[id] = { ...target.source, id, map: baked.dataUrl, mapFlipY: target.material.map?.flipY ?? false, mapChannel: target.material.map?.channel || 0, color: '#ffffff', roughness: target.material.roughness, metalness: target.material.metalness }
      const node = exportNodes[target.nodeId]
      const slots = node.materialIds?.length ? [...node.materialIds] : [node.materialId!]
      slots[target.slot] = id
      node.materialIds = slots; node.materialId = slots[0]
    }
    for (const zone of Object.values(bound.zones)) {
      const node = exportNodes[zone.targetMeshNodeId]
      if (!node || !zone.target) continue
      node.userData = { ...node.userData, customizationTarget: zone.target, ...(zone.target.blackBulletRegion ? { blackBulletContract: { version: BLACKBULLET_CONTRACT.version, profile: BLACKBULLET_CONTRACT.profile }, partId: zone.target.blackBulletRegion } : {}) }
    }
    if (project.blackBulletMode === 'runtime-customization') {
      const runtimeScene = buildThreeSceneFromNodes(exportNodes, rootNodeIds, exportMaterials)
      try {
        if (!verifyRuntimeContract(runtimeScene)) throw new Error('BlackBullet runtime contract failed: verify unique front/back mesh targets, material slots and atlas UVs. Preserve Imported Appearance remains available.')
      } finally { disposeScene(runtimeScene) }
    }
    const verification = await exportSceneToGLB(exportNodes, rootNodeIds, exportMaterials, undefined, { binary: true, onlyVisible: true, embedImages: true })
    return { ...verification, projectData: bound, bakedTextureResolution: resolution }
  } finally { disposeComposedTargets(derived); releaseTransientMaterials(transientIds) }
}
