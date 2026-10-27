export type Vector3Array = [number, number, number]

export interface TransformData {
  position: Vector3Array
  rotation: Vector3Array // in degrees for easy UI editing
  scale: Vector3Array
  rotationOrder?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY'
}

export type GeometryType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'plane'
  | 'custom'

export interface GeometryStats {
  vertexCount: number
  triangleCount: number
  hasNormals: boolean
  hasUVs: boolean
  boundingBox?: {
    min: Vector3Array
    max: Vector3Array
    size: Vector3Array
  }
}

export interface GeometryDefinition {
  type: GeometryType
  params: Record<string, number>
  stats: GeometryStats
  customGeometryKey?: string // Key referencing binary or BufferGeometry cache if imported
}

export type CustomizableZone =
  | 'body_front'
  | 'body_back'
  | 'sleeve_left'
  | 'sleeve_right'
  | 'hood'
  | 'pocket_front'
  | 'collar'
  | 'cuff_left'
  | 'cuff_right'
  | 'custom'

export type SceneNodeType = 'mesh' | 'group' | 'light'

export interface SceneNode {
  id: string
  name: string
  type: SceneNodeType
  parentId: string | null
  children: string[]
  transform: TransformData
  geometry?: GeometryDefinition
  materialId?: string
  materialIds?: string[]
  userData?: Record<string, unknown>
  visible: boolean
  locked: boolean
  customizableZone?: CustomizableZone
  isCustomizable?: boolean
  semanticTag?: string // e.g. "Body_Main", "Sleeve_Left" for BlackBullet
}

export interface MaterialData {
  id: string
  name: string
  color: string // hex #ffffff
  roughness: number // 0 - 1
  metalness: number // 0 - 1
  emissive: string // hex
  emissiveIntensity: number // 0 - 5
  opacity: number // 0 - 1
  transparent: boolean
  wireframe: boolean
  doubleSided: boolean
  map?: string | null // null explicitly removes an imported map
  mapFlipY?: boolean
  mapChannel?: number
  normalMap?: string | null
  roughnessMap?: string | null
  importedTextureSlots?: string[]
  importedMaterialKey?: string
  sourceType?: string
  side?: number
  alphaTest?: number
}

export interface EnvironmentSettings {
  preset: 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'apartment'
  background: boolean
  blur: number
  ambientIntensity: number
  directionalIntensity: number
  shadows: boolean
  grid: boolean
  axes: boolean
}
