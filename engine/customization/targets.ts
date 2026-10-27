import type { CustomizableProduct, CustomizationTarget, DesignZone } from '@/types/customization'
import type { SceneNode } from '@/types/scene'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'
import { BLACKBULLET_CONTRACT, regionForMesh } from './blackbullet-contract'

export function resolveTarget(productId: string, node: SceneNode, slot = 0): CustomizationTarget {
  const stored = node.userData?.customizationTarget as CustomizationTarget | undefined
  const region = (node.userData?.partId as string) || regionForMesh(node.name)
  const geometry = node.geometry && createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
  const uv = geometry?.getAttribute('uv')
  let minU = 1, maxU = 0, minV = 1, maxV = 0
  const indices = new Set<number>()
  if (geometry && (node.materialIds?.length || 0) > 1) for (const group of geometry.groups) {
    if (group.materialIndex !== slot) continue
    for (let i = group.start; i < group.start + group.count; i++) indices.add(geometry.index ? geometry.index.getX(i) : i)
  }
  if (uv) for (let i = 0; i < uv.count; i++) {
    if (indices.size && !indices.has(i)) continue
    minU = Math.min(minU, uv.getX(i)); maxU = Math.max(maxU, uv.getX(i))
    minV = Math.min(minV, 1 - uv.getY(i)); maxV = Math.max(maxV, 1 - uv.getY(i))
  }
  if (node.geometry && node.geometry.type !== 'custom') geometry?.dispose()
  return {
    ...stored,
    version: 1, productId, meshId: node.id, materialSlot: slot, uvChannel: stored?.uvChannel || 0,
    uvBounds: stored?.uvBounds || (region && BLACKBULLET_CONTRACT.atlas[region]) || (uv ? { minU, maxU, minV, maxV } : { minU: 0, maxU: 1, minV: 0, maxV: 1 }),
    compositionId: `${node.id}:${slot}`, blackBulletRegion: stored?.blackBulletRegion || region, textureFlipY: stored?.textureFlipY ?? false,
    intentionalSharedUVs: stored?.intentionalSharedUVs ?? (!!node.userData?.partId && Object.values(BLACKBULLET_CONTRACT.regions).includes(region || '')),
  }
}

export function bindProduct(product: CustomizableProduct, nodes: Record<string, SceneNode>): CustomizableProduct {
  const meshes = Object.values(nodes).filter(n => n.type === 'mesh')
  return { ...product, defaultZones: product.defaultZones.map(zone => {
    const node = meshes.find(n => n.customizableZone === zone.id || n.name === zone.targetMeshName)
    if (!node) return { ...zone, enabled: false }
    const target = resolveTarget(product.id, node, zone.materialSlotIndex)
    return { ...zone, targetMeshNodeId: node.id, targetMeshName: node.name, target, uvBounds: target.uvBounds }
  }) }
}

export function bindZones(zones: Record<string, DesignZone>, productId: string, nodes: Record<string, SceneNode>): Record<string, DesignZone> {
  return Object.fromEntries(Object.entries(zones).map(([id, zone]) => {
    const node = nodes[zone.targetMeshNodeId] || Object.values(nodes).find(n => n.name === zone.targetMeshName || n.customizableZone === id)
    if (!node) return [id, { ...zone, enabled: false }]
    const target = { ...resolveTarget(productId, node, zone.materialSlotIndex), ...zone.target, meshId: node.id, productId, compositionId: `${node.id}:${zone.materialSlotIndex}` }
    return [id, { ...zone, targetMeshNodeId: node.id, target, uvBounds: target.uvBounds }]
  }))
}
