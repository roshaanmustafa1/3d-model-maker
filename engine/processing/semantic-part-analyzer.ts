import * as THREE from 'three'
import { GeminiAnalysisResult } from '@/types/ai-generator'
import { CustomizableZone } from '@/types/scene'

export interface SemanticPartMapping {
  meshId: string
  meshName: string
  suggestedName: string
  candidateZone?: CustomizableZone
  confidence: number // 0 to 1
  isGeometricallyVerified: boolean
  hasValidUVs: boolean
  triangleCount: number
  boundingRelativePosition: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'center'
  reasoning: string
}

export interface SemanticAnalysisReport {
  totalMeshes: number
  mappedParts: SemanticPartMapping[]
  unmappedMeshes: string[]
  suggestedRootName: string
  customizerReadyPartCount: number
  uncertaintyLevel: 'low' | 'medium' | 'high'
  requiresManualReview: boolean
}

export function analyzeSemanticParts(
  root: THREE.Object3D,
  aiAnalysis?: GeminiAnalysisResult
): SemanticAnalysisReport {
  const rootBox = new THREE.Box3().setFromObject(root)
  const rootCenter = new THREE.Vector3()
  rootBox.getCenter(rootCenter)
  const rootSize = new THREE.Vector3()
  rootBox.getSize(rootSize)

  const mappedParts: SemanticPartMapping[] = []
  const unmappedMeshes: string[] = []

  const aiParts = aiAnalysis?.suggestedHierarchy?.parts || []

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const meshName = obj.name || 'UnnamedMesh'
      const lowerName = meshName.toLowerCase()

      const meshBox = new THREE.Box3().setFromObject(obj)
      const meshCenter = new THREE.Vector3()
      meshBox.getCenter(meshCenter)
      const meshSize = new THREE.Vector3()
      meshBox.getSize(meshSize)

      // Determine relative spatial position within product bounding box
      const relX = (meshCenter.x - rootCenter.x) / (rootSize.x || 1)
      const relY = (meshCenter.y - rootCenter.y) / (rootSize.y || 1)
      const relZ = (meshCenter.z - rootCenter.z) / (rootSize.z || 1)

      let relativePos: SemanticPartMapping['boundingRelativePosition'] = 'center'
      if (relZ > 0.15) relativePos = 'front'
      else if (relZ < -0.15) relativePos = 'back'
      else if (relX < -0.2) relativePos = 'left'
      else if (relX > 0.2) relativePos = 'right'
      else if (relY > 0.25) relativePos = 'top'
      else if (relY < -0.25) relativePos = 'bottom'

      const geom = obj.geometry
      const hasUVs = !!geom.getAttribute('uv')
      const posAttr = geom.getAttribute('position')
      const indexAttr = geom.getIndex()
      const triCount = indexAttr ? indexAttr.count / 3 : posAttr ? posAttr.count / 3 : 0

      // Match against AI suggestions or spatial heuristics
      let bestMatch: (typeof aiParts)[0] | undefined
      let matchConfidence = 0.5
      let candidateZone: CustomizableZone | undefined
      let suggestedName = meshName

      // 1. Direct name match with AI suggestion
      for (const p of aiParts) {
        const pLower = p.name.toLowerCase()
        if (lowerName.includes(pLower) || pLower.includes(lowerName)) {
          bestMatch = p
          matchConfidence = 0.95
          break
        }
      }

      // 2. Spatial heuristic for apparel / product
      if (!bestMatch) {
        if (relativePos === 'front' || lowerName.includes('front')) {
          suggestedName = 'Body_Front'
          candidateZone = 'body_front'
          matchConfidence = 0.82
        } else if (relativePos === 'back' || lowerName.includes('back')) {
          suggestedName = 'Body_Back'
          candidateZone = 'body_back'
          matchConfidence = 0.8
        } else if (relativePos === 'left' || lowerName.includes('left') || lowerName.includes('sleeve.l')) {
          suggestedName = 'Sleeve_Left'
          candidateZone = 'sleeve_left'
          matchConfidence = 0.85
        } else if (relativePos === 'right' || lowerName.includes('right') || lowerName.includes('sleeve.r')) {
          suggestedName = 'Sleeve_Right'
          candidateZone = 'sleeve_right'
          matchConfidence = 0.85
        } else if (relativePos === 'top' || lowerName.includes('hood')) {
          suggestedName = 'Hood'
          candidateZone = 'hood'
          matchConfidence = 0.75
        } else {
          suggestedName = meshName
          matchConfidence = 0.4
        }
      } else {
        suggestedName = bestMatch.name
        candidateZone = bestMatch.suggestedZone as CustomizableZone
      }

      const isGeometricallyVerified = triCount > 20 && hasUVs

      mappedParts.push({
        meshId: obj.uuid,
        meshName,
        suggestedName,
        candidateZone,
        confidence: parseFloat(matchConfidence.toFixed(2)),
        isGeometricallyVerified,
        hasValidUVs: hasUVs,
        triangleCount: Math.round(triCount),
        boundingRelativePosition: relativePos,
        reasoning: `Located at relative ${relativePos} (Z: ${relZ.toFixed(2)}, X: ${relX.toFixed(2)}). Matches ${suggestedName} with ${hasUVs ? 'valid UVs' : 'missing UVs'}.`,
      })
    }
  })

  const customizerReadyPartCount = mappedParts.filter(
    (p) => p.isGeometricallyVerified && p.candidateZone
  ).length

  return {
    totalMeshes: mappedParts.length,
    mappedParts,
    unmappedMeshes,
    suggestedRootName: aiAnalysis?.suggestedHierarchy?.rootName || 'ProductRoot',
    customizerReadyPartCount,
    uncertaintyLevel: customizerReadyPartCount >= 2 ? 'low' : 'medium',
    requiresManualReview: customizerReadyPartCount < 2,
  }
}
