import { NextRequest, NextResponse } from 'next/server'
import { JobRepository } from '@/server/generation/job-repository'
import { JobOrchestrator } from '@/server/generation/job-orchestrator'

export async function GET() {
  try {
    const jobs = await JobRepository.listJobs()
    const providers = JobOrchestrator.listProviders()
    return NextResponse.json({ success: true, jobs, providers })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list jobs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = await JobOrchestrator.createJob(body)
    return NextResponse.json({ success: true, job }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Job creation failed' },
      { status: 400 }
    )
  }
}
