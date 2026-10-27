import * as THREE from 'three'
import { TopologyGraph, SelectionSubMode } from '@/types/topology'

export interface TopologyPickResult {
  vertexId?: number
  edgeId?: number
  faceId?: number
}

function distanceToSegmentSquared(
  p: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3
): number {
  const ab = new THREE.Vector3().subVectors(b, a)
  const ap = new THREE.Vector3().subVectors(p, a)
  const l2 = ab.lengthSq()
  if (l2 < 1e-10) return ap.lengthSq()
  const t = Math.max(0, Math.min(1, ap.dot(ab) / l2))
  const proj = new THREE.Vector3().copy(a).addScaledVector(ab, t)
  return p.distanceToSquared(proj)
}

/**
 * Resolves which topological element (vertex, edge, face) was hit based on
 * a Three.js Raycaster Intersection and the active SelectionSubMode.
 */
export function pickTopologyElement(
  graph: TopologyGraph,
  mesh: THREE.Mesh,
  intersection: THREE.Intersection,
  subMode: SelectionSubMode
): TopologyPickResult {
  const faceIdx = intersection.faceIndex
  if (faceIdx === undefined || faceIdx === null) {
    return {}
  }

  const face = graph.faces.get(graph.bufferFaceIds?.[faceIdx] ?? faceIdx)
  if (!face) return {}
  const localPoint = mesh.worldToLocal(intersection.point.clone())

  if (subMode === 'face') {
    return { faceId: face.id }
  }

  if (subMode === 'vertex') {
    let closestVId: number = face.vertexIds[0]
    let minDistSq = Infinity

    for (const vId of face.vertexIds) {
      const v = graph.vertices.get(vId)
      if (!v) continue
      const vPos = new THREE.Vector3(...v.position)
      const d2 = localPoint.distanceToSquared(vPos)
      if (d2 < minDistSq) {
        minDistSq = d2
        closestVId = vId
      }
    }
    return { vertexId: closestVId }
  }

  if (subMode === 'edge') {
    let closestEId: number = face.edgeIds[0]
    let minDistSq = Infinity

    for (const eId of face.edgeIds) {
      const edge = graph.edges.get(eId)
      if (!edge) continue
      const v0 = graph.vertices.get(edge.vertexIds[0])
      const v1 = graph.vertices.get(edge.vertexIds[1])
      if (!v0 || !v1) continue

      const p0 = new THREE.Vector3(...v0.position)
      const p1 = new THREE.Vector3(...v1.position)
      const d2 = distanceToSegmentSquared(localPoint, p0, p1)
      if (d2 < minDistSq) {
        minDistSq = d2
        closestEId = eId
      }
    }
    return { edgeId: closestEId }
  }

  return {}
}

/**
 * Calculates the average 3D center (centroid) of the selected topology vertices in local space.
 */
export function getCentroidOfVertices(
  graph: TopologyGraph,
  vertexIds: number[]
): THREE.Vector3 | null {
  if (!vertexIds.length) return null
  const sum = new THREE.Vector3(0, 0, 0)
  let count = 0
  for (const vId of vertexIds) {
    const v = graph.vertices.get(vId)
    if (v) {
      sum.add(new THREE.Vector3(...v.position))
      count++
    }
  }
  return count > 0 ? sum.divideScalar(count) : null
}

/**
 * Collects all unique vertex IDs associated with selected edges.
 */
export function getVerticesFromEdges(
  graph: TopologyGraph,
  edgeIds: number[]
): number[] {
  const set = new Set<number>()
  for (const eId of edgeIds) {
    const edge = graph.edges.get(eId)
    if (edge) {
      set.add(edge.vertexIds[0])
      set.add(edge.vertexIds[1])
    }
  }
  return Array.from(set)
}

/**
 * Collects all unique vertex IDs associated with selected faces.
 */
export function getVerticesFromFaces(
  graph: TopologyGraph,
  faceIds: number[]
): number[] {
  const set = new Set<number>()
  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (face) {
      set.add(face.vertexIds[0])
      set.add(face.vertexIds[1])
      set.add(face.vertexIds[2])
    }
  }
  return Array.from(set)
}
