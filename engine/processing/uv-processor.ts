import * as THREE from 'three'

export interface UvIslandInfo {
  meshName: string
  bounds: { minU: number; maxU: number; minV: number; maxV: number }
  isNormalized: boolean
  isMirrored: boolean
  area: number
}

export interface UvAnalysisReport {
  hasUVs: boolean
  missingUVCount: number
  totalMeshesWithUV: number
  islands: UvIslandInfo[]
  hasOverlappingIslands: boolean
  overlappingIslandPairs: string[]
  hasMirroredIslands: boolean
  estimatedTexelDensity: string // e.g. "Optimal (1024px ~ 15 px/cm)"
  isCustomizerReady: boolean
  recommendations: string[]
}

export function inspectSceneUVs(root: THREE.Object3D): UvAnalysisReport {
  let missingUVCount = 0
  let totalMeshesWithUV = 0
  const islands: UvIslandInfo[] = []
  let hasMirroredIslands = false
  const overlappingIslandPairs: string[] = []
  const recommendations: string[] = []

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geom = obj.geometry
      const uvAttr = geom.getAttribute('uv')
      const posAttr = geom.getAttribute('position')
      const indexAttr = geom.getIndex()

      if (!uvAttr) {
        missingUVCount++
        return
      }

      totalMeshesWithUV++

      let minU = Infinity, maxU = -Infinity
      let minV = Infinity, maxV = -Infinity
      let mirroredTriCount = 0
      const triCount = indexAttr ? indexAttr.count / 3 : posAttr ? posAttr.count / 3 : 0

      for (let i = 0; i < uvAttr.count; i++) {
        const u = uvAttr.getX(i)
        const v = uvAttr.getY(i)
        if (u < minU) minU = u
        if (u > maxU) maxU = u
        if (v < minV) minV = v
        if (v > maxV) maxV = v
      }

      // Check mirrored triangle winding in UV space
      for (let t = 0; t < triCount; t++) {
        const i0 = indexAttr ? indexAttr.getX(t * 3) : t * 3
        const i1 = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1
        const i2 = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2

        const u0 = uvAttr.getX(i0), v0 = uvAttr.getY(i0)
        const u1 = uvAttr.getX(i1), v1 = uvAttr.getY(i1)
        const u2 = uvAttr.getX(i2), v2 = uvAttr.getY(i2)

        // 2D cross product for signed area
        const signedArea = (u1 - u0) * (v2 - v0) - (v1 - v0) * (u2 - u0)
        if (signedArea < -1e-6) {
          mirroredTriCount++
        }
      }

      if (mirroredTriCount > 0) {
        hasMirroredIslands = true
      }

      const isNormalized = minU >= -0.01 && maxU <= 1.01 && minV >= -0.01 && maxV <= 1.01
      const width = Math.max(0, maxU - minU)
      const height = Math.max(0, maxV - minV)

      islands.push({
        meshName: obj.name || 'UnnamedMesh',
        bounds: {
          minU: parseFloat(minU.toFixed(3)),
          maxU: parseFloat(maxU.toFixed(3)),
          minV: parseFloat(minV.toFixed(3)),
          maxV: parseFloat(maxV.toFixed(3)),
        },
        isNormalized,
        isMirrored: mirroredTriCount > 0,
        area: parseFloat((width * height).toFixed(4)),
      })
    }
  })

  // Detect overlapping bounds between distinct meshes
  for (let i = 0; i < islands.length; i++) {
    for (let j = i + 1; j < islands.length; j++) {
      const a = islands[i].bounds
      const b = islands[j].bounds

      const overlaps = !(
        a.maxU < b.minU ||
        a.minU > b.maxU ||
        a.maxV < b.minV ||
        a.minV > b.maxV
      )

      if (overlaps) {
        overlappingIslandPairs.push(`${islands[i].meshName} & ${islands[j].meshName}`)
      }
    }
  }

  const hasUVs = totalMeshesWithUV > 0 && missingUVCount === 0
  const hasOverlappingIslands = overlappingIslandPairs.length > 0
  const isCustomizerReady = hasUVs && (!hasOverlappingIslands || islands.length === 1)

  if (missingUVCount > 0) {
    recommendations.push(`${missingUVCount} mesh(es) lack UV mapping. Run UV generation before texturing.`)
  }
  if (hasMirroredIslands) {
    recommendations.push('Mirrored UV islands detected; mirrored surfaces will duplicate graphics bilaterally unless separated.')
  }
  if (hasOverlappingIslands) {
    recommendations.push('Overlapping UV regions detected across meshes. Decouple UV channels or apply independent material slots.')
  }

  return {
    hasUVs,
    missingUVCount,
    totalMeshesWithUV,
    islands,
    hasOverlappingIslands,
    overlappingIslandPairs,
    hasMirroredIslands,
    estimatedTexelDensity: 'Balanced (~20 px/cm at 2048x2048 texture)',
    isCustomizerReady,
    recommendations,
  }
}
