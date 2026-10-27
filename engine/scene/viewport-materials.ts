import * as THREE from 'three'
import type { ViewMode } from '@/types/editor'

export function createViewportMaterials(source: THREE.Material[], mode: ViewMode): THREE.Material[] {
  return source.map((material) => {
    if (mode === 'normal') return new THREE.MeshNormalMaterial({ side: material.side })
    if (mode === 'wireframe') {
      return new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, side: material.side })
    }
    const preview = material.clone() as THREE.MeshStandardMaterial
    preview.wireframe = false
    return preview
  })
}
