import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { SceneNode, MaterialData } from '@/types/scene'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'
import { inspectScene, compareSceneRoundTrip } from '@/engine/validation/scene-integrity'
import { waitForSceneTextures } from '@/engine/scene/material-manager'
import { disposeScene } from '@/engine/scene/resource-lifecycle'

export interface ExportVerificationResult {
  blob: Blob
  byteSize: number
  verified: boolean
  reloadedMeshCount: number
  reloadedTriangleCount: number
  uvCheckPassed: boolean
  hasMaterials: boolean
  issues: string[]
  warnings: string[]
  exportedMaterials: unknown[]
}

export async function exportSceneToGLB(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  filterNodeId?: string,
  options?: {
    binary?: boolean
    onlyVisible?: boolean
    embedImages?: boolean
  }
): Promise<ExportVerificationResult> {
  const rootObject = buildThreeSceneFromNodes(nodes, rootNodeIds, materials, filterNodeId, options?.onlyVisible ?? true)
  const sourceIntegrity = inspectScene(rootObject)
  await waitForSceneTextures(rootObject)

  const exporter = new GLTFExporter()
  const exportOptions = {
    binary: options?.binary ?? true,
    onlyVisible: options?.onlyVisible ?? true,
    embedImages: options?.embedImages ?? true,
  }

  const output = await new Promise<ArrayBuffer | object>((resolve, reject) => {
    exporter.parse(
      rootObject,
      (result) => resolve(result),
      (error) => reject(new Error(`GLTF Export error: ${error instanceof Error ? error.message : String(error)}`)),
      exportOptions
    )
  })

  let blob: Blob
  let arrayBuffer: ArrayBuffer

  if (output instanceof ArrayBuffer) {
    arrayBuffer = output
    blob = new Blob([output], { type: 'model/gltf-binary' })
  } else {
    const jsonString = JSON.stringify(output, null, 2)
    blob = new Blob([jsonString], { type: 'application/json' })
    const encoder = new TextEncoder()
    arrayBuffer = encoder.encode(jsonString).buffer as ArrayBuffer
  }

  // --- Step 2: Verification by re-parsing with GLTFLoader ---
  const issues: string[] = [...sourceIntegrity.errors]
  const warnings: string[] = [...sourceIntegrity.warnings]
  for (const material of Object.values(materials)) {
    if (material.wireframe) warnings.push(`${material.name}: stored wireframe flag ignored; wireframe is a viewport preference.`)
  }
  const exportedJSON = output instanceof ArrayBuffer
    ? JSON.parse(new TextDecoder().decode(new Uint8Array(output, 20, new DataView(output).getUint32(12, true))))
    : output
  let reloadedMeshCount = 0
  let reloadedTriangleCount = 0
  let uvCheckPassed = true
  let hasMaterials = false

  try {
    const loader = new GLTFLoader()
    const gltf = await new Promise<THREE.Group>((resolve, reject) => {
      loader.parse(
        arrayBuffer,
        '',
        (loadedGltf) => resolve(loadedGltf.scene),
        (err) => reject(new Error(`Verification reload failed: ${err instanceof Error ? err.message : String(err)}`))
      )
    })

    const comparison = compareSceneRoundTrip(rootObject, gltf)
    const reloadedIntegrity = inspectScene(gltf)
    issues.push(...comparison.errors, ...reloadedIntegrity.errors)
    warnings.push(...comparison.warnings, ...reloadedIntegrity.warnings)

    gltf.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        reloadedMeshCount++
        if (child.geometry) {
          const index = child.geometry.index
          const pos = child.geometry.attributes.position
          const tris = index ? index.count / 3 : (pos ? pos.count / 3 : 0)
          reloadedTriangleCount += Math.round(tris)

          if (!child.geometry.attributes.uv) {
            uvCheckPassed = false
            issues.push(`Mesh "${child.name}" is missing UV coordinates.`)
          }
        }
        if (child.material) {
          hasMaterials = true
        }
      }
    })

    if (reloadedMeshCount === 0) {
      issues.push('Verification found 0 meshes in exported GLB.')
    }
    disposeScene(gltf, true)
  } catch (verifyErr) {
    issues.push(`Reload verification error: ${verifyErr instanceof Error ? verifyErr.message : String(verifyErr)}`)
  }

  rootObject.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      const assigned = Array.isArray(object.material) ? object.material : [object.material]
      assigned.forEach((material) => material.dispose())
    }
  })
  const verified = issues.length === 0

  return {
    blob,
    byteSize: blob.size,
    verified,
    reloadedMeshCount,
    reloadedTriangleCount,
    uvCheckPassed,
    hasMaterials,
    issues: [...new Set(issues)],
    warnings: [...new Set(warnings)],
    exportedMaterials: exportedJSON.materials || [],
  }
}
