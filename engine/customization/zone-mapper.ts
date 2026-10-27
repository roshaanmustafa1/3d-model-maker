import * as THREE from 'three'
import { analyzeUVOverlap } from './uv-overlap'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'
import { resolveTarget } from './targets'
import { DesignZone, UVBounds } from '@/types/customization'
import { SceneNode, MaterialData } from '@/types/scene'

export interface ModelCustomizationDiagnostics {
  meshCount: number
  customizableMeshCount: number
  missingUVCount: number
  detectedZones: string[]
  hasOverlappingUVs: boolean
  overlapWarnings: string[]
  isReadyForArtwork: boolean
}

export function matchZoneFromRaycast(
  intersection: THREE.Intersection,
  zones: DesignZone[],
  nodes: Record<string, SceneNode>
): DesignZone | undefined {
  const object = intersection.object
  const nodeId = object.userData.nodeId as string | undefined
  const uv = intersection.uv

  // If node ID is matched directly
  if (nodeId) {
    const matchingMeshZones = zones.filter((z) => z.targetMeshNodeId === nodeId)
    if (matchingMeshZones.length === 1) {
      return matchingMeshZones[0]
    }

    if (uv && matchingMeshZones.length > 1) {
      // Find zone that encloses this UV coordinate
      const inBounds = matchingMeshZones.find(
        (z) =>
          uv.x >= z.uvBounds.minU &&
          uv.x <= z.uvBounds.maxU &&
          uv.y >= z.uvBounds.minV &&
          uv.y <= z.uvBounds.maxV
      )
      if (inBounds) return inBounds
    }
  }

  // Fallback: match by mesh name or semantic zone tag
  const meshName = object.name?.toLowerCase() || ''
  const semanticTag = (object.userData.semanticTag as string)?.toLowerCase() || ''
  const customizableZoneTag = (object.userData.customizableZone as string)?.toLowerCase() || ''

  return zones.find((z) => {
    const zid = z.id.toLowerCase()
    return (
      zid === customizableZoneTag ||
      meshName.includes(zid) ||
      semanticTag.includes(zid) ||
      (z.targetMeshName && z.targetMeshName.toLowerCase() === meshName)
    )
  })
}

export const detectMeshUVOverlap = analyzeUVOverlap

export function inspectModelForCustomization(
  nodes: Record<string, SceneNode>,
  materials: Record<string, MaterialData>,
  zones?: DesignZone[]
): ModelCustomizationDiagnostics {
  const meshNodes = Object.values(nodes).filter((n) => n.type === 'mesh')
  let missingUVCount = 0
  const detectedZones: string[] = []
  const overlapWarnings: string[] = []

  for (const node of meshNodes) {
    if (!node.geometry?.stats.hasUVs) {
      missingUVCount++
    }
    if (node.geometry && (zones ? zones.some(z => z.enabled && z.targetMeshNodeId === node.id) : node.isCustomizable)) {
      const geometry = createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
      const targets = zones?.filter(z => z.enabled && z.targetMeshNodeId === node.id)
      const slots = node.materialIds?.length || 1
      const checks = targets?.length ? targets.map(zone => ({ zone, result: analyzeUVOverlap(geometry, { slot: slots > 1 ? zone.materialSlotIndex : undefined, channel: zone.target?.uvChannel, bounds: zone.uvBounds, faceIndices: zone.target?.faceIndices }) })) : Array.from({ length: slots }, (_, slot) => ({ zone: undefined, result: analyzeUVOverlap(geometry, { slot: slots > 1 ? slot : undefined }) }))
      for (const { zone, result } of checks) if (result.hasOverlap) {
        const target = zone?.target || resolveTarget('inspection', node)
        const intentional = target.intentionalSharedUVs && result.overlapCount === result.mirroredCount
        overlapWarnings.push(node.name + (zone ? ' / ' + zone.name : '') + ': ' + (intentional ? 'Intentional shared UVs. Registered mirrored-part target. ' : 'Artwork can affect another surface. ') + result.message)
      }
      if (node.geometry.type !== 'custom') geometry.dispose()
    }
    if (node.customizableZone && !detectedZones.includes(node.customizableZone)) {
      detectedZones.push(node.customizableZone)
    }
  }

  const customizableMeshCount = meshNodes.filter((n) => n.isCustomizable).length
  const required = zones?.length ? meshNodes.filter(node => zones.some(zone => zone.enabled && zone.targetMeshNodeId === node.id)) : meshNodes
  const isReadyForArtwork = required.length > 0 && required.every(node => node.geometry?.stats.hasUVs) && !overlapWarnings.some(warning => !warning.includes('Intentional shared UVs.'))

  return {
    meshCount: meshNodes.length,
    customizableMeshCount,
    missingUVCount,
    detectedZones,
    hasOverlappingUVs: overlapWarnings.length > 0,
    overlapWarnings,
    isReadyForArtwork,
  }
}
