import * as THREE from 'three'
import {
  TopologyGraph,
  TopologyVertex,
  TopologyEdge,
  TopologyFace,
  TopologyFaceCorner,
  SelectionSubMode,
} from '@/types/topology'
import { rebuildBufferGeometryFromTopology } from './topology-graph'

export interface ExtrudeOptions {
  distance: number
  direction?: [number, number, number]
  individual?: boolean
}

export interface InsetOptions {
  amount: number // 0 to 0.99 fraction towards centroid
  depth?: number // optional extrusion offset along normal
}

export interface SubdivideOptions {
  iterations?: number
}

export interface MergeOptions {
  mode: 'center' | 'distance'
  tolerance?: number
}

/**
 * Extrudes selected faces along their face normals or a specified direction.
 * Creates perimeter sidewall quads (2 triangles each), connects topology,
 * generates sidewall UVs, and preserves material assignments.
 */
export function extrudeFaces(
  graph: TopologyGraph,
  faceIds: number[],
  options: ExtrudeOptions
): { newFaceIds: number[]; extrudedFaceIds: number[] } {
  if (!faceIds.length) return { newFaceIds: [], extrudedFaceIds: [] }

  const distance = options.distance
  const selectedFaceSet = new Set(faceIds)

  // 1. Identify perimeter edges
  // An edge is on the perimeter if it belongs to exactly one selected face.
  const perimeterEdges: { edgeId: number; faceId: number; v0: number; v1: number }[] = []

  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue

    for (let i = 0; i < 3; i++) {
      const eId = face.edgeIds[i]
      const edge = graph.edges.get(eId)
      if (!edge) continue

      // Count how many selected faces share this edge
      let count = 0
      for (const sharingFaceId of edge.faceIds) {
        if (selectedFaceSet.has(sharingFaceId)) count++
      }

      if (count === 1 || options.individual) {
        // Directed orientation of edge (vA -> vB) according to face winding
        const vA = face.vertexIds[i]
        const vB = face.vertexIds[(i + 1) % 3]
        perimeterEdges.push({ edgeId: eId, faceId: fId, v0: vA, v1: vB })
      }
    }
  }

  // 2. Identify all vertices belonging to selected faces
  const selectedVertexSet = new Set<number>()
  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (face) {
      selectedVertexSet.add(face.vertexIds[0])
      selectedVertexSet.add(face.vertexIds[1])
      selectedVertexSet.add(face.vertexIds[2])
    }
  }

  // Calculate average normal for extrusion vector if not specified
  let avgNx = 0, avgNy = 0, avgNz = 0
  if (options.direction) {
    avgNx = options.direction[0]
    avgNy = options.direction[1]
    avgNz = options.direction[2]
  } else {
    for (const fId of faceIds) {
      const face = graph.faces.get(fId)
      if (face) {
        avgNx += face.normal[0]
        avgNy += face.normal[1]
        avgNz += face.normal[2]
      }
    }
    const len = Math.hypot(avgNx, avgNy, avgNz)
    if (len > 1e-8) {
      avgNx /= len
      avgNy /= len
      avgNz /= len
    } else {
      avgNy = 1
    }
  }

  // Find next available IDs
  let nextVId = Math.max(0, ...Array.from(graph.vertices.keys())) + 1
  let nextEId = Math.max(0, ...Array.from(graph.edges.keys())) + 1
  let nextFId = Math.max(0, ...Array.from(graph.faces.keys())) + 1

  // Map old vertex ID -> new extruded vertex ID
  const oldToNewVertexMap = new Map<number, number>()

  for (const vId of selectedVertexSet) {
    const oldV = graph.vertices.get(vId)
    if (!oldV) continue

    const newVId = nextVId++
    const newPos: [number, number, number] = [
      oldV.position[0] + avgNx * distance,
      oldV.position[1] + avgNy * distance,
      oldV.position[2] + avgNz * distance,
    ]

    const newV: TopologyVertex = {
      id: newVId,
      position: newPos,
      connectedEdges: [],
      connectedFaces: [],
    }

    graph.vertices.set(newVId, newV)
    oldToNewVertexMap.set(vId, newVId)
  }

  // 3. Update original selected faces to use the new extruded vertices
  const extrudedFaceIds: number[] = []

  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue

    const newV0 = oldToNewVertexMap.get(face.vertexIds[0])!
    const newV1 = oldToNewVertexMap.get(face.vertexIds[1])!
    const newV2 = oldToNewVertexMap.get(face.vertexIds[2])!

    // Unregister from old vertices
    const oldV0 = graph.vertices.get(face.vertexIds[0])
    const oldV1 = graph.vertices.get(face.vertexIds[1])
    const oldV2 = graph.vertices.get(face.vertexIds[2])
    if (oldV0) oldV0.connectedFaces = oldV0.connectedFaces.filter((id) => id !== fId)
    if (oldV1) oldV1.connectedFaces = oldV1.connectedFaces.filter((id) => id !== fId)
    if (oldV2) oldV2.connectedFaces = oldV2.connectedFaces.filter((id) => id !== fId)

    // Update face vertices
    face.vertexIds = [newV0, newV1, newV2]
    face.corners[0].vertexId = newV0
    face.corners[1].vertexId = newV1
    face.corners[2].vertexId = newV2

    // Register with new vertices
    graph.vertices.get(newV0)!.connectedFaces.push(fId)
    graph.vertices.get(newV1)!.connectedFaces.push(fId)
    graph.vertices.get(newV2)!.connectedFaces.push(fId)

    extrudedFaceIds.push(fId)
  }

  // 4. Create new sidewall quad faces along perimeter edges
  const newFaceIds: number[] = []

  for (const pEdge of perimeterEdges) {
    const vA = pEdge.v0
    const vB = pEdge.v1
    const vA_new = oldToNewVertexMap.get(vA)!
    const vB_new = oldToNewVertexMap.get(vB)!

    const origFace = graph.faces.get(pEdge.faceId)
    const matIdx = origFace ? origFace.materialIndex : 0

    // Get UVs from original face corner if available
    let uvA: [number, number] | undefined
    let uvB: [number, number] | undefined
    if (origFace) {
      for (const c of origFace.corners) {
        if (c.vertexId === vA_new) uvA = c.uv
        if (c.vertexId === vB_new) uvB = c.uv
      }
    }

    const uvA_bot = uvA ? [uvA[0], Math.max(0, uvA[1] - 0.2)] as [number, number] : undefined
    const uvB_bot = uvB ? [uvB[0], Math.max(0, uvB[1] - 0.2)] as [number, number] : undefined

    // Helper to add a triangle face
    const addSideTriangle = (
      t0: number,
      t1: number,
      t2: number,
      c0_uv?: [number, number],
      c1_uv?: [number, number],
      c2_uv?: [number, number]
    ): number => {
      const fId = nextFId++
      const p0 = graph.vertices.get(t0)!.position
      const p1 = graph.vertices.get(t1)!.position
      const p2 = graph.vertices.get(t2)!.position

      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
      const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2]
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx
      const len = Math.hypot(nx, ny, nz)
      if (len > 1e-8) {
        nx /= len; ny /= len; nz /= len
      } else {
        nx = avgNx; ny = avgNy; nz = avgNz
      }

      // Create or reuse edges
      const getOrCreateE = (u0: number, u1: number): number => {
        const minU = Math.min(u0, u1)
        const maxU = Math.max(u0, u1)
        for (const e of graph.edges.values()) {
          if (e.vertexIds[0] === minU && e.vertexIds[1] === maxU) {
            e.faceIds.push(fId)
            return e.id
          }
        }
        const eId = nextEId++
        const newEdge: TopologyEdge = {
          id: eId,
          vertexIds: [minU, maxU],
          faceIds: [fId],
        }
        graph.edges.set(eId, newEdge)
        graph.vertices.get(minU)!.connectedEdges.push(eId)
        graph.vertices.get(maxU)!.connectedEdges.push(eId)
        return eId
      }

      const e0 = getOrCreateE(t0, t1)
      const e1 = getOrCreateE(t1, t2)
      const e2 = getOrCreateE(t2, t0)

      const sideFace: TopologyFace = {
        id: fId,
        vertexIds: [t0, t1, t2],
        edgeIds: [e0, e1, e2],
        corners: [
          { vertexId: t0, uv: c0_uv, normal: [nx, ny, nz] },
          { vertexId: t1, uv: c1_uv, normal: [nx, ny, nz] },
          { vertexId: t2, uv: c2_uv, normal: [nx, ny, nz] },
        ],
        materialIndex: matIdx,
        normal: [nx, ny, nz],
      }

      graph.faces.set(fId, sideFace)
      graph.vertices.get(t0)!.connectedFaces.push(fId)
      graph.vertices.get(t1)!.connectedFaces.push(fId)
      graph.vertices.get(t2)!.connectedFaces.push(fId)
      return fId
    }

    // Quad triangle 1: (vA, vB, vB_new)
    const f1 = addSideTriangle(vA, vB, vB_new, uvA_bot, uvB_bot, uvB)
    // Quad triangle 2: (vA, vB_new, vA_new)
    const f2 = addSideTriangle(vA, vB_new, vA_new, uvA_bot, uvB, uvA)

    newFaceIds.push(f1, f2)
  }

  return { newFaceIds, extrudedFaceIds }
}

/**
 * Insets selected faces towards their geometric centroid.
 * Connects perimeter with an outer border ring of triangles,
 * leaving an inner inset face with configurable depth offset.
 */
export function insetFaces(
  graph: TopologyGraph,
  faceIds: number[],
  options: InsetOptions
): { newFaceIds: number[]; insetFaceIds: number[] } {
  if (!faceIds.length) return { newFaceIds: [], insetFaceIds: [] }

  const amount = Math.max(0.01, Math.min(0.95, options.amount))
  const depth = options.depth || 0

  let nextVId = Math.max(0, ...Array.from(graph.vertices.keys())) + 1
  let nextEId = Math.max(0, ...Array.from(graph.edges.keys())) + 1
  let nextFId = Math.max(0, ...Array.from(graph.faces.keys())) + 1

  const newFaceIds: number[] = []
  const insetFaceIds: number[] = []

  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue

    const [v0, v1, v2] = face.vertexIds
    const p0 = graph.vertices.get(v0)!.position
    const p1 = graph.vertices.get(v1)!.position
    const p2 = graph.vertices.get(v2)!.position

    // Centroid
    const cx = (p0[0] + p1[0] + p2[0]) / 3
    const cy = (p0[1] + p1[1] + p2[1]) / 3
    const cz = (p0[2] + p1[2] + p2[2]) / 3

    // Create 3 new inset vertices
    const createInsetV = (origPos: [number, number, number]): number => {
      const vid = nextVId++
      const nx = face.normal[0] * depth
      const ny = face.normal[1] * depth
      const nz = face.normal[2] * depth

      const pos: [number, number, number] = [
        origPos[0] + (cx - origPos[0]) * amount + nx,
        origPos[1] + (cy - origPos[1]) * amount + ny,
        origPos[2] + (cz - origPos[2]) * amount + nz,
      ]

      graph.vertices.set(vid, {
        id: vid,
        position: pos,
        connectedEdges: [],
        connectedFaces: [],
      })
      return vid
    }

    const iv0 = createInsetV(p0)
    const iv1 = createInsetV(p1)
    const iv2 = createInsetV(p2)

    // Helper for edges
    const getOrCreateE = (u0: number, u1: number, faceOwnerId: number): number => {
      const minU = Math.min(u0, u1)
      const maxU = Math.max(u0, u1)
      for (const e of graph.edges.values()) {
        if (e.vertexIds[0] === minU && e.vertexIds[1] === maxU) {
          e.faceIds.push(faceOwnerId)
          return e.id
        }
      }
      const eid = nextEId++
      graph.edges.set(eid, {
        id: eid,
        vertexIds: [minU, maxU],
        faceIds: [faceOwnerId],
      })
      graph.vertices.get(minU)!.connectedEdges.push(eid)
      graph.vertices.get(maxU)!.connectedEdges.push(eid)
      return eid
    }

    const addTri = (
      t0: number,
      t1: number,
      t2: number,
      c0_uv?: [number, number],
      c1_uv?: [number, number],
      c2_uv?: [number, number]
    ): number => {
      const newFid = nextFId++
      const e0 = getOrCreateE(t0, t1, newFid)
      const e1 = getOrCreateE(t1, t2, newFid)
      const e2 = getOrCreateE(t2, t0, newFid)

      const f: TopologyFace = {
        id: newFid,
        vertexIds: [t0, t1, t2],
        edgeIds: [e0, e1, e2],
        corners: [
          { vertexId: t0, uv: c0_uv, normal: face.normal },
          { vertexId: t1, uv: c1_uv, normal: face.normal },
          { vertexId: t2, uv: c2_uv, normal: face.normal },
        ],
        materialIndex: face.materialIndex,
        normal: [...face.normal],
      }
      graph.faces.set(newFid, f)
      graph.vertices.get(t0)!.connectedFaces.push(newFid)
      graph.vertices.get(t1)!.connectedFaces.push(newFid)
      graph.vertices.get(t2)!.connectedFaces.push(newFid)
      return newFid
    }

    const uv0 = face.corners[0].uv
    const uv1 = face.corners[1].uv
    const uv2 = face.corners[2].uv

    // Calculate inset UVs by lerping towards UV centroid
    let iuv0 = uv0, iuv1 = uv1, iuv2 = uv2
    if (uv0 && uv1 && uv2) {
      const cu = (uv0[0] + uv1[0] + uv2[0]) / 3
      const cv = (uv0[1] + uv1[1] + uv2[1]) / 3
      iuv0 = [uv0[0] + (cu - uv0[0]) * amount, uv0[1] + (cv - uv0[1]) * amount]
      iuv1 = [uv1[0] + (cu - uv1[0]) * amount, uv1[1] + (cv - uv1[1]) * amount]
      iuv2 = [uv2[0] + (cu - uv2[0]) * amount, uv2[1] + (cv - uv2[1]) * amount]
    }

    // Border ring quad 1: (v0, v1, iv1) and (v0, iv1, iv0)
    newFaceIds.push(addTri(v0, v1, iv1, uv0, uv1, iuv1))
    newFaceIds.push(addTri(v0, iv1, iv0, uv0, iuv1, iuv0))

    // Border ring quad 2: (v1, v2, iv2) and (v1, iv2, iv1)
    newFaceIds.push(addTri(v1, v2, iv2, uv1, uv2, iuv2))
    newFaceIds.push(addTri(v1, iv2, iv1, uv1, iuv2, iuv1))

    // Border ring quad 3: (v2, v0, iv0) and (v2, iv0, iv2)
    newFaceIds.push(addTri(v2, v0, iv0, uv2, uv0, iuv0))
    newFaceIds.push(addTri(v2, iv0, iv2, uv2, iuv0, iuv2))

    // Update central face to become the inset face
    // Unlink old vertices
    const oldV0 = graph.vertices.get(v0)
    const oldV1 = graph.vertices.get(v1)
    const oldV2 = graph.vertices.get(v2)
    if (oldV0) oldV0.connectedFaces = oldV0.connectedFaces.filter((id) => id !== fId)
    if (oldV1) oldV1.connectedFaces = oldV1.connectedFaces.filter((id) => id !== fId)
    if (oldV2) oldV2.connectedFaces = oldV2.connectedFaces.filter((id) => id !== fId)

    face.vertexIds = [iv0, iv1, iv2]
    face.corners[0] = { vertexId: iv0, uv: iuv0, normal: face.normal }
    face.corners[1] = { vertexId: iv1, uv: iuv1, normal: face.normal }
    face.corners[2] = { vertexId: iv2, uv: iuv2, normal: face.normal }

    const ie0 = getOrCreateE(iv0, iv1, fId)
    const ie1 = getOrCreateE(iv1, iv2, fId)
    const ie2 = getOrCreateE(iv2, iv0, fId)
    face.edgeIds = [ie0, ie1, ie2]

    graph.vertices.get(iv0)!.connectedFaces.push(fId)
    graph.vertices.get(iv1)!.connectedFaces.push(fId)
    graph.vertices.get(iv2)!.connectedFaces.push(fId)

    insetFaceIds.push(fId)
  }

  return { newFaceIds, insetFaceIds }
}

/**
 * 1-to-4 Midpoint Subdivision on selected faces.
 * Splits every triangle into 4 smaller triangles, correctly interpolating
 * vertex positions, normals, and UV coordinates.
 */
export function subdivideFaces(
  graph: TopologyGraph,
  faceIds: number[]
): { newFaceIds: number[] } {
  if (!faceIds.length) return { newFaceIds: [] }

  let nextVId = Math.max(0, ...Array.from(graph.vertices.keys())) + 1
  let nextEId = Math.max(0, ...Array.from(graph.edges.keys())) + 1
  let nextFId = Math.max(0, ...Array.from(graph.faces.keys())) + 1

  const midpointCache = new Map<string, number>()
  const midpointUvCache = new Map<string, [number, number]>()

  const getOrCreateMidpoint = (
    vA: number,
    vB: number,
    uvA?: [number, number],
    uvB?: [number, number]
  ): number => {
    const minV = Math.min(vA, vB)
    const maxV = Math.max(vA, vB)
    const key = `${minV}_${maxV}`

    let mId = midpointCache.get(key)
    if (mId === undefined) {
      mId = nextVId++
      midpointCache.set(key, mId)

      const pA = graph.vertices.get(vA)!.position
      const pB = graph.vertices.get(vB)!.position
      const mPos: [number, number, number] = [
        (pA[0] + pB[0]) * 0.5,
        (pA[1] + pB[1]) * 0.5,
        (pA[2] + pB[2]) * 0.5,
      ]

      graph.vertices.set(mId, {
        id: mId,
        position: mPos,
        connectedEdges: [],
        connectedFaces: [],
      })

      if (uvA && uvB) {
        midpointUvCache.set(key, [(uvA[0] + uvB[0]) * 0.5, (uvA[1] + uvB[1]) * 0.5])
      }
    }
    return mId
  }

  const getOrCreateE = (u0: number, u1: number, faceId: number): number => {
    const minU = Math.min(u0, u1)
    const maxU = Math.max(u0, u1)
    for (const e of graph.edges.values()) {
      if (e.vertexIds[0] === minU && e.vertexIds[1] === maxU) {
        e.faceIds.push(faceId)
        return e.id
      }
    }
    const eid = nextEId++
    graph.edges.set(eid, {
      id: eid,
      vertexIds: [minU, maxU],
      faceIds: [faceId],
    })
    graph.vertices.get(minU)!.connectedEdges.push(eid)
    graph.vertices.get(maxU)!.connectedEdges.push(eid)
    return eid
  }

  const newFaceIds: number[] = []

  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue

    const [v0, v1, v2] = face.vertexIds
    const uv0 = face.corners[0].uv
    const uv1 = face.corners[1].uv
    const uv2 = face.corners[2].uv

    const m01 = getOrCreateMidpoint(v0, v1, uv0, uv1)
    const m12 = getOrCreateMidpoint(v1, v2, uv1, uv2)
    const m20 = getOrCreateMidpoint(v2, v0, uv2, uv0)

    const key01 = `${Math.min(v0, v1)}_${Math.max(v0, v1)}`
    const key12 = `${Math.min(v1, v2)}_${Math.max(v1, v2)}`
    const key20 = `${Math.min(v2, v0)}_${Math.max(v2, v0)}`

    const uv01 = midpointUvCache.get(key01)
    const uv12 = midpointUvCache.get(key12)
    const uv20 = midpointUvCache.get(key20)

    const addSubTri = (
      t0: number,
      t1: number,
      t2: number,
      c0_uv?: [number, number],
      c1_uv?: [number, number],
      c2_uv?: [number, number]
    ): number => {
      const newFid = nextFId++
      const e0 = getOrCreateE(t0, t1, newFid)
      const e1 = getOrCreateE(t1, t2, newFid)
      const e2 = getOrCreateE(t2, t0, newFid)

      const f: TopologyFace = {
        id: newFid,
        vertexIds: [t0, t1, t2],
        edgeIds: [e0, e1, e2],
        corners: [
          { vertexId: t0, uv: c0_uv, normal: face.normal },
          { vertexId: t1, uv: c1_uv, normal: face.normal },
          { vertexId: t2, uv: c2_uv, normal: face.normal },
        ],
        materialIndex: face.materialIndex,
        normal: [...face.normal],
      }
      graph.faces.set(newFid, f)
      graph.vertices.get(t0)!.connectedFaces.push(newFid)
      graph.vertices.get(t1)!.connectedFaces.push(newFid)
      graph.vertices.get(t2)!.connectedFaces.push(newFid)
      return newFid
    }

    // 4 child triangles replacing the original face
    newFaceIds.push(addSubTri(v0, m01, m20, uv0, uv01, uv20))
    newFaceIds.push(addSubTri(v1, m12, m01, uv1, uv12, uv01))
    newFaceIds.push(addSubTri(v2, m20, m12, uv2, uv20, uv12))
    newFaceIds.push(addSubTri(m01, m12, m20, uv01, uv12, uv20))

    // Remove old face
    graph.faces.delete(fId)
    for (const vId of face.vertexIds) {
      const v = graph.vertices.get(vId)
      if (v) v.connectedFaces = v.connectedFaces.filter((id) => id !== fId)
    }
  }

  return { newFaceIds }
}

/**
 * Merges / welds selected vertices.
 * - 'center': welds all selected vertices to their centroid.
 * - 'distance': welds pairs of vertices closer than tolerance.
 * Automatically eliminates degenerate faces (where 2 or 3 vertices collapse).
 */
export function mergeVertices(
  graph: TopologyGraph,
  vertexIds: number[],
  options: MergeOptions
): { removedFacesCount: number; mergedVerticesCount: number } {
  if (vertexIds.length < 2) return { removedFacesCount: 0, mergedVerticesCount: 0 }

  let mergedCount = 0
  let removedFacesCount = 0

  if (options.mode === 'center') {
    // 1. Calculate centroid
    let cx = 0, cy = 0, cz = 0
    for (const vId of vertexIds) {
      const v = graph.vertices.get(vId)
      if (v) {
        cx += v.position[0]
        cy += v.position[1]
        cz += v.position[2]
      }
    }
    cx /= vertexIds.length
    cy /= vertexIds.length
    cz /= vertexIds.length

    const targetVId = vertexIds[0]
    const targetV = graph.vertices.get(targetVId)!
    targetV.position = [cx, cy, cz]

    const otherIds = new Set(vertexIds.slice(1))

    // Replace otherIds with targetVId across all faces
    const facesToInspect = new Set<number>()
    for (const otherId of otherIds) {
      const otherV = graph.vertices.get(otherId)
      if (otherV) {
        otherV.connectedFaces.forEach((fId) => facesToInspect.add(fId))
      }
    }

    for (const fId of facesToInspect) {
      const face = graph.faces.get(fId)
      if (!face) continue

      face.vertexIds = face.vertexIds.map((v) => (otherIds.has(v) ? targetVId : v)) as [
        number,
        number,
        number
      ]
      face.corners.forEach((c) => {
        if (otherIds.has(c.vertexId)) c.vertexId = targetVId
      })

      // Check if degenerate (2 or more identical vertices)
      const [a, b, c] = face.vertexIds
      if (a === b || b === c || c === a) {
        graph.faces.delete(fId)
        removedFacesCount++
      } else {
        targetV.connectedFaces.push(fId)
      }
    }

    // Delete merged vertices from graph
    for (const otherId of otherIds) {
      graph.vertices.delete(otherId)
      mergedCount++
    }
  } else if (options.mode === 'distance') {
    const tol = options.tolerance || 0.005
    const tolSq = tol * tol

    for (let i = 0; i < vertexIds.length; i++) {
      const v0 = graph.vertices.get(vertexIds[i])
      if (!v0) continue

      for (let j = i + 1; j < vertexIds.length; j++) {
        const v1 = graph.vertices.get(vertexIds[j])
        if (!v1) continue

        const dx = v0.position[0] - v1.position[0]
        const dy = v0.position[1] - v1.position[1]
        const dz = v0.position[2] - v1.position[2]

        if (dx * dx + dy * dy + dz * dz <= tolSq) {
          // Merge v1 into v0
          for (const fId of v1.connectedFaces) {
            const face = graph.faces.get(fId)
            if (!face) continue
            face.vertexIds = face.vertexIds.map((v) => (v === v1.id ? v0.id : v)) as [
              number,
              number,
              number
            ]
            face.corners.forEach((c) => {
              if (c.vertexId === v1.id) c.vertexId = v0.id
            })

            const [a, b, c] = face.vertexIds
            if (a === b || b === c || c === a) {
              graph.faces.delete(fId)
              removedFacesCount++
            } else {
              v0.connectedFaces.push(fId)
            }
          }
          graph.vertices.delete(v1.id)
          mergedCount++
        }
      }
    }
  }

  return { removedFacesCount, mergedVerticesCount: mergedCount }
}

/**
 * Deletes selected vertices, edges, or faces from the topology graph.
 * Automatically cleans up dependent faces and orphaned edges.
 */
export function deleteTopologyElements(
  graph: TopologyGraph,
  subMode: SelectionSubMode,
  selectedIds: number[]
): { deletedFaces: number; deletedVertices: number } {
  const targetIds = new Set(selectedIds)
  const facesToDelete = new Set<number>()

  if (subMode === 'face') {
    selectedIds.forEach((id) => facesToDelete.add(id))
  } else if (subMode === 'edge') {
    for (const eId of selectedIds) {
      const edge = graph.edges.get(eId)
      if (edge) {
        edge.faceIds.forEach((fId) => facesToDelete.add(fId))
      }
    }
  } else if (subMode === 'vertex') {
    for (const vId of selectedIds) {
      const v = graph.vertices.get(vId)
      if (v) {
        v.connectedFaces.forEach((fId) => facesToDelete.add(fId))
      }
    }
  }

  // Delete identified faces
  for (const fId of facesToDelete) {
    const face = graph.faces.get(fId)
    if (face) {
      for (const vId of face.vertexIds) {
        const v = graph.vertices.get(vId)
        if (v) v.connectedFaces = v.connectedFaces.filter((id) => id !== fId)
      }
      graph.faces.delete(fId)
    }
  }

  // Clean up orphaned vertices with 0 faces
  let deletedVerticesCount = 0
  for (const [vId, v] of graph.vertices.entries()) {
    if (v.connectedFaces.length === 0) {
      graph.vertices.delete(vId)
      deletedVerticesCount++
    }
  }

  return { deletedFaces: facesToDelete.size, deletedVertices: deletedVerticesCount }
}

/**
 * Inverts / flips normal orientation of selected faces (or all faces if none selected).
 * Reverses triangle winding (v0, v2, v1) to invert normal direction.
 */
export function flipTopologyNormals(
  graph: TopologyGraph,
  faceIds?: number[]
): void {
  const targetFaces = faceIds && faceIds.length
    ? faceIds.map((id) => graph.faces.get(id)!).filter(Boolean)
    : Array.from(graph.faces.values())

  for (const face of targetFaces) {
    // Swap v1 and v2 to reverse winding
    const tmpV = face.vertexIds[1]
    face.vertexIds[1] = face.vertexIds[2]
    face.vertexIds[2] = tmpV

    const tmpCorner = face.corners[1]
    face.corners[1] = face.corners[2]
    face.corners[2] = tmpCorner

    face.normal[0] = -face.normal[0]
    face.normal[1] = -face.normal[1]
    face.normal[2] = -face.normal[2]
    for (const corner of face.corners) {
      if (corner.normal) corner.normal = [-corner.normal[0], -corner.normal[1], -corner.normal[2]]
    }
  }
}

/**
 * Separates connected components of a mesh using graph traversal (BFS).
 * Returns an array of face ID lists, one per connected island.
 */
export function getConnectedMeshComponents(graph: TopologyGraph): number[][] {
  const visitedFaces = new Set<number>()
  const components: number[][] = []

  for (const face of graph.faces.values()) {
    if (visitedFaces.has(face.id)) continue

    const component: number[] = []
    const queue = [face.id]
    visitedFaces.add(face.id)

    while (queue.length > 0) {
      const currentFId = queue.shift()!
      component.push(currentFId)
      const currentFace = graph.faces.get(currentFId)
      if (!currentFace) continue

      // Explore neighboring faces via shared edges
      for (const eId of currentFace.edgeIds) {
        const edge = graph.edges.get(eId)
        if (!edge) continue

        for (const neighborFId of edge.faceIds) {
          if (!visitedFaces.has(neighborFId)) {
            visitedFaces.add(neighborFId)
            queue.push(neighborFId)
          }
        }
      }
    }
    components.push(component)
  }

  return components
}
