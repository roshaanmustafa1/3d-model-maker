import type { TopologyGraph } from '@/types/topology'
import { detectUvIslands } from './uv-unwrapper'

export function markUVSeams(graph: TopologyGraph, edgeIds: number[], marked: boolean): void {
  for (const id of edgeIds) {
    const edge = graph.edges.get(id)
    if (edge) edge.seam = marked
  }
}

export function packUVIslands(graph: TopologyGraph, margin = 0.02): void {
  if (!Number.isFinite(margin) || margin < 0 || margin >= 0.25) throw new Error('UV margin must be between 0 and 0.25.')
  const islands = detectUvIslands(graph)
  if (!graph.hasUVs || islands.some(island => island.faceIds.some(id => graph.faces.get(id)!.corners.some(corner => !corner.uv?.every(Number.isFinite))))) {
    throw new Error('Generate finite UV coordinates before packing islands.')
  }
  const columns = Math.ceil(Math.sqrt(islands.length)), cell = 1 / columns
  for (let index = 0; index < islands.length; index++) {
    const island = islands[index], bounds = island.bounds
    const extent = Math.max(bounds.maxU - bounds.minU, bounds.maxV - bounds.minV)
    if (extent <= 1e-12) throw new Error('Degenerate UV island: unwrap before packing.')
    const scale = cell * (1 - margin * 2) / extent
    for (const id of island.faceIds) for (const corner of graph.faces.get(id)!.corners) {
      corner.uv = [(index % columns) * cell + cell * margin + (corner.uv![0] - bounds.minU) * scale,
        Math.floor(index / columns) * cell + cell * margin + (corner.uv![1] - bounds.minV) * scale]
    }
  }
}
