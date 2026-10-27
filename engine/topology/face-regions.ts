import type { TopologyGraph } from '@/types/topology'

export function selectFaceRegion(graph: TopologyGraph, ids: number[], mode: 'connected' | 'grow' | 'shrink'): number[] {
  const selected = new Set(ids.filter(id => graph.faces.has(id)))
  const neighbors = (id: number) => graph.faces.get(id)!.edgeIds.flatMap(edge => graph.edges.get(edge)?.faceIds || [])
  if (mode === 'shrink') return [...selected].filter(id => {
    const face = graph.faces.get(id)!
    return face.edgeIds.every(edge => (graph.edges.get(edge)?.faceIds.length || 0) > 1) && neighbors(id).every(other => selected.has(other))
  })
  const queue = [...selected]
  for (let cursor = 0; cursor < queue.length; cursor++) {
    for (const id of neighbors(queue[cursor])) if (!selected.has(id)) {
      selected.add(id)
      if (mode === 'connected') queue.push(id)
    }
  }
  return [...selected]
}
