import { NextRequest, NextResponse } from 'next/server'
import { getAsset, saveAsset } from '@/server/generation/asset-storage'
import { JobRepository } from '@/server/generation/job-repository'
import { processGlbBuffer } from '@/engine/processing/mesh-processor'
import { MeshProcessingOptions } from '@/types/ai-generator'
import { executeBlenderJob } from '@/server/blender/blender-worker-client'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> | { jobId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { jobId } = resolvedParams

    const job = await JobRepository.getJob(jobId)
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
    }

    const asset = await getAsset(jobId, 'original_glb')
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Original GLB asset not found for this job' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const options: MeshProcessingOptions = {
      preset: body.preset || 'web_optimized',
      recalculateNormals: body.recalculateNormals,
      flipInvertedFaces: body.flipInvertedFaces,
      centerPivot: body.centerPivot ?? true,
      normalizeOrientation: body.normalizeOrientation ?? true,
      scaleToDimensions: body.scaleToDimensions,
      simplifyPolycount: body.simplifyPolycount,
      targetMaxTriangles: body.targetMaxTriangles,
      unwrapMissingUVs: body.unwrapMissingUVs ?? true,
      useBlenderWorker: body.useBlenderWorker,
    }

    // Convert Buffer to ArrayBuffer
    const arrayBuffer = asset.buffer.buffer.slice(
      asset.buffer.byteOffset,
      asset.buffer.byteOffset + asset.buffer.byteLength
    ) as ArrayBuffer

    let input = arrayBuffer
    if (options.useBlenderWorker) {
      const result = await executeBlenderJob(input, { recalculateNormals: false, smartUvUnwrap: options.unwrapMissingUVs, onlyMissingUVs: true })
      if (!result.success || !result.processedGlbBuffer) return NextResponse.json({ success: false, error: result.error }, { status: 503 })
      input = result.processedGlbBuffer
    }
    const { processedBuffer, report } = await processGlbBuffer(input, options)
    if (options.useBlenderWorker) report.appliedOperations.unshift('Blender worker: unwrap and pack missing UVs; preserve existing UVs')

    // Save processed GLB asset
    const processedUrl = await saveAsset(jobId, 'processed_glb', processedBuffer, 'model/gltf-binary')

    // Update job
    await JobRepository.updateJob(jobId, {
      processedGlbUrl: processedUrl,
    })

    return NextResponse.json({
      success: true,
      report,
      processedGlbUrl: processedUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
