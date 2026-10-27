import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { MeshProcessingOptions, MeshProcessingPreset } from '@/types/ai-generator'
import { analyzeMeshHierarchy, MeshDiagnosis } from './mesh-analyzer'

// Ensure node server environment has FileReader for GLTFExporter
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    result: string | ArrayBuffer | null = null
    onloadend: (() => void) | null = null

    readAsArrayBuffer(blob: Blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf
        this.onloadend?.()
      })
    }
    readAsDataURL(blob: Blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buf).toString('base64')}`
        this.onloadend?.()
      })
    }
  } as any
}

export interface ProcessingReport {
  preset: MeshProcessingPreset
  timestamp: string
  diagnosisBefore: MeshDiagnosis
  diagnosisAfter: MeshDiagnosis
  trianglesBefore: number
  trianglesAfter: number
  verticesBefore: number
  verticesAfter: number
  normalsRecalculated: boolean
  uvsGeneratedCount: number
  degenerateRemovedCount: number
  centered: boolean
  scaledToDimensions: boolean
  appliedOperations: string[]
}

export function generateBoxUVs(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox || new THREE.Box3()
  const size = new THREE.Vector3()
  box.getSize(size)

  const sizeX = Math.max(1e-5, size.x)
  const sizeY = Math.max(1e-5, size.y)
  const sizeZ = Math.max(1e-5, size.z)

  const pos = geometry.getAttribute('position')
  if (!pos) return

  const uvs = new Float32Array(pos.count * 2)
  const normal = geometry.getAttribute('normal')
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    if (normal) {
      n.fromBufferAttribute(normal, i)
    } else {
      n.set(0, 1, 0)
    }

    const absX = Math.abs(n.x)
    const absY = Math.abs(n.y)
    const absZ = Math.abs(n.z)

    let u = 0, valV = 0
    if (absX >= absY && absX >= absZ) {
      u = (v.z - box.min.z) / sizeZ
      valV = (v.y - box.min.y) / sizeY
    } else if (absY >= absX && absY >= absZ) {
      u = (v.x - box.min.x) / sizeX
      valV = (v.z - box.min.z) / sizeZ
    } else {
      u = (v.x - box.min.x) / sizeX
      valV = (v.y - box.min.y) / sizeY
    }

    uvs[i * 2] = Math.max(0, Math.min(1, u))
    uvs[i * 2 + 1] = Math.max(0, Math.min(1, valV))
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
}

export function eliminateDegenerateTrianglesFromGeometry(geometry: THREE.BufferGeometry): number {
  const pos = geometry.getAttribute('position')
  const index = geometry.getIndex()
  if (!pos) return 0

  let removed = 0
  const triCount = index ? index.count / 3 : pos.count / 3
  const validIndices: number[] = []
  const groups: { start: number; count: number; materialIndex: number }[] = []

  const vA = new THREE.Vector3()
  const vB = new THREE.Vector3()
  const vC = new THREE.Vector3()

  for (let i = 0; i < triCount; i++) {
    const i0 = index ? index.getX(i * 3) : i * 3
    const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1
    const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2

    vA.fromBufferAttribute(pos, i0)
    vB.fromBufferAttribute(pos, i1)
    vC.fromBufferAttribute(pos, i2)

    const edge1 = new THREE.Vector3().subVectors(vB, vA)
    const edge2 = new THREE.Vector3().subVectors(vC, vA)
    const area = new THREE.Vector3().crossVectors(edge1, edge2).length() * 0.5

    if (area < 1e-7 || isNaN(area)) {
      removed++
    } else {
      const materialIndex = geometry.groups.find(group => i * 3 >= group.start && i * 3 < group.start + group.count)?.materialIndex || 0
      const last = groups[groups.length - 1]
      if (last?.materialIndex === materialIndex) last.count += 3
      else groups.push({ start: validIndices.length, count: 3, materialIndex })
      validIndices.push(i0, i1, i2)
    }
  }

  if (removed > 0) {
    geometry.setIndex(validIndices)
    geometry.clearGroups()
    for (const group of groups) geometry.addGroup(group.start, group.count, group.materialIndex)
  }

  return removed
}

export function processSceneHierarchy(
  root: THREE.Group,
  options: MeshProcessingOptions
): { appliedOperations: string[]; normalsRecalculated: boolean; uvsGeneratedCount: number; degenerateRemovedCount: number } {
  const appliedOperations: string[] = []
  let normalsRecalculated = false
  let uvsGeneratedCount = 0
  let degenerateRemovedCount = 0

  const preset = options.preset || 'web_optimized'

  const shouldCenter = options.centerPivot ?? true
  const shouldNormals = options.recalculateNormals ?? (preset !== 'preserve_high_detail')
  const shouldFixUVs = options.unwrapMissingUVs ?? (preset === 'customizer_preparation' || preset === 'blackbullet_garment_preparation')
  const shouldRemoveDegenerate = preset === 'web_optimized' || preset === 'customizer_preparation'

  // 1. Mesh-level operations
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geom = obj.geometry

      if (shouldRemoveDegenerate) {
        const removed = eliminateDegenerateTrianglesFromGeometry(geom)
        if (removed > 0) {
          degenerateRemovedCount += removed
        }
      }

      if (shouldNormals || !geom.getAttribute('normal')) {
        geom.computeVertexNormals()
        normalsRecalculated = true
      }

      if (!geom.getAttribute('uv') && shouldFixUVs) {
        generateBoxUVs(geom)
        uvsGeneratedCount++
      }
    }
  })

  if (normalsRecalculated) appliedOperations.push('Recalculated vertex normals')
  if (uvsGeneratedCount > 0) appliedOperations.push(`Generated UV coordinates for ${uvsGeneratedCount} mesh(es)`)
  if (degenerateRemovedCount > 0) appliedOperations.push(`Eliminated ${degenerateRemovedCount} degenerate triangle(s)`)

  // 2. Global Transform & Pivot Centering
  if (shouldCenter) {
    const box = new THREE.Box3().setFromObject(root)
    const center = new THREE.Vector3()
    box.getCenter(center)

    // Center on X and Z, and ground bottom at Y = 0
    const offsetX = -center.x
    const offsetY = -box.min.y
    const offsetZ = -center.z

    root.position.x += offsetX
    root.position.y += offsetY
    root.position.z += offsetZ
    appliedOperations.push(`Centered model pivot (offset: [${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}, ${offsetZ.toFixed(2)}])`)
  }

  // 3. Optional Scaling to real-world dimensions
  if (options.scaleToDimensions) {
    const target = options.scaleToDimensions
    const currentBox = new THREE.Box3().setFromObject(root)
    const currentSize = new THREE.Vector3()
    currentBox.getSize(currentSize)

    if (currentSize.x > 0 && target.width && target.width > 0) {
      const scaleFactor = (target.width / 100) / currentSize.x
      root.scale.multiplyScalar(scaleFactor)
      appliedOperations.push(`Proportionally scaled to target width: ${target.width} cm`)
    }
  }

  return {
    appliedOperations,
    normalsRecalculated,
    uvsGeneratedCount,
    degenerateRemovedCount,
  }
}

export async function processGlbBuffer(
  inputBuffer: ArrayBuffer,
  options: MeshProcessingOptions
): Promise<{ processedBuffer: ArrayBuffer; report: ProcessingReport }> {
  // 1. Parse input
  const loader = new GLTFLoader()
  const gltf = await new Promise<any>((resolve, reject) => {
    loader.parse(inputBuffer, '', resolve, reject)
  })

  const sourceScene = gltf.scene as THREE.Group
  const diagnosisBefore = analyzeMeshHierarchy(sourceScene)

  // 2. Clone scene to guarantee source asset immutability
  const clonedScene = sourceScene.clone(true)
  clonedScene.traverse(object => {
    if (object instanceof THREE.Mesh) object.geometry = object.geometry.clone()
  })

  // 3. Apply processing operations
  const result = processSceneHierarchy(clonedScene, options)
  const diagnosisAfter = analyzeMeshHierarchy(clonedScene)

  // 4. Export to GLB ArrayBuffer
  const exporter = new GLTFExporter()
  const processedBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      clonedScene,
      (out) => resolve(out as ArrayBuffer),
      (err) => reject(new Error(`GLTF export failed: ${err instanceof Error ? err.message : String(err)}`)),
      { binary: true }
    )
  })

  const report: ProcessingReport = {
    preset: options.preset,
    timestamp: new Date().toISOString(),
    diagnosisBefore,
    diagnosisAfter,
    trianglesBefore: diagnosisBefore.totalTriangles,
    trianglesAfter: diagnosisAfter.totalTriangles,
    verticesBefore: diagnosisBefore.totalVertices,
    verticesAfter: diagnosisAfter.totalVertices,
    normalsRecalculated: result.normalsRecalculated,
    uvsGeneratedCount: result.uvsGeneratedCount,
    degenerateRemovedCount: result.degenerateRemovedCount,
    centered: options.centerPivot ?? true,
    scaledToDimensions: !!options.scaleToDimensions,
    appliedOperations: result.appliedOperations,
  }

  return { processedBuffer, report }
}
