import * as THREE from 'three'

export interface MeshDiagnosis {
  meshCount: number
  totalTriangles: number
  totalVertices: number
  degenerateTriangles: number
  nonManifoldEdges: number
  invertedFacesEstimate: number
  missingUVCount: number
  disconnectedComponents: number
  boundingBox: {
    min: [number, number, number]
    max: [number, number, number]
    size: [number, number, number]
    center: [number, number, number]
  }
  isCentered: boolean
  isGrounded: boolean
  orientation: 'y_up' | 'z_up' | 'unknown'
  issues: string[]
  recommendedPreset:
    | 'preview_optimized'
    | 'web_optimized'
    | 'customizer_preparation'
    | 'blackbullet_garment_preparation'
    | 'preserve_high_detail'
}

export function analyzeMeshHierarchy(root: THREE.Object3D): MeshDiagnosis {
  let meshCount = 0
  let totalTriangles = 0
  let totalVertices = 0
  let degenerateTriangles = 0
  let nonManifoldEdges = 0
  let invertedFacesEstimate = 0
  let missingUVCount = 0
  const issues: string[] = []

  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  const isCentered = Math.abs(center.x) < 0.05 && Math.abs(center.z) < 0.05
  const isGrounded = Math.abs(box.min.y) < 0.05

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      meshCount++
      const geom = obj.geometry
      const pos = geom.getAttribute('position')
      const uv = geom.getAttribute('uv')
      const normal = geom.getAttribute('normal')
      const index = geom.getIndex()

      if (!uv) {
        missingUVCount++
      }

      if (pos) {
        totalVertices += pos.count
        const triCount = index ? index.count / 3 : pos.count / 3
        totalTriangles += triCount

        // Inspect edge manifoldness & degenerate triangles
        const edgeMap = new Map<string, number>()
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

          // Area of triangle using cross product
          const edge1 = new THREE.Vector3().subVectors(vB, vA)
          const edge2 = new THREE.Vector3().subVectors(vC, vA)
          const area = new THREE.Vector3().crossVectors(edge1, edge2).length() * 0.5

          if (area < 1e-7 || isNaN(area)) {
            degenerateTriangles++
          }

          // Edge map for manifold detection
          const edges = [
            [Math.min(i0, i1), Math.max(i0, i1)],
            [Math.min(i1, i2), Math.max(i1, i2)],
            [Math.min(i2, i0), Math.max(i2, i0)],
          ]

          for (const [e0, e1] of edges) {
            const key = `${e0}_${e1}`
            const count = (edgeMap.get(key) || 0) + 1
            edgeMap.set(key, count)
            if (count === 3) {
              nonManifoldEdges++
            }
          }

          // Check inverted face estimate against bounding center
          if (normal) {
            const faceNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()
            const faceCenter = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3)
            const toCenter = new THREE.Vector3().subVectors(faceCenter, center)
            if (faceNormal.dot(toCenter) < -0.85) {
              invertedFacesEstimate++
            }
          }
        }
      }
    }
  })

  if (degenerateTriangles > 0) {
    issues.push(`Detected ${degenerateTriangles} degenerate or zero-area triangle(s).`)
  }
  if (nonManifoldEdges > 0) {
    issues.push(`Detected ${nonManifoldEdges} non-manifold edge(s) shared by more than two faces.`)
  }
  if (missingUVCount > 0) {
    issues.push(`${missingUVCount} mesh(es) lack UV coordinates.`)
  }
  if (!isCentered) {
    issues.push('Model pivot is offset from origin (X/Z center).')
  }

  let recommendedPreset: MeshDiagnosis['recommendedPreset'] = 'web_optimized'
  if (totalTriangles > 120000) {
    recommendedPreset = 'web_optimized'
  } else if (missingUVCount > 0) {
    recommendedPreset = 'customizer_preparation'
  } else if (issues.length === 0) {
    recommendedPreset = 'preserve_high_detail'
  }

  return {
    meshCount,
    totalTriangles: Math.round(totalTriangles),
    totalVertices,
    degenerateTriangles,
    nonManifoldEdges,
    invertedFacesEstimate,
    missingUVCount,
    disconnectedComponents: meshCount,
    boundingBox: {
      min: [parseFloat(box.min.x.toFixed(3)), parseFloat(box.min.y.toFixed(3)), parseFloat(box.min.z.toFixed(3))],
      max: [parseFloat(box.max.x.toFixed(3)), parseFloat(box.max.y.toFixed(3)), parseFloat(box.max.z.toFixed(3))],
      size: [parseFloat(size.x.toFixed(3)), parseFloat(size.y.toFixed(3)), parseFloat(size.z.toFixed(3))],
      center: [parseFloat(center.x.toFixed(3)), parseFloat(center.y.toFixed(3)), parseFloat(center.z.toFixed(3))],
    },
    isCentered,
    isGrounded,
    orientation: size.y >= size.z ? 'y_up' : 'z_up',
    issues,
    recommendedPreset,
  }
}
