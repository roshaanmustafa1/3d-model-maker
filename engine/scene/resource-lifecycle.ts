import * as THREE from 'three'
import type { EditorState } from '@/stores/editor-store'
import { pruneCustomGeometries } from './primitive-factory'
import { pruneMaterialResources } from './material-manager'
import { removeTopologyForNode } from '@/engine/topology/topology-cache'
import { retainedWorkspaceScenes } from './workspaces'

let previousNodes = new Set<string>()
export function pruneSceneResources(state: EditorState): void {
  const keep = new Set<string>()
  const scenes = [state, ...retainedWorkspaceScenes()]
  for (const scene of scenes) {
    Object.values(scene.nodes).forEach(node => { if (node.geometry?.customGeometryKey) keep.add(node.geometry.customGeometryKey) })
    for (const command of [...scene.history.past, ...scene.history.future]) command.resourceKeys?.forEach(key => keep.add(key))
  }
  pruneCustomGeometries(keep)
  pruneMaterialResources(Object.assign({}, ...scenes.map(scene => scene.materials)))
  for (const id of previousNodes) if (!state.nodes[id]) removeTopologyForNode(id)
  previousNodes = new Set(Object.keys(state.nodes))
}

export function disposeScene(root: THREE.Object3D, textures = false): void {
  const disposedTextures = new Set<THREE.Texture>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (textures) Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) disposedTextures.add(value) })
      material.dispose()
    }
  })
  disposedTextures.forEach((texture) => texture.dispose())
}
