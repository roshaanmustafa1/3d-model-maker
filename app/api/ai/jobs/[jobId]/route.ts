import { NextRequest, NextResponse } from 'next/server'
import { JobRepository } from '@/server/generation/job-repository'
import { JobOrchestrator } from '@/server/generation/job-orchestrator'
import { deleteJobAssets } from '@/server/generation/asset-storage'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> | { jobId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { jobId } = resolvedParams

    const job = await JobOrchestrator.reconcileJob(jobId)
    return NextResponse.json({ success: true, job })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to retrieve job' },
      { status: 404 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> | { jobId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { jobId } = resolvedParams

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'cancel') {
      const job = await JobOrchestrator.cancelJob(jobId)
      return NextResponse.json({ success: true, job })
    }

    await deleteJobAssets(jobId)
    const deleted = await JobRepository.deleteJob(jobId)
    return NextResponse.json({ success: deleted })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete/cancel job' },
      { status: 500 }
    )
  }
}
