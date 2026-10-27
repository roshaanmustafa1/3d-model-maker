import * as THREE from 'three'
import type { UVBounds } from '@/types/customization'
type Point = [number, number]
const cross = (a: Point, b: Point, c: Point) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
function area(points: Point[]): number { return Math.abs(points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p[0] * q[1] - p[1] * q[0] }, 0)) / 2 }
function intersection(a: Point[], b: Point[]): number {
  let polygon = a
  const direction = Math.sign(cross(b[0], b[1], b[2]))
  for (let edge = 0; edge < 3 && polygon.length; edge++) {
    const p = b[edge], q = b[(edge + 1) % 3], output: Point[] = []
    for (let i = 0; i < polygon.length; i++) {
      const s = polygon[i], t = polygon[(i + 1) % polygon.length]
      const ds = cross(p, q, s) * direction, dt = cross(p, q, t) * direction
      if (ds >= -1e-10) output.push(s)
      if ((ds > 1e-10 && dt < -1e-10) || (ds < -1e-10 && dt > 1e-10)) {
        const alpha = ds / (ds - dt)
        output.push([s[0] + alpha * (t[0] - s[0]), s[1] + alpha * (t[1] - s[1])])
      }
    }
    polygon = output
  }
  return polygon.length >= 3 ? area(polygon) : 0
}

type AnalysisOptions = { slot?: number; channel?: number; bounds?: UVBounds; faceIndices?: number[] }
const cache = new WeakMap<THREE.BufferGeometry, { uv: unknown; index: unknown; entries: Map<string, ReturnType<typeof computeUVOverlap>> }>()
export function analyzeUVOverlap(geometry: THREE.BufferGeometry, options: AnalysisOptions = {}) {
  const uv = geometry.getAttribute(options.channel ? `uv${options.channel}` : 'uv')
  let record = cache.get(geometry)
  if (!record || record.uv !== uv || record.index !== geometry.index) {
    record = { uv, index: geometry.index, entries: new Map() }
    cache.set(geometry, record)
  }
  const version = uv && ('version' in uv ? uv.version : uv.data.version)
  const key = JSON.stringify([options, version, geometry.index?.version, geometry.groups])
  const previous = record.entries.get(key)
  if (previous) return previous
  const result = computeUVOverlap(geometry, options)
  record.entries.set(key, result)
  if (record.entries.size > 32) record.entries.delete(record.entries.keys().next().value!)
  return result
}

function computeUVOverlap(geometry: THREE.BufferGeometry, options: AnalysisOptions) {
  const uv = geometry.getAttribute(options.channel ? `uv${options.channel}` : 'uv')
  if (!uv) return { hasOverlap: false, overlapCount: 0, mirroredCount: 0, message: 'Mesh has no UV coordinates.' }
  const triangles: Point[][] = [], grid = new Map<string, number[]>()
  const faces = options.faceIndices && new Set(options.faceIndices)
  let overlaps = 0, mirroredCount = 0
  const count = (geometry.index?.count || uv.count) / 3
  for (let face = 0; face < count; face++) {
    if (faces && !faces.has(face)) continue
    if (options.slot !== undefined && geometry.groups.length && geometry.groups.some(g => (g.materialIndex || 0) > 0)) {
      const group = geometry.groups.find(g => face * 3 >= g.start && face * 3 < g.start + g.count)
      if ((group?.materialIndex || 0) !== options.slot) continue
    }
    const points: Point[] = [0, 1, 2].map(corner => { const id = geometry.index ? geometry.index.getX(face * 3 + corner) : face * 3 + corner; return [uv.getX(id), uv.getY(id)] })
    if (points.some(p => !p.every(Number.isFinite)) || area(points) < 1e-12) continue
    const minU = Math.min(...points.map(p => p[0])), maxU = Math.max(...points.map(p => p[0]))
    const minV = Math.min(...points.map(p => p[1])), maxV = Math.max(...points.map(p => p[1]))
    const bounds = options.bounds
    if (bounds && (maxU <= bounds.minU || minU >= bounds.maxU || maxV <= 1 - bounds.maxV || minV >= 1 - bounds.minV)) continue
    const candidates = new Set<number>(), cells: string[] = []
    for (let x = Math.max(0, Math.floor(minU * 64)); x <= Math.min(63, Math.floor(maxU * 64)); x++) for (let y = Math.max(0, Math.floor(minV * 64)); y <= Math.min(63, Math.floor(maxV * 64)); y++) {
      const key = `${x}:${y}`; cells.push(key); grid.get(key)?.forEach(id => candidates.add(id))
    }
    for (const id of candidates) if (intersection(points, triangles[id]) > 1e-10) {
      overlaps++
      if (Math.sign(cross(...points as [Point, Point, Point])) !== Math.sign(cross(...triangles[id] as [Point, Point, Point]))) mirroredCount++
    }
    const id = triangles.push(points) - 1
    for (const key of cells) { const bucket = grid.get(key) || []; bucket.push(id); grid.set(key, bucket) }
  }
  return { hasOverlap: overlaps > 0, overlapCount: overlaps, mirroredCount, message: overlaps ? `${overlaps} positive-area UV intersections (${mirroredCount} mirrored); shared edges alone are excluded.` : undefined }
}
