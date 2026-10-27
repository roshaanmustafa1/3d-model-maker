export type EditorMode = 'object' | 'edit'
export type SelectionSubMode = 'vertex' | 'edge' | 'face'

export interface TopologyVertex {
  id: number
  position: [number, number, number]
  connectedEdges: number[] // edge IDs
  connectedFaces: number[] // face IDs
}

export interface TopologyEdge {
  seam?: boolean
  id: number
  vertexIds: [number, number] // sorted [min(v0, v1), max(v0, v1)]
  faceIds: number[] // face IDs sharing this edge (1 = boundary, 2 = manifold, >2 = non-manifold)
}

export interface TopologyFaceCorner {
  sourceIndex?: number
  vertexId: number
  uv?: [number, number]
  normal?: [number, number, number]
}

export interface TopologyFace {
  id: number
  vertexIds: [number, number, number]
  edgeIds: [number, number, number]
  corners: [TopologyFaceCorner, TopologyFaceCorner, TopologyFaceCorner]
  materialIndex: number
  normal: [number, number, number]
}

export interface TopologyStats {
  uniqueVertices: number
  bufferVertices: number
  totalEdges: number
  boundaryEdges: number
  nonManifoldEdges: number
  totalFaces: number
  degenerateFaces: number
  materialSlots: number
  surfaceArea: number
  bounds: {
    min: [number, number, number]
    max: [number, number, number]
    size: [number, number, number]
  }
}

export interface AmbiguousWeldCandidate {
  vertexIds: number[]
  position: [number, number, number]
  reason: 'disconnected_components' | 'non_manifold_pinch' | 'duplicate_surface'
}

export interface TopologyBuildOptions {
  tolerance?: number
  preserveDisconnectedComponents?: boolean
  weldCoincidentVertices?: boolean
}

export interface TopologyGraph {
  bufferFaceIds?: number[]
  vertices: Map<number, TopologyVertex>
  edges: Map<number, TopologyEdge>
  faces: Map<number, TopologyFace>

  // Mapping from BufferGeometry vertex index to topological vertex ID
  bufferToTopologyMap: number[]
  // Mapping from topological vertex ID to all BufferGeometry vertex indices
  topologyToBuffersMap: Map<number, number[]>

  hasUVs: boolean
  hasNormals: boolean
  materialSlotCount: number
  originalVertexCount: number
  originalIndexCount: number

  ambiguousWeldCandidates?: AmbiguousWeldCandidate[]
}

export interface EditModeOverlaySettings {
  vertices: boolean
  edges: boolean
  faces: boolean
  normals: boolean
  wireframe: boolean
}
