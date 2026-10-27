import * as THREE from 'three'
import type { EditorState } from '@/stores/editor-store'
import type { SceneNode } from '@/types/scene'
import type { TopologyGraph } from '@/types/topology'
import { cloneTopologyGraph, rebuildBufferGeometryFromTopology } from './topology-graph'
import { getTopologyForNode, setTopologyForNode } from './topology-cache'
import { createBufferGeometry, registerCustomGeometry, calculateGeometryStats } from '@/engine/scene/primitive-factory'

type Update = (mutator: (state: EditorState) => void) => void
type SubSelection = { vertices: number[]; edges: number[]; faces: number[] }
interface GeometrySnapshot {
  node: SceneNode
  key: string
  geometry: THREE.BufferGeometry
  graph: TopologyGraph
  selection: SubSelection
}

export function geometryTransaction(
  get: () => EditorState,
  update: Update,
  name: string,
  edit: (graph: TopologyGraph, node: SceneNode, state: EditorState) => Partial<SubSelection> | void,
  nodeId?: string,
): void {
  const state = get(), id = nodeId || state.selectedNodeId
  const source = id ? state.nodes[id] : undefined
  if (!id || !source?.geometry) return
  const geometry = createBufferGeometry(source.geometry.type, source.geometry.params, source.geometry.customGeometryKey)
  if (Object.keys(geometry.morphAttributes).length) throw new Error('Morph-target editing requires a Blender workflow; the original model was preserved.')
  const slots = source.materialIds?.length || (source.materialId ? 1 : 0)
  const graph = getTopologyForNode(id, geometry, slots)
  const before: GeometrySnapshot = {
    node: structuredClone(source), key: `history_${THREE.MathUtils.generateUUID()}`,
    geometry: geometry.clone(), graph: cloneTopologyGraph(graph),
    selection: { vertices: [...state.selectedVertexIds], edges: [...state.selectedEdgeIds], faces: [...state.selectedFaceIds] },
  }
  const draftNode = structuredClone(source), draftGraph = cloneTopologyGraph(graph)
  const selection = edit(draftGraph, draftNode, state) || {}
  const rebuilt = rebuildBufferGeometryFromTopology(draftGraph, geometry)
  const after: GeometrySnapshot = {
    node: { ...draftNode, geometry: { type: 'custom', params: {}, customGeometryKey: '', stats: calculateGeometryStats(rebuilt) } },
    key: `history_${THREE.MathUtils.generateUUID()}`, geometry: rebuilt, graph: draftGraph,
    selection: { ...before.selection, ...selection },
  }
  function restore(snapshot: GeometrySnapshot): void {
    if (!get().nodes[id!]) throw new Error(`Cannot restore geometry: object ${id} is missing.`)
    registerCustomGeometry(snapshot.key, snapshot.geometry.clone())
    setTopologyForNode(id!, cloneTopologyGraph(snapshot.graph))
    update((next) => {
      const node = next.nodes[id!]
      node.geometry = { ...structuredClone(snapshot.node.geometry!), customGeometryKey: snapshot.key }
      node.materialId = snapshot.node.materialId
      node.materialIds = snapshot.node.materialIds ? [...snapshot.node.materialIds] : undefined
      if (next.selectedNodeId === id) {
        next.selectedVertexIds = [...snapshot.selection.vertices]
        next.selectedEdgeIds = [...snapshot.selection.edges]
        next.selectedFaceIds = [...snapshot.selection.faces]
      }
    })
    get().recalculateSceneStats()
  }
  restore(after)
  get().recordCommand({
    id: `geometry_${THREE.MathUtils.generateUUID()}`, name, timestamp: Date.now(),
    execute: () => restore(after), undo: () => restore(before),
    resourceKeys: [before.key, after.key],
    dispose: () => { before.geometry.dispose(); after.geometry.dispose() },
  })
}
