import * as THREE from 'three'
import type { CustomizationProject, TextureResolution } from '@/types/customization'
import type { MaterialData, SceneNode } from '@/types/scene'
import { syncMeshStandardMaterial, waitForSceneTextures } from '@/engine/scene/material-manager'
import { bindZones } from './targets'
import { TextureComposer } from './texture-composer'

export interface ComposedTarget { key: string; nodeId: string; slot: number; source: MaterialData; material: THREE.MeshStandardMaterial; composer?: TextureComposer }
export async function composeMaterials(nodes: Record<string, SceneNode>, materials: Record<string, MaterialData>, project: CustomizationProject, resolution: TextureResolution): Promise<ComposedTarget[]> {
  const zones = Object.values(bindZones(project.zones, project.productId, nodes))
  const result: ComposedTarget[] = []
  try {
    for (const node of Object.values(nodes)) {
      if (node.type !== 'mesh') continue
      const slots = node.materialIds?.length ? node.materialIds : node.materialId ? [node.materialId] : []
      for (const [slot, id] of slots.entries()) {
        const relevant = zones.filter(z => z.enabled && z.target?.meshId === node.id && z.target.materialSlot === slot)
        if (relevant.some(zone => zone.target?.faceIndices?.length)) throw new Error('Face-selected artwork requires a separate material surface before composition. No unrelated faces were painted.')
        const override = project.partMaterials[`${node.id}:${slot}`] || {}
        if (!relevant.some(z => z.layers.some(l => l.visible)) && !Object.keys(override).length) continue
        const source = materials[id]
        if (!source) throw new Error(`Missing material for ${node.name}, slot ${slot}.`)
        const material = syncMeshStandardMaterial(source).clone()
        const entry: ComposedTarget = { key: `${node.id}:${slot}`, nodeId: node.id, slot, source, material }
        result.push(entry)
        const root = new THREE.Mesh(new THREE.BufferGeometry(), material)
        await waitForSceneTextures(root)
        root.geometry.dispose()
        const composer = entry.composer = new TextureComposer(resolution)
        await composer.compositeTexture(override.color || source.color, relevant, material.map?.image as CanvasImageSource | undefined)
        material.map = composer.getCanvasTexture()
        if (material.map) {
          material.map.flipY = relevant[0]?.target?.textureFlipY ?? false
          material.map.channel = relevant[0]?.target?.uvChannel || 0
        }
        material.color.set('#ffffff')
        material.roughness = override.roughness ?? source.roughness
        material.metalness = override.metalness ?? source.metalness
        material.needsUpdate = true
      }
    }
    return result
  } catch (error) { disposeComposedTargets(result); throw error }
}

export function disposeComposedTargets(targets: ComposedTarget[]): void {
  for (const target of targets) { target.material.dispose(); target.composer?.dispose() }
}
