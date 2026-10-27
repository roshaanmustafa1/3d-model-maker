import {
  GenerationInput,
  GenerationJob,
  GenerationSettings,
  ProviderCapabilities,
} from '@/types/ai-generator'
import { JobRepository } from './job-repository'
import { saveAsset, getAssetLocalUrl } from './asset-storage'
import { ImageTo3DProvider } from '@/integrations/image-to-3d/provider-interface'
import { MeshyProvider } from '@/integrations/image-to-3d/meshy-provider'
import { DemoImageTo3DProvider } from '@/integrations/image-to-3d/demo-provider'
import { TripoProvider } from '@/integrations/image-to-3d/tripo-provider'
import { validateGlbBuffer } from '@/engine/generation/generation-validator'

export class JobOrchestrator {
  private static providers = new Map<string, ImageTo3DProvider>()

  static getProvider(providerId: string): ImageTo3DProvider {
    if (this.providers.size === 0) {
      this.registerProvider(new MeshyProvider())
      this.registerProvider(new DemoImageTo3DProvider())
      this.registerProvider(new TripoProvider())
    }

    const provider = this.providers.get(providerId)
    if (!provider) {
      throw new Error(`Provider "${providerId}" is not recognized or supported.`)
    }
    return provider
  }

  static registerProvider(provider: ImageTo3DProvider): void {
    this.providers.set(provider.id, provider)
  }

  static listProviders(): ProviderCapabilities[] {
    if (this.providers.size === 0) {
      this.registerProvider(new MeshyProvider())
      this.registerProvider(new DemoImageTo3DProvider())
      this.registerProvider(new TripoProvider())
    }
    return Array.from(this.providers.values()).map((p) => p.capabilities())
  }

  static async createJob(input: GenerationInput): Promise<GenerationJob> {
    const providerId = input.providerId || (process.env.MESHY_API_KEY ? 'meshy' : 'demo')
    const provider = this.getProvider(providerId)
    const capabilities = provider.capabilities()

    if (!capabilities.isConfigured && providerId !== 'demo') {
      throw new Error(
        `${capabilities.name} is not configured: ${capabilities.configurationNotice || 'API Key missing.'}`
      )
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const defaultSettings: GenerationSettings = {
      category: input.category || 'apparel',
      geometryQuality: input.quality || 'standard',
      shouldTexture: true,
      enablePbr: true,
      shouldRemesh: true,
      topology: 'triangle',
      symmetryMode: 'auto',
      dimensions: input.dimensions,
    }

    const mergedSettings: GenerationSettings = {
      ...defaultSettings,
      ...(input.settings || {}),
    }

    const newJob: GenerationJob = {
      id: jobId,
      provider: providerId as any,
      providerId: providerId as any,
      status: 'queued',
      progress: 5,
      stageMessage: `Queued with ${capabilities.name}...`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prompt: input.prompt,
      category: input.category,
      settings: mergedSettings,
      images: input.images || [],
    }

    // Persist draft/queued state
    await JobRepository.saveJob(newJob)

    try {
      // Submit asynchronously to provider
      const providerStatus = await provider.createJob({
        jobId,
        prompt: input.prompt,
        category: input.category,
        images: input.images || [],
        settings: mergedSettings,
      })

      newJob.providerTaskId = providerStatus.taskId
      newJob.status = 'processing'
      newJob.progress = Math.max(newJob.progress, providerStatus.progress)
      newJob.stageMessage = providerStatus.stageMessage

      await JobRepository.saveJob(newJob)
      return newJob
    } catch (err) {
      newJob.status = 'failed'
      newJob.error = err instanceof Error ? err.message : String(err)
      newJob.stageMessage = `Submission failed: ${newJob.error}`
      await JobRepository.saveJob(newJob)
      throw err
    }
  }

  static async reconcileJob(jobId: string): Promise<GenerationJob> {
    const job = await JobRepository.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    // If already in a terminal state, return directly
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') {
      return job
    }

    if (!job.providerTaskId) {
      return job
    }

    const providerId = job.providerId || job.provider || 'demo'
    const provider = this.getProvider(providerId)

    try {
      const status = await provider.getJob(job.providerTaskId)

      job.progress = status.progress
      job.stageMessage = status.stageMessage

      if (status.status === 'SUCCEEDED') {
        job.status = 'downloading'
        job.stageMessage = 'Retrieving and validating genuine GLB asset from provider...'
        await JobRepository.saveJob(job)

        // Download asset
        const assets = await provider.retrieveAssets(job.providerTaskId, status)

        // Validate GLB structure & extract diagnostics
        const qualityReport = await validateGlbBuffer(assets.glbBuffer)
        job.qualityReport = qualityReport

        // Save durable GLB asset
        const glbUrl = await saveAsset(job.id, 'original_glb', assets.glbBuffer, assets.metadata.contentType)
        job.resultGlbUrl = glbUrl

        // Save thumbnail if available
        if (assets.thumbnailBuffer) {
          const thumbUrl = await saveAsset(job.id, 'thumbnail', assets.thumbnailBuffer, 'image/jpeg')
          job.thumbnailUrl = thumbUrl
        }

        job.status = 'completed'
        job.progress = 100
        job.completedAt = new Date().toISOString()
        job.stageMessage = 'AI Image-to-3D generation completed and validated.'
      } else if (status.status === 'FAILED') {
        job.status = 'failed'
        job.error = status.error?.message || 'Provider generation reported failure.'
        job.stageMessage = `Failed: ${job.error}`
      } else if (status.status === 'CANCELED') {
        job.status = 'canceled'
        job.stageMessage = 'Generation task was canceled.'
      } else {
        job.status = 'processing'
      }

      await JobRepository.saveJob(job)
      return job
    } catch (err) {
      console.error(`[JobOrchestrator] Error reconciling job ${jobId}:`, err)
      // Do not mark job failed on temporary polling network blip
      return job
    }
  }

  static async cancelJob(jobId: string): Promise<GenerationJob> {
    const job = await JobRepository.getJob(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') {
      return job
    }

    const providerId = job.providerId || job.provider || 'demo'
    const provider = this.getProvider(providerId)

    if (job.providerTaskId && provider.cancelJob) {
      try {
        await provider.cancelJob(job.providerTaskId)
      } catch (err) {
        console.warn(`[JobOrchestrator] Provider cancellation failed:`, err)
      }
    }

    job.status = 'canceled'
    job.stageMessage = 'Job canceled by user.'
    await JobRepository.saveJob(job)
    return job
  }
}
