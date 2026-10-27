import * as THREE from 'three'
import type { TopologyGraph } from '@/types/topology'

export function partitionGeometry(source: THREE.BufferGeometry, graph: TopologyGraph, partitions: number[][]): THREE.BufferGeometry[] {
  const faces = partitions.flat()
  if (faces.length !== graph.faces.size || new Set(faces).size !== faces.length || faces.some(id => !graph.faces.has(id))) {
    throw new Error('Separation must assign every face exactly once.')
  }
  const order = graph.bufferFaceIds || [...graph.faces.keys()]
  const triangles = new Map(order.map((id, index) => [id, index]))
  return partitions.map(ids => {
    const result = new THREE.BufferGeometry()
    const vertices: number[] = []
    for (const id of [...ids].sort((a, b) => graph.faces.get(a)!.materialIndex - graph.faces.get(b)!.materialIndex)) {
      const triangle = triangles.get(id)
      if (triangle === undefined) throw new Error('Stale topology: rebuild before separation.')
      const start = vertices.length
      for (let corner = 0; corner < 3; corner++) vertices.push(source.index ? source.index.getX(triangle * 3 + corner) : triangle * 3 + corner)
      const materialIndex = graph.faces.get(id)!.materialIndex
      const previous = result.groups[result.groups.length - 1]
      if (previous?.materialIndex === materialIndex) previous.count += 3
      else result.addGroup(start, 3, materialIndex)
    }
    const copy = (attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
      const ArrayType = attribute.array.constructor as Float32ArrayConstructor
      const output = new THREE.BufferAttribute(new ArrayType(vertices.length * attribute.itemSize), attribute.itemSize, attribute.normalized)
      vertices.forEach((vertex, index) => {
        for (let component = 0; component < attribute.itemSize; component++) output.setComponent(index, component, attribute.getComponent(vertex, component))
      })
      output.name = attribute.name
      return output
    }
    for (const [name, attribute] of Object.entries(source.attributes)) result.setAttribute(name, copy(attribute))
    for (const [name, attributes] of Object.entries(source.morphAttributes)) result.morphAttributes[name as 'position'] = attributes.map(copy)
    result.morphTargetsRelative = source.morphTargetsRelative
    result.userData = structuredClone(source.userData)
    result.computeBoundingBox()
    result.computeBoundingSphere()
    return result
  })
}
