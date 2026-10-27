import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { SceneNode, MaterialData } from '@/types/scene'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'

export function exportSceneToOBJ(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  filterNodeId?: string
): Blob {
  const rootObject = buildThreeSceneFromNodes(nodes, rootNodeIds, materials, filterNodeId)
  const exporter = new OBJExporter()
  const result = exporter.parse(rootObject)
  return new Blob([result], { type: 'text/plain' })
}
