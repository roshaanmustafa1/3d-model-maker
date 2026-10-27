export type ReferenceView = 'front' | 'back' | 'left' | 'right' | 'top' | 'perspective' | 'detail'

export interface ReferenceImage {
  id: string
  view: ReferenceView
  dataUrl: string
  name: string
  size: number
  mimeType?: string
}

export type ProductCategory =
  | 'apparel'
  | 'footwear'
  | 'hardgoods'
  | 'packaging'
  | 'furniture'
  | 'accessories'
  | 'other'

export type GeometryQuality = 'draft' | 'standard' | 'high'

export interface GenerationSettings {
  category: ProductCategory
  geometryQuality: GeometryQuality
  targetPolycount?: number
  shouldTexture: boolean
  enablePbr: boolean
  shouldRemesh: boolean
  topology?: 'triangle' | 'quad'
  symmetryMode?: 'off' | 'auto' | 'on'
  modelOrientation?: 'front_z' | 'front_y' | 'auto'
  dimensions?: {
    width?: number
    height?: number
    depth?: number
    unit: 'cm' | 'in' | 'm'
  }
  outputFormats?: string[]
}

export interface GenerationInput {
  prompt: string
  category: ProductCategory
  dimensions?: {
    width?: number
    height?: number
    depth?: number
    unit: 'cm' | 'in' | 'm'
  }
  quality: GeometryQuality
  images: ReferenceImage[]
  settings?: Partial<GenerationSettings>
  providerId?: 'meshy' | 'demo' | 'tripo' | 'gemini_enhanced' | 'external_cloud'
}

export interface GeminiAnalysisResult {
  category: string
  detectedObjects: string[]
  estimatedDimensions: {
    width: number
    height: number
    depth: number
    unit: string
  }
  symmetry: 'symmetric_bilateral' | 'asymmetric' | 'radial'
  suggestedHierarchy: {
    rootName: string
    parts: {
      name: string
      customizable: boolean
      suggestedZone?: string
      confidence?: number
    }[]
  }
  materialCharacteristics: {
    baseColorDescription: string
    likelyMaterialType: 'cotton_fabric' | 'leather' | 'metal' | 'plastic' | 'glass' | 'wood' | string
    roughnessEstimate: number
    metalnessEstimate: number
  }
  reconstructionComplexity: 'low' | 'medium' | 'high'
  hiddenSurfacesWarning: string[]
  recommendedNextSteps: string[]
  hiddenGeometryUncertainty?: 'low' | 'medium' | 'high'
  requiresManualReview?: boolean
  suggestedOrientation?: string
  potentialCustomizableParts?: string[]
}

export type JobStatus =
  | 'draft'
  | 'queued'
  | 'submitting'
  | 'analyzing'
  | 'reconstructing'
  | 'meshing'
  | 'processing'
  | 'downloading'
  | 'processing_asset'
  | 'completed'
  | 'failed'
  | 'canceled'

export interface PbrMapsStatus {
  hasBaseColor: boolean
  hasNormalMap: boolean
  hasRoughnessMap: boolean
  hasMetalnessMap: boolean
  hasEmissiveMap: boolean
  hasOcclusionMap?: boolean
}

export interface GenerationQualityReport {
  isGlbCompatible: boolean
  isCustomizerCompatible: boolean
  isBlackBulletReady: boolean
  meshCount: number
  triangleCount: number
  vertexCount: number
  hasNormals: boolean
  hasUVs: boolean
  uvChannelCount: number
  overlappingUvDetected: boolean
  pbrMapsDetected: PbrMapsStatus
  dimensions: {
    width: number
    height: number
    depth: number
  }
  semanticPartsDetected: string[]
  validationIssues: string[]
  recommendations: string[]
}

export interface GenerationJob {
  id: string
  provider: 'meshy' | 'demo' | 'tripo' | 'gemini_enhanced' | 'external_cloud'
  providerId?: 'meshy' | 'demo' | 'tripo' | 'gemini_enhanced' | 'external_cloud'
  providerTaskId?: string
  status: JobStatus
  progress: number // 0 to 100
  stageMessage: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  prompt?: string
  category?: string
  settings?: GenerationSettings
  images?: ReferenceImage[]
  analysis?: GeminiAnalysisResult
  resultGlbBlob?: Blob
  resultModelUrl?: string
  resultGlbUrl?: string
  processedGlbUrl?: string
  thumbnailUrl?: string
  qualityReport?: GenerationQualityReport
  error?: string
}

export interface ProviderCapabilities {
  id: string
  name: string
  singleImage: boolean
  multiImage: boolean
  maxImages: number
  supportsPbr: boolean
  supportsRemesh: boolean
  supportsPolycount: boolean
  supportedFormats: string[]
  estimatedCostNotice?: string
  isConfigured?: boolean
  configurationNotice?: string
}

export interface ImageTo3DProvider {
  id?: string
  capabilities?(): ProviderCapabilities
  generate(input: GenerationInput): Promise<GenerationJob>
  getJobStatus(jobId: string): Promise<GenerationJob>
  cancelJob?(jobId: string): Promise<boolean>
}

export type MeshProcessingPreset =
  | 'preview_optimized'
  | 'web_optimized'
  | 'customizer_preparation'
  | 'blackbullet_garment_preparation'
  | 'preserve_high_detail'

export interface MeshProcessingOptions {
  preset: MeshProcessingPreset
  recalculateNormals?: boolean
  flipInvertedFaces?: boolean
  centerPivot?: boolean
  normalizeOrientation?: boolean
  scaleToDimensions?: {
    width: number
    height: number
    depth: number
  }
  simplifyPolycount?: boolean
  targetMaxTriangles?: number
  unwrapMissingUVs?: boolean
  useBlenderWorker?: boolean
}
