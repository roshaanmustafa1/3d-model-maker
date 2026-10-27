import * as THREE from 'three'
import { GeometryType, GeometryStats, GeometryDefinition } from '@/types/scene'

// In-memory cache for custom / imported geometries
const customGeometryCache = new Map<string, THREE.BufferGeometry>()

export function registerCustomGeometry(key: string, geometry: THREE.BufferGeometry): void {
  // Ensure normals & bounding box exist
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals()
  }
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  customGeometryCache.set(key, geometry)
}

export function getCustomGeometry(key: string): THREE.BufferGeometry | undefined {
  return customGeometryCache.get(key)
}

export function removeCustomGeometry(key: string): void {
  const geom = customGeometryCache.get(key)
  if (geom) {
    geom.dispose()
    customGeometryCache.delete(key)
  }
}

export function pruneCustomGeometries(keep: Set<string>): void {
  for (const key of customGeometryCache.keys()) if (!keep.has(key)) removeCustomGeometry(key)
}

export function geometryResourceCount(): number { return customGeometryCache.size }

export function calculateGeometryStats(geometry: THREE.BufferGeometry): GeometryStats {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox || new THREE.Box3()
  const size = new THREE.Vector3()
  box.getSize(size)

  const posAttr = geometry.attributes.position
  const vertexCount = posAttr ? posAttr.count : 0
  const index = geometry.index
  const triangleCount = index ? index.count / 3 : vertexCount / 3

  return {
    vertexCount,
    triangleCount: Math.round(triangleCount),
    hasNormals: !!geometry.attributes.normal,
    hasUVs: !!geometry.attributes.uv,
    boundingBox: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [size.x, size.y, size.z],
    },
  }
}

export function createBufferGeometry(type: GeometryType, params: Record<string, number>, customKey?: string): THREE.BufferGeometry {
  if (type === 'custom' || customKey) {
    const cached = customKey ? customGeometryCache.get(customKey) : undefined
    if (!cached) throw new Error(`Missing geometry asset ${customKey || '(no resource key)'}. Reopen a durable saved project or reimport the source model.`)
    return cached
  }

  let geom: THREE.BufferGeometry

  switch (type) {
    case 'box': {
      const width = params.width ?? 1
      const height = params.height ?? 1
      const depth = params.depth ?? 1
      const segments = params.segments ?? 1
      geom = new THREE.BoxGeometry(width, height, depth, segments, segments, segments)
      break
    }
    case 'sphere': {
      const radius = params.radius ?? 0.75
      const segments = params.segments ?? 32
      geom = new THREE.SphereGeometry(radius, segments, segments)
      break
    }
    case 'cylinder': {
      const radiusTop = params.radiusTop ?? 0.5
      const radiusBottom = params.radiusBottom ?? 0.5
      const height = params.height ?? 1.5
      const radialSegments = params.radialSegments ?? 32
      geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
      break
    }
    case 'cone': {
      const radius = params.radius ?? 0.75
      const height = params.height ?? 1.5
      const radialSegments = params.radialSegments ?? 32
      geom = new THREE.ConeGeometry(radius, height, radialSegments)
      break
    }
    case 'torus': {
      const radius = params.radius ?? 0.8
      const tube = params.tube ?? 0.25
      const radialSegments = params.radialSegments ?? 16
      const tubularSegments = params.tubularSegments ?? 48
      geom = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
      break
    }
    case 'plane': {
      const width = params.width ?? 2
      const height = params.height ?? 2
      geom = new THREE.PlaneGeometry(width, height)
      break
    }
    default:
      geom = new THREE.BoxGeometry(1, 1, 1)
  }

  geom.computeVertexNormals()
  geom.computeBoundingBox()
  return geom
}

export function createDefaultGeometryDefinition(type: GeometryType): GeometryDefinition {
  const defaultParams: Record<GeometryType, Record<string, number>> = {
    box: { width: 1, height: 1, depth: 1, segments: 1 },
    sphere: { radius: 0.75, segments: 32 },
    cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5, radialSegments: 32 },
    cone: { radius: 0.75, height: 1.5, radialSegments: 32 },
    torus: { radius: 0.8, tube: 0.25, radialSegments: 16, tubularSegments: 48 },
    plane: { width: 2, height: 2 },
    custom: {},
  }

  const params = defaultParams[type] || defaultParams.box
  const geom = createBufferGeometry(type, params)
  const stats = calculateGeometryStats(geom)
  geom.dispose()

  return {
    type,
    params,
    stats,
  }
}
