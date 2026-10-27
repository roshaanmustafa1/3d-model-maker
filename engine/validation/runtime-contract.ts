import * as THREE from 'three'
import { BLACKBULLET_CONTRACT } from '@/engine/customization/blackbullet-contract'
import { analyzeUVOverlap } from '@/engine/customization/uv-overlap'

export function verifyRuntimeContract(root: THREE.Object3D): boolean {
  const regions = new Set<string>()
  const depths = new Map<string, number>()
  let invalid = false
  root.updateMatrixWorld(true)
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const contract = object.userData.blackBulletContract
    const target = object.userData.customizationTarget
    const region = target?.blackBulletRegion || object.userData.partId
    if (!['shirt_front', 'shirt_back'].includes(region)) return
    if (regions.has(region) || contract?.version !== BLACKBULLET_CONTRACT.version || contract?.profile !== BLACKBULLET_CONTRACT.profile) { invalid = true; return }
    const slot = target?.materialSlot ?? 0, geometry: THREE.BufferGeometry = object.geometry
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    const uv = geometry.getAttribute('uv'), bounds = BLACKBULLET_CONTRACT.atlas[region]
    const positions = geometry.getAttribute('position')
    if (!uv || !positions || positions.itemSize !== 3 || !object.matrixWorld.elements.every(Number.isFinite) || !materials[slot] || !Number.isInteger(slot) || slot < 0 || (target?.uvChannel ?? 0) !== 0) { invalid = true; return }
    let triangles = 0
    let area = 0, weightedDepth = 0, facing = 0
    for (let offset = 0; offset < (geometry.index?.count || geometry.getAttribute('position')?.count || 0); offset += 3) {
      const group = geometry.groups.find(group => offset >= group.start && offset < group.start + group.count)
      if ((group?.materialIndex ?? 0) !== slot) continue
      triangles++
      const points = [0, 1, 2].map(corner => {
        const index = geometry.index ? geometry.index.getX(offset + corner) : offset + corner
        return new THREE.Vector3().fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld)
      })
      const normal = points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]))
      const weight = normal.length()
      area += weight
      facing += normal.z
      weightedDepth += weight * (points[0].z + points[1].z + points[2].z) / 3
      for (let corner = 0; corner < 3; corner++) {
        const index = geometry.index ? geometry.index.getX(offset + corner) : offset + corner
        const u = uv.getX(index), v = 1 - uv.getY(index)
        if (!Number.isFinite(u) || !Number.isFinite(v) || u < bounds.minU - 1e-4 || u > bounds.maxU + 1e-4 || v < bounds.minV - 1e-4 || v > bounds.maxV + 1e-4) invalid = true
      }
    }
    if (!triangles || analyzeUVOverlap(geometry, { slot }).hasOverlap) invalid = true
    if (!(area > 1e-12) || (region === 'shirt_front' ? facing <= 1e-12 : facing >= -1e-12)) invalid = true
    depths.set(region, weightedDepth / area)
    regions.add(region)
  })
  return !invalid && regions.has('shirt_front') && regions.has('shirt_back') && depths.get('shirt_front')! > depths.get('shirt_back')!
}
