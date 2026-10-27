import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GenerationQualityReport, PbrMapsStatus } from '@/types/ai-generator'
import { inspectGlbContainer } from '@/engine/loaders/glb-integrity'
import { verifyRuntimeContract } from '@/engine/validation/runtime-contract'
import { analyzeUVOverlap } from '@/engine/customization/uv-overlap'

export async function parseGlbBufferToThree(buffer: ArrayBuffer): Promise<THREE.Group> {
  inspectGlbContainer(buffer)
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.parse(
      buffer,
      '',
      (gltf) => resolve(gltf.scene),
      (err) => reject(new Error(`Failed to parse GLB: ${err instanceof Error ? err.message : String(err)}`))
    )
  })
}

export function analyzeGlbScene(scene: THREE.Group): GenerationQualityReport {
  let meshCount = 0
  let triangleCount = 0
  let vertexCount = 0
  let hasNormals = true
  let hasUVs = true
  let maxUvChannels = 0
  const semanticParts: string[] = []
  const validationIssues: string[] = []
  const recommendations: string[] = []

  const pbrStatus: PbrMapsStatus = {
    hasBaseColor: false,
    hasNormalMap: false,
    hasRoughnessMap: false,
    hasMetalnessMap: false,
    hasEmissiveMap: false,
  }

  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  box.getSize(size)

  let customizableMeshCount = 0
  let invalidGeometry = false
  let overlappingUvDetected = false
  scene.updateMatrixWorld(true)

  scene.traverse((obj) => {
    if (obj.name && !semanticParts.includes(obj.name)) {
      semanticParts.push(obj.name)
    }

    if (obj instanceof THREE.Mesh) {
      meshCount++
      const geom = obj.geometry
      if (!obj.matrixWorld.elements.every(Number.isFinite) || Math.abs(obj.matrixWorld.determinant()) < 1e-12) invalidGeometry = true
      if (geom) {
        const posAttr = geom.getAttribute('position')
        if (posAttr) {
          vertexCount += posAttr.count
          for (let i = 0; i < posAttr.count; i++) if (![posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)].every(Number.isFinite)) invalidGeometry = true
        }
        if (!posAttr || posAttr.itemSize !== 3 || !(geom.index?.count || posAttr.count) || (geom.index?.count || posAttr.count) % 3) invalidGeometry = true

        const index = geom.getIndex()
        if (index) {
          triangleCount += index.count / 3
          for (let i = 0; i < index.count; i++) if (!Number.isInteger(index.getX(i)) || index.getX(i) < 0 || index.getX(i) >= (posAttr?.count || 0)) invalidGeometry = true
        } else if (posAttr) {
          triangleCount += posAttr.count / 3
        }

        if (!geom.getAttribute('normal')) {
          hasNormals = false
          validationIssues.push(`Mesh "${obj.name || 'unnamed'}" lacks vertex normal attributes.`)
        }

        const uvAttr = geom.getAttribute('uv')
        if (!uvAttr) {
          hasUVs = false
          validationIssues.push(`Mesh "${obj.name || 'unnamed'}" lacks UV coordinates (channel 0).`)
        } else {
          maxUvChannels = Math.max(maxUvChannels, 1)
          if (uvAttr.itemSize !== 2 || uvAttr.count !== posAttr?.count) hasUVs = false
          for (let i = 0; i < uvAttr.count; i++) if (![uvAttr.getX(i), uvAttr.getY(i)].every(Number.isFinite)) hasUVs = false
          const slots = Array.isArray(obj.material) ? obj.material.length : 1
          for (let slot = 0; slot < slots; slot++) overlappingUvDetected ||= analyzeUVOverlap(geom, { slot }).hasOverlap
        }

        if (geom.getAttribute('uv2')) {
          maxUvChannels = Math.max(maxUvChannels, 2)
        }
      }

      // Check materials
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of materials) {
        if (mat) {
          if ((mat as any).map) pbrStatus.hasBaseColor = true
          if ((mat as any).normalMap) pbrStatus.hasNormalMap = true
          if ((mat as any).roughnessMap) pbrStatus.hasRoughnessMap = true
          if ((mat as any).metalnessMap) pbrStatus.hasMetalnessMap = true
          if ((mat as any).emissiveMap) pbrStatus.hasEmissiveMap = true
        }
      }

      const lowerName = (obj.name || '').toLowerCase()
      if (
        lowerName.includes('front') ||
        lowerName.includes('chest') ||
        lowerName.includes('back') ||
        lowerName.includes('sleeve') ||
        lowerName.includes('hood') ||
        lowerName.includes('body') ||
        lowerName.includes('custom')
      ) {
        customizableMeshCount++
      }
    }
  })

  // GLB Compatibility Gate: Loads cleanly, has at least one mesh and valid geometry
  const isGlbCompatible = meshCount > 0 && vertexCount > 0 && !invalidGeometry
  if (invalidGeometry) validationIssues.push('Invalid positions, indices, triangle buffers, or singular transforms. Repair geometry before editing.')

  // Customizer Compatibility Gate: Has UVs, proper meshes and orientation
  const isCustomizerCompatible =
    isGlbCompatible && hasUVs && meshCount >= 1 && triangleCount > 0 && triangleCount < 250000

  // BlackBullet Runtime Compatibility Gate:
  // Requires specific registered BlackBullet region contracts (front/back design zones)
  const isBlackBulletReady = isCustomizerCompatible && verifyRuntimeContract(scene)
  if (overlappingUvDetected) recommendations.push('Overlapping UV triangles detected within a material target. Isolate parts or unwrap before adding independent artwork.')

  if (!hasUVs) {
    recommendations.push('Apply UV unwrapping before attempting texture customization.')
  }
  if (!hasNormals) {
    recommendations.push('Recalculate smooth vertex normals for PBR shading fidelity.')
  }
  if (!isBlackBulletReady) {
    recommendations.push(
      'Model does not yet satisfy BlackBullet front/back registration contracts. Use Semantic Part Inspector to assign customizable zones.'
    )
  }
  if (triangleCount > 100000) {
    recommendations.push('Triangle budget exceeds 100k; consider running Web Optimized decimation preset.')
  }

  return {
    isGlbCompatible,
    isCustomizerCompatible,
    isBlackBulletReady,
    meshCount,
    triangleCount: Math.round(triangleCount),
    vertexCount,
    hasNormals,
    hasUVs,
    uvChannelCount: maxUvChannels,
    overlappingUvDetected,
    pbrMapsDetected: pbrStatus,
    dimensions: {
      width: parseFloat(size.x.toFixed(3)),
      height: parseFloat(size.y.toFixed(3)),
      depth: parseFloat(size.z.toFixed(3)),
    },
    semanticPartsDetected: semanticParts,
    validationIssues,
    recommendations,
  }
}

export async function validateGlbBuffer(buffer: ArrayBuffer): Promise<GenerationQualityReport> {
  const scene = await parseGlbBufferToThree(buffer)
  return analyzeGlbScene(scene)
}
