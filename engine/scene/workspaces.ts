import type { EditorState } from '@/stores/editor-store'

type SceneState = Pick<EditorState, 'nodes' | 'rootNodeIds' | 'materials' | 'environment' | 'history' | 'selectedNodeId' | 'selectedNodeIds' | 'editorMode'>
const suspended = new Map<string, SceneState>()
let current = 'editor'
export function retainedWorkspaceScenes(): SceneState[] { return [...suspended.values()] }
export function switchWorkspaceScene(state: EditorState, workspace: string): Partial<EditorState> {
  if (!['editor', 'customizer'].includes(workspace) || workspace === current) return {}
  suspended.set(current, { nodes: state.nodes, rootNodeIds: state.rootNodeIds, materials: state.materials, environment: state.environment, history: state.history, selectedNodeId: state.selectedNodeId, selectedNodeIds: state.selectedNodeIds, editorMode: state.editorMode })
  current = workspace
  const restored = suspended.get(current)
  suspended.delete(current)
  return restored || { nodes: {}, rootNodeIds: [], materials: {}, history: { past: [], future: [] }, selectedNodeId: null, selectedNodeIds: [], editorMode: 'object' }
}
