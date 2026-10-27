import type { EditorState } from '@/stores/editor-store'
import { applyObjectSelection } from './selection-state'

export function sceneTransaction(get: () => EditorState, update: (edit: (state: EditorState) => void) => void, name: string, edit: (state: EditorState) => void): void {
  const capture = () => {
    const state = get()
    return structuredClone({ nodes: state.nodes, rootNodeIds: state.rootNodeIds, ids: state.selectedNodeIds, primary: state.selectedNodeId })
  }
  const before = capture()
  update(edit)
  update((state) => applyObjectSelection(state, state.selectedNodeIds, state.selectedNodeId))
  const after = capture()
  const restore = (snapshot: typeof before) => {
    update((state) => {
      state.nodes = structuredClone(snapshot.nodes)
      state.rootNodeIds = [...snapshot.rootNodeIds]
      applyObjectSelection(state, snapshot.ids, snapshot.primary)
    })
    get().recalculateSceneStats()
  }
  get().recalculateSceneStats()
  get().recordCommand({
    id: `scene_${crypto.randomUUID()}`, name, timestamp: Date.now(), execute: () => restore(after), undo: () => restore(before),
    resourceKeys: [...new Set([...Object.values(before.nodes), ...Object.values(after.nodes)].flatMap((node) => node.geometry?.customGeometryKey ? [node.geometry.customGeometryKey] : []))],
  })
}
