import * as THREE from 'three'
import {
  TopologyGraph,
  TopologyVertex,
  TopologyEdge,
  TopologyFace,
  TopologyFaceCorner,
  TopologyStats,
} from '@/types/topology'

/**
 * Builds a topology-aware data structure from Three.js BufferGeometry.
 * Unifies vertices that share the exact 3D position (within tolerance)
 * while preserving per-corner UVs, normals, and multi-material groups.
 */
export function buildTopologyFromBufferGeometry(
  geometry: THREE.BufferGeometry,
  tolerance = 1e-5
): TopologyGraph {
  const posAttr = geometry.attributes.position
  if (!posAttr) {
    throw new Error('Geometry has no position attribute')
  }

  const uvAttr = geometry.attributes.uv
  const normAttr = geometry.attributes.normal
  const indexAttr = geometry.index

  const invTol = 1 / tolerance
  const quantizeKey = (x: number, y: number, z: number): string => {
    const qx = Math.round(x * invTol)
    const qy = Math.round(y * invTol)
    const qz = Math.round(z * invTol)
    return `${qx}_${qy}_${qz}`
  }

  const vertices = new Map<number, TopologyVertex>()
  const edges = new Map<number, TopologyEdge>()
  const faces = new Map<number, TopologyFace>()

  const spatialMap = new Map<string, number>()
  const bufferToTopologyMap: number[] = new Array(posAttr.count)
  const topologyToBuffersMap = new Map<number, number[]>()

  let nextVertexId = 0

  // 1. Unify vertices by spatial location
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    const key = quantizeKey(x, y, z)

    let vId = spatialMap.get(key)
    if (vId === undefined) {
      vId = nextVertexId++
      spatialMap.set(key, vId)
      vertices.set(vId, {
        id: vId,
        position: [x, y, z],
        connectedEdges: [],
        connectedFaces: [],
      })
      topologyToBuffersMap.set(vId, [i])
    } else {
      topologyToBuffersMap.get(vId)!.push(i)
    }
    bufferToTopologyMap[i] = vId
  }

  // Helper for unique edges
  const edgeKeyMap = new Map<string, number>()
  let nextEdgeId = 0

  const getOrCreateEdge = (v0: number, v1: number): number => {
    const minV = Math.min(v0, v1)
    const maxV = Math.max(v0, v1)
    const key = `${minV}_${maxV}`
    let eId = edgeKeyMap.get(key)
    if (eId === undefined) {
      eId = nextEdgeId++
      edgeKeyMap.set(key, eId)
      const edge: TopologyEdge = {
        id: eId,
        vertexIds: [minV, maxV],
        faceIds: [],
      }
      edges.set(eId, edge)
      vertices.get(minV)!.connectedEdges.push(eId)
      vertices.get(maxV)!.connectedEdges.push(eId)
    }
    return eId
  }

  // 2. Iterate faces (triangles)
  const triangleCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3
  const groups = geometry.groups || []

  const getMaterialIndexForTriangle = (triangleIndex: number): number => {
    if (!groups.length) return 0
    const vertexIndex = triangleIndex * 3
    for (const grp of groups) {
      if (vertexIndex >= grp.start && vertexIndex < grp.start + grp.count) {
        return grp.materialIndex ?? 0
      }
    }
    return 0
  }

  let materialSlotMax = 0

  for (let t = 0; t < triangleCount; t++) {
    const b0 = indexAttr ? indexAttr.getX(t * 3) : t * 3
    const b1 = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1
    const b2 = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2

    const v0 = bufferToTopologyMap[b0]
    const v1 = bufferToTopologyMap[b1]
    const v2 = bufferToTopologyMap[b2]

    const e0 = getOrCreateEdge(v0, v1)
    const e1 = getOrCreateEdge(v1, v2)
    const e2 = getOrCreateEdge(v2, v0)

    const c0: TopologyFaceCorner = {
      sourceIndex: b0,
      vertexId: v0,
      uv: uvAttr ? [uvAttr.getX(b0), uvAttr.getY(b0)] : undefined,
      normal: normAttr ? [normAttr.getX(b0), normAttr.getY(b0), normAttr.getZ(b0)] : undefined,
    }
    const c1: TopologyFaceCorner = {
      sourceIndex: b1,
      vertexId: v1,
      uv: uvAttr ? [uvAttr.getX(b1), uvAttr.getY(b1)] : undefined,
      normal: normAttr ? [normAttr.getX(b1), normAttr.getY(b1), normAttr.getZ(b1)] : undefined,
    }
    const c2: TopologyFaceCorner = {
      sourceIndex: b2,
      vertexId: v2,
      uv: uvAttr ? [uvAttr.getX(b2), uvAttr.getY(b2)] : undefined,
      normal: normAttr ? [normAttr.getX(b2), normAttr.getY(b2), normAttr.getZ(b2)] : undefined,
    }

    // Compute geometric face normal
    const p0 = vertices.get(v0)!.position
    const p1 = vertices.get(v1)!.position
    const p2 = vertices.get(v2)!.position

    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
    const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2]
    let nx = ay * bz - az * by
    let ny = az * bx - ax * bz
    let nz = ax * by - ay * bx
    const len = Math.hypot(nx, ny, nz)
    if (len > 1e-8) {
      nx /= len; ny /= len; nz /= len
    } else {
      nx = 0; ny = 1; nz = 0
    }

    const matIdx = getMaterialIndexForTriangle(t)
    if (matIdx > materialSlotMax) materialSlotMax = matIdx

    const faceId = t
    const face: TopologyFace = {
      id: faceId,
      vertexIds: [v0, v1, v2],
      edgeIds: [e0, e1, e2],
      corners: [c0, c1, c2],
      materialIndex: matIdx,
      normal: [nx, ny, nz],
    }

    faces.set(faceId, face)
    edges.get(e0)!.faceIds.push(faceId)
    edges.get(e1)!.faceIds.push(faceId)
    edges.get(e2)!.faceIds.push(faceId)

    vertices.get(v0)!.connectedFaces.push(faceId)
    vertices.get(v1)!.connectedFaces.push(faceId)
    vertices.get(v2)!.connectedFaces.push(faceId)
  }

  const seams = geometry.userData.uvSeams as number[][][] | undefined
  if (seams?.length) {
    const key = (points: number[][]) => points.map(point => point.join(',')).sort().join('|')
    const marked = new Set(seams.map(key))
    for (const edge of edges.values()) edge.seam = marked.has(key(edge.vertexIds.map(id => vertices.get(id)!.position)))
  }
  return {
    vertices,
    edges,
    faces,
    bufferToTopologyMap,
    topologyToBuffersMap,
    hasUVs: !!uvAttr,
    hasNormals: !!normAttr,
    materialSlotCount: materialSlotMax + 1,
    originalVertexCount: posAttr.count,
    originalIndexCount: indexAttr ? indexAttr.count : posAttr.count,
  }
}

/**
 * Rebuilds a complete, renderable Three.js BufferGeometry from a TopologyGraph.
 * Correctly handles UV seam splits, custom corner normals, and material groups.
 */
export function rebuildBufferGeometryFromTopology(graph: TopologyGraph, source?: THREE.BufferGeometry): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry()

  // Corner deduplication map: key = vertexId + "_" + uv + "_" + normal
  const cornerKeyMap = new Map<string, number>()
  const sourceIndices: number[] = []
  const remappedCorners: [TopologyFaceCorner, number][] = []
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  let nextBufIdx = 0

  const getOrCreateBufferVertex = (corner: TopologyFaceCorner, faceNormal: [number, number, number]): number => {
    const v = graph.vertices.get(corner.vertexId)
    if (!v) throw new Error(`Topology vertex ${corner.vertexId} missing`)

    const uvKey = corner.uv ? `${corner.uv[0]}_${corner.uv[1]}` : 'none'
    const norm = corner.normal || faceNormal
    const normKey = `${norm[0]}_${norm[1]}_${norm[2]}`
    const key = `${corner.vertexId}_${uvKey}_${normKey}_${source ? corner.sourceIndex : ""}`

    let bufIdx = cornerKeyMap.get(key)
    if (bufIdx === undefined) {
      bufIdx = nextBufIdx++
      cornerKeyMap.set(key, bufIdx)

      sourceIndices.push(corner.sourceIndex ?? -1)
      positions.push(v.position[0], v.position[1], v.position[2])
      normals.push(norm[0], norm[1], norm[2])
      if (corner.uv) {
        uvs.push(corner.uv[0], corner.uv[1])
      } else {
        uvs.push(0, 0)
      }
    }
    remappedCorners.push([corner, bufIdx])
    return bufIdx
  }

  // Sort faces by materialIndex to build contiguous material groups
  const sortedFaces = Array.from(graph.faces.values()).sort(
    (a, b) => a.materialIndex - b.materialIndex
  )

  const indices: number[] = []
  graph.bufferFaceIds = sortedFaces.map(face => face.id)
  let currentMatIndex = -1
  let groupStart = 0

  for (let fIdx = 0; fIdx < sortedFaces.length; fIdx++) {
    const face = sortedFaces[fIdx]

    if (face.materialIndex !== currentMatIndex) {
      if (currentMatIndex !== -1) {
        geom.addGroup(groupStart, indices.length - groupStart, currentMatIndex)
      }
      currentMatIndex = face.materialIndex
      groupStart = indices.length
    }

    const b0 = getOrCreateBufferVertex(face.corners[0], face.normal)
    const b1 = getOrCreateBufferVertex(face.corners[1], face.normal)
    const b2 = getOrCreateBufferVertex(face.corners[2], face.normal)

    indices.push(b0, b1, b2)
  }

  if (currentMatIndex !== -1 && indices.length > groupStart) {
    geom.addGroup(groupStart, indices.length - groupStart, currentMatIndex)
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  if (graph.hasUVs || uvs.some((v) => v !== 0)) {
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  }

  if (source) {
    for (const [name, attribute] of Object.entries(source.attributes)) {
      if (['position', 'normal', 'uv'].includes(name)) continue
      if (sourceIndices.some(index => index < 0)) throw new Error('This topology operation cannot preserve secondary attributes. Use the Blender worker.')
      const values = sourceIndices.flatMap(index => Array.from({ length: attribute.itemSize }, (_, component) => attribute.getComponent(index, component)))
      geom.setAttribute(name, name === 'skinIndex' ? new THREE.Uint16BufferAttribute(values, attribute.itemSize) : new THREE.Float32BufferAttribute(values, attribute.itemSize))
    }
    geom.userData = structuredClone(source.userData)
  }
  geom.userData.uvSeams = [...graph.edges.values()].filter(edge => edge.seam).map(edge => edge.vertexIds.map(id => graph.vertices.get(id)!.position))
  graph.bufferToTopologyMap = []
  graph.topologyToBuffersMap = new Map()
  for (const [corner, index] of remappedCorners) {
    corner.sourceIndex = index
    graph.bufferToTopologyMap[index] = corner.vertexId
    const buffers = graph.topologyToBuffersMap.get(corner.vertexId) || []
    if (!buffers.includes(index)) buffers.push(index)
    graph.topologyToBuffersMap.set(corner.vertexId, buffers)
  }
  geom.setIndex(indices)
  geom.computeBoundingBox()
  geom.computeBoundingSphere()

  return geom
}

/**
 * Fast in-place position update for BufferGeometry when vertices are moved,
 * without re-allocating or re-indexing the entire buffer.
 */
export function updateBufferGeometryPositions(
  geometry: THREE.BufferGeometry,
  graph: TopologyGraph
): void {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute
  if (!posAttr) return

  for (const [topVertexId, bufferIndices] of graph.topologyToBuffersMap.entries()) {
    const v = graph.vertices.get(topVertexId)
    if (!v) continue
    const [x, y, z] = v.position
    for (const bIdx of bufferIndices) {
      posAttr.setXYZ(bIdx, x, y, z)
    }
  }

  posAttr.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
}

/**
 * Computes exact topological statistics including manifoldness,
 * boundary edges, degenerate faces, and surface area.
 */
export function getTopologyStats(graph: TopologyGraph): TopologyStats {
  let boundaryEdges = 0
  let nonManifoldEdges = 0

  for (const edge of graph.edges.values()) {
    if (edge.faceIds.length === 1) {
      boundaryEdges++
    } else if (edge.faceIds.length > 2) {
      nonManifoldEdges++
    }
  }

  let degenerateFaces = 0
  let surfaceArea = 0

  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  for (const v of graph.vertices.values()) {
    const [x, y, z] = v.position
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }

  for (const face of graph.faces.values()) {
    const [v0, v1, v2] = face.vertexIds
    if (v0 === v1 || v1 === v2 || v2 === v0) {
      degenerateFaces++
      continue
    }

    const p0 = graph.vertices.get(v0)!.position
    const p1 = graph.vertices.get(v1)!.position
    const p2 = graph.vertices.get(v2)!.position

    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
    const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2]
    const cx = ay * bz - az * by
    const cy = az * bx - ax * bz
    const cz = ax * by - ay * bx
    const area = 0.5 * Math.hypot(cx, cy, cz)

    if (area < 1e-10) {
      degenerateFaces++
    } else {
      surfaceArea += area
    }
  }

  if (minX === Infinity) {
    minX = minY = minZ = maxX = maxY = maxZ = 0
  }

  return {
    uniqueVertices: graph.vertices.size,
    bufferVertices: graph.originalVertexCount,
    totalEdges: graph.edges.size,
    boundaryEdges,
    nonManifoldEdges,
    totalFaces: graph.faces.size,
    degenerateFaces,
    materialSlots: graph.materialSlotCount,
    surfaceArea,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      size: [maxX - minX, maxY - minY, maxZ - minZ],
    },
  }
}

/**
 * Deep clones a TopologyGraph for safe undo/redo snapshots.
 */
export function cloneTopologyGraph(source: TopologyGraph): TopologyGraph {
  const vertices = new Map<number, TopologyVertex>()
  for (const [id, v] of source.vertices) {
    vertices.set(id, {
      id: v.id,
      position: [v.position[0], v.position[1], v.position[2]],
      connectedEdges: [...v.connectedEdges],
      connectedFaces: [...v.connectedFaces],
    })
  }

  const edges = new Map<number, TopologyEdge>()
  for (const [id, e] of source.edges) {
    edges.set(id, {
      seam: e.seam,
      id: e.id,
      vertexIds: [e.vertexIds[0], e.vertexIds[1]],
      faceIds: [...e.faceIds],
    })
  }

  const faces = new Map<number, TopologyFace>()
  for (const [id, f] of source.faces) {
    faces.set(id, {
      id: f.id,
      vertexIds: [f.vertexIds[0], f.vertexIds[1], f.vertexIds[2]],
      edgeIds: [f.edgeIds[0], f.edgeIds[1], f.edgeIds[2]],
      materialIndex: f.materialIndex,
      normal: [f.normal[0], f.normal[1], f.normal[2]],
      corners: [
        {
          sourceIndex: f.corners[0].sourceIndex,
          vertexId: f.corners[0].vertexId,
          uv: f.corners[0].uv ? [f.corners[0].uv[0], f.corners[0].uv[1]] : undefined,
          normal: f.corners[0].normal ? [f.corners[0].normal[0], f.corners[0].normal[1], f.corners[0].normal[2]] : undefined,
        },
        {
          sourceIndex: f.corners[1].sourceIndex,
          vertexId: f.corners[1].vertexId,
          uv: f.corners[1].uv ? [f.corners[1].uv[0], f.corners[1].uv[1]] : undefined,
          normal: f.corners[1].normal ? [f.corners[1].normal[0], f.corners[1].normal[1], f.corners[1].normal[2]] : undefined,
        },
        {
          sourceIndex: f.corners[2].sourceIndex,
          vertexId: f.corners[2].vertexId,
          uv: f.corners[2].uv ? [f.corners[2].uv[0], f.corners[2].uv[1]] : undefined,
          normal: f.corners[2].normal ? [f.corners[2].normal[0], f.corners[2].normal[1], f.corners[2].normal[2]] : undefined,
        },
      ],
    })
  }

  return {
    bufferFaceIds: source.bufferFaceIds ? [...source.bufferFaceIds] : undefined,
    vertices,
    edges,
    faces,
    bufferToTopologyMap: [...source.bufferToTopologyMap],
    topologyToBuffersMap: new Map(
      Array.from(source.topologyToBuffersMap.entries()).map(([k, v]) => [k, [...v]])
    ),
    hasUVs: source.hasUVs,
    hasNormals: source.hasNormals,
    materialSlotCount: source.materialSlotCount,
    originalVertexCount: source.originalVertexCount,
    originalIndexCount: source.originalIndexCount,
  }
}

