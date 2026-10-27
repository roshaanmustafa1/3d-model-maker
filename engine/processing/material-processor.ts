import * as THREE from 'three'

export interface MaterialInspection {
  materialId: string
  name: string
  type: string
  baseColorHex: string
  roughness: number
  metalness: number
  emissiveHex: string
  opacity: number
  transparent: boolean
  doubleSided: boolean
  hasAlbedoTexture: boolean
  hasNormalMap: boolean
  hasRoughnessMap: boolean
  hasMetalnessMap: boolean
  hasEmissiveMap: boolean
  hasAoMap: boolean
  textureDimensions?: { width: number; height: number }
  missingExpectedMaps: string[]
  assignedMeshCount: number
}

export interface MaterialAnalysisReport {
  totalMaterials: number
  materials: MaterialInspection[]
  hasAnyPbrMaps: boolean
  isPbrComplete: boolean
  recommendations: string[]
}

export function inspectSceneMaterials(root: THREE.Object3D): MaterialAnalysisReport {
  const materialMap = new Map<string, MaterialInspection>()

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]

      for (const mat of mats) {
        if (!mat) continue
        const id = mat.uuid

        let existing = materialMap.get(id)
        if (!existing) {
          const colorHex = '#' + (mat.color ? mat.color.getHexString() : 'cccccc')
          const roughness = typeof (mat as any).roughness === 'number' ? (mat as any).roughness : 0.5
          const metalness = typeof (mat as any).metalness === 'number' ? (mat as any).metalness : 0.0
          const emissiveHex = '#' + ((mat as any).emissive ? (mat as any).emissive.getHexString() : '000000')

          const hasAlbedo = !!(mat as any).map
          const hasNormal = !!(mat as any).normalMap
          const hasRoughness = !!(mat as any).roughnessMap
          const hasMetalness = !!(mat as any).metalnessMap
          const hasEmissive = !!(mat as any).emissiveMap
          const hasAo = !!(mat as any).aoMap

          const missingMaps: string[] = []
          if (!hasNormal) missingMaps.push('normalMap')
          if (!hasRoughness) missingMaps.push('roughnessMap')
          if (!hasMetalness) missingMaps.push('metalnessMap')

          let textureDimensions: { width: number; height: number } | undefined
          if ((mat as any).map?.image) {
            textureDimensions = {
              width: (mat as any).map.image.width || 1024,
              height: (mat as any).map.image.height || 1024,
            }
          }

          existing = {
            materialId: id,
            name: mat.name || 'PBR_Material',
            type: mat.type,
            baseColorHex: colorHex,
            roughness,
            metalness,
            emissiveHex,
            opacity: mat.opacity ?? 1,
            transparent: mat.transparent ?? false,
            doubleSided: mat.side === THREE.DoubleSide,
            hasAlbedoTexture: hasAlbedo,
            hasNormalMap: hasNormal,
            hasRoughnessMap: hasRoughness,
            hasMetalnessMap: hasMetalness,
            hasEmissiveMap: hasEmissive,
            hasAoMap: hasAo,
            textureDimensions,
            missingExpectedMaps: missingMaps,
            assignedMeshCount: 0,
          }
          materialMap.set(id, existing)
        }

        existing.assignedMeshCount++
      }
    }
  })

  const materials = Array.from(materialMap.values())
  const hasAnyPbrMaps = materials.some(
    (m) => m.hasAlbedoTexture || m.hasNormalMap || m.hasRoughnessMap || m.hasMetalnessMap
  )
  const isPbrComplete = materials.length > 0 && materials.every((m) => m.hasAlbedoTexture && m.hasNormalMap && m.hasRoughnessMap)

  const recommendations: string[] = []
  if (!hasAnyPbrMaps) {
    recommendations.push('Model uses solid color shading without texture maps. Textures can be baked in Product Customizer.')
  } else if (!isPbrComplete) {
    recommendations.push('Some PBR maps (normal or roughness) are absent from source asset; defaults will be applied without fabricating fake textures.')
  }

  return {
    totalMaterials: materials.length,
    materials,
    hasAnyPbrMaps,
    isPbrComplete,
    recommendations,
  }
}
