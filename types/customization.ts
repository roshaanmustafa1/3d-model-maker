import { MaterialData } from './scene'

export type LayerType = 'image' | 'text' | 'shape'

export interface BaseArtworkLayer {
  id: string
  name: string
  type: LayerType
  x: number // X coordinate in canvas space (e.g. 0 - 1000)
  y: number // Y coordinate in canvas space (e.g. 0 - 1000)
  width: number
  height: number
  rotation: number // degrees (0 - 360)
  scaleX: number
  scaleY: number
  opacity: number // 0 to 1
  visible: boolean
  locked: boolean
  zIndex: number
}

export interface ImageArtworkLayer extends BaseArtworkLayer {
  type: 'image'
  assetId: string
  src: string // Base64 data URL, blob URL or SVG markup URL
  mimeType?: string
  originalWidth?: number
  originalHeight?: number
  aspectRatioLocked?: boolean
  isSvg?: boolean
}

export interface TextArtworkLayer extends BaseArtworkLayer {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700' | '800'
  fontStyle: 'normal' | 'italic'
  fill: string // hex color
  align: 'left' | 'center' | 'right'
  letterSpacing: number
  lineHeight: number
  stroke?: string
  strokeWidth?: number
}

export type ShapeType = 'rectangle' | 'circle' | 'star' | 'triangle'

export interface ShapeArtworkLayer extends BaseArtworkLayer {
  type: 'shape'
  shapeType: ShapeType
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius?: number
}

export type ArtworkLayer = ImageArtworkLayer | TextArtworkLayer | ShapeArtworkLayer

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type NewArtworkLayer = DistributiveOmit<ArtworkLayer, 'id' | 'zIndex'>


export interface UVBounds {
  minU: number // 0.0 to 1.0
  maxU: number // 0.0 to 1.0
  minV: number // 0.0 to 1.0
  maxV: number // 0.0 to 1.0
}

export interface DesignZone {
  id: string
  name: string
  targetMeshNodeId: string
  targetMeshName?: string
  materialSlotIndex: number
  materialId?: string
  uvBounds: UVBounds
  canvasWidth: number
  canvasHeight: number
  layers: ArtworkLayer[]
  enabled: boolean
  target?: CustomizationTarget
  recommendedDimensions?: {
    width: number
    height: number
    unit: 'px' | 'mm'
  }
}

export interface CustomizationTarget {
  version: 1
  productId: string
  meshId: string
  materialSlot: number
  faceIndices?: number[]
  uvChannel: number
  uvBounds: UVBounds
  compositionId: string
  blackBulletRegion?: string
  textureFlipY: boolean
  intentionalSharedUVs?: boolean
}

export type ProductCategory =
  | 't-shirt'
  | 'hoodie'
  | 'jacket'
  | 'shoes'
  | 'bottle'
  | 'box'
  | 'furniture'
  | 'accessories'
  | 'other'

export interface CustomizableProduct {
  id: string
  name: string
  category: ProductCategory
  thumbnailUrl: string
  sourceType: 'preset' | 'imported' | 'project'
  glbUrl?: string
  defaultZones: DesignZone[]
  defaultFabricPreset?: string
  description?: string
}

export interface FabricPreset {
  id: string
  name: string
  category: 'cotton' | 'fleece' | 'terry' | 'poly' | 'canvas' | 'satin' | 'metal' | 'ceramic'
  color: string
  roughness: number
  metalness: number
  normalScale?: number
  description?: string
}

export type BlackBulletAppearanceMode = 'preserve-imported' | 'runtime-customization'

export type TextureResolution = 1024 | 2048 | 4096

export type StudioLightingPreset = 'neutral' | 'soft-white' | 'dark' | 'warm'

export type CameraViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'perspective' | 'fit' | 'reset'

export interface CustomizationProject {
  id: string
  name: string
  version: 3 | 4
  createdAt: string
  updatedAt: string
  productId: string
  productName: string
  productCategory: ProductCategory
  activeZoneId: string
  zones: Record<string, DesignZone>
  fabricColor: string
  fabricRoughness: number
  fabricMetalness: number
  fabricPresetId?: string
  partMaterials: Record<string, Partial<MaterialData>>
  textureResolution: TextureResolution
  blackBulletMode: BlackBulletAppearanceMode
  workspace?: 'editor' | 'customizer'
  sourceType?: 'preset' | 'imported' | 'project'
}
