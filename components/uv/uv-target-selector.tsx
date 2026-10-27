'use client'

import { useEditorStore } from '@/stores/editor-store'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import { detectUvIslands } from '@/engine/topology/uv-unwrapper'

export function UVTargetSelector() {
  const node = useEditorStore(state => state.selectedNodeId ? state.nodes[state.selectedNodeId] : null)
  const materials = useEditorStore(state => state.materials)
  if (!node?.geometry) return null
  const geometry = createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
  const graph = getTopologyForNode(node.id, geometry)
  const islands = detectUvIslands(graph)
  const slots = node.materialIds?.length ? node.materialIds : node.materialId ? [node.materialId] : []
  const select = (ids: number[]) => useEditorStore.getState().setSelectedFaces(ids)
  return <section className="space-y-2 rounded border border-white/10 p-3 text-xs">
    <p className="font-semibold text-zinc-200">UV transform target</p>
    <label className="block text-zinc-400">Material surface
      <select aria-label="UV material target" className="mt-1 w-full bg-[#161a22] p-1" defaultValue="" key={node.id} onChange={event => select(event.target.value === '' ? [] : [...graph.faces.values()].filter(face => face.materialIndex === Number(event.target.value)).map(face => face.id))}>
        <option value="">All faces</option>
        {slots.map((id, slot) => <option key={slot} value={slot}>{slot}: {materials[id]?.name || id}</option>)}
      </select>
    </label>
    <label className="block text-zinc-400">UV island
      <select aria-label="UV island target" className="mt-1 w-full bg-[#161a22] p-1" defaultValue="" key={`${node.id}:${node.geometry.customGeometryKey}`} onChange={event => select(islands.find(island => island.id === Number(event.target.value))?.faceIds || [])}>
        <option value="">All faces</option>
        {islands.map(island => <option key={island.id} value={island.id}>Island {island.id} ({island.faceIds.length} faces)</option>)}
      </select>
    </label>
    <p className="text-zinc-500">Transforms use selected faces. Separate front, back and sleeve parts before defining artwork zones.</p>
  </section>
}
