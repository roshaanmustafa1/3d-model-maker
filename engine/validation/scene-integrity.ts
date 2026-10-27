import * as THREE from 'three'

export interface IntegrityReport { errors: string[]; warnings: string[] }

export function inspectScene(root: THREE.Object3D): IntegrityReport {
  const errors: string[] = []
  const warnings: string[] = []
  root.updateMatrixWorld(true)
  root.traverse((object) => {
    const label = object.name || object.type
    const determinant = object.matrixWorld.determinant()
    if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) errors.push(`${label}: singular or invalid world transform.`)
    else if (determinant < 0) warnings.push(`${label}: negative world determinant; verify mirrored face orientation downstream.`)
    if (!(object instanceof THREE.Mesh)) return
    if (!object.visible) warnings.push(`${label}: mesh is hidden.`)
    const geometry = object.geometry
    const position = geometry.getAttribute('position')
    if (!position || position.count < 3) {
      errors.push(`${label}: no renderable surface.`)
      return
    }
    for (const attributeName of ['position', 'normal', 'uv']) {
      const attribute = geometry.getAttribute(attributeName)
      if (!attribute) {
        if (attributeName !== 'position') errors.push(`${label}: missing ${attributeName} attribute.`)
        continue
      }
      if (attribute.count !== position.count) errors.push(`${label}: ${attributeName} count differs from positions.`)
      for (let i = 0; i < attribute.count; i++) {
        if (![attribute.getX(i), attribute.getY(i), ...(attribute.itemSize > 2 ? [attribute.getZ(i)] : [])].every(Number.isFinite)) {
          errors.push(`${label}: non-finite ${attributeName} data.`)
          break
        }
        if (attributeName === 'normal' && Math.hypot(attribute.getX(i), attribute.getY(i), attribute.getZ(i)) < 1e-8) {
          errors.push(`${label}: zero-length normal.`)
          break
        }
      }
    }
    const count = geometry.index?.count ?? position.count
    if (count % 3) errors.push(`${label}: incomplete triangle.`)
    let degenerate = 0
    let opposed = 0
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    const edge = new THREE.Vector3(), normal = new THREE.Vector3(), vertexNormal = new THREE.Vector3()
    const normals = geometry.getAttribute('normal')
    for (let i = 0; i + 2 < count; i += 3) {
      const indices = [0, 1, 2].map((offset) => geometry.index ? geometry.index.getX(i + offset) : i + offset)
      if (indices.some((index) => index < 0 || index >= position.count)) {
        errors.push(`${label}: triangle index outside vertex buffer.`)
        break
      }
      a.fromBufferAttribute(position, indices[0]); b.fromBufferAttribute(position, indices[1]); c.fromBufferAttribute(position, indices[2])
      edge.subVectors(b, a).cross(c.sub(a))
      if (edge.lengthSq() === 0) degenerate++
      if (normals) {
        normal.set(0, 0, 0)
        for (const index of indices) normal.add(vertexNormal.fromBufferAttribute(normals, index))
        if (edge.dot(normal) < -1e-10) opposed++
      }
    }
    if (degenerate) errors.push(`${label}: ${degenerate} degenerate triangles.`)
    if (opposed) warnings.push(`${label}: ${opposed} triangles have normals opposing winding; inspect orientation before repair.`)
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    if (Array.isArray(object.material) && !geometry.groups.length) errors.push(`${label}: material array has no geometry groups.`)
    for (const group of Array.isArray(object.material) ? geometry.groups : []) {
      if (!materials[group.materialIndex ?? 0]) errors.push(`${label}: geometry group references a missing material slot.`)
    }
    for (const material of materials) {
      const pbr = material as THREE.MeshStandardMaterial
      if (pbr.wireframe) errors.push(`${label}: unexpected wireframe material ${material.name}.`)
      if (material.opacity === 0 || !material.visible) errors.push(`${label}: invisible material ${material.name}.`)
      if (material.side === THREE.BackSide) warnings.push(`${label}: back-side-only material requires glTF orientation review.`)
      if (pbr.color && ![pbr.color.r, pbr.color.g, pbr.color.b, pbr.roughness ?? 0, pbr.metalness ?? 0].every(Number.isFinite)) errors.push(`${label}: invalid material values.`)
    }
  })
  return { errors, warnings }
}

function parentId(object: THREE.Object3D): string | undefined {
  let parent = object.parent
  while (parent) {
    if (parent.userData.nodeId) return parent.userData.nodeId
    parent = parent.parent
  }
}

function indexedNodes(root: THREE.Object3D): Map<string, THREE.Object3D> {
  const result = new Map<string, THREE.Object3D>()
  root.traverse((object) => { if (object.userData.nodeId) result.set(object.userData.nodeId, object) })
  return result
}

function primitiveMeshes(object: THREE.Object3D): THREE.Mesh[] {
  if (object instanceof THREE.Mesh) return [object]
  return object.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh && !child.userData.nodeId)
}

export function compareSceneRoundTrip(source: THREE.Object3D, reloaded: THREE.Object3D): IntegrityReport {
  source.updateMatrixWorld(true)
  reloaded.updateMatrixWorld(true)
  const errors: string[] = []
  const warnings: string[] = []
  const expected = indexedNodes(source), actual = indexedNodes(reloaded)
  const materialAssignments = new Map<string, string>()
  if (expected.size !== actual.size) errors.push('Logical scene node count changed during export.')
  const near = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(a), Math.abs(b))
  expected.forEach((before, id) => {
    const after = actual.get(id)
    const label = before.name
    if (!after) { errors.push(`${label}: missing reloaded node.`); return }
    if (before.name !== after.name) errors.push(`${label}: mesh/node name changed to ${after.name}.`)
    if (parentId(before) !== parentId(after)) errors.push(`${label}: parent hierarchy changed.`)
    if (!before.matrixWorld.elements.every((value, index) => near(value, after.matrixWorld.elements[index]))) errors.push(`${label}: world transform changed.`)
    for (const key of ['semanticTag', 'isCustomizable', 'customizableZone']) {
      if (before.userData[key] !== after.userData[key]) errors.push(`${label}: ${key} metadata changed.`)
    }
    if (!(before instanceof THREE.Mesh)) return
    const primitives = primitiveMeshes(after)
    const originalMaterials = Array.isArray(before.material) ? before.material : [before.material]
    const groups: { start: number; count: number; materialIndex?: number }[] = Array.isArray(before.material) ? before.geometry.groups : [{ start: 0, count: before.geometry.index?.count ?? before.geometry.getAttribute('position').count, materialIndex: 0 }]
    if (primitives.length !== groups.length) errors.push(`${label}: primitive count changed.`)
    groups.forEach((group, index) => {
      const mesh = primitives[index]
      if (!mesh) return
      const original = originalMaterials[group.materialIndex ?? 0] as THREE.MeshStandardMaterial
      const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial
      if (!original || !material) { errors.push(`${label}: missing material assignment.`); return }
      const assigned = materialAssignments.get(original.uuid)
      if (assigned && assigned !== material.uuid) errors.push(`${label}: shared material assignment changed.`)
      materialAssignments.set(original.uuid, material.uuid)
      if (original.type !== material.type || original.name !== material.name) errors.push(`${label}: material type/name changed.`)
      for (const key of ['color', 'emissive'] as const) {
        if (original[key] && (!material[key] || !original[key].toArray().every((value, i) => near(value, material[key].toArray()[i])))) errors.push(`${label}: material ${key} changed.`)
      }
      for (const key of ['roughness', 'metalness', 'opacity', 'alphaTest', 'emissiveIntensity', 'side', 'transparent'] as const) {
        const a = original[key], b = material[key]
        if (typeof a === 'number' && typeof b === 'number' ? !near(a, b) : a !== b) errors.push(`${label}: material ${key} changed.`)
      }
      for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'] as const) {
        const a = original[key], b = material[key]
        if (!!a !== !!b) errors.push(`${label}: ${key} texture reference changed.`)
        if (a && b && (a.colorSpace !== b.colorSpace || a.channel !== b.channel || a.wrapS !== b.wrapS || a.wrapT !== b.wrapT || !a.offset.equals(b.offset) || !a.repeat.equals(b.repeat) || !near(a.rotation, b.rotation))) errors.push(`${label}: ${key} texture settings changed.`)
      }
      const count = mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0
      if (count !== group.count) errors.push(`${label}: triangle/index count changed.`)
      for (const key of ['position', 'normal', 'uv']) {
        const a = before.geometry.getAttribute(key), b = mesh.geometry.getAttribute(key)
        if (!a || !b || a.count !== b.count || a.itemSize !== b.itemSize) { errors.push(`${label}: ${key} vertex count/attribute changed.`); continue }
        for (let i = 0; i < count; i++) {
          const ai = before.geometry.index ? before.geometry.index.getX(group.start + i) : group.start + i
          const bi = mesh.geometry.index ? mesh.geometry.index.getX(i) : i
          if (!near(a.getX(ai), b.getX(bi)) || !near(a.getY(ai), b.getY(bi)) || (a.itemSize > 2 && !near(a.getZ(ai), b.getZ(bi)))) {
            errors.push(`${label}: ${key} triangle data changed.`)
            break
          }
        }
      }
    })
  })
  return { errors: [...new Set(errors)], warnings }
}
