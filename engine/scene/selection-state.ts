import type { SceneNode } from '@/types/scene'
import type { EditorState } from '@/stores/editor-store'

export function applyObjectSelection(state: EditorState, ids: string[], primary?: string | null): void {
  state.selectedNodeIds = [...new Set(ids)].filter((id) => !!state.nodes[id])
  state.selectedNodeId = primary && state.selectedNodeIds.includes(primary) ? primary : state.selectedNodeIds.at(-1) || null
  state.selectedVertexIds = []; state.selectedEdgeIds = []; state.selectedFaceIds = []
  const node: SceneNode | undefined = state.selectedNodeId ? state.nodes[state.selectedNodeId] : undefined
  if (!node || node.type !== 'mesh') state.editorMode = 'object'
  state.stats.selectedVertices = node?.geometry?.stats.vertexCount || 0
  state.stats.selectedTriangles = node?.geometry?.stats.triangleCount || 0
}
