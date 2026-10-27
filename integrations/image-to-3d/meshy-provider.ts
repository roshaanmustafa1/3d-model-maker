import {
  ImageTo3DProvider,
  ProviderCapabilities,
  GenerationRequest,
  ProviderJobStatus,
  GeneratedAssets,
} from './provider-interface'

export class MeshyProvider implements ImageTo3DProvider {
  readonly id = 'meshy'
  readonly name = 'Meshy AI (Official Image-to-3D)'
  private apiKey: string | null = null
  private baseUrl = 'https://api.meshy.ai'

  constructor(apiKeyOverride?: string) {
    this.apiKey =
      apiKeyOverride ||
      process.env.MESHY_API_KEY ||
      process.env.NEXT_PUBLIC_MESHY_API_KEY ||
      null
  }

  capabilities(): ProviderCapabilities {
    const isConfigured = !!this.apiKey && this.apiKey.trim().length > 0
    return {
      id: this.id,
      name: this.name,
      singleImage: true,
      multiImage: true,
      maxImages: 4,
      supportsPbr: true,
      supportsRemesh: true,
      supportsPolycount: true,
      supportedFormats: ['glb', 'fbx', 'obj', 'usdz'],
      estimatedCostNotice: 'Consumes standard Meshy AI generation credits (typically 20 credits per task).',
      isConfigured,
      configurationNotice: isConfigured
        ? 'Meshy API key is configured and active.'
        : 'Meshy API key is missing. Set MESHY_API_KEY in .env.local to activate live cloud generation.',
    }
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error(
        'MESHY_API_KEY is not configured on the server. Please add MESHY_API_KEY to your environment or .env.local.'
      )
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
  }

  async createJob(request: GenerationRequest): Promise<ProviderJobStatus> {
    const isMultiImage = request.images.length > 1

    if (isMultiImage) {
      return this.createMultiImageJob(request)
    } else {
      return this.createSingleImageJob(request)
    }
  }

  private async createSingleImageJob(request: GenerationRequest): Promise<ProviderJobStatus> {
    const image = request.images[0]
    if (!image || !image.dataUrl) {
      throw new Error('At least one reference image is required for Meshy single-image-to-3D.')
    }

    const payload: Record<string, unknown> = {
      image_url: image.dataUrl,
      ai_model: 'meshy-7.1',
      geometry_resolution: request.settings.geometryQuality === 'high' ? '2k' : 'standard',
      should_remesh: request.settings.shouldRemesh ?? true,
      topology: request.settings.topology ?? 'triangle',
      should_texture: request.settings.shouldTexture ?? true,
      enable_pbr: request.settings.enablePbr ?? true,
      target_formats: ['glb'],
    }

    if (request.settings.targetPolycount && request.settings.targetPolycount > 0) {
      payload.target_polycount = Math.min(300000, Math.max(500, request.settings.targetPolycount))
    }

    const res = await fetch(`${this.baseUrl}/openapi/v1/image-to-3d`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      this.handleHttpErrors(res.status, errorText)
    }

    const data = await res.json()
    const taskId = data.result || data.id
    if (!taskId) {
      throw new Error(`Invalid response from Meshy API: missing task ID (${JSON.stringify(data)})`)
    }

    return {
      taskId,
      status: 'PENDING',
      progress: 0,
      stageMessage: 'Submitted single-image task to Meshy AI...',
    }
  }

  private async createMultiImageJob(request: GenerationRequest): Promise<ProviderJobStatus> {
    const sortedImages = [...request.images].sort((a, b) => {
      const order = ['front', 'left', 'back', 'right', 'top', 'perspective', 'detail']
      return order.indexOf(a.view) - order.indexOf(b.view)
    })

    const imageUrls = sortedImages.slice(0, 4).map((img) => img.dataUrl)
    if (imageUrls.length === 0) {
      throw new Error('At least one reference image required for multi-image-to-3d.')
    }

    const payload: Record<string, unknown> = {
      image_urls: imageUrls,
      ai_model: 'latest',
      geometry_resolution: request.settings.geometryQuality === 'high' ? '2k' : 'standard',
      should_texture: request.settings.shouldTexture ?? true,
      should_remesh: request.settings.shouldRemesh ?? true,
      topology: request.settings.topology ?? 'triangle',
      symmetry_mode: request.settings.symmetryMode ?? 'auto',
    }

    if (request.settings.targetPolycount && request.settings.targetPolycount > 0) {
      payload.target_polycount = Math.min(300000, Math.max(500, request.settings.targetPolycount))
    }

    const res = await fetch(`${this.baseUrl}/openapi/v1/multi-image-to-3d`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      this.handleHttpErrors(res.status, errorText)
    }

    const data = await res.json()
    const taskId = data.result || data.id
    if (!taskId) {
      throw new Error(`Invalid response from Meshy API: missing task ID (${JSON.stringify(data)})`)
    }

    return {
      taskId,
      status: 'PENDING',
      progress: 0,
      stageMessage: 'Submitted multi-image task to Meshy AI...',
    }
  }

  async getJob(providerTaskId: string, request?: GenerationRequest): Promise<ProviderJobStatus> {
    const isMultiImage = request ? request.images.length > 1 : false
    const endpoints = isMultiImage
      ? [`${this.baseUrl}/openapi/v1/multi-image-to-3d/${providerTaskId}`, `${this.baseUrl}/openapi/v1/image-to-3d/${providerTaskId}`]
      : [`${this.baseUrl}/openapi/v1/image-to-3d/${providerTaskId}`, `${this.baseUrl}/openapi/v1/multi-image-to-3d/${providerTaskId}`]

    let lastError: Error | null = null

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        })

        if (!res.ok) {
          if (res.status === 404) {
            continue // Try alternative endpoint
          }
          const errorText = await res.text()
          this.handleHttpErrors(res.status, errorText)
        }

        const data = await res.json()
        const rawStatus = (data.status || 'PENDING').toUpperCase()
        let status: ProviderJobStatus['status'] = 'PENDING'
        if (rawStatus === 'SUCCEEDED' || rawStatus === 'SUCCESS') status = 'SUCCEEDED'
        else if (rawStatus === 'IN_PROGRESS' || rawStatus === 'PROCESSING') status = 'IN_PROGRESS'
        else if (rawStatus === 'FAILED') status = 'FAILED'
        else if (rawStatus === 'CANCELED' || rawStatus === 'CANCELLED') status = 'CANCELED'

        const progress = typeof data.progress === 'number' ? data.progress : status === 'SUCCEEDED' ? 100 : 25

        let stageMessage = 'Meshy processing...'
        if (status === 'PENDING') stageMessage = 'Meshy task queued in generation pool...'
        else if (status === 'IN_PROGRESS') stageMessage = `Synthesizing 3D mesh & textures (${progress}%)...`
        else if (status === 'SUCCEEDED') stageMessage = 'Meshy generation complete. Downloading GLB asset...'
        else if (status === 'FAILED') stageMessage = `Meshy generation failed: ${data.task_error?.message || 'Unknown provider error'}`

        return {
          taskId: providerTaskId,
          status,
          progress,
          stageMessage,
          modelUrls: data.model_urls || (data.model_url ? { glb: data.model_url } : undefined),
          thumbnailUrl: data.thumbnail_url || (data.thumbnail_urls ? Object.values(data.thumbnail_urls)[0] as string : undefined),
          error: data.task_error ? { message: data.task_error.message } : undefined,
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    throw lastError || new Error(`Failed to query Meshy task ${providerTaskId}`)
  }

  async retrieveAssets(providerTaskId: string, status?: ProviderJobStatus): Promise<GeneratedAssets> {
    const glbUrl = status?.modelUrls?.glb
    if (!glbUrl) {
      throw new Error(`Meshy task ${providerTaskId} has no GLB output URL available.`)
    }

    // SSRF validation: Verify HTTPS and approved host domain
    const parsedUrl = new URL(glbUrl)
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(`Untrusted protocol for model download: ${parsedUrl.protocol}`)
    }

    const host = parsedUrl.hostname.toLowerCase()
    const isApprovedHost =
      host.endsWith('.meshy.ai') ||
      host.endsWith('.amazonaws.com') ||
      host.includes('meshy') ||
      host === 'localhost' ||
      host === '127.0.0.1'

    if (!isApprovedHost) {
      throw new Error(`Untrusted host for asset download: ${host}`)
    }

    const res = await fetch(glbUrl)
    if (!res.ok) {
      if (res.status === 403 || res.status === 404) {
        throw new Error(
          `Provider asset URL has expired or is unavailable (HTTP ${res.status}). Result URLs from Meshy are time-limited.`
        )
      }
      throw new Error(`Failed to download GLB asset from Meshy: HTTP ${res.status}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'model/gltf-binary'

    // Validate GLB binary magic (0x46546C67 in little endian: 'glTF')
    if (arrayBuffer.byteLength < 12) {
      throw new Error('Downloaded asset is corrupted: file size too small to be a valid GLB container.')
    }

    const magic = new DataView(arrayBuffer).getUint32(0, true)
    if (magic !== 0x46546c67) {
      throw new Error('Downloaded asset is invalid: missing glTF binary magic header (0x46546C67).')
    }

    let thumbnailBuffer: ArrayBuffer | undefined
    if (status?.thumbnailUrl) {
      try {
        const thumbRes = await fetch(status.thumbnailUrl)
        if (thumbRes.ok) {
          thumbnailBuffer = await thumbRes.arrayBuffer()
        }
      } catch {
        // Thumbnail is non-blocking
      }
    }

    return {
      glbBuffer: arrayBuffer,
      thumbnailBuffer,
      metadata: {
        fileSizeBytes: arrayBuffer.byteLength,
        contentType,
        sourceUrl: glbUrl,
        retrievedAt: new Date().toISOString(),
      },
    }
  }

  private handleHttpErrors(status: number, errorText: string): never {
    if (status === 401) {
      throw new Error('Meshy API authentication failed: Invalid or expired MESHY_API_KEY.')
    }
    if (status === 402 || status === 403) {
      throw new Error(
        'Meshy API credit limit reached: Insufficient account credits to complete 3D generation.'
      )
    }
    if (status === 429) {
      throw new Error('Meshy API rate limit exceeded: Too many concurrent requests. Please wait before retrying.')
    }
    throw new Error(`Meshy API request failed (HTTP ${status}): ${errorText}`)
  }
}
