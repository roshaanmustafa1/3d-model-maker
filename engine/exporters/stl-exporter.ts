import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { SceneNode, MaterialData } from '@/types/scene'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'

export function exportSceneToSTL(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  filterNodeId?: string,
  binary = true
): Blob {
  const rootObject = buildThreeSceneFromNodes(nodes, rootNodeIds, materials, filterNodeId)
  const exporter = new STLExporter()
  const result = exporter.parse(rootObject, { binary })
  return new Blob([result], { type: binary ? 'application/octet-stream' : 'text/plain' })
}
