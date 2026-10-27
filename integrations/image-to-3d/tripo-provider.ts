import {
  ImageTo3DProvider,
  ProviderCapabilities,
  GenerationRequest,
  ProviderJobStatus,
  GeneratedAssets,
} from './provider-interface'

export class TripoProvider implements ImageTo3DProvider {
  readonly id = 'tripo'
  readonly name = 'Tripo 3D (OpenAPI v3)'
  private apiKey: string | null = null
  private baseUrl = 'https://openapi.tripo3d.ai'

  constructor(apiKeyOverride?: string) {
    this.apiKey =
      apiKeyOverride ||
      process.env.TRIPO_API_KEY ||
      process.env.NEXT_PUBLIC_TRIPO_API_KEY ||
      null
  }

  capabilities(): ProviderCapabilities {
    const isConfigured = !!this.apiKey && this.apiKey.trim().length > 0
    return {
      id: this.id,
      name: this.name,
      singleImage: true,
      multiImage: false,
      maxImages: 1,
      supportsPbr: true,
      supportsRemesh: true,
      supportsPolycount: true,
      supportedFormats: ['glb'],
      estimatedCostNotice: 'Consumes Tripo API draft/refine credits.',
      isConfigured,
      configurationNotice: isConfigured
        ? 'Tripo API key configured and active.'
        : 'Tripo API key is not configured. Set TRIPO_API_KEY to activate Tripo generation.',
    }
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('TRIPO_API_KEY is not configured on the server.')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
  }

  async createJob(request: GenerationRequest): Promise<ProviderJobStatus> {
    const image = request.images[0]
    if (!image || !image.dataUrl) {
      throw new Error('At least one reference image is required for Tripo 3D.')
    }

    const payload: Record<string, unknown> = {
      type: 'image_to_model',
      file: {
        type: image.mimeType || 'image/jpeg',
        data: image.dataUrl.includes(',') ? image.dataUrl.split(',')[1] : image.dataUrl,
      },
    }

    const res = await fetch(`${this.baseUrl}/v3/generation/image-to-model`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Tripo task creation failed (HTTP ${res.status}): ${errText}`)
    }

    const data = await res.json()
    const taskId = data.data?.task_id || data.task_id
    if (!taskId) {
      throw new Error(`Invalid response from Tripo API: missing task ID (${JSON.stringify(data)})`)
    }

    return {
      taskId,
      status: 'PENDING',
      progress: 0,
      stageMessage: 'Submitted image to Tripo 3D engine...',
    }
  }

  async getJob(providerTaskId: string): Promise<ProviderJobStatus> {
    const res = await fetch(`${this.baseUrl}/v3/tasks/${providerTaskId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Failed to query Tripo task ${providerTaskId}: ${errText}`)
    }

    const json = await res.json()
    const taskData = json.data || json

    let status: ProviderJobStatus['status'] = 'PENDING'
    if (taskData.status === 'success') status = 'SUCCEEDED'
    else if (taskData.status === 'running') status = 'IN_PROGRESS'
    else if (taskData.status === 'failed') status = 'FAILED'
    else if (taskData.status === 'cancelled') status = 'CANCELED'

    const progress = taskData.progress ?? (status === 'SUCCEEDED' ? 100 : 30)

    return {
      taskId: providerTaskId,
      status,
      progress,
      stageMessage:
        status === 'SUCCEEDED'
          ? 'Tripo generation succeeded.'
          : `Tripo status: ${taskData.status} (${progress}%)...`,
      modelUrls: taskData.output?.model_url ? { glb: taskData.output.model_url } : undefined,
      thumbnailUrl: taskData.output?.thumbnail_url,
      error: taskData.error ? { message: taskData.error } : undefined,
    }
  }

  async retrieveAssets(providerTaskId: string, status?: ProviderJobStatus): Promise<GeneratedAssets> {
    const glbUrl = status?.modelUrls?.glb
    if (!glbUrl) {
      throw new Error(`Tripo task ${providerTaskId} has no GLB output URL available.`)
    }

    const res = await fetch(glbUrl)
    if (!res.ok) {
      throw new Error(`Failed to download GLB asset from Tripo: HTTP ${res.status}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    if (arrayBuffer.byteLength < 12) {
      throw new Error('Downloaded asset from Tripo is too small to be a valid GLB container.')
    }

    const magic = new DataView(arrayBuffer).getUint32(0, true)
    if (magic !== 0x46546c67) {
      throw new Error('Downloaded asset is invalid: missing glTF binary magic header (0x46546C67).')
    }

    return {
      glbBuffer: arrayBuffer,
      metadata: {
        fileSizeBytes: arrayBuffer.byteLength,
        contentType: 'model/gltf-binary',
        sourceUrl: glbUrl,
        retrievedAt: new Date().toISOString(),
      },
    }
  }

  async cancelJob(providerTaskId: string): Promise<boolean> {
    return false
  }
}
