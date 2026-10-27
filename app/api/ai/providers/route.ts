import { NextResponse } from 'next/server'
import { JobOrchestrator } from '@/server/generation/job-orchestrator'

export async function GET() {
  try {
    const providers = JobOrchestrator.listProviders()
    return NextResponse.json({ success: true, providers })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list providers' },
      { status: 500 }
    )
  }
}
