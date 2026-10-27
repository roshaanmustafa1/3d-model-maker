import * as THREE from 'three'
import { processThreeObjectHierarchy } from '../../engine/loaders/model-importer.ts'

export function blackShirt() {
  const root = new THREE.Group()
  root.name = 'TShirt'
  root.position.set(0.2, 0.4, -0.3)
  root.rotation.set(0.1, 0.2, -0.1, 'ZYX')
  root.scale.set(1.1, 0.9, 1)
  const fabric = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.85, metalness: 0 })
  fabric.name = 'Matte Black Cotton'
  for (const [name, size, position] of [
    ['Body_Main', [1.2, 1.5, 0.25], [0, 0, 0]],
    ['Sleeve_Left', [0.6, 0.5, 0.25], [-0.85, 0.5, 0]],
    ['Sleeve_Right', [0.6, 0.5, 0.25], [0.85, 0.5, 0]],
  ]) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), fabric)
    mesh.name = name
    mesh.position.set(...position)
    mesh.userData = { isCustomizable: true, customizableZone: name === 'Body_Main' ? 'body_front' : name === 'Sleeve_Left' ? 'sleeve_left' : 'sleeve_right' }
    root.add(mesh)
  }
  return processThreeObjectHierarchy(root, 'Black T-shirt')
}
