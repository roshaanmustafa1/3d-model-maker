import { analyzeUVOverlap } from '@/engine/customization/uv-overlap'
import * as THREE from 'three'
import { TopologyGraph, TopologyFace } from '@/types/topology'
import { rebuildBufferGeometryFromTopology } from './topology-graph'

export interface UVIsland {
  id: number
  faceIds: number[]
  bounds: { minU: number; maxU: number; minV: number; maxV: number }
}

/**
 * Box Projection UV mapping:
 * Evaluates dominant face normal axis (X, Y, or Z) and projects coordinates cleanly
 * onto [0, 1] UV space without distortion on box/planar primitives.
 */
export function applyBoxProjection(graph: TopologyGraph, scale = 1.0): void {
  // Compute bounds
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

  for (const v of graph.vertices.values()) {
    const [x, y, z] = v.position
    if (x < minX) minX = x; if (y < minY) minY = y; if (z < minZ) minZ = z
    if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (z > maxZ) maxZ = z
  }

  const sizeX = Math.max(1e-5, maxX - minX)
  const sizeY = Math.max(1e-5, maxY - minY)
  const sizeZ = Math.max(1e-5, maxZ - minZ)

  for (const face of graph.faces.values()) {
    const [nx, ny, nz] = face.normal
    const absX = Math.abs(nx)
    const absY = Math.abs(ny)
    const absZ = Math.abs(nz)

    // Determine dominant axis
    for (const corner of face.corners) {
      const v = graph.vertices.get(corner.vertexId)
      if (!v) continue
      const [x, y, z] = v.position

      let u = 0, valV = 0
      if (absX >= absY && absX >= absZ) {
        // X dominant face -> map Z, Y
        u = (z - minZ) / sizeZ
        valV = (y - minY) / sizeY
      } else if (absY >= absX && absY >= absZ) {
        // Y dominant face (Top/Bottom) -> map X, Z
        u = (x - minX) / sizeX
        valV = (z - minZ) / sizeZ
      } else {
        // Z dominant face (Front/Back) -> map X, Y
        u = (x - minX) / sizeX
        valV = (y - minY) / sizeY
      }

      corner.uv = [(u * scale) % 1, (valV * scale) % 1]
    }
  }

  graph.hasUVs = true
}

/**
 * Planar Projection UV mapping along a specified axis ('x' | 'y' | 'z')
 */
export function applyPlanarProjection(
  graph: TopologyGraph,
  axis: 'x' | 'y' | 'z' = 'z'
): void {
  let minU = Infinity, maxU = -Infinity
  let minV = Infinity, maxV = -Infinity

  const getCoord = (pos: [number, number, number]): [number, number] => {
    if (axis === 'x') return [pos[2], pos[1]] // Z, Y
    if (axis === 'y') return [pos[0], pos[2]] // X, Z
    return [pos[0], pos[1]] // X, Y for Z-axis
  }

  for (const v of graph.vertices.values()) {
    const [u, vCoord] = getCoord(v.position)
    if (u < minU) minU = u; if (u > maxU) maxU = u
    if (vCoord < minV) minV = vCoord; if (vCoord > maxV) maxV = vCoord
  }

  const rangeU = Math.max(1e-5, maxU - minU)
  const rangeV = Math.max(1e-5, maxV - minV)

  for (const face of graph.faces.values()) {
    for (const corner of face.corners) {
      const v = graph.vertices.get(corner.vertexId)
      if (!v) continue
      const [u, vCoord] = getCoord(v.position)
      corner.uv = [(u - minU) / rangeU, (vCoord - minV) / rangeV]
    }
  }

  graph.hasUVs = true
}

/**
 * Cylindrical Projection UV mapping (ideal for bottles, sleeves, legs, cylinders)
 */
export function applyCylindricalProjection(
  graph: TopologyGraph,
  axis: 'x' | 'y' | 'z' = 'y'
): void {
  let minH = Infinity, maxH = -Infinity

  for (const v of graph.vertices.values()) {
    const h = axis === 'y' ? v.position[1] : axis === 'z' ? v.position[2] : v.position[0]
    if (h < minH) minH = h
    if (h > maxH) maxH = h
  }
  const rangeH = Math.max(1e-5, maxH - minH)

  for (const face of graph.faces.values()) {
    for (const corner of face.corners) {
      const v = graph.vertices.get(corner.vertexId)
      if (!v) continue

      let angle = 0
      let hVal = 0

      if (axis === 'y') {
        angle = Math.atan2(v.position[2], v.position[0]) // Z, X
        hVal = v.position[1]
      } else if (axis === 'z') {
        angle = Math.atan2(v.position[1], v.position[0]) // Y, X
        hVal = v.position[2]
      } else {
        angle = Math.atan2(v.position[2], v.position[1]) // Z, Y
        hVal = v.position[0]
      }

      // Map angle [-PI, PI] to [0, 1]
      const u = (angle + Math.PI) / (2 * Math.PI)
      const vCoord = (hVal - minH) / rangeH
      corner.uv = [u, vCoord]
    }
  }

  graph.hasUVs = true
}

/**
 * Detects disconnected UV islands based on continuous UV seam adjacency.
 */
export function detectUvIslands(graph: TopologyGraph): UVIsland[] {
  const visited = new Set<number>()
  const islands: UVIsland[] = []
  let nextIslandId = 1

  // Helper to check if two faces share continuous UVs along a shared edge
  const shareContinuousUV = (fA: TopologyFace, fB: TopologyFace, v0: number, v1: number): boolean => {
    let uvA0: [number, number] | undefined
    let uvA1: [number, number] | undefined
    let uvB0: [number, number] | undefined
    let uvB1: [number, number] | undefined

    for (const c of fA.corners) {
      if (c.vertexId === v0) uvA0 = c.uv
      if (c.vertexId === v1) uvA1 = c.uv
    }
    for (const c of fB.corners) {
      if (c.vertexId === v0) uvB0 = c.uv
      if (c.vertexId === v1) uvB1 = c.uv
    }

    if (!uvA0 || !uvA1 || !uvB0 || !uvB1) return false

    const d0 = Math.hypot(uvA0[0] - uvB0[0], uvA0[1] - uvB0[1])
    const d1 = Math.hypot(uvA1[0] - uvB1[0], uvA1[1] - uvB1[1])
    return d0 < 1e-4 && d1 < 1e-4
  }

  for (const face of graph.faces.values()) {
    if (visited.has(face.id)) continue

    const islandFaces: number[] = []
    const queue = [face.id]
    visited.add(face.id)

    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity

    while (queue.length > 0) {
      const currId = queue.shift()!
      islandFaces.push(currId)
      const currFace = graph.faces.get(currId)
      if (!currFace) continue

      for (const c of currFace.corners) {
        if (c.uv) {
          if (c.uv[0] < minU) minU = c.uv[0]
          if (c.uv[0] > maxU) maxU = c.uv[0]
          if (c.uv[1] < minV) minV = c.uv[1]
          if (c.uv[1] > maxV) maxV = c.uv[1]
        }
      }

      for (const eId of currFace.edgeIds) {
        const edge = graph.edges.get(eId)
        if (!edge || edge.seam) continue

        for (const neighborFId of edge.faceIds) {
          if (!visited.has(neighborFId)) {
            const neighborFace = graph.faces.get(neighborFId)
            if (neighborFace && shareContinuousUV(currFace, neighborFace, edge.vertexIds[0], edge.vertexIds[1])) {
              visited.add(neighborFId)
              queue.push(neighborFId)
            }
          }
        }
      }
    }

    islands.push({
      id: nextIslandId++,
      faceIds: islandFaces,
      bounds: {
        minU: minU === Infinity ? 0 : minU,
        maxU: maxU === -Infinity ? 1 : maxU,
        minV: minV === Infinity ? 0 : minV,
        maxV: maxV === -Infinity ? 1 : maxV,
      },
    })
  }

  return islands
}

/**
 * Transforms UV coordinates of selected faces or vertices in 2D UV space.
 */
export function transformUVSelection(
  graph: TopologyGraph,
  faceIds: number[],
  deltaU: number,
  deltaV: number,
  scaleU = 1.0,
  scaleV = 1.0,
  angleRad = 0
): void {
  if (!faceIds.length) return

  // Calculate UV centroid
  let sumU = 0, sumV = 0, count = 0
  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue
    for (const c of face.corners) {
      if (c.uv) {
        sumU += c.uv[0]
        sumV += c.uv[1]
        count++
      }
    }
  }

  if (count === 0) return
  const centerU = sumU / count
  const centerV = sumV / count

  const cosA = Math.cos(angleRad)
  const sinA = Math.sin(angleRad)

  for (const fId of faceIds) {
    const face = graph.faces.get(fId)
    if (!face) continue

    for (const c of face.corners) {
      if (!c.uv) continue
      // Translate to centroid
      let u = c.uv[0] - centerU
      let v = c.uv[1] - centerV

      // Scale
      u *= scaleU
      v *= scaleV

      // Rotate
      const ru = u * cosA - v * sinA
      const rv = u * sinA + v * cosA

      // Translate back + apply delta
      c.uv[0] = ru + centerU + deltaU
      c.uv[1] = rv + centerV + deltaV
    }
  }
}

export interface UVDiagnostics {
  hasUVs: boolean
  isValid: boolean
  isNormalized: boolean
  islandCount: number
  hasExplicitSeams: boolean
  hasBoundarySeams: boolean
  overlapDetected: boolean
  customizableZoneReady: boolean
  summary: string
}

export function inspectUVDiagnostics(
  graph: TopologyGraph,
  geometry?: THREE.BufferGeometry | null,
  isCustomizable?: boolean
): UVDiagnostics {
  const uvAttr = geometry?.attributes?.uv
  if (!uvAttr || uvAttr.count === 0) {
    return {
      hasUVs: false,
      isValid: false,
      isNormalized: false,
      islandCount: 0,
      hasExplicitSeams: false,
      hasBoundarySeams: false,
      overlapDetected: false,
      customizableZoneReady: false,
      summary: 'No UV coordinates found on geometry. Texturing unavailable.',
    }
  }

  let allFinite = true
  let allNormalized = true
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i)
    const v = uvAttr.getY(i)
    if (!Number.isFinite(u) || !Number.isFinite(v)) {
      allFinite = false
      break
    }
    if (u < -0.05 || u > 1.05 || v < -0.05 || v > 1.05) {
      allNormalized = false
    }
  }

  const islands = detectUvIslands(graph)
  const hasBoundarySeams = islands.length > 1
  const hasExplicitSeams = [...graph.edges.values()].some(edge => edge.seam)

  const overlapDetected = geometry ? analyzeUVOverlap(geometry).hasOverlap : false

  return {
    hasUVs: true,
    isValid: allFinite,
    isNormalized: allNormalized,
    islandCount: islands.length,
    hasExplicitSeams,
    hasBoundarySeams,
    overlapDetected,
    customizableZoneReady: allFinite && allNormalized && !overlapDetected && (isCustomizable ?? true),
    summary: allFinite
      ? `Valid UV mapping detected across ${islands.length} UV islands.`
      : 'Invalid or non-finite UV coordinates detected.',
  }
}
