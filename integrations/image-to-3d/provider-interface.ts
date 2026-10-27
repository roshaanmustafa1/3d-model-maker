import {
  ProductCategory,
  GeometryQuality,
  ReferenceImage,
  GenerationSettings,
  PbrMapsStatus,
} from '@/types/ai-generator'

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
  isConfigured: boolean
  configurationNotice?: string
}

export interface GenerationRequest {
  jobId: string
  prompt: string
  category: ProductCategory
  images: ReferenceImage[]
  settings: GenerationSettings
}

export type ProviderStatusType =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED'

export interface ProviderJobStatus {
  taskId: string
  status: ProviderStatusType
  progress: number // 0-100
  stageMessage: string
  modelUrls?: {
    glb?: string
    fbx?: string
    obj?: string
    usdz?: string
  }
  thumbnailUrl?: string
  error?: {
    code?: string
    message: string
  }
}

export interface GeneratedAssets {
  glbBuffer: ArrayBuffer
  thumbnailBuffer?: ArrayBuffer
  metadata: {
    fileSizeBytes: number
    contentType: string
    sourceUrl?: string
    retrievedAt: string
  }
}

export interface ImageTo3DProvider {
  id: string
  name: string
  capabilities(): ProviderCapabilities
  createJob(request: GenerationRequest): Promise<ProviderJobStatus>
  getJob(providerTaskId: string, request?: GenerationRequest): Promise<ProviderJobStatus>
  retrieveAssets(providerTaskId: string, status?: ProviderJobStatus): Promise<GeneratedAssets>
  cancelJob?(providerTaskId: string): Promise<boolean>
}
