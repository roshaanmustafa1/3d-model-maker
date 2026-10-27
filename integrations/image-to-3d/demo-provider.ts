import fs from 'fs'
import path from 'path'
import {
  ImageTo3DProvider,
  ProviderCapabilities,
  GenerationRequest,
  ProviderJobStatus,
  GeneratedAssets,
} from './provider-interface'

interface SimulatedTask {
  taskId: string
  request: GenerationRequest
  createdAt: number
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'
}

export class DemoImageTo3DProvider implements ImageTo3DProvider {
  readonly id = 'demo'
  readonly name = 'Local Fixture Provider (Test Assets; no AI generation)'
  private static tasks = new Map<string, SimulatedTask>()

  capabilities(): ProviderCapabilities {
    return {
      id: this.id,
      name: this.name,
      singleImage: true,
      multiImage: true,
      maxImages: 4,
      supportsPbr: true,
      supportsRemesh: true,
      supportsPolycount: true,
      supportedFormats: ['glb'],
      estimatedCostNotice: 'Offline test fixture playback. Does not reconstruct input images or perform AI generation.',
      isConfigured: true,
      configurationNotice:
        'Local fixture provider is active. Uses genuine pre-generated 3D garment & product GLBs for deterministic offline testing and pipeline validation.',
    }
  }

  async createJob(request: GenerationRequest): Promise<ProviderJobStatus> {
    const taskId = `demo_task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    DemoImageTo3DProvider.tasks.set(taskId, {
      taskId,
      request,
      createdAt: Date.now(),
      status: 'PENDING',
    })

    return {
      taskId,
      status: 'PENDING',
      progress: 5,
      stageMessage: 'Queued for test fixture playback; no AI generation.',
    }
  }

  async getJob(providerTaskId: string): Promise<ProviderJobStatus> {
    const task = DemoImageTo3DProvider.tasks.get(providerTaskId)
    const elapsedMs = task ? Date.now() - task.createdAt : 3000

    if (task && task.status === 'CANCELED') {
      return {
        taskId: providerTaskId,
        status: 'CANCELED',
        progress: 0,
        stageMessage: 'Job was cancelled by user.',
      }
    }

    // Simulate fast progressive generation
    if (elapsedMs < 600) {
      return {
        taskId: providerTaskId,
        status: 'PENDING',
        progress: 15,
        stageMessage: 'Analyzing multi-view silhouette & silhouette contours...',
      }
    } else if (elapsedMs < 1200) {
      return {
        taskId: providerTaskId,
        status: 'IN_PROGRESS',
        progress: 55,
        stageMessage: 'Synthesizing watertight surface mesh & UV islands...',
      }
    } else if (elapsedMs < 1800) {
      return {
        taskId: providerTaskId,
        status: 'IN_PROGRESS',
        progress: 88,
        stageMessage: 'Baking PBR material maps and validating normal winding...',
      }
    }

    if (task) task.status = 'SUCCEEDED'

    return {
      taskId: providerTaskId,
      status: 'SUCCEEDED',
      progress: 100,
      stageMessage: 'Existing fixture loaded. Ready for inspection; no AI generation was performed.',
      modelUrls: {
        glb: `/api/fixtures/generated-model?taskId=${providerTaskId}`,
      },
    }
  }

  async retrieveAssets(providerTaskId: string): Promise<GeneratedAssets> {
    const fixtureCandidates = [
      path.join(process.cwd(), 'docs', 'fixtures', 'black-shirt.glb'),
      path.join(process.cwd(), 'qa-reports', 'exported-models', 'black-raglan_shirt.glb'),
      path.join(process.cwd(), 'qa-reports', 'phase2_5', 'fixtures', 'multipart-pbr-export.glb'),
    ]

    let glbBuffer: Buffer | null = null
    let chosenPath = ''

    for (const cand of fixtureCandidates) {
      if (fs.existsSync(cand)) {
        glbBuffer = await fs.promises.readFile(cand)
        chosenPath = cand
        break
      }
    }

    if (!glbBuffer) {
      throw new Error('Local demo fixture GLB could not be located in project files.')
    }

    // Convert Buffer to ArrayBuffer
    const arrayBuffer = glbBuffer.buffer.slice(
      glbBuffer.byteOffset,
      glbBuffer.byteOffset + glbBuffer.byteLength
    ) as ArrayBuffer

    // Validate GLB binary magic (0x46546C67 in little endian: 'glTF')
    const magic = new DataView(arrayBuffer).getUint32(0, true)
    if (magic !== 0x46546c67) {
      throw new Error('Local fixture file is not a valid GLB binary container.')
    }

    return {
      glbBuffer: arrayBuffer,
      metadata: {
        fileSizeBytes: arrayBuffer.byteLength,
        contentType: 'model/gltf-binary',
        sourceUrl: chosenPath,
        retrievedAt: new Date().toISOString(),
      },
    }
  }

  async cancelJob(providerTaskId: string): Promise<boolean> {
    const task = DemoImageTo3DProvider.tasks.get(providerTaskId)
    if (task) {
      task.status = 'CANCELED'
      return true
    }
    return false
  }
}
