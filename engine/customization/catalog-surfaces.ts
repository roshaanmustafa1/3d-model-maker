import * as THREE from 'three'
import { BLACKBULLET_CONTRACT } from './blackbullet-contract'

export function isolatedBoxUVs(geometry: THREE.BufferGeometry): void {
  const uv = geometry.getAttribute('uv')
  for (const [index, group] of geometry.groups.entries()) {
    const ids = new Set<number>()
    for (let i = group.start; i < group.start + group.count; i++) ids.add(geometry.index ? geometry.index.getX(i) : i)
    for (const id of ids) uv.setXY(id, (index % 3 + uv.getX(id)) / 3, (Math.floor(index / 3) + uv.getY(id)) / 2)
  }
  uv.needsUpdate = true
}

export function isolatedCylinderUVs(geometry: THREE.BufferGeometry): void {
  const uv = geometry.getAttribute('uv')
  for (const [slot, group] of geometry.groups.entries()) {
    const ids = new Set<number>()
    for (let i = group.start; i < group.start + group.count; i++) ids.add(geometry.index ? geometry.index.getX(i) : i)
    for (const id of ids) {
      const u = uv.getX(id), v = uv.getY(id)
      uv.setXY(id, slot === 0 ? u * .8 : .81 + u * .18, slot === 0 ? v : (slot === 1 ? .51 : .01) + v * .48)
    }
  }
  uv.needsUpdate = true
}

export function splitTorso(geometry: THREE.BoxGeometry, material: THREE.MeshStandardMaterial): THREE.Mesh[] {
  const source = geometry.toNonIndexed()
  const definitions = [
    { name: 'Body_Main', zone: 'body_front', region: 'shirt_front', test: (z: number) => z > .9 },
    { name: 'Body_Back', zone: 'body_back', region: 'shirt_back', test: (z: number) => z < -.9 },
    { name: 'Body_Sides', zone: undefined, region: 'shirt_base', test: (z: number) => Math.abs(z) < .9 },
  ]
  const result = definitions.map(({ name, zone, region, test }) => {
    const positions: number[] = [], normals: number[] = [], uvs: number[] = []
    const bounds = BLACKBULLET_CONTRACT.atlas[region]
    for (let i = 0; i < source.attributes.position.count; i += 3) {
      if (!test(source.attributes.normal.getZ(i))) continue
      for (let j = i; j < i + 3; j++) {
        positions.push(source.attributes.position.getX(j), source.attributes.position.getY(j), source.attributes.position.getZ(j))
        normals.push(source.attributes.normal.getX(j), source.attributes.normal.getY(j), source.attributes.normal.getZ(j))
        const u = source.attributes.uv.getX(j), v = source.attributes.uv.getY(j)
        uvs.push(bounds ? bounds.minU + u * (bounds.maxU - bounds.minU) : u, bounds ? 1 - bounds.maxV + (1 - v) * (bounds.maxV - bounds.minV) : v)
      }
    }
    const part = new THREE.BufferGeometry()
    part.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    part.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    part.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    const mesh = new THREE.Mesh(part, material.clone())
    mesh.name = name
    mesh.userData = { partId: region, customizableZone: zone, isCustomizable: !!zone, blackBulletContract: { version: 1, profile: 'shirt' }, ...(bounds ? { customizationTarget: { uvBounds: bounds } } : {}) }
    return mesh
  })
  source.dispose(); geometry.dispose()
  return result
}
