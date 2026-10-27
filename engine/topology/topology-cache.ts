import * as THREE from 'three'
import { TopologyGraph } from '@/types/topology'
import { buildTopologyFromBufferGeometry } from './topology-graph'

// In-memory cache for active node topology graphs during editing sessions
const nodeTopologyCache = new Map<string, TopologyGraph>()

export function getTopologyForNode(nodeId: string, geometry: THREE.BufferGeometry, materialSlotCount?: number): TopologyGraph {
  let graph = nodeTopologyCache.get(nodeId)
  if (!graph) {
    graph = buildTopologyFromBufferGeometry(geometry)
    nodeTopologyCache.set(nodeId, graph)
  }
  if (materialSlotCount !== undefined) {
    for (const face of graph.faces.values()) {
      if (materialSlotCount === 1) face.materialIndex = 0
      else if (face.materialIndex < 0 || face.materialIndex >= materialSlotCount) throw new Error(`Invalid material slot ${face.materialIndex} on ${nodeId}.`)
    }
    graph.materialSlotCount = materialSlotCount
  }
  return graph
}

export function setTopologyForNode(nodeId: string, graph: TopologyGraph): void {
  nodeTopologyCache.set(nodeId, graph)
}

export function removeTopologyForNode(nodeId: string): void {
  nodeTopologyCache.delete(nodeId)
}

export function hasTopologyForNode(nodeId: string): boolean {
  return nodeTopologyCache.has(nodeId)
}

export function clearTopologyCache(): void {
  nodeTopologyCache.clear()
}
